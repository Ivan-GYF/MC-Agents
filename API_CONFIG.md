# API配置说明

## 已配置的API密钥

### 1. Perplexity API
- **API Key**: 请在Perplexity官网获取
- **API URL**: `https://api.perplexity.ai/chat/completions`
- **模型**: `sonar`
- **状态**: 需要配置

### 2. Gemini 3.0 API (通过Dify)
- **API Key**: 请在Dify平台获取
- **API URL**: `https://dify-stg1.mcisaas.com/v1`
- **状态**: 需要配置

## 使用方法

### 配置API密钥
1. 访问部署的应用
2. 选择任意智能体
3. 在配置面板中输入API密钥
4. 选择对应的模型（Perplexity或Gemini 3.0）
5. 点击"保存配置"
6. 开始对话

### 切换模型
1. 进入智能体页面
2. 在配置面板中，将"模型选择"改为目标模型
3. API URL会自动更新
4. 输入对应的API Key
5. 点击"保存配置"

## 模型对比

| 特性 | Perplexity | Gemini 3.0 (Dify) |
|------|-----------|-------------------|
| 在线搜索 | ✅ 支持 | 取决于Dify配置 |
| 响应速度 | 快 | 中等 |
| 上下文长度 | 128K tokens | 取决于配置 |
| 适用场景 | 需要实时信息的查询 | 通用对话和分析 |

## 注意事项

1. **API密钥安全**：请妥善保管您的API密钥，不要提交到公共代码仓库
2. **环境变量**：生产环境建议使用环境变量管理API密钥
3. **模型切换**：切换模型后需要点击"保存配置"才能生效
4. **对话历史**：切换模型不会影响已有的对话历史

## 故障排查

### 如果Perplexity API无法使用
1. 检查API密钥是否有效
2. 确认网络可以访问 `api.perplexity.ai`
3. 查看浏览器控制台的错误信息

### 如果Gemini API无法使用
1. 确认Dify服务是否正常运行
2. 检查URL是否可访问
3. 验证API Key是否正确

## 扩展其他模型

要添加新的AI模型，需要修改以下文件：
1. `src/lib/ai-api.ts` - 添加新的API调用函数
2. `src/views/agent.ts` - 在模型选择下拉框中添加选项
3. `src/views/agent.ts` - 在`updateAPIDefaults()`函数中添加默认配置
