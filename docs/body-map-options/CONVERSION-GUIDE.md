# Body Map SVG Conversion Guide

## Step 1: Convert EPS to SVG

You have two .eps files that need to be converted to SVG format:
- `9248836.eps` (Female body - front & back)
- `9330280.eps` (Male body - front & back)

### Option A: CloudConvert (Easiest - Online, Free)

1. Go to https://cloudconvert.com/eps-to-svg
2. Upload `9248836.eps`
3. Click "Convert"
4. Download the converted SVG
5. Save as `female-body.svg` in `docs/body-map-options/`
6. Repeat for `9330280.eps` → save as `male-body.svg`

### Option B: Inkscape (Free Desktop Software)

1. Download Inkscape from https://inkscape.org/release/
2. Install and open Inkscape
3. File → Open → Select `9248836.eps`
4. File → Save As → Choose "Optimized SVG (*.svg)"
5. In the dialog:
   - Check "Remove metadata"
   - Check "Shorten color values"
   - Check "Convert CSS attributes to XML attributes"
6. Save as `female-body.svg`
7. Repeat for `9330280.eps` → save as `male-body.svg`

### Option C: Adobe Illustrator (If you have it)

1. Open `9248836.eps` in Illustrator
2. File → Save As → SVG
3. SVG Options:
   - Styling: Internal CSS
   - Font: SVG
   - Images: Embed
   - Object IDs: Layer Names
   - Decimal: 2
   - Check "Responsive"
4. Save as `female-body.svg`
5. Repeat for male body

---

## Step 2: Extract SVG Content

Once you have the converted SVG files:

1. Open `female-body.svg` in a text editor (VS Code, Notepad++)
2. Look for the front view body outline (left figure in the image)
3. Copy the `<path>` or `<g>` element that represents the front body
4. You'll paste this into `FrontBodyFemale.tsx` (see component files)

5. Look for the back view body outline (right figure)
6. Copy the `<path>` or `<g>` element for the back body
7. You'll paste this into `BackBodyFemale.tsx`

---

## Step 3: What to Look For in the SVG

The SVG will contain multiple elements. You need to identify:

```xml
<svg viewBox="..." xmlns="...">
  <!-- Background circle (you can ignore this) -->
  <circle cx="..." cy="..." r="..." fill="#FFF5E1"/>

  <!-- THIS IS WHAT YOU NEED - The body outline paths -->
  <g id="front-body">
    <path d="M 200 50 C ..." stroke="#000" fill="none"/>
    <!-- More paths for body parts -->
  </g>

  <g id="back-body">
    <path d="M 500 50 C ..." stroke="#000" fill="none"/>
    <!-- More paths for body parts -->
  </g>
</svg>
```

**Key things to extract:**
- `viewBox` attribute from the `<svg>` tag (e.g., `viewBox="0 0 1000 1200"`)
- The `<path>` elements or `<g>` groups that draw the body outline
- Any `<defs>` if they contain gradients or styles

---

## Step 4: Update Component Files

Once extracted, you'll paste the SVG content into the placeholders marked in:
- `src/components/body-mapping/bodies/FrontBodyFemale.tsx`
- `src/components/body-mapping/bodies/BackBodyFemale.tsx`
- `src/components/body-mapping/bodies/FrontBodyMale.tsx`
- `src/components/body-mapping/bodies/BackBodyMale.tsx`

Look for comments like:
```tsx
{/* PASTE CONVERTED SVG CONTENT HERE */}
{/* Replace this comment with the <path> or <g> elements from your converted SVG */}
```

---

## Tips

1. **Keep the original stroke color** - The professional illustrations use clean black lines
2. **Remove background fills** - We'll add our own styling for regions
3. **Preserve the viewBox** - This ensures proper scaling
4. **Test incrementally** - Paste front body first, verify it displays, then add back body

---

## Need Help?

If the SVG looks complex or you're unsure what to extract, share the SVG file content and I can help identify the correct elements to use.
