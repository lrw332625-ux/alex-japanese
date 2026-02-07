# Alex 日语学习网站 - 项目技术文档

> 本文档完整记录项目的需求、架构、技术实现和资源，可据此从零重建整个项目。

---

## 一、项目概述

- **项目名称**：Alex の日本語（林之恒亲子日语学习卡片集）
- **目标用户**：儿童（Alex/林之恒），配合家长使用
- **课程范围**：2025年6月 - 2026年2月，共 47 节课
- **部署方式**：GitHub Pages 静态站点
- **仓库地址**：`git@github.com:lrw332625-ux/alex-japanese.git`
- **线上地址**：`https://lrw332625-ux.github.io/alex-japanese/`

---

## 二、功能需求

### 2.1 主页（index.html）
- 显示所有课程列表，按日期倒序排列
- 每个课程卡片显示：日期、标题、标签（词汇数/句子数/测验）
- 卡通图标区分课程类型
- 点击进入对应课程页面

### 2.2 课程页面（lessons/*.html）
- **单页滚动布局**：所有内容在一页内，上下滑动浏览（不使用标签切换）
- **返回主页**：顶部左上角 ← 箭头 + 页面底部"返回课程列表"按钮
- **词汇卡片**：翻转式卡片，正面显示卡通图+日文+假名，背面显示罗马音+中文
- **句子卡片**：点击播放整句发音，显示日文/假名/罗马音/中文
- **速度控制**：常速/慢速切换
- **全部播放**：一键连续播放该板块所有词汇
- **进度追踪**：进度条显示已学习词汇比例
- **歌曲学习**：五十音歌曲等音乐学习卡
- **亲子互动练习**：看图说日语、听音猜词、分类游戏
- **小测验**：随机出题，看图选日语，带动画反馈和计分

### 2.3 语音系统（三级后备）
1. **本地 MP3 音频**（优先）：预录制的高质量音频，离线可用
2. **Google Neural TTS**（在线后备）：`translate.googleapis.com` 接口
3. **浏览器 Web Speech API**（最终后备）：智能选择最佳日语语音（优先 Enhanced/Premium 版本，已知高质量语音如 Kyoko、O-Ren 等）

### 2.4 卡通图标
- 使用微软 Fluent Emoji 3D 卡通图替代系统 emoji
- 本地存储在 `img/` 目录，离线可用
- 页面加载后自动将 emoji 字符替换为 `<img>` 标签

---

## 三、技术架构

### 3.1 技术栈
| 技术 | 用途 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式、动画（3D翻转、渐入、弹跳、抖动） |
| Vanilla JavaScript | 交互逻辑，无框架依赖 |
| Web Speech API | 浏览器语音合成（后备方案） |
| Google Translate TTS | 在线语音合成（后备方案） |
| GitHub Pages | 静态站点托管 |
| Git + SSH | 版本控制和部署 |

### 3.2 无外部依赖
- 不使用任何 JS 框架（React/Vue 等）
- 不使用任何 CSS 框架（Bootstrap 等）
- 不使用任何构建工具（Webpack/Vite 等）
- 字体通过 Google Fonts CDN 加载
- 每个 HTML 文件完全独立，内联所有 CSS 和 JS

### 3.3 目录结构
```
alex-japanese/
├── index.html              # 主页（课程列表）
├── README.md               # 项目说明
├── PROJECT.md              # 本技术文档
├── .gitignore              # Git 忽略规则
├── .nojekyll               # 禁用 Jekyll（GitHub Pages 需要）
├── scripts/
│   └── deploy.sh           # 自动部署脚本
├── audio/                  # 预录制音频（318 个 MP3，约 5.3MB）
│   └── {md5hash}.mp3       # 文件名为日文文本的 MD5 前12位
├── img/                    # 卡通图标（102 个 PNG，约 4.1MB）
│   └── {name}.png          # 语义化命名（fish.png, car.png 等）
└── lessons/                # 课程页面（47 个 HTML）
    ├── 2025-06-00.html     # 月度合集课程
    ├── 2025-10-19.html     # 单日课程
    └── ...
```

---

## 四、页面结构详解

### 4.1 主页 index.html
```html
<div class="header">
  <h1>Alex の日本語</h1>
  <div class="sub">林之恒 亲子日语学习卡片集</div>
  <div class="stats">共 47 节课 · 2025年6月 - 2026年2月</div>
</div>
<div class="container">
  <div class="lesson-list">
    <!-- 每个课程一个卡片 -->
    <a class="lesson-card" href="lessons/YYYY-MM-DD.html">
      <div class="lesson-icon">emoji</div>
      <div class="lesson-info">
        <div class="lesson-date">日期</div>
        <div class="lesson-title">标题</div>
        <div class="lesson-tags"><span class="tag">标签</span></div>
      </div>
      <div class="arrow">→</div>
    </a>
  </div>
</div>
```

### 4.2 课程页面结构
```html
<!-- 头部（含返回链接） -->
<div class="header">
  <a class="back-link" href="../index.html">←</a>
  <h1>林之恒 日语学习卡片</h1>
  <div class="sub">日期 · 点击翻转+发音</div>
</div>

<!-- 速度控制栏 -->
<div class="controls">
  <div class="speed-toggle">
    <button class="speed-btn on">常速</button>
    <button class="speed-btn">慢速</button>
  </div>
  <div class="progress-bar"><div class="progress-fill"></div></div>
  <button class="play-all-btn">▶ 全部</button>
</div>

<!-- 词汇区（翻转卡片） -->
<div class="sec-title">词汇</div>
<div class="card-grid">
  <div class="flip-card" data-k="key" onclick="tapCard(this)">
    <div class="flip-inner">
      <div class="flip-front">
        <div class="speaker">🔈</div>
        <div class="emoji">卡通图标</div>
        <div class="kanji">汉字</div>
        <div class="kana">假名</div>
      </div>
      <div class="flip-back">
        <div class="romaji">罗马音</div>
        <div class="chinese">中文</div>
      </div>
    </div>
  </div>
</div>

<!-- 句子区 -->
<div class="sent-card" data-k="key" onclick="playSent(this)">
  <div class="wave"></div>
  <div class="jp-text"><span>🔊</span>日文句子</div>
  <div class="kana-text">假名</div>
  <div class="romaji-text">罗马音</div>
  <div class="cn-text">中文翻译</div>
</div>

<!-- 知识提示 -->
<div class="tip-box">💡 提示内容</div>

<!-- 测验区 -->
<div class="quiz-area">
  <button class="quiz-btn" onclick="startQuiz()">开始小测验！</button>
</div>

<!-- 底部返回 -->
<a href="../index.html">← 返回课程列表</a>
<div class="footer">使用提示</div>
```

---

## 五、核心 JavaScript 逻辑

### 5.1 语音播放系统
```javascript
// 全局变量
var currentAudio = null;      // 当前播放的 Audio 对象
var audioMap = {...};          // 日文文本 → 本地 mp3 路径的映射
var bestJPVoice = null;       // 缓存的最佳日语语音
var speechRate = 1;           // 语速（1=常速，0.6=慢速）

// 主函数：三级后备
function speakJP(text, cb) {
  // 1. 尝试本地 mp3
  if (audioMap[text]) → new Audio(path).play()
  // 2. 失败则尝试 Google TTS
  → speakJPOnline(text, cb)
  // 3. 再失败则用浏览器语音
  → speakJPLocal(text, cb)
}

// 语音选择优先级
function findBestJPVoice() {
  // 1. Enhanced/Premium 增强版
  // 2. 已知高质量：Kyoko, O-Ren, Hattori, Otoya
  // 3. 任意日语语音
}
```

### 5.2 音频文件生成方式
```python
# 文件名 = 日文文本的 MD5 前12位
import hashlib
filename = hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:12] + '.mp3'

# 下载来源：Google Translate Neural TTS
url = 'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q=' + quote(text)
```

### 5.3 卡通图标替换
```javascript
// emoji字符 → 本地图片路径
var emojiImgMap = {"🐟":"../img/fish.png", "🦈":"../img/shark.png", ...};

function replaceEmojiWithImg() {
  // 替换 .emoji, .quiz-emoji, .lesson-icon, .note 元素中的 emoji
  // 使用 <img> 标签替代文字 emoji
}
```

### 5.4 测验系统
```javascript
var quizVocab = [
  {k:'sakana', e:'🐟', jp:'魚', cn:'鱼'},
  // ...
];
var quizTotal = 5;  // 每次测验题数

function startQuiz()    // 随机抽 5 题
function showQuestion() // 显示题目（emoji + 4个选项）
function answer(btn)    // 判断对错，动画反馈，自动下一题
```

---

## 六、CSS 设计规范

### 6.1 配色方案
```css
:root {
  --bg: #F5F0E8;        /* 页面背景（米色） */
  --card-bg: #FFFEF9;   /* 卡片背景（暖白） */
  --text: #2D2A24;      /* 主文字（深棕） */
  --text-sub: #7A7468;  /* 辅助文字（灰棕） */
  --accent: #E8573A;    /* 强调色（橙红） */
  --primary: #2B7A98;   /* 主色（蓝绿） */
  --secondary: #D4553A; /* 次色（红） */
  --tertiary: #3A8F5C;  /* 三色（绿） */
  --vocab: #7B5EA7;     /* 词汇（紫） */
  --song: #D4903A;      /* 歌曲（橙） */
  --game: #2B8F8F;      /* 互动（青） */
}
```

### 6.2 字体
```css
font-family: 'Noto Sans SC', 'M PLUS Rounded 1c', sans-serif;
/* Noto Sans SC：中文显示 */
/* M PLUS Rounded 1c：日文显示，圆润风格适合儿童 */
/* 来源：Google Fonts CDN */
```

### 6.3 关键动画
| 动画 | 用途 | 实现 |
|------|------|------|
| 翻转 | 词汇卡片正反面 | `transform: rotateY(180deg)` + `perspective: 800px` |
| 渐入 | 内容区域出现 | `@keyframes fadeIn` opacity + translateY |
| 弹跳 | 答对反馈 | `@keyframes bounce` scale 1→1.1→1 |
| 抖动 | 答错反馈 | `@keyframes shake` translateX ±4px |
| 波浪 | 句子播放指示 | `transform: scaleX(0→1)` + `transition` |

### 6.4 响应式
```css
@media(max-width:400px) {
  /* 小屏幕：缩小卡片网格、字体、图标 */
  .card-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) }
  .flip-card { height: 160px }
  .flip-front .emoji { font-size: 34px }
}
```

---

## 七、资源清单

### 7.1 卡通图片（img/，共 102 个）
**来源**：Microsoft Fluent Emoji 3D
**许可**：MIT License
**CDN 下载地址**：
```
https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/{Name}/3D/{name}_3d.png
```

**完整列表**：
| 文件名 | 对应 emoji | 含义 |
|--------|-----------|------|
| fish.png | 🐟 | 鱼 |
| shark.png | 🦈 | 鲨鱼 |
| squid.png | 🦑 | 鱿鱼 |
| crab.png | 🦀 | 螃蟹 |
| dolphin.png | 🐬 | 海豚 |
| whale.png | 🐋 | 鲸鱼 |
| turtle.png | 🐢 | 乌龟 |
| jellyfish.png | 🪼 | 水母 |
| star.png | ⭐ | 海星 |
| frog.png | 🐸 | 青蛙 |
| penguin.png | 🐧 | 企鹅 |
| rabbit.png | 🐰 | 兔子 |
| cat.png | 🐱 | 猫 |
| dog.png | 🐶 | 狗 |
| bird.png | 🐦 | 鸟 |
| duck.png | 🦆 | 鸭子 |
| elephant.png | 🐘 | 大象 |
| lion.png | 🦁 | 狮子 |
| monkey.png | 🐒 | 猴子 |
| horse.png | 🐴 | 马 |
| cow.png | 🐄 | 牛 |
| pig.png | 🐷 | 猪 |
| deer.png | 🦌 | 鹿 |
| zebra.png | 🦓 | 斑马 |
| fox.png | 🦊 | 狐狸 |
| ant.png | 🐜 | 蚂蚁 |
| car.png | 🚗 | 汽车 |
| bicycle.png | 🚲 | 自行车 |
| bus.png | 🚌 | 公交车 |
| taxi.png | 🚕 | 出租车 |
| police_car.png | 🚔 | 警车 |
| shinkansen.png | 🚄 | 新干线 |
| ship.png | 🚢 | 船 |
| airplane.png | ✈️ | 飞机 |
| helicopter.png | 🚁 | 直升机 |
| tractor.png | 🚜 | 拖拉机 |
| apple.png | 🍎 | 苹果 |
| banana.png | 🍌 | 香蕉 |
| sushi.png | 🍣 | 寿司 |
| bento.png | 🍱 | 便当 |
| ramen.png | 🍜 | 拉面 |
| rice.png | 🍚 | 米饭 |
| coffee.png | ☕ | 咖啡 |
| umbrella.png | ☂️ | 伞 |
| house.png | 🏠 | 房子 |
| hospital.png | 🏥 | 医院 |
| school.png | 🏫 | 学校 |
| *(更多见 img/ 目录)* | | |

