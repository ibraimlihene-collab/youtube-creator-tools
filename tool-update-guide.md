# Tool Component Update Guide

This document explains how to update the remaining tool components to include navigation, other tools, FAQs, and footer sections.

## Pattern for Updating Tool Components

### 1. Import Required Components

Add these imports at the top of each tool component file:

```tsx
import ToolNavigation from '../../components/shared/ToolNavigation';
import OtherTools from '../../components/shared/OtherTools';
import ToolFAQ from '../../components/shared/ToolFAQ';
import ToolFooter from '../../components/shared/ToolFooter';
```

### 2. Add Navigation at the Top

Insert this at the beginning of the main div in the return statement:

```tsx
{/* Navigation at the top */}
<ToolNavigation currentTool="[TOOL_ID]" t={t} />
```

Replace `[TOOL_ID]` with the appropriate tool ID (e.g., "colorPaletteGenerator").

### 3. Add Other Tools Section

Insert this before the closing tag of the main div:

```tsx
{/* Other tools section */}
<OtherTools currentTool="[TOOL_ID]" t={t} />
```

### 4. Add FAQ Section

Insert this after the Other Tools section:

```tsx
{/* FAQ section */}
<ToolFAQ toolId="[TOOL_ID]" t={t} />
```

### 5. Add Footer

Insert this at the very end, before the closing tag of the main div:

```tsx
{/* Footer */}
<ToolFooter t={t} />
```

## Example Implementation

Here's how the structure should look:

```tsx
return (
  <div className="p-4">
    {/* Navigation at the top */}
    <ToolNavigation currentTool="[TOOL_ID]" t={t} />
    
    {/* Tool content */}
    {/* ... existing tool content ... */}
    
    {/* Other tools section */}
    <OtherTools currentTool="[TOOL_ID]" t={t} />
    
    {/* FAQ section */}
    <ToolFAQ toolId="[TOOL_ID]" t={t} />
    
    {/* Footer */}
    <ToolFooter t={t} />
  </div>
);
```

## Tool IDs Reference

- Color Palette Generator: `colorPaletteGenerator`
- CPM Calculator: `cpmCalculator`
- Silence Remover: `silenceRemover`
- Thumbnail Downloader: `thumbnailDownloader`
- Thumbnail Previewer: `thumbnailPreviewer`
- Thumbnail Generator: `thumbnailGenerator`
- Video Rephraser: `videoRephraser`
- Script Writer: `scriptWriter`
- Description Generator: `descriptionGenerator`
- Title Generator: `titleGenerator`
- Hashtag Generator: `hashtagGenerator`

## Localization Updates

For each tool, add appropriate entries in both `en.json` and `ar.json`:

1. Tool-specific translations under a new key (e.g., `colorPaletteGenerator`)
2. FAQ entries in the `landingPage.faqs` section:
   - `[toolId]Question1` and `[toolId]Answer1`
   - `[toolId]Question2` and `[toolId]Answer2`
   - `[toolId]Question3` and `[toolId]Answer3`

Example for Color Palette Generator:

```json
{
  "colorPaletteGenerator": {
    "baseColor": "Base Color",
    "paletteType": "Palette Type",
    // ... other translations
  },
  "landingPage": {
    "faqs": {
      "colorPaletteGeneratorQuestion1": "How does the Color Palette Generator work?",
      "colorPaletteGeneratorAnswer1": "Our Color Palette Generator uses color theory principles to create harmonious color schemes based on your selected base color.",
      // ... other FAQ entries
    }
  }
}
```