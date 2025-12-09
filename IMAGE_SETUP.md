# Image Setup Guide

This guide explains how to add images from https://labaguettemagiquesarttilman.be/ to the website.

## Image Directory Structure

Images should be placed in the `public/images/` directory:

```
public/
  images/
    hero.jpg          # Main homepage hero image
    logo.png          # Restaurant logo
    restaurant.jpg    # Restaurant interior/exterior photo
    menu-sandwiches.jpg
    menu-frites.jpg
    menu-pitas.jpg
    menu-salades.jpg
```

## How to Add Images

### Step 1: Download Images from Website

1. Visit https://labaguettemagiquesarttilman.be/
2. Right-click on images you want to use
3. Select "Save image as..." or "Enregistrer l'image sous..."
4. Save them to your computer

### Step 2: Add Images to Project

1. Copy downloaded images to `public/images/` directory
2. Name them according to the structure above (or update `src/lib/website-data.ts` with your naming)
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

### Step 3: Update Image References (if needed)

If you use different filenames, update the `images` object in `src/lib/website-data.ts`:

```typescript
export const images = {
  hero: "/images/your-hero-image.jpg",
  // ... etc
};
```

## Current Status

- ✅ Image directory structure created
- ✅ Image configuration in `website-data.ts`
- ✅ Next.js image configuration updated
- ⏳ Waiting for actual images from website to be added

## Fallback Images

Currently using high-quality food images from Unsplash as placeholders. These will automatically be replaced once you add the actual images from the website.

## Image Optimization

Next.js automatically optimizes images. For best results:
- Use `.webp` format when possible
- Keep file sizes reasonable (< 1MB recommended)
- Use appropriate dimensions (hero: ~1600px width, menu items: ~800px width)


