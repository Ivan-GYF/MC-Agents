# 打字机效果实现说明

## 📝 概述

实现了AI回复的实时打字机效果，让用户可以看到AI逐字生成回答，提升交互体验。

## 🎯 效果展示

- ✅ AI回复逐字显示
- ✅ 闪烁的打字光标（▋）
- ✅ 实时Markdown渲染
- ✅ 自动滚动到底部
- ✅ 支持Perplexity和Gemini双模型

## 🏗 架构设计

```
前端 → /api/chat/stream → callAIAPIStream() → AI API (流式)
  ↓                                              ↓
接收SSE流 ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← 逐字返回
  ↓
打字机效果显示
```

## 📂 文件修改

### 1. 后端API (src/api/chat.ts)

新增流式聊天端点：

```typescript
chatRouter.post('/stream', async (c) => {
  // ... 保存用户消息 ...

  // 创建SSE流式响应
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullResponse = '';

      // 调用流式API
      for await (const chunk of callAIAPIStream(...)) {
        fullResponse += chunk;
        // 发送SSE格式数据
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
      }

      // 发送完成信号
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

      // 保存完整回复到数据库
      await saveToDatabase(fullResponse);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
});
```

**关键点**：
- 使用 `ReadableStream` 创建流式响应
- 使用 `text/event-stream` 格式（SSE）
- 每个chunk发送后立即推送给前端
- 完成后保存完整内容到数据库

### 2. AI API库 (src/lib/ai-api.ts)

新增流式API函数：

```typescript
// 流式API调用（异步生成器）
export async function* callAIAPIStream(
  apiKey: string,
  apiUrl: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  if (model === 'gemini') {
    yield* callGeminiAPIStream(apiKey, apiUrl, messages);
  } else {
    yield* callPerplexityAPIStream(apiKey, apiUrl, messages);
  }
}
```

#### Perplexity流式实现

```typescript
async function* callPerplexityAPIStream(...): AsyncGenerator<string, void, unknown> {
  const response = await fetch(apiUrl, {
    body: JSON.stringify({
      model: 'sonar',
      messages: formattedMessages,
      stream: true  // 启用流式响应
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const parsed = JSON.parse(line.replace(/^data: /, ''));
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        yield content;  // 逐字返回
      }
    }
  }
}
```

#### Gemini流式实现

```typescript
async function* callGeminiAPIStream(...): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${apiUrl}/chat-messages`, {
    body: JSON.stringify({
      query: lastUserMessage,
      response_mode: 'streaming'  // Dify流式模式
    })
  });

  const reader = response.body?.getReader();
  let buffer = '';
  let isInThinkTag = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const data = JSON.parse(line.substring(6));

      if (data.event === 'agent_message' && data.answer) {
        // 过滤<think>标签，逐字返回
        for (const char of data.answer) {
          if (!isInThinkTag) {
            yield char;
          }
        }
      }
    }
  }
}
```

**关键技术**：
- 使用 `async function*` 创建异步生成器
- 使用 `yield` 逐字返回内容
- 实时过滤 `<think>` 标签
- 处理SSE格式的流式数据

### 3. 前端实现 (src/views/agent.ts)

#### 发送消息并接收流

```typescript
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 显示用户消息
  addMessage(message, 'user');

  // 创建空的助手消息气泡
  const assistantBubble = createTypingBubble();

  // 发送到流式端点
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ message, session_id, agent_id, attachments })
  });

  // 读取流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = JSON.parse(line.substring(6));

      if (data.chunk) {
        fullContent += data.chunk;
        updateTypingBubble(assistantBubble, fullContent);  // 实时更新
      }

      if (data.done) {
        finalizeTypingBubble(assistantBubble, fullContent);  // 完成
      }
    }
  }
});
```

#### 创建打字气泡

```typescript
function createTypingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'max-w-2xl px-4 py-3 rounded-lg glass-effect text-white border border-white/10';
  bubble.innerHTML = '<span class="typing-cursor">▋</span>';

  messagesDiv.appendChild(bubble);
  return bubble;
}
```

#### 更新打字内容

```typescript
function updateTypingBubble(bubble, content) {
  // 实时解析Markdown
  bubble.innerHTML = marked.parse(content) + '<span class="typing-cursor">▋</span>';

  // 样式化内容
  bubble.querySelectorAll('a').forEach(a => {
    a.className = 'text-blue-400 hover:text-blue-300 underline';
  });

  // 自动滚动到底部
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
```

#### 完成打字效果

```typescript
function finalizeTypingBubble(bubble, content) {
  // 移除光标，显示最终内容
  bubble.innerHTML = marked.parse(content);

  // 样式化内容
  bubble.querySelectorAll('a').forEach(a => {
    a.className = 'text-blue-400 hover:text-blue-300 underline';
  });
}
```

### 4. CSS动画 (src/views/agent.ts)

```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typing-cursor {
  animation: blink 1s infinite;
  color: #60a5fa;  /* 根据智能体颜色动态设置 */
  font-weight: bold;
}
```

## 🔑 关键技术点

### 1. SSE (Server-Sent Events)

**格式**：
```
data: {"chunk": "你"}\n\n
data: {"chunk": "好"}\n\n
data: {"done": true}\n\n
```

**特点**：
- 单向通信：服务器 → 客户端
- 自动重连
- 文本格式，易于调试

### 2. ReadableStream

**后端创建流**：
```typescript
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of dataSource) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    }
    controller.close();
  }
});
```

**前端读取流**：
```typescript
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  processChunk(value);
}
```

### 3. 异步生成器 (Async Generator)

```typescript
async function* generateData() {
  for (let i = 0; i < 10; i++) {
    await sleep(100);
    yield i;  // 逐个返回
  }
}

