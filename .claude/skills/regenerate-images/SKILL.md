# Skill: Regenerate All Images (alex-japanese)

## Purpose
Regenerate all images in the alex-japanese project to ensure consistent style and quality across all lessons.

## Image Categories

### 1. Emoji Icons (img/*.png) - ~152 images
- **Style**: `kawaii` (cute cartoon)
- **Size**: 256x256
- **Background**: Transparent (rembg=true)
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
- **Requirements**:
  - Simple and clean - avoid cluttered compositions
  - Focus on the core concept (e.g., "red car" shows just a red car)
  - No text in images
  - For abstract concepts (particles, grammar), use simple visual metaphors
  - For time concepts, show a clock with the correct time
  - For day-of-week concepts, use calendar or simple icons

### 3. Sentence Scene Images (img/sentences/sent_*.png) - 196 images
- **Style**: `ghibli` (Studio Ghibli / Miyazaki inspired)
- **Size**: 400x400
- **Background**: Keep background (rembg=false)
- **Prompt pattern**: `"[scene description], Studio Ghibli style, warm colors, children illustration, gentle atmosphere, anime style"`
- **Requirements**:
  - Each scene illustrates the Japanese sentence content
  - Use a consistent bear character (cute brown bear cub) as the main character
  - Warm, inviting atmosphere consistent with Ghibli aesthetics
  - Simple compositions that clearly convey the sentence meaning
  - No text overlays in the image

## Execution Steps

### Step 1: Generate Emoji Icons
```bash
# Use MCP batch_generate with kawaii style
# Source: scripts/emoji-data.js for the full emoji-to-filename mapping
# Output: img/[name].png (overwrite existing)
```

### Step 2: Generate Vocabulary Images
```bash
# Use MCP batch_generate with kawaii style
# Source: data/vocabulary.json for vocab keys and meanings
# Output: img/vocab_[key].png (overwrite existing)
```

### Step 3: Generate Sentence Scenes
```bash
# Use MCP batch_generate with ghibli style
# Source: data/sentences.json for sentence content
# Output: img/sentences/sent_NNN.png (overwrite existing)
```

### Step 4: Quality Check
- Verify all files exist and have non-zero size
- Spot-check representative samples from each category
- Check for any images that look broken or inconsistent
- Verify transparent backgrounds on icons/vocab images

### Step 5: Deploy
```bash
git add img/ && git commit -m "style: regenerate all images with consistent style" && git push
```

## Prompt Guidelines

### For Animals
`"cute cartoon [animal name], kawaii style, full body, facing forward, simple clean background, children illustration"`

### For Food
`"cute cartoon [food item], kawaii style, appetizing, simple clean background, children illustration"`

### For Vehicles
`"cute cartoon [vehicle], kawaii style, side view, simple clean background, children illustration"`

### For Abstract/UI Icons
`"cute cartoon [concept] icon, kawaii style, simple, clean, children illustration"`

### For Sentence Scenes
`"[action description] with cute bear character, Studio Ghibli style, warm colors, soft lighting, anime illustration"`

## Seed Strategy
- Use consistent seed per category for style consistency
- Emoji icons: seed=100
- Vocab images: seed=200
- Sentence scenes: seed=300
- Increment by 1 for each image within category to get variety while maintaining style

## Notes
- Total ~434 images, ~3.5s each = ~25 minutes total generation time
- Use `--force` flag to overwrite existing images
- After generation, update cache-busting parameter if needed (currently ?v2, bump to ?v3)