### 7.2 音频文件（audio/，共 318 个）
**来源**：Google Translate Neural TTS（日语）
**格式**：MP3
**命名规则**：`hashlib.md5(日文文本.encode('utf-8')).hexdigest()[:12] + '.mp3'`
**总大小**：约 5.3 MB

**生成方法**：
```python
import hashlib, urllib.request, urllib.parse

def download_audio(text):
    filename = hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:12] + '.mp3'
    url = 'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q=' + urllib.parse.quote(text)
    urllib.request.urlretrieve(url, f'audio/{filename}')
```

---

## 八、部署流程

### 8.1 前置条件
- macOS（或 Linux/Windows）
- Git 已安装
- GitHub 账号
- SSH 密钥已配置（见 8.3）

### 8.2 部署命令
```bash
cd alex-japanese/
git add -A
git commit -m "更新课程 $(date +'%Y-%m-%d %H:%M')"
git push origin main
```
或直接运行 `scripts/deploy.sh`。

GitHub Pages 设置：仓库 Settings → Pages → Source: Deploy from branch → Branch: main → /(root)

### 8.3 SSH 配置（永久免密推送）
```bash
# 生成密钥
ssh-keygen -t ed25519 -C "用户名" -f ~/.ssh/id_ed25519 -N ""

# 配置 SSH（端口 443 兼容防火墙）
cat > ~/.ssh/config << 'EOF'
Host github.com
  Hostname ssh.github.com
  Port 443
  User git
  IdentityFile ~/.ssh/id_ed25519
EOF

# 将公钥添加到 GitHub：Settings → SSH keys
cat ~/.ssh/id_ed25519.pub | pbcopy  # 复制到剪贴板

# 设置远程地址为 SSH
git remote set-url origin git@github.com:用户名/alex-japanese.git
```

---

## 九、新建课程流程

### 9.1 课程 HTML 文件
1. 复制最近一个课程文件作为模板
2. 修改标题、日期、词汇、句子内容
3. 更新 `audioMap` 和 `quizVocab` 数据
4. 更新 `emojiImgMap`（如有新 emoji）

### 9.2 生成新课程的音频
```python
# 提取新课程的所有日文文本
texts = ["さかな", "美味しいですね！", ...]

# 为每个文本下载音频
for text in texts:
    filename = hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:12] + '.mp3'
    url = f'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q={quote(text)}'
    # 下载保存到 audio/ 目录
```

### 9.3 更新主页
在 `index.html` 的 `<div class="lesson-list">` 顶部添加新课程卡片。

### 9.4 部署
运行 `scripts/deploy.sh` 或手动 git add/commit/push。

---

## 十、项目文件大小概览

| 目录/文件 | 大小 | 文件数 |
|-----------|------|--------|
| audio/ | 5.3 MB | 318 |
| img/ | 4.1 MB | 102 |
| lessons/ | 1.2 MB | 47 |
| index.html | 27 KB | 1 |
| **合计** | **约 11 MB** | **468+** |

---

## 十一、从零重建步骤

1. **创建 GitHub 仓库** `alex-japanese`，启用 GitHub Pages
2. **配置 SSH** 免密推送（见第八节）
3. **创建目录结构**：`mkdir -p alex-japanese/{audio,img,lessons,scripts}`
4. **添加基础文件**：`.gitignore`、`.nojekyll`、`scripts/deploy.sh`
5. **下载卡通图片**：从 Microsoft Fluent Emoji CDN 下载所需 PNG 到 `img/`
6. **创建主页** `index.html`：课程列表 + 卡通图标替换脚本
7. **创建课程页面**：按模板创建每个课程 HTML（词汇卡片+句子+测验）
8. **生成音频**：用 Python 脚本从 Google TTS 下载所有日文文本的 MP3
9. **在每个 HTML 中配置** `audioMap`（文本→mp3路径映射）
10. **部署**：git push 到 GitHub

---

*文档生成日期：2026-02-06*
*Co-Authored-By: Claude Opus 4.6*
