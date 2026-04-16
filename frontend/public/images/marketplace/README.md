# Marketplace Images

Place your cattle/marketplace images here.

**Naming convention:**
Name your images using the cattle ID from the constants file:
- `cattle-c1.jpg` - Image for cattle with ID 'c1' (Sahiwal Bull)
- `cattle-c2.jpg` - Image for cattle with ID 'c2' (Cholistani Cow)
- `cattle-c3.jpg` - Image for cattle with ID 'c3' (Red Sindhi)
- `cattle-c4.jpg` - Image for cattle with ID 'c4' (Dhanni Bull)
- `cattle-c5.jpg` - Image for cattle with ID 'c5' (Nili-Ravi Buffalo)
- `cattle-c6.jpg` - Image for cattle with ID 'c6' (Siri)
- `cattle-c7.jpg` - Image for cattle with ID 'c7' (Cholistani Bull)
- `cattle-c8.jpg` - Image for cattle with ID 'c8' (Lohani Cow)

**Current cattle IDs in the system:**
- **c1** - Sahiwal Bull
- **c2** - Cholistani Cow
- **c3** - Red Sindhi
- **c4** - Dhanni Bull
- **c5** - Nili-Ravi Buffalo
- **c6** - Siri
- **c7** - Cholistani Bull
- **c8** - Lohani Cow

**Image recommendations:**
- Recommended size: 600x400 or larger
- Format: JPG, PNG, JPEG, or WEBP
- Aspect ratio: 3:2 or 4:3 works best
- File naming: Use `.jpg` extension (or update `lib/imageUtils.ts` if you use a different extension)

**How it works:**
1. Copy your cattle images to this folder
2. Name them using the pattern: `cattle-{cattleId}.jpg`
   - Example: `cattle-c1.jpg` for the first cattle (Sahiwal Bull)
3. The code will automatically use these images if they exist
4. If an image doesn't exist, it will fall back to the original online image
5. If you use a different file extension (like `.png`), update the `getCattleImageUrl()` function in `lib/imageUtils.ts`

