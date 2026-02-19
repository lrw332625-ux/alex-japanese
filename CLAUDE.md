# Alex Japanese Learning Project - Claude Code Context

## Project Overview
Children's Japanese learning website for Alex (林之恒), deployed on GitHub Pages.
- **Live URL**: https://lrw332625-ux.github.io/alex-japanese/
- **Repo**: https://github.com/lrw332625-ux/alex-japanese.git
- **Auth**: SSH key (ed25519) over port 443 (~/.ssh/config)
- **Host**: Mac Mini M4 24GB, macOS

## Project Structure
```
alex-japanese/
├── index.html          # Main page with lesson list + 50-on link at top
├── lessons/
│   ├── gojuon.html     # Interactive 50-on chart (special page)
│   ├── 2026-02-06.html # Latest lesson (47 lesson files total)
│   ├── 2025-06-00.html # Earliest lesson
│   └── ...             # Date-based lesson files
├── audio/              # 318 pre-recorded Japanese MP3 files (MD5 hash names)
├── img/                # 152 AI-generated cartoon PNG icons (256x256, transparent)
├── img_backup/         # Backup of original Fluent Emoji images
├── scripts/
│   ├── emoji-data.js   # Centralized emoji→image mapping (shared by all pages)
│   ├── audio.js        # Shared 3-tier audio system (used by gojuon.html)
│   ├── cache-control.js # Version indicator + force-refresh button
│   └── deploy.sh       # Auto-deploy script
├── PROJECT.md          # Full technical documentation
└── CLAUDE.md           # This file (Claude Code context)
```

## Tech Stack
- **Vanilla HTML/CSS/JS** - no frameworks, each HTML file is self-contained
- **Fonts**: Google Fonts (Noto Sans SC + M PLUS Rounded 1c)
- **Audio 3-tier**: Local MP3 → Google TTS → Web Speech API
- **Images**: AI-generated with Stable Diffusion SDXL-Turbo (local on M4)
  - Virtual env: `~/sd-env/` (Python 3.11, diffusers, rembg)
  - Cache busting: All image URLs use `?v2` query parameter
- **Emoji→Image**: Centralized in `scripts/emoji-data.js` (shared by all pages)
  - Auto-detects path prefix (`../img/` for lessons, `img/` for index)
  - Targets: `.emoji`, `.quiz-emoji`, `.lesson-icon`, `.note`, `.tab-btn`, `.tip-box`, `h1`, `.footer`
- **Cache Control**: `scripts/cache-control.js` adds version indicator + force-refresh button in footer

## Key Patterns in Lesson Files
Each lesson HTML contains (inline, self-contained):
1. CSS with color variables (--bg, --primary, --accent, etc.)
2. Tab navigation with `switchTab()` for category switching
3. Flip cards for vocabulary, sentence cards, song cards
4. `audioMap` object → maps Japanese text to local MP3 paths
5. Shared `scripts/emoji-data.js` (no longer inline emojiImgMap)
6. Inline three-tier `speakJP()` function (lessons keep own audio; gojuon uses shared audio.js)
7. Quiz system with `quizVocab`, `startQuiz()`, `showQuestion()`, `answer()`
8. Back-to-home links (top arrow + bottom button)

## Audio Generation
```python
import hashlib
filename = hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:12] + '.mp3'
# Download from: https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q=TEXT
```

## Image Generation
```bash
# Vocabulary icons (kawaii, 256x256, transparent background)
~/sd-env/bin/python ~/tools/ja-image.py icon "cute cartoon bear" -o img/bear.png

# Sentence scenes (ghibli, 512x512, with background)
~/sd-env/bin/python ~/tools/ja-image.py scene "bear walking to school" -o img/sent_20260215_01.png --no-rembg

# Batch generate from JSON config
~/sd-env/bin/python ~/tools/ja-image.py batch config.json --outdir img/

# Preview batch plan (no GPU usage)
~/sd-env/bin/python ~/tools/ja-image.py info config.json --outdir img/
```

## Deployment
```bash
cd /Users/linrenwen/Desktop/汽车人打印文件夹/林之恒日语学习mac电脑/alex-japanese
git add <files> && git commit -m "message" && git push
# GitHub Pages auto-deploys from main branch (1-2 min delay)
# IMPORTANT: After pushing, always verify live site with WebFetch
# IMPORTANT: Use cache-busting (?v=N) when updating images
```

## User Preferences
- Auto-approve all operations (CLAUDE_AUTO_ACCEPT=true)
- YouTube videos: Japanese only or English+Japanese (NO Chinese+Japanese)
- **IMPORTANT**: 完成新增课程内容后，必须直接部署到网页（git add + commit + push），不要等用户要求再部署
- Always verify deployment to live site after pushing
- Images should be cartoon/kawaii style, clearly distinct from each other
- Each lesson uses tab navigation for different categories
- 五十音 page is a special reference page linked at top of index

## Batch Update Scripts
When modifying all HTML files, write a Python script in the scratchpad directory.
Common patterns:
- `glob.glob(os.path.join(BASE, "lessons", "*.html"))` to find all lesson files
- String replacement for CSS/JS changes
- `re.sub()` for pattern-based replacements
- Always update index.html separately (different script path prefix: `scripts/` vs `../scripts/`)
- When adding new emoji images: update `scripts/emoji-data.js` (single place now!)

## Shared Scripts Architecture
All pages include these 3 shared scripts (loaded before inline scripts):
1. `scripts/audio.js` - 3-tier audio: Local MP3 → Google TTS → Web Speech
   - Checks `window.audioMap` for page-specific MP3 files
   - Uses `findBestJPVoice()` for best available Japanese voice
   - Lesson files override with their own inline speakJP (which is fine)
2. `scripts/emoji-data.js` - emojiImgMap + replaceEmojiWithImg()
   - Auto-detects image path based on page location
3. `scripts/cache-control.js` - Adds version tag + "强制刷新" button to footer

## Recent Changes (2026-02-07)
1. Restored tab navigation (was temporarily changed to single-page scroll)
2. Expanded emoji coverage: 102→152 images
3. Replaced ALL images with AI-generated (Stable Diffusion SDXL-Turbo)
4. Added cache-busting (?v2) to all image URLs
5. Created 50-on interactive page (gojuon.html)
6. Added 50-on link to index.html (special card at top)
7. Added YouTube learning videos to 50-on page
8. Centralized emojiImgMap into shared scripts/emoji-data.js
9. Fixed 204 wrong emoji assignments across all lessons
10. Added shared 3-tier audio system for gojuon.html
11. Added cache-control with force-refresh button
12. Added "play row" sequential playback to 50-on page