// 使用
for await (const value of generateData()) {
  console.log(value);  // 0, 1, 2, ...
}
```

### 4. 实时Markdown渲染

```typescript
// 每次更新都重新解析Markdown
bubble.innerHTML = marked.parse(content) + '<span class="typing-cursor">▋</span>';
```

**优势**：
- 支持代码块、链接等格式
- 实时预览效果
- 无需等待完整内容

## 🎨 用户体验优化

### 1. 打字光标动画
- 使用 `▋` 字符作为光标
- 1秒闪烁动画
- 根据智能体颜色动态设置

### 2. 自动滚动
```typescript
messagesDiv.scrollTop = messagesDiv.scrollHeight;
```
每次更新后自动滚动到底部

### 3. 错误处理
```typescript
if (data.error) {
  updateTypingBubble(bubble, `错误: ${data.error}`);
  finalizeTypingBubble(bubble, `错误: ${data.error}`);
}
```

### 4. 性能优化
- 使用 `TextDecoder` 的 `stream: true` 选项
- 批量处理多行数据
- 避免频繁的DOM操作

## 📊 对比：普通 vs 流式

| 特性 | 普通响应 | 流式响应 |
|------|---------|---------|
| 用户体验 | 等待完整回答 | 实时看到生成过程 |
| 响应时间 | 感觉较慢 | 感觉更快 |
| 可中断性 | 不可中断 | 可以提前停止 |
| 实现复杂度 | 简单 | 中等 |
| 服务器压力 | 集中在最后 | 分散在整个过程 |

## 🚀 使用方法

1. 访问智能体页面
2. 输入问题并发送
3. 观察AI回复的打字机效果
4. 光标闪烁表示正在生成
5. 光标消失表示生成完成

## 🔧 调试技巧

### 查看SSE流

```javascript
// 在浏览器控制台
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ message: 'test', ... })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

### 测试流式API

```bash
curl -N -X POST https://mc-agents.guoyifan1021.workers.dev/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","session_id":"test","agent_id":1}'
```

## 🎯 未来优化

- [ ] 添加"停止生成"按钮
- [ ] 支持打字速度调节
- [ ] 添加声音效果
- [ ] 优化长文本的渲染性能
- [ ] 支持代码块的逐行显示
- [ ] 添加重新生成功能

## 📝 总结

打字机效果通过以下技术实现：
1. **后端**：使用 ReadableStream 和异步生成器创建流式响应
2. **传输**：使用 SSE 格式实时推送数据
3. **前端**：使用 ReadableStream API 接收并逐字显示
4. **动画**：CSS闪烁动画 + 实时Markdown渲染

这种实现方式既保证了用户体验，又保持了代码的简洁性和可维护性。
