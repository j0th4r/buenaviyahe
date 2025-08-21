# Category Images Directory

This directory contains cover images for each category.

## Organization

```
categories/
├── beaches.jpg
├── waterpark.jpg
├── cliffs.jpg
├── restaurants.jpg
└── ...
```

## Guidelines

### Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: 400x520px (2:2.6 aspect ratio) for optimal display
- **File size**: Keep under 300KB

### Naming Convention

- Use the category ID as the filename
- Lowercase with hyphens for multi-word categories
- Examples: `beaches.jpg`, `water-parks.jpg`

### Image Paths in Database

Reference images using relative paths:

```json
"image": "/images/categories/beaches.jpg"
```
