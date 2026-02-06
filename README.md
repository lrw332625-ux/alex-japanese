# Alex 日语学习网站

亲子日语学习卡片集，由 GitHub Pages 免费托管。

## 📁 项目结构

```
alex-japanese/
├── index.html          ← 首页（课程列表）
├── lessons/            ← 所有课程文件
│   └── 2026-02-06.html ← 第一课
├── scripts/
│   └── deploy.sh       ← 自动部署脚本
└── README.md           ← 本文件
```

## 🚀 首次设置步骤（只需做一次）

### 1. 注册 GitHub
- 打开 https://github.com/join
- 注册免费账号

### 2. 创建仓库
- 打开 https://github.com/new
- Repository name 填: `alex-japanese`
- 选择 **Public**
- 不要勾选任何初始化选项
- 点击 Create repository

### 3. 本地初始化（在终端或 Cowork 中执行）
```bash
cd 这个文件夹的路径/alex-japanese
git init
git branch -M main
git remote add origin https://github.com/你的用户名/alex-japanese.git
git add -A
git commit -m "初始化：第一课"
git push -u origin main
```

### 4. 开启 GitHub Pages
- 打开 https://github.com/你的用户名/alex-japanese/settings/pages
- Source 选择: **Deploy from a branch**
- Branch 选择: **main** / **(root)**
- 点击 Save
- 等待 1-2 分钟，网站就上线了！

### 5. 访问网站
```
https://你的用户名.github.io/alex-japanese/
```

## 📝 添加新课程（Cowork 工作流）

每次有新的日语课程 HTML 文件时：

1. **复制新课程文件**到 `lessons/` 文件夹，命名格式 `YYYY-MM-DD.html`
2. **编辑 `index.html`**，在 `<!-- ▼ 新课程添加在这里 ▼ -->` 上方添加：
   ```html
   <a class="lesson-card" href="lessons/YYYY-MM-DD.html">
     <div class="lesson-icon">📚</div>
     <div class="lesson-info">
       <div class="lesson-date">YYYY年M月D日</div>
       <div class="lesson-title">本课主题描述</div>
       <div class="lesson-tags">
         <span class="tag">标签1</span>
         <span class="tag">标签2</span>
       </div>
     </div>
     <div class="arrow">→</div>
   </a>
   ```
3. **运行部署脚本**：
   ```bash
   bash scripts/deploy.sh
   ```

## 🤖 Cowork 快捷指令

对 Cowork 说以下话即可自动完成部署：

> "把 alex-japanese 文件夹里的更新推送到 GitHub"

Cowork 需要执行的命令：
```bash
cd /path/to/alex-japanese && git add -A && git commit -m "更新课程 $(date +%Y-%m-%d)" && git push origin main
```

## ⚙️ Git 认证设置（首次推送前需要）

GitHub 不再支持密码推送，需要设置以下之一：

### 方案 A: GitHub CLI（推荐，最简单）
```bash
brew install gh        # macOS
gh auth login          # 按提示登录，选择 HTTPS
```

### 方案 B: Personal Access Token
1. 打开 https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 `repo` 权限
4. 复制 token
5. 推送时用 token 替代密码

### 方案 C: SSH Key
```bash
ssh-keygen -t ed25519 -C "your@email.com"
cat ~/.ssh/id_ed25519.pub
# 复制输出，添加到 https://github.com/settings/keys
git remote set-url origin git@github.com:你的用户名/alex-japanese.git
```
