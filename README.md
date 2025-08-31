# 🌅 Golden Hour Calculator

A professional photography tool for calculating perfect golden hour and blue hour times worldwide. Built with Next.js 15, TypeScript, and modern web technologies.

![Golden Hour Calculator](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Functionality
- **Precise Golden Hour Calculations** - Accurate sunrise, sunset, golden hour, and blue hour times
- **Auto-Location Detection** - Automatic detection using IP geolocation
- **Weather Integration** - Real-time weather conditions for photography planning
- **Interactive Map** - Visual location selection with Leaflet maps
- **Photography Calendar** - Monthly view of optimal shooting times
- **SEO-Friendly URLs** - Dynamic routing with location and date parameters

### 🚀 Advanced Features
- **PWA Support** - Installable as a mobile/desktop app with offline capabilities
- **Image Inspiration** - Curated photos from Unsplash and Pexels APIs
- **Photography Tips** - Location-specific photography recommendations
- **Version Management** - Built-in project versioning system
- **Dark/Light Mode** - Automatic theme switching
- **Responsive Design** - Optimized for all devices

### ⚡ Performance Optimizations
- **API Caching** - In-memory caching for weather and location data
- **Service Worker** - Offline support and asset caching
- **Code Splitting** - Optimized bundle sizes with dynamic imports
- **Image Optimization** - Next.js Image component with AVIF/WebP support
- **Edge Functions** - Fast API responses with middleware

## 🛠️ Tech Stack

- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + Shadcn/ui
- **Maps:** Leaflet + React Leaflet
- **State Management:** React Hooks
- **APIs:** OpenWeatherMap, Unsplash, Pexels
- **Deployment:** Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone git@github.com:abuhasnatruhu/Golden-Hour.git
cd Golden-Hour
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# API Keys
OPENWEATHER_API_KEY=your_openweather_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key

# Optional
DATABASE_URL=file:./prisma/db/custom.db
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Version Management

This project includes a built-in version management system:

```bash
# Save current state
npm run version:save "Description of changes"

# List all versions
npm run version:list

# Restore to a previous version
npm run version:restore <version-id>

# Show current version
npm run version:current
```

[Learn more about version management](./VERSION_SYSTEM.md)

## 📁 Project Structure

```
golden-hour-calculator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── golden-hour/       # Dynamic routes
│   └── page.tsx           # Main page
├── components/            # React components
├── lib/                   # Utility functions
├── public/               # Static assets
├── src/                  # Source code
│   └── components/       # Additional components
├── types/                # TypeScript types
└── project-version.js    # Version management tool
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run version:save # Save project version
npm run version:list # List all versions
```

## 🌐 API Endpoints

- `GET /api/location` - Get user location
- `GET /api/weather` - Get weather data
- `GET /api/geocoding` - Geocode addresses
- `GET /api/images/unsplash` - Search Unsplash
- `GET /api/images/pexels` - Search Pexels

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t golden-hour .
docker run -p 3000:3000 golden-hour
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Photos from [Unsplash](https://unsplash.com/) and [Pexels](https://www.pexels.com/)
- Sun calculations using [SunCalc](https://github.com/mourner/suncalc)
- UI components from [Radix UI](https://www.radix-ui.com/)

## 📧 Contact

Abu Hasnat - [@abuhasnatruhu](https://github.com/abuhasnatruhu)

Project Link: [https://github.com/abuhasnatruhu/Golden-Hour](https://github.com/abuhasnatruhu/Golden-Hour)

---

**Note:** This project uses versioned branches for different states. Each version is saved as a branch prefixed with `version/`. The main branch contains the latest stable version.