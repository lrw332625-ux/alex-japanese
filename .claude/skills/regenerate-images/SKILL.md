# Skill: Regenerate All Images (alex-japanese)

## Purpose
Regenerate all images in the alex-japanese project to ensure consistent style and quality across all lessons.

## Tool
```bash
~/sd-env/bin/python ~/tools/ja-image.py <command> [options]
```

## Image Categories

### 1. Emoji Icons (img/*.png) - ~152 images
- **Style**: `kawaii` (cute cartoon)
- **Size**: 256x256
- **Background**: Transparent (rembg=true, default for kawaii)
- **Prompt pattern**: `"cute cartoon [subject], kawaii style, simple clean background, children illustration, single object, centered"`
- **Requirements**:
  - Each icon should depict ONE clear subject
  - No complex backgrounds - keep it minimal
  - Bright, cheerful colors suitable for children
  - Consistent line weight and shading across all icons

### 2. Vocabulary Card Images (img/vocab_*.png) - ~86 images
- **Style**: `kawaii` (cute cartoon)
- **Size**: 256x256
- **Background**: Transparent (rembg=true)
- **Prompt pattern**: `"cute cartoon [concept], kawaii style, simple clean background, children illustration, centered, no text"`

### 3. Sentence Scene Images (img/sent_*.png) - ~196 images
- **Style**: `ghibli` (Studio Ghibli / Miyazaki inspired)
- **Size**: 512x512
- **Background**: Keep background (--no-rembg)
- **Prompt pattern**: `"[scene description] with cute bear character, Studio Ghibli style, warm colors, anime illustration"`
- **Requirements**:
  - Use a consistent bear character (cute brown bear cub) as the main character
  - Warm, inviting atmosphere consistent with Ghibli aesthetics
  - Simple compositions that clearly convey the sentence meaning

## Execution Steps

### Step 1: Prepare batch JSON configs
Create separate JSON config files for each category:

```bash
# Example: emoji_batch.json
[
  {"id": "bear", "prompt": "cute cartoon bear, full body, facing forward", "style": "kawaii", "seed": 100},
  {"id": "cat", "prompt": "cute cartoon cat, full body, facing forward", "style": "kawaii", "seed": 101}
]

# Example: scene_batch.json
[
  {"id": "sent_20260215_01", "prompt": "cute bear walking toward Japanese police station", "style": "ghibli", "rembg": false, "seed": 300}
]
```

### Step 2: Preview (optional)
```bash
~/sd-env/bin/python ~/tools/ja-image.py info emoji_batch.json --outdir img/
```

### Step 3: Generate
```bash
# Emoji icons
~/sd-env/bin/python ~/tools/ja-image.py batch emoji_batch.json --outdir img/ --force

# Vocabulary images
~/sd-env/bin/python ~/tools/ja-image.py batch vocab_batch.json --outdir img/ --force

# Sentence scenes
~/sd-env/bin/python ~/tools/ja-image.py batch scene_batch.json --outdir img/ --force
```

### Step 4: Quality Check
- Verify all files exist and have non-zero size
- Spot-check representative samples from each category

### Step 5: Deploy
```bash
git add img/ && git commit -m "style: regenerate all images with consistent style" && git push
```

## Seed Strategy
- Emoji icons: seed=100 (increment by 1 per image)
- Vocab images: seed=200
- Sentence scenes: seed=300
- Use `--global-seed N` to force same seed across all items

## Banned Styles
- **NEVER use the `ink` style** — 水墨/齐白石风格会导致图片模糊、躯体不完整、显示不清楚
- Only use: `kawaii`, `ghibli`, `flat`, `watercolor`

## Notes
- Total ~434 images, ~3.5s each = ~25 minutes total generation time
- `--force` flag overwrites existing images; default skips existing
- After generation, update cache-busting parameter if needed (currently ?v2)
