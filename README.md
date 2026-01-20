# MC Agents - AI智能体平台

基于Cloudflare Workers和Hono框架构建的企业级AI智能体平台。

## 功能特性

- 🤖 **四大智能体模块**：法务、财务、人力、IR/股东关系
- 💬 **智能对话**：支持与AI智能体进行自然语言交互
- 📁 **知识库管理**：上传和管理各类文档（PDF、Word、Excel、PPT、TXT等）
- ⚙️ **灵活配置**：自定义API、模型选择、系统提示词
- 💾 **对话历史**：完整保存所有对话记录，方便查阅
- 🌐 **Edge-Native**：基于Cloudflare边缘计算，全球低延迟访问

## 技术栈

- **运行环境**: Cloudflare Workers / Pages
- **Web框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **开发语言**: TypeScript
- **前端**: TailwindCSS + Marked.js
- **AI模型**: Perplexity API（未来支持Gemini 3.0等）

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

在每个智能体的配置面板中，需要设置：

1. **API URL**: Perplexity API地址（默认：https://api.perplexity.ai/chat/completions）
2. **API Key**: 您的Perplexity API密钥
3. **模型选择**: 当前支持Perplexity，未来将支持Gemini 3.0等
4. **系统提示词**: 定义智能体的行为和专业领域

### 获取Perplexity API Key

1. 访问 [Perplexity AI](https://www.perplexity.ai/)
2. 注册账号并获取API密钥
3. 在智能体配置中填入API密钥

## 项目结构

\`\`\`
MC Agents/
├── src/
│   ├── api/              # API路由
│   │   ├── agents.ts     # 智能体管理API
│   │   ├── chat.ts       # 聊天API
│   │   └── knowledge.ts  # 知识库API
│   ├── db/               # 数据库相关
│   │   └── schema.sql    # 数据库结构
│   ├── lib/              # 工具库
│   │   └── perplexity.ts # Perplexity API集成
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts
│   ├── views/            # 前端页面
│   │   ├── home.ts       # 主页
│   │   └── agent.ts      # 智能体交互页面
│   └── index.ts          # 应用入口
├── migrations/           # 数据库迁移文件
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

### 3. 管理知识库

在知识库选项卡中：
- 上传相关文档（支持PDF、Word、Excel、PPT、TXT）
- 查看已上传的文档
- 删除不需要的文档

### 4. 开始对话

在聊天界面中：
- 输入问题并发送
- AI会基于配置的提示词和知识库回答
- 所有对话自动保存，可随时查阅历史记录

## 数据库结构

### agents表
存储智能体配置信息

### knowledge_base表
存储上传的文档信息

### conversations表
存储所有对话历史记录

## 未来计划

- [ ] 支持更多AI模型（Gemini 3.0、Claude等）
- [ ] 文档内容解析和向量化搜索
- [ ] 多轮对话上下文优化
- [ ] 导出对话记录功能
- [ ] 智能体性能分析和统计
- [ ] 团队协作功能

## 许可证

ISC

## 支持

如有问题或建议，请提交Issue。
