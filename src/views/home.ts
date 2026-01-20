export function homePage() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MC Agents - AI智能体平台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .gradient-bg {
      background: linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-hover {
      transition: all 0.3s ease;
    }

    .card-hover:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .glow {
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .float-animation {
      animation: float 6s ease-in-out infinite;
    }
  </style>
</head>
<body class="gradient-bg min-h-screen">
  <!-- 装饰性背景元素 -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 float-animation"></div>
    <div class="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 float-animation" style="animation-delay: 2s;"></div>
    <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 float-animation" style="animation-delay: 4s;"></div>
  </div>

  <div class="relative container mx-auto px-4 py-8 md:py-16">
    <!-- Header -->
    <div class="text-center mb-12 md:mb-16">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
          MC Agents
        </span>
      </h1>
      <p class="text-lg md:text-xl text-white/80 font-light">企业级AI智能体平台</p>
      <div class="mt-6 flex items-center justify-center gap-2">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm text-white/60">系统运行正常</span>
      </div>
    </div>

    <!-- Agent Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
      <!-- 法务智能体 -->
      <a href="/agent/legal" class="group">
        <div class="glass-effect rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden">
          <!-- 背景光效 -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform glow">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
              </svg>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">法务智能体</h2>
            <p class="text-sm md:text-base text-white/70 leading-relaxed">专业法律咨询、合同审查、合规建议</p>

            <!-- 标签 -->
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">合同审查</span>
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">法律咨询</span>
            </div>
          </div>
        </div>
      </a>

      <!-- 财务智能体 -->
      <a href="/agent/finance" class="group">
        <div class="glass-effect rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform glow">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">财务智能体</h2>
            <p class="text-sm md:text-base text-white/70 leading-relaxed">财务分析、预算规划、投资建议</p>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">财务分析</span>
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">预算规划</span>
            </div>
          </div>
        </div>
      </a>

      <!-- 人力智能体 -->
      <a href="/agent/hr" class="group">
        <div class="glass-effect rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform glow">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">人力智能体</h2>
            <p class="text-sm md:text-base text-white/70 leading-relaxed">招聘管理、员工关系、绩效评估</p>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">招聘管理</span>
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">绩效评估</span>
            </div>
          </div>
        </div>
      </a>

      <!-- IR/股东关系智能体 -->
      <a href="/agent/ir" class="group">
        <div class="glass-effect rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div class="relative z-10">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform glow">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">IR/股东关系</h2>
            <p class="text-sm md:text-base text-white/70 leading-relaxed">投资者关系、股东沟通、财报解读</p>

            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">投资者关系</span>
              <span class="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">财报解读</span>
            </div>
          </div>
        </div>
      </a>
    </div>

    <!-- Footer Info -->
    <div class="text-center mt-12 md:mt-16">
      <p class="text-white/60 text-sm md:text-base mb-4">选择一个智能体开始对话</p>
      <div class="flex items-center justify-center gap-6 text-xs md:text-sm text-white/50">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Perplexity</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>Gemini 3.0</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
