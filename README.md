# YouTube Creator Tools

A comprehensive suite of free tools designed to help YouTube content creators enhance their videos, optimize their content, and grow their channels.

## Features

- **Silence Remover**: Automatically detect and remove silent parts from your videos to keep your audience engaged
- **CPM Calculator**: Estimate your YouTube earnings based on your niche and target audience
- **Thumbnail Downloader**: Download YouTube thumbnails in all available resolutions
- **Thumbnail Previewer**: Preview your thumbnails on different devices and themes
- **Hashtag Generator**: Generate relevant hashtags to increase your video's discoverability
- **Color Palette Generator**: Create beautiful color palettes for your video thumbnails and branding
- **Thumbnail Generator**: Create professional thumbnails with our easy-to-use generator
- **Video Rephraser**: Rephrase your video scripts to improve clarity and engagement
- **Script Writer**: Write compelling scripts for your videos with AI assistance
- **Description Generator**: Generate engaging descriptions for your videos to improve SEO
- **Title Generator**: Create catchy titles that increase click-through rates

## Tech Stack

- **React** with TypeScript for building the user interface
- **Tailwind CSS** and **DaisyUI** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Vite** for fast development and building
- **FFmpeg** for audio/video processing
- **Google AI** for content generation

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/youtube-creator-tools.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── App.tsx          # Main application component with routing
├── main.tsx         # Application entry point
├── index.css        # Global styles and custom utilities
├── components/      # Reusable UI components
├── features/        # Individual tool components
├── locales/         # Localization files (English and Arabic)
├── pages/           # Page components (including LandingPage)
└── lib/             # Utility functions and API integrations
```

## Routing

The application uses React Router for navigation between the landing page and individual tools:

- `/` - Landing page showcasing all tools
- `/app` - Main application with sidebar navigation
- `/silence-remover` - Silence Remover tool
- `/cpm-calculator` - CPM Calculator tool
- `/thumbnail-downloader` - Thumbnail Downloader tool
- `/thumbnail-previewer` - Thumbnail Previewer tool
- `/hashtag-generator` - Hashtag Generator tool
- `/color-palette-generator` - Color Palette Generator tool
- `/thumbnail-generator` - Thumbnail Generator tool
- `/video-rephraser` - Video Rephraser tool
- `/script-writer` - Script Writer tool
- `/description-generator` - Description Generator tool
- `/title-generator` - Title Generator tool

## Localization

The application supports both English and Arabic languages. The language can be toggled in the application interface.

## SEO Optimization

The landing page includes comprehensive SEO optimizations:
- Dynamic meta tags for each page
- Open Graph tags for social sharing
- Canonical URLs
- Semantic HTML structure
- Responsive design for all devices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
