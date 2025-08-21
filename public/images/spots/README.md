# Spot Images Directory

This directory contains all images for travel spots.

## Organization

The images are organized by spot slug for easy management:

```
spots/
├── ocean-bloom/
│   ├── main.jpg          # Primary hero image
│   ├── gallery-1.jpg     # Additional gallery images
│   ├── gallery-2.jpg
│   └── ...
├── alicias-ridge/
│   ├── main.jpg
│   └── ...
└── ...
```

## Guidelines

### Image Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 1600x900px for main images
- **Gallery**: 1200x800px minimum for gallery images
- **File size**: Keep under 500KB for optimal loading

### Naming Convention
- `main.jpg` - Primary hero image (required)
- `gallery-1.jpg`, `gallery-2.jpg`, etc. - Additional images
- Use lowercase and hyphens for consistency

### Adding New Spots
1. Create a new folder with the spot's slug name
2. Add the main image as `main.jpg`
3. Add additional gallery images as needed
4. Update the database entry to reference these images

### Image Paths in Database
Reference images in the database using relative paths:
```json
"images": [
  "/images/spots/ocean-bloom/main.jpg",
  "/images/spots/ocean-bloom/gallery-1.jpg",
  "/images/spots/ocean-bloom/gallery-2.jpg"
]
```

### Optimization
- Consider using Next.js Image component for automatic optimization
- Use responsive images for different screen sizes
- Implement lazy loading for better performance
