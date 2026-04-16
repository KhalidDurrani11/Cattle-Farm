# Hero Section Images

Place your hero section background image here.

**Required file:**
- `hero-bg.jpg` (or `.png`, `.jpeg`, `.webp`) - Main hero section background image
  - Recommended size: 1920x1080 or larger (full HD or higher)
  - Aspect ratio: 16:9 works best
  - This will be used as the background for the hero section on the homepage
  - The code will automatically use this image if it exists, otherwise it will fall back to the default image

**How it works:**
1. Copy your hero background image to this folder
2. Name it `hero-bg.jpg` (or change the extension to match your file: `.png`, `.jpeg`, `.webp`)
3. If you use a different extension, update `lib/imageUtils.ts` to change the extension in `getHeroImageUrl()`
4. The image will automatically appear in the hero section on the homepage

