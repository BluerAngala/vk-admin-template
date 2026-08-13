#!/bin/bash

# 文档搜索脚本
# 用法: bash search.sh [选项] [参数]

set -e

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 知识库目录
KNOWLEDGE_PROJECT="$SKILL_ROOT/knowledge/project"
KNOWLEDGE_FRAMEWORK="$SKILL_ROOT/knowledge/framework"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取相对路径
get_rel_path() {
    echo "${1#$SKILL_ROOT/}"
}

# 显示帮助
show_help() {
    echo -e "${BLUE}文档搜索工具${NC}"
    echo ""
    echo "用法: bash search.sh [选项] [参数]"
    echo ""
    echo "选项:"
    echo "  --list              列出所有可用文档"
    echo "  --search <关键词>   搜索关键词"
    echo "  --topic <主题>      按主题查找文档"
    echo "  --read <文件路径>   读取指定文档"
    echo "  --kb <知识库>       指定知识库: project / framework / all"
    echo "  --help              显示帮助信息"
    echo ""
    echo "示例:"
    echo "  bash search.sh --list"
    echo "  bash search.sh --search 'vk.callFunction'"
    echo "  bash search.sh --search 'baseDao' --kb framework"
    echo "  bash search.sh --topic '页面开发'"
    echo "  bash search.sh --read 'knowledge/project/page-dev.md'"
}

# 列出所有文档
list_docs() {
    echo -e "${GREEN}=== 项目知识库（项目开发规范） ===${NC}"
    if [ -d "$KNOWLEDGE_PROJECT" ]; then
        for f in "$KNOWLEDGE_PROJECT"/*.md; do
            if [ -f "$f" ]; then
                title=$(head -n 5 "$f" | grep "^#" | head -1 | sed 's/^#* //')
                rel_path=$(get_rel_path "$f")
                echo -e "  ${YELLOW}$rel_path${NC} - $title"
            fi
        done
    fi
    
    echo ""
    echo -e "${GREEN}=== 框架知识库（vk-unicloud 文档） ===${NC}"
    if [ -d "$KNOWLEDGE_FRAMEWORK" ]; then
        # 按目录分组显示
        for dir in "$KNOWLEDGE_FRAMEWORK"/*/; do
            if [ -d "$dir" ]; then
                dir_name=$(basename "$dir")
                count=$(find "$dir" -name "*.md" -type f | wc -l | tr -d ' ')
                echo -e "  ${BLUE}$dir_name/${NC} ($count 个文档)"
            fi
        done
        # 顶层文件
        for f in "$KNOWLEDGE_FRAMEWORK"/*.md; do
            if [ -f "$f" ]; then
                rel_path=$(get_rel_path "$f")
                echo -e "  ${YELLOW}$rel_path${NC}"
            fi
        done
        total=$(find "$KNOWLEDGE_FRAMEWORK" -name "*.md" -type f | wc -l | tr -d ' ')
        echo -e "  ${BLUE}共 $total 个文档${NC}"
    fi
}

# 搜索关键词
search_keyword() {
    local keyword="$1"
    local kb="$2"
    
    if [ -z "$keyword" ]; then
        echo -e "${RED}错误: 请提供搜索关键词${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}搜索: $keyword${NC}"
    echo ""
    
    case "$kb" in
        project)
            echo -e "${BLUE}[项目知识库]${NC}"
            grep -r -n -i "$keyword" "$KNOWLEDGE_PROJECT" --include="*.md" 2>/dev/null | head -50 || echo "  无匹配结果"
            ;;
        framework)
            echo -e "${BLUE}[框架知识库]${NC}"
            grep -r -n -i "$keyword" "$KNOWLEDGE_FRAMEWORK" --include="*.md" 2>/dev/null | head -50 || echo "  无匹配结果"
            ;;
        *)
            echo -e "${BLUE}[项目知识库]${NC}"
            grep -r -n -i "$keyword" "$KNOWLEDGE_PROJECT" --include="*.md" 2>/dev/null | head -30 || echo "  无匹配结果"
            echo ""
            echo -e "${BLUE}[框架知识库]${NC}"
            grep -r -n -i "$keyword" "$KNOWLEDGE_FRAMEWORK" --include="*.md" 2>/dev/null | head -30 || echo "  无匹配结果"
            ;;
    esac
}

# 按主题查找
find_by_topic() {
    local topic="$1"
    
    if [ -z "$topic" ]; then
        echo -e "${RED}错误: 请提供主题${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}主题: $topic${NC}"
    echo ""
    
    case "$topic" in
        *架构*|*数据流*|*启动*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/architecture.md - 架构与数据流"
            ;;
        *页面*|*组件*|*前端*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/page-dev.md - 页面开发"
            echo "  knowledge/project/COMPONENTS.md - 组件化开发指南"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/admin/custom-components/ - 自定义组件"
            ;;
        *管理*|*CRUD*|*后台*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/admin-dev.md - 系统管理功能开发"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/admin/6/ - 管理功能文档"
            ;;
        *云函数*|*后端*|*service*|*router*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/cloud-dev.md - 云函数开发"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/client/uniCloud/cloudfunctions/ - 云函数文档"
            ;;
        *数据库*|*dao*|*DB*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/cloud-dev.md - 云函数开发（数据库部分）"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/client/uniCloud/db/ - 数据库文档"
            ;;
        *样式*|*CSS*|*布局*|*rpx*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/style-dev.md - 样式开发指南"
            ;;
        *API*|*参考*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/references.md - API 参考"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/client/vk.userCenter.html - 用户中心 API"
            ;;
        *登录*|*认证*|*权限*|*Token*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/admin-dev.md - 系统管理功能开发"
            echo "  knowledge/project/cloud-dev.md - 云函数开发（uniID 部分）"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/client/uniCloud/config/uni-id/ - uni-id 配置"
            ;;
        *菜单*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/architecture.md - 架构与数据流（菜单系统）"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/admin/6/menu.md - 菜单管理"
            ;;
        *支付*)
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/vk-uni-pay/ - 支付文档"
            ;;
        *配置*)
            echo -e "${YELLOW}项目知识库:${NC}"
            echo "  knowledge/project/architecture.md - 架构与数据流"
            echo ""
            echo -e "${YELLOW}框架知识库:${NC}"
            echo "  knowledge/framework/client/uniCloud/config/ - 配置文档"
            ;;
        *)
            echo -e "${BLUE}未识别的主题，尝试搜索关键词...${NC}"
            search_keyword "$topic" "all"
            ;;
    esac
}

# 读取指定文档
read_doc() {
    local file_path="$1"
    
    if [ -z "$file_path" ]; then
        echo -e "${RED}错误: 请提供文件路径${NC}"
        exit 1
    fi
    
    # 尝试从 skill 根目录解析
    if [ ! -f "$file_path" ]; then
        file_path="$SKILL_ROOT/$file_path"
    fi
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}错误: 文件不存在: $file_path${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}文件: $(get_rel_path "$file_path")${NC}"
    echo "---"
    cat "$file_path"
}

# 主函数
main() {
    local action=""
    local param=""
    local kb="all"
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list)
                action="list"
                shift
                ;;
            --search)
                action="search"
                param="$2"
                shift 2
                ;;
            --topic)
                action="topic"
                param="$2"
                shift 2
                ;;
            --read)
                action="read"
                param="$2"
                shift 2
                ;;
            --kb)
                kb="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 执行操作
    case $action in
        list)
            list_docs
            ;;
        search)
            search_keyword "$param" "$kb"
            ;;
        topic)
            find_by_topic "$param"
            ;;
        read)
            read_doc "$param"
            ;;
        *)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"
