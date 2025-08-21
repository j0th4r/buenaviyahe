# 📸 Images Setup Guide

Your travel spots database is now configured to use local images stored in organized directories. Here's how to set up your images:

## 🗂️ Directory Structure

The images are organized in the `public/images/` directory:

```
public/images/
├── spots/                 # Individual spot images
│   ├── ocean-bloom/
│   │   ├── main.jpg      # Primary hero image
│   │   ├── gallery-1.jpg # Additional gallery images
│   │   └── gallery-2.jpg
│   ├── alicias-ridge/
│   │   └── main.jpg
│   └── ...
└── categories/           # Category cover images
    ├── beaches.jpg
    ├── waterpark.jpg
    ├── cliffs.jpg
    └── restaurants.jpg
```

## 🎯 Current Status

✅ **Directory structure created**  
✅ **Database updated to reference local paths**  
✅ **API updated to use tags system**  
❌ **Images need to be added** (see instructions below)

## 📥 Adding Images

### For Spots

1. Create/navigate to the spot's folder: `public/images/spots/{spot-slug}/`
2. Add images following the naming convention:
   - `main.jpg` - Primary hero image (required)
   - `gallery-1.jpg`, `gallery-2.jpg`, etc. - Additional images

### For Categories

1. Navigate to: `public/images/categories/`
2. Add category cover images:
   - `beaches.jpg`
   - `waterpark.jpg`
   - `cliffs.jpg`
   - `restaurants.jpg`

## 📏 Image Requirements

### Spot Images

- **Main Image**: 1600x900px (16:9 aspect ratio)
- **Gallery Images**: 1200x800px minimum
- **Format**: JPG, PNG, or WebP
- **Size**: Keep under 500KB for performance

### Category Images

- **Size**: 400x520px (2:2.6 aspect ratio)
- **Format**: JPG, PNG, or WebP
- **Size**: Keep under 300KB

## 🔄 Temporary Solution

While you're adding your own images, the database currently references local paths like:

- `/images/spots/ocean-bloom/main.jpg`
- `/images/categories/beaches.jpg`

If these files don't exist, you'll see broken images. You can:

1. **Add your own images** (recommended)
2. **Use placeholder images temporarily**
3. **Update the database to use external URLs** (if needed)

## 🏷️ Tags System

Your spots now use a flexible tagging system:

### Available Tags

- **Categories**: `beaches`, `waterpark`, `cliffs`, `restaurants`
- **Features**: `popular`, `featured`
- **Custom tags**: Add any tags you want!

### Examples

```json
{
  "id": "ocean-bloom",
  "tags": ["beaches", "popular", "featured"]
}
```

### Benefits

- ✅ Spots can belong to multiple categories
- ✅ Easy to filter by any combination of tags
- ✅ Simple to add new tag types
- ✅ More flexible than boolean fields

## 🚀 Next Steps

1. **Add your images** to the organized directories
2. **Test the frontend** - spots will load with the new tag system
3. **Customize tags** - add new categories or features as needed
4. **Upload more spots** - the structure is ready to scale!

## 💡 Pro Tips

- Use consistent image sizes for better UI
- Optimize images for web (compress them)
- Consider using Next.js Image component for automatic optimization
- Keep image filenames lowercase and hyphenated
- Backup your images in a version control system or cloud storage
