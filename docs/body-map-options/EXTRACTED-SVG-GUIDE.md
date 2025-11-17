# Extracted SVG Paths - Female Body Map

## Overview

The converted `female-body.svg` file contains TWO body figures side by side:
- **Left figure** (x coordinates ~500-2400): **FRONT VIEW**
- **Right figure** (x coordinates ~2600-4500): **BACK VIEW**

## Key Information

**Original ViewBox:** `0 0 666.66669 666.66669`
**Transform Matrix:** `matrix(0.13333333,0,0,-0.13333333,0,666.66667)`

This transform scales coordinates from the original 5000x5000 canvas down to 666x666.

## What You Need for Each Component

### For `FrontBodyFemale.tsx` - Use These Paths:

The front view consists of these main elements:

1. **path4 + path5**: Hair (white fill + stroke outline)
2. **path6**: Main body outline (THIS IS THE KEY PATH!)
3. **path7-12**: Facial features and body details

### For `BackBodyFemale.tsx` - Use These Paths:

The back view starts from:

1. **path13**: Main body outline (BACK VIEW KEY PATH!)
2. Subsequent paths: Hair and details for back view

---

## Simplified Integration Approach

Instead of copying the entire complex SVG, I recommend a **two-step approach**:

### Option 1: Use as Background Image (EASIEST)

1. Export the left half of the SVG as a separate image
2. Use it as a background in your component
3. Keep clickable regions as overlays

### Option 2: Copy Key Outline Only (RECOMMENDED)

Just copy **path6** (front body outline) and **path13** (back body outline) - these are the main body shapes. Ignore the hair and facial details for now.

---

## Ready-to-Use Extraction

I'll create simplified versions for you that extract just the essential body outlines with adjusted coordinates for your 400x800 viewBox.
