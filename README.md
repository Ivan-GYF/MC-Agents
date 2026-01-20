# MC Agents - AI智能体平台

基于Cloudflare Workers和Hono框架构建的企业级AI智能体平台，采用科技风格UI设计，完美适配移动端。

🌐 **在线演示**: https://mc-agents.guoyifan1021.workers.dev

## ✨ 功能特性

- 🤖 **四大智能体模块**：法务、财务、人力、IR/股东关系
- 💬 **智能对话**：支持与AI智能体进行自然语言交互
- 📁 **文件上传**：在对话中上传文件，AI可以分析文件内容
- 💾 **会话管理**：多会话支持，完整保存所有对话记录
- 📚 **知识库管理**：上传和管理各类文档（PDF、Word、Excel、PPT、TXT等）
- ⚙️ **灵活配置**：自定义API、模型选择、系统提示词
- 🎨 **科技风格UI**：毛玻璃效果、渐变动画、现代化设计
- 📱 **移动端优化**：完美适配手机和平板，抽屉式侧边栏
- 🌐 **Edge-Native**：基于Cloudflare边缘计算，全球低延迟访问

## 🎨 UI特色

### 主页
- 动态渐变背景动画（5色渐变，15秒循环）
- 毛玻璃卡片效果
- 悬停交互动画和发光效果
- 响应式网格布局（移动端1列，平板2列，桌面4列）

### 智能体页面
- 深色科技主题背景
- 毛玻璃侧边栏和配置面板
- 渐变消息气泡
- 消息淡入动画
- 移动端抽屉式侧边栏
- Markdown内容样式化

## 🛠 技术栈

- **运行环境**: Cloudflare Workers
- **Web框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (可选)
- **开发语言**: TypeScript
- **前端**: TailwindCSS + Marked.js
- **AI模型**: Perplexity API / Gemini 3.0 (via Dify)

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 创建数据库

\`\`\`bash
npm run db:create
\`\`\`

复制返回的database_id，更新wrangler.toml中的database_id字段。

### 3. 运行数据库迁移

\`\`\`bash
npm run db:migrate
\`\`\`

### 4. 创建R2存储桶

\`\`\`bash
npm run r2:create
\`\`\`

### 5. 本地开发

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:8787

### 6. 部署到生产环境

\`\`\`bash
# 先运行生产环境的数据库迁移
npm run db:migrate:prod

# 部署应用
npm run deploy
\`\`\`

## 配置说明

### API配置

1. 复制 `.env.example` 为 `.env`（可选，用于本地开发）
2. 在智能体页面的配置面板中设置：
   - **API URL**: Perplexity或Gemini API地址
   - **API Key**: 您的API密钥
   - **模型选择**: Perplexity 或 Gemini 3.0
   - **系统提示词**: 定义智能体的行为和专业领域

### 获取API密钥

**Perplexity API**:
1. 访问 [Perplexity AI](https://www.perplexity.ai/)
2. 注册账号并获取API密钥

**Gemini 3.0 (via Dify)**:
1. 访问您的Dify平台
2. 创建应用并获取API密钥

## 项目结构

\`\`\`
MC Agents/
├── src/
│   ├── api/              # API路由
│   │   ├── agents.ts     # 智能体管理API
│   │   ├── chat.ts       # 聊天API
│   │   ├── sessions.ts   # 会话管理API
│   │   └── knowledge.ts  # 知识库API
│   ├── lib/              # 工具库
│   │   └── ai-api.ts     # AI API集成（Perplexity + Gemini）
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts
│   ├── views/            # 前端页面
│   │   ├── home.ts       # 主页（科技风格）
│   │   └── agent.ts      # 智能体交互页面（科技风格）
│   └── index.ts          # 应用入口
├── migrations/           # 数据库迁移文件
│   ├── 0001_initial.sql
│   ├── 0002_add_api_keys.sql
│   └── 0003_add_sessions_and_attachments.sql
├── .env.example          # 环境变量示例
├── wrangler.toml         # Cloudflare配置
├── tsconfig.json         # TypeScript配置
└── package.json          # 项目配置
\`\`\`

## 使用指南

### 1. 选择智能体

在主页选择您需要的智能体类型：
- 法务智能体：处理法律事务、合同审查
- 财务智能体：财务分析、预算规划
- 人力智能体：招聘管理、员工关系
- IR/股东关系智能体：投资者关系、股东沟通

### 2. 配置智能体

在智能体页面的配置面板中：
- 设置API密钥和URL
- 选择AI模型
- 自定义系统提示词

### 3. 开始对话

在聊天界面中：
- 输入问题并发送
- 可以上传文件（点击附件图标）
- AI会基于配置的提示词和上传的文件回答
- 所有对话自动保存在当前会话中
- 可以创建新会话或切换到历史会话

## 📊 数据库结构

### agents表
存储智能体配置信息（API密钥、模型、系统提示词等）

### sessions表
存储会话信息（会话ID、标题、创建时间等）

### conversations表
存储所有对话历史记录（用户消息和AI回复）

### message_attachments表
存储消息附件信息（文件名、类型、内容等）

### knowledge_base表
存储知识库文档信息（文件名、路径、大小等）

## 🎯 未来计划

- [ ] 文档内容解析和向量化搜索
- [ ] 多轮对话上下文优化
- [ ] 导出对话记录功能（Markdown、PDF）
- [ ] 智能体性能分析和统计
- [ ] 团队协作功能
- [ ] 支持更多AI模型（Claude、GPT-4等）
- [ ] 语音输入和输出
- [ ] 实时流式响应显示

## 📸 截图

访问 [在线演示](https://mc-agents.guoyifan1021.workers.dev) 查看实际效果。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

ISC

## 💬 支持

如有问题或建议，请提交Issue或访问在线演示体验。