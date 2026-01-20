import { Agent } from '../types';

export function agentPage(agent: Agent) {
  const agentNames = {
    legal: '法务智能体',
    finance: '财务智能体',
    hr: '人力智能体',
    ir: 'IR/股东关系智能体'
  };

  const agentColors = {
    legal: 'blue',
    finance: 'green',
    hr: 'purple',
    ir: 'orange'
  };

  const color = agentColors[agent.type];

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agentNames[agent.type]} - MC Agents</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .gradient-bg {
      background: linear-gradient(-45deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
      background-size: 400% 400%;
      animation: gradient 20s ease infinite;
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .glass-panel {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    .sidebar-mobile {
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .sidebar-mobile.open {
      transform: translateX(0);
    }

    @media (max-width: 768px) {
      .desktop-sidebar {
        display: none;
      }
    }

    @media (min-width: 769px) {
      .mobile-menu-btn {
        display: none;
      }
    }
  </style>
</head>
<body class="gradient-bg min-h-screen">
  <!-- Mobile Menu Button -->
  <button onclick="toggleMobileSidebar()" class="mobile-menu-btn fixed top-4 left-4 z-50 glass-effect text-white p-3 rounded-lg">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  </button>

  <!-- Mobile Overlay -->
  <div id="mobile-overlay" class="fixed inset-0 bg-black/50 z-30 hidden" onclick="toggleMobileSidebar()"></div>

  <div class="flex h-screen">
    <!-- 左侧边栏 - 对话历史 (Desktop) -->
    <div class="desktop-sidebar w-64 glass-panel border-r border-white/10 flex flex-col">
      <div class="p-4 border-b border-white/10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white">对话历史</h3>
          <button onclick="createNewSession()" class="bg-gradient-to-r from-${color}-500 to-${color}-600 text-white px-3 py-1 rounded-lg text-sm hover:shadow-lg hover:shadow-${color}-500/50 transition-all">
            新建
          </button>
        </div>
        <a href="/" class="flex items-center text-white/60 hover:text-${color}-400 text-sm transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回主页
        </a>
      </div>

      <div id="sessions-list" class="flex-1 overflow-y-auto p-2">
        <!-- 会话列表将动态加载 -->
      </div>
    </div>

    <!-- 左侧边栏 - 对话历史 (Mobile) -->
    <div id="mobile-sidebar" class="sidebar-mobile fixed inset-y-0 left-0 w-64 glass-panel border-r border-white/10 flex flex-col z-40 md:hidden">
      <div class="p-4 border-b border-white/10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white">对话历史</h3>
          <button onclick="createNewSession()" class="bg-gradient-to-r from-${color}-500 to-${color}-600 text-white px-3 py-1 rounded-lg text-sm hover:shadow-lg hover:shadow-${color}-500/50 transition-all">
            新建
          </button>
        </div>
        <a href="/" class="flex items-center text-white/60 hover:text-${color}-400 text-sm transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回主页
        </a>
      </div>

      <div id="sessions-list-mobile" class="flex-1 overflow-y-auto p-2">
        <!-- 会话列表将动态加载 -->
      </div>
    </div>

    <!-- 中间 - 配置面板 -->
    <div class="w-80 glass-panel border-r border-white/10 overflow-y-auto hidden md:block">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-${color}-400 to-${color}-600">${agentNames[agent.type]}</h2>

        <!-- 配置选项卡 -->
        <div class="mb-6">
          <div class="flex border-b border-white/10">
            <button onclick="showTab('config')" id="tab-config" class="px-4 py-2 font-medium text-${color}-400 border-b-2 border-${color}-400">配置</button>
            <button onclick="showTab('knowledge')" id="tab-knowledge" class="px-4 py-2 font-medium text-white/50 hover:text-white/70 transition-colors">知识库</button>
          </div>
        </div>

        <!-- 配置面板 -->
        <div id="config-panel">
          <form id="agent-config-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white/80 mb-2">API URL</label>
              <input type="text" id="api_url" value="${agent.api_url}" class="w-full px-3 py-2 glass-effect text-white rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent text-sm placeholder-white/30">
            </div>

            <div>
              <label class="block text-sm font-medium text-white/80 mb-2">API Key</label>
              <input type="password" id="api_key" value="${agent.api_key}" placeholder="输入您的API密钥" class="w-full px-3 py-2 glass-effect text-white rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent text-sm placeholder-white/30">
            </div>

            <div>
              <label class="block text-sm font-medium text-white/80 mb-2">模型选择</label>
              <select id="model" onchange="updateAPIDefaults()" class="w-full px-3 py-2 glass-effect text-white rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent text-sm">
                <option value="perplexity" ${agent.model === 'perplexity' ? 'selected' : ''}>Perplexity</option>
                <option value="gemini" ${agent.model === 'gemini' ? 'selected' : ''}>Gemini 3.0</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-white/80 mb-2">系统提示词</label>
              <textarea id="system_prompt" rows="6" class="w-full px-3 py-2 glass-effect text-white rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent text-sm placeholder-white/30">${agent.system_prompt}</textarea>
            </div>

            <button type="submit" class="w-full bg-gradient-to-r from-${color}-500 to-${color}-600 text-white py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-${color}-500/50 transition-all">
              保存配置
            </button>
          </form>
        </div>

        <!-- 知识库面板 -->
        <div id="knowledge-panel" class="hidden">
          <div class="mb-4">
            <label class="block text-sm font-medium text-white/80 mb-2">上传文档</label>
            <input type="file" id="file-upload" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" class="w-full px-3 py-2 glass-effect text-white rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-${color}-500 file:text-white hover:file:bg-${color}-600">
            <button onclick="uploadDocument()" class="mt-2 w-full bg-gradient-to-r from-${color}-500 to-${color}-600 text-white py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-${color}-500/50 transition-all">
              上传
            </button>
          </div>

          <div class="mt-6">
            <h3 class="text-sm font-medium text-white/80 mb-3">已上传文档</h3>
            <div id="documents-list" class="space-y-2">
              <!-- 文档列表将动态加载 -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧 - 主聊天区域 -->
    <div class="flex-1 flex flex-col">
      <!-- 聊天消息区域 -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div class="text-center text-white/60 py-8">
          <p>开始与${agentNames[agent.type]}对话</p>
          <p class="text-sm mt-2">您可以上传文件与AI进行交互</p>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="border-t border-white/10 p-4 glass-panel">
        <!-- 附件预览 -->
        <div id="attachments-preview" class="mb-2 hidden">
          <div class="flex flex-wrap gap-2" id="attachments-list"></div>
        </div>

        <form id="chat-form" class="flex gap-2">
          <label for="file-attach" class="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg glass-effect hover:bg-white/10 transition-colors">
            <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
            <input type="file" id="file-attach" class="hidden" multiple accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json">
          </label>
          <input type="text" id="message-input" placeholder="输入您的问题..." class="flex-1 px-4 py-3 glass-effect text-white rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent placeholder-white/30">
          <button type="submit" class="bg-gradient-to-r from-${color}-500 to-${color}-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-${color}-500/50 transition-all">
            发送
          </button>
        </form>
      </div>
    </div>
  </div>

  <script>
    const agentId = ${agent.id};
    let currentSessionId = localStorage.getItem('current_session_${agent.id}') || null;
    let attachedFiles = [];

    // Toggle mobile sidebar
    function toggleMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-overlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('hidden');
    }

    // 初始化
    async function init() {
      await loadSessions();
      if (!currentSessionId) {
        await createNewSession();
      } else {
        await loadConversationHistory();
      }
    }

    // 加载会话列表
    async function loadSessions() {
      try {
        const response = await fetch(\`/api/sessions/\${agentId}\`);
        const sessions = await response.json();

        const sessionHTML = sessions.length === 0
          ? '<p class="text-sm text-white/50 p-2">暂无对话</p>'
          : sessions.map(session => \`
          <div onclick="switchSession('\${session.id}')"
               class="p-3 rounded-lg cursor-pointer transition-all \${session.id === currentSessionId ? 'glass-effect border border-${color}-400/50 shadow-lg shadow-${color}-500/20' : 'hover:bg-white/5 border border-transparent'}">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-white truncate flex-1">\${session.title}</p>
              <button onclick="deleteSession('\${session.id}', event)" class="text-white/40 hover:text-red-400 ml-2 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <p class="text-xs text-white/40 mt-1">\${new Date(session.updated_at).toLocaleString()}</p>
          </div>
        \`).join('');

        document.getElementById('sessions-list').innerHTML = sessionHTML;
        document.getElementById('sessions-list-mobile').innerHTML = sessionHTML;
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }

    // 创建新会话
    async function createNewSession() {
      try {
        const response = await fetch(\`/api/sessions/\${agentId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '新对话' })
        });
        const data = await response.json();
        currentSessionId = data.session_id;
        localStorage.setItem('current_session_${agent.id}', currentSessionId);

        document.getElementById('chat-messages').innerHTML = '<div class="text-center text-white/60 py-8"><p>开始新对话</p></div>';
        await loadSessions();
        toggleMobileSidebar(); // Close mobile sidebar after creating session
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }

    // 切换会话
    async function switchSession(sessionId) {
      currentSessionId = sessionId;
      localStorage.setItem('current_session_${agent.id}', sessionId);
      await loadConversationHistory();
      await loadSessions();
      toggleMobileSidebar(); // Close mobile sidebar after switching
    }

    // 删除会话
    async function deleteSession(sessionId, event) {
      event.stopPropagation();
      if (!confirm('确定要删除这个对话吗？')) return;

      try {
        await fetch(\`/api/sessions/\${agentId}/\${sessionId}\`, {
          method: 'DELETE'
        });

        if (sessionId === currentSessionId) {
          await createNewSession();
        }
        await loadSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }

    // 加载对话历史
    async function loadConversationHistory() {
      try {
        const response = await fetch(\`/api/agents/\${agentId}/conversations?session_id=\${currentSessionId}\`);
        const conversations = await response.json();

        const messagesDiv = document.getElementById('chat-messages');
        messagesDiv.innerHTML = '';

        if (conversations.length === 0) {
          messagesDiv.innerHTML = '<div class="text-center text-white/60 py-8"><p>开始对话</p></div>';
          return;
        }

        conversations.forEach(conv => {
          addMessage(conv.content, conv.role);
        });
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }

    // 处理文件选择
    document.getElementById('file-attach').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(\`文件 \${file.name} 超过5MB限制\`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          attachedFiles.push({
            name: file.name,
            type: file.type,
            content: event.target.result.split(',')[1], // Base64
            size: file.size
          });
          updateAttachmentsPreview();
        };
        reader.readAsDataURL(file);
      }

      e.target.value = '';
    });

    // 更新附件预览
    function updateAttachmentsPreview() {
      const preview = document.getElementById('attachments-preview');
      const list = document.getElementById('attachments-list');

      if (attachedFiles.length === 0) {
        preview.classList.add('hidden');
        return;
      }

      preview.classList.remove('hidden');
      list.innerHTML = attachedFiles.map((file, index) => \`
        <div class="flex items-center gap-2 glass-effect px-3 py-2 rounded-lg">
          <svg class="w-4 h-4 text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span class="text-sm text-white">\${file.name}</span>
          <button onclick="removeAttachment(\${index})" class="text-white/50 hover:text-red-400 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      \`).join('');
    }

    // 移除附件
    function removeAttachment(index) {
      attachedFiles.splice(index, 1);
      updateAttachmentsPreview();
    }

    // 发送消息
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('message-input');
      const message = input.value.trim();

      if (!message && attachedFiles.length === 0) return;

      const displayMessage = message + (attachedFiles.length > 0 ? \` [附件: \${attachedFiles.map(f => f.name).join(', ')}]\` : '');
      addMessage(displayMessage, 'user');
      input.value = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            session_id: currentSessionId,
            agent_id: agentId,
            attachments: attachedFiles
          })
        });

        const data = await response.json();

        if (data.error) {
          addMessage(\`错误: \${data.error}\`, 'assistant');
        } else if (data.response) {
          addMessage(data.response, 'assistant');
        }

        // 清空附件
        attachedFiles = [];
        updateAttachmentsPreview();

        // 重新加载会话列表（更新时间）
        await loadSessions();
      } catch (error) {
        console.error('Error:', error);
        addMessage(\`抱歉，发生了错误: \${error.message || '未知错误'}\`, 'assistant');
      }
    });

    // 添加消息到聊天界面
    function addMessage(content, role) {
      const messagesDiv = document.getElementById('chat-messages');

      // 移除空状态提示
      const emptyState = messagesDiv.querySelector('.text-center');
      if (emptyState) {
        messagesDiv.innerHTML = '';
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = \`flex \${role === 'user' ? 'justify-end' : 'justify-start'} message-fade-in\`;

      const bubble = document.createElement('div');
      bubble.className = \`max-w-2xl px-4 py-3 rounded-lg \${
        role === 'user'
          ? 'bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/30'
          : 'glass-effect text-white border border-white/10'
      }\`;

      if (role === 'assistant') {
        bubble.innerHTML = marked.parse(content);
        // Style markdown content
        bubble.querySelectorAll('a').forEach(a => {
          a.className = 'text-${color}-400 hover:text-${color}-300 underline';
        });
        bubble.querySelectorAll('code').forEach(code => {
          code.className = 'bg-black/30 px-1 py-0.5 rounded text-sm';
        });
        bubble.querySelectorAll('pre').forEach(pre => {
          pre.className = 'bg-black/30 p-3 rounded-lg overflow-x-auto my-2';
        });
      } else {
        bubble.textContent = content;
      }

      messageDiv.appendChild(bubble);
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // 保存配置
    document.getElementById('agent-config-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const config = {
        api_url: document.getElementById('api_url').value,
        api_key: document.getElementById('api_key').value,
        model: document.getElementById('model').value,
        system_prompt: document.getElementById('system_prompt').value
      };

      try {
        await fetch(\`/api/agents/\${agentId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        alert('配置已保存');
      } catch (error) {
        console.error('Error:', error);
        alert('保存失败');
      }
    });

    // 模型切换时更新默认API配置
    function updateAPIDefaults() {
      const model = document.getElementById('model').value;
      const apiUrlInput = document.getElementById('api_url');
      const apiKeyInput = document.getElementById('api_key');

      if (model === 'perplexity') {
        apiUrlInput.value = 'https://api.perplexity.ai/chat/completions';
        apiKeyInput.placeholder = '请输入Perplexity API Key';
      } else if (model === 'gemini') {
        apiUrlInput.value = 'https://dify-stg1.mcisaas.com/v1';
        apiKeyInput.placeholder = '请输入Gemini API Key';
      }
    }

    // 切换选项卡
    function showTab(tab) {
      document.getElementById('config-panel').classList.toggle('hidden', tab !== 'config');
      document.getElementById('knowledge-panel').classList.toggle('hidden', tab !== 'knowledge');

      document.getElementById('tab-config').className = \`px-4 py-2 font-medium transition-colors \${tab === 'config' ? 'text-${color}-400 border-b-2 border-${color}-400' : 'text-white/50 hover:text-white/70'}\`;
      document.getElementById('tab-knowledge').className = \`px-4 py-2 font-medium transition-colors \${tab === 'knowledge' ? 'text-${color}-400 border-b-2 border-${color}-400' : 'text-white/50 hover:text-white/70'}\`;

      if (tab === 'knowledge') {
        loadDocuments();
      }
    }

    // 上传文档
    async function uploadDocument() {
      const fileInput = document.getElementById('file-upload');
      const file = fileInput.files[0];

      if (!file) {
        alert('请选择文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        await fetch(\`/api/knowledge/\${agentId}/upload\`, {
          method: 'POST',
          body: formData
        });
        alert('上传成功');
        fileInput.value = '';
        loadDocuments();
      } catch (error) {
        console.error('Error:', error);
        alert('上传失败: ' + error.message);
      }
    }

    // 加载文档列表
    async function loadDocuments() {
      try {
        const response = await fetch(\`/api/knowledge/\${agentId}\`);
        const documents = await response.json();

        const listDiv = document.getElementById('documents-list');
        if (documents.length === 0) {
          listDiv.innerHTML = '<p class="text-sm text-white/50">暂无文档</p>';
          return;
        }

        listDiv.innerHTML = documents.map(doc => \`
          <div class="flex items-center justify-between p-3 glass-effect rounded-lg">
            <div class="flex-1">
              <p class="text-sm font-medium text-white">\${doc.file_name}</p>
              <p class="text-xs text-white/50">\${new Date(doc.uploaded_at).toLocaleString()}</p>
            </div>
            <button onclick="deleteDocument(\${doc.id})" class="text-red-400 hover:text-red-300 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        \`).join('');
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // 删除文档
    async function deleteDocument(docId) {
      if (!confirm('确定要删除这个文档吗?')) return;

      try {
        await fetch(\`/api/knowledge/\${agentId}/\${docId}\`, {
          method: 'DELETE'
        });
        loadDocuments();
      } catch (error) {
        console.error('Error:', error);
        alert('删除失败');
      }
    }

    // 初始化应用
    init();
  </script>
</body>
</html>
  `;
}
