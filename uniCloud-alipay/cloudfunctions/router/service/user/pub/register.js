module.exports = {
  /**
   * 用户注册(账号+密码)
   * @url user/pub/register 前端调用的url参数地址
   * @description 用户注册(账号+密码)
   * data 请求参数 说明
   * @param {String} username 用户名，唯一
   * @param {String} password 密码
   * @param {String} email QQ邮箱（必填，用于找回密码）
   * @param {String} captcha 图形验证码
   * @param {String} inviteCode 邀请码（可选）
   * res 返回参数说明
   * @param {Number} code 错误码，0表示成功
   * @param {String} msg 详细信息
   * @param {String} token 注册完成自动登录之后返回的token信息
   * @param {String} tokenExpired token过期时间
   * @param {Object} userInfo 用户信息
   */
  main: async (event) => {
    let { data = {}, userInfo, util, originalParam } = event;
    let { uniID, config, pubFun, vk, db, _ } = util;
    let { uid } = data;
    let res = { code: -1, msg: "" };
    // 业务逻辑开始-----------------------------------------------------------
    if (typeof data.username === "number")
      data.username = String(data.username).trim();
    if (typeof data.password === "number")
      data.password = String(data.password).trim();

    let { username, password, email, captcha, needPermission, inviteCode } = data;

    // 验证图形验证码
    if (captcha) {
      const uniCaptcha = require("uni-captcha");
      const verifyCaptchaRes = await uniCaptcha.verify({
        scene: "register",
        captcha: captcha,
      });
      if (verifyCaptchaRes.code !== 0) {
        return verifyCaptchaRes;
      }
    }

    // 验证规则开始 -----------------------------------------------------------
    let rules = {
      username: [
        {
          required: true,
          validator: function(rule, value, data, callback) {
            // 支持中文、英文、数字和下划线，长度3-32
            const regex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{3,32}$/;
            if (!regex.test(value)) {
              return '用户名长度在3~32之间，可以包含中文、英文、数字和下划线';
            }
            return true;
          },
          message: "用户名长度在3~32之间，可以包含中文、英文、数字和下划线",
          trigger: ["blur", "change"],
        },
      ],
      password: [
        {
          validator: vk.pubfn.validator("password"),
          message: "密码长度在6~18之间，只能包含字母、数字和下划线",
          trigger: "blur",
        },
      ],
      email: [
        {
          required: true,
          validator: function(rule, value, data, callback) {
            if (!value || value.trim() === '') {
              return '请输入QQ邮箱';
            }
            // 验证QQ邮箱格式
            const emailRegex = /^[1-9]\d{4,10}@qq\.com$/;
            if (!emailRegex.test(value)) {
              return '请输入正确的QQ邮箱格式';
            }
            return true;
          },
          message: "请输入正确的QQ邮箱格式",
          trigger: ["blur", "change"],
        },
      ],
    };
    // 验证规则结束 -----------------------------------------------------------
    
    // 检查邮箱是否已注册
    if (email) {
      const emailExists = await vk.baseDao.count({
        dbName: "uni-id-users",
        whereJson: { email: email }
      });
      if (emailExists > 0) {
        return { code: -1, msg: '该QQ邮箱已被注册' };
      }
    }
    // 开始进行验证
    let formRulesRes = vk.pubfn.formValidate({
      data: data,
      rules: rules,
    });
    if (formRulesRes.code !== 0) {
      // 表单验证未通过
      return formRulesRes;
    }
    // 表单验证通过，下面写自己的业务逻辑
    res = await uniID.register({
      username,
      password,
      needPermission: false, // 普通用户注册,不需要权限
    });

    // 注册成功后,设置用户可以登录后台,并分配默认角色
    if (res.code === 0 && res.uid) {
      // 设置用户可以登录后台,并分配普通用户角色
      let updateData = {
        allow_login_background: true, // 允许登录后台
        role: ["normal-user"], // 分配普通用户角色
      };
      
      // 保存邮箱
      if (email) {
        updateData.email = email;
      }
      
      // 处理邀请码绑定
      let inviteBound = false; // 标记是否已通过事务绑定邀请关系
      
      if (inviteCode) {
        // 查找邀请人
        const inviter = await vk.baseDao.findByWhereJson({
          dbName: "uni-id-users",
          fieldJson: { _id: true, invite_count: true },
          whereJson: { my_invite_code: inviteCode }
        });
        
        if (inviter) {
          // 防止自己邀请自己
          if (inviter._id === res.uid) {
            console.warn(`用户不能使用自己的邀请码: ${inviteCode}`);
          } else {
            // 绑定邀请关系
            updateData.inviter_uid = [inviter._id];
            updateData.invite_time = Date.now();
            
            // 使用事务确保数据一致性：同时更新新用户的邀请关系和邀请人的邀请人数
            const transaction = await db.startTransaction();
            try {
              // 1. 更新新用户的所有信息（包括邀请关系）
              await transaction.collection("uni-id-users").doc(res.uid).update(updateData);
              
              // 2. 更新邀请人的邀请人数
              await transaction.collection("uni-id-users").doc(inviter._id).update({
                invite_count: db.command.inc(1)
              });
              
              // 提交事务
              await transaction.commit();
              inviteBound = true; // 标记已成功绑定
            } catch (err) {
              // 回滚事务
              await transaction.rollback();
              console.error('邀请关系绑定失败，已回滚:', err);
              // 移除邀请关系，只保留其他更新数据
              delete updateData.inviter_uid;
              delete updateData.invite_time;
            }
          }
        } else {
          // 邀请码无效，记录警告但不影响注册
          console.warn(`无效的邀请码: ${inviteCode}`);
        }
      }
      
      // 如果没有通过事务更新，则正常更新用户信息
      if (!inviteBound) {
        await db
          .collection("uni-id-users")
          .doc(res.uid)
          .update(updateData);
      }
    }

    // 业务逻辑结束-----------------------------------------------------------
    return res;
  },
};
