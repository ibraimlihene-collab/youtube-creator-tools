# YouTube Creator Tools

A comprehensive suite of free tools designed to help YouTube content creators enhance their videos, optimize their content, and grow their channels.

## About the Developer

Hi there! My name is Ibrahim, and I'm from a small village in Morocco. I'm still learning to code and this is my first open source project. I've always been passionate about YouTube and creating content that helps other creators like me.

As a young content creator, I know how important it is to have the right tools to create engaging content. I've always been searching for tools online, but I never knew if they were safe to use or not. That's why I decided to create my own free, open-source alternatives that other creators can trust.

I know the code quality is not great, but this is mainly an educational project for me to learn new tools like AI coding, latest LLMs, Gemini, and other technologies. This project uses AI to help content creators with various tasks like generating scripts, titles, descriptions, and hashtags. With the help of AI tools and guidance from my brother, I was able to deploy my first project. This journey has been both challenging and rewarding, and I'm excited to share these tools with the YouTube creator community.

This project represents not just my technical growth, but also my dream of creating accessible tools that can help creators around the world, regardless of their background or experience level.

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

The MIT License is a permissive open-source license that allows for free use, modification, and distribution of the software, with only a requirement to include the original copyright notice and disclaimer. This means you can use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, and you can permit persons to whom the software is furnished to do so, subject to the conditions outlined in the LICENSE file.
