# 🚀 RocketMaps

A modern, interactive property mapping Progressive Web Application built with React, TypeScript, and Leaflet.

![RocketMaps Screenshot](https://github.com/pburglin/RocketMap/blob/8b60f1f637fa9d617401b9f3540447ed4a4d3374/public/rocketmap.png?raw=true)

## 📱 Features

- **Interactive Maps**: Explore properties with multiple map layers (Streets, Satellite, Topography)
- **Location Tracking**: Real-time GPS tracking with direction indicators
- **Bookmarks**: Save and organize your favorite locations
- **Offline Support**: Access maps and saved locations even without internet connection
- **Customizable Settings**: Personalize your map experience
- **Cross-Platform**: Works on desktop and mobile devices
- **Installable**: Install as a PWA on your device for quick access

## 🛠️ Technology Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PWA Support**: Vite PWA Plugin

## 🏗️ Architecture

RocketMaps follows a modular component-based architecture with the following key elements:

### Core Components

- **Map Component**: Central interactive map with multiple layers and overlays
- **Footer Navigation**: Quick access to bookmarks, settings, and profile
- **Modal System**: Reusable modal component for various interfaces

### State Management

The application uses React Context API for global state management with the following key features:

- **User Location**: Tracks and stores the user's current GPS coordinates
- **Bookmarks**: Manages saved locations with metadata
- **Map Settings**: Controls map appearance and behavior
- **User Profile**: Manages user preferences and theme settings

### Data Flow

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  User Actions   │────▶│  AppContext   │────▶│  Components    │
│  (Interactions) │     │  (State)      │     │  (UI Updates)  │
└─────────────────┘     └───────────────┘     └────────────────┘
        ▲                      │                      │
        │                      ▼                      │
        │              ┌───────────────┐              │
        └──────────────│  LocalStorage │◀─────────────┘
                       │  (Persistence)│
                       └───────────────┘
```

### Key Design Patterns

- **Custom Hooks**: Encapsulates complex logic like geolocation and local storage
- **Compound Components**: Modal system with specialized implementations
- **Context Provider Pattern**: Global state management with specialized contexts

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rocket-maps.git
cd rocket-maps

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📋 Project Structure

```
rocket-maps/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Map.tsx        # Main map component
│   │   ├── Footer.tsx     # Navigation footer
│   │   ├── Modal.tsx      # Base modal component
│   │   └── ...            # Other components
│   ├── context/           # React context providers
│   │   └── AppContext.tsx # Global application state
│   ├── hooks/             # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   └── useLocalStorage.ts
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
└── package.json           # Project dependencies and scripts
```

## 🧩 Key Components

### Map Component

The central map interface that displays various map layers, user location, and bookmarks.

```tsx
<Map focusLocation={focusLocation} />
```

### Modal System

A flexible modal system with specialized implementations for different features:

```tsx
<BookmarksModal 
  isOpen={isBookmarksOpen} 
  onClose={() => setIsBookmarksOpen(false)}
  onSelectBookmark={handleSelectBookmark}
/>
```

### Context Provider

Global state management with React Context:

```tsx
<AppProvider>
  <AppContent />
</AppProvider>
```

## 🔄 State Management

RocketMaps uses React Context API for state management with the following key states:

- **User Location**: Current GPS coordinates with accuracy and heading
- **Bookmarks**: Array of saved locations with metadata
- **Map Settings**: Configuration for map appearance and behavior
- **User Profile**: User preferences and theme settings

## 📱 Progressive Web App Features

RocketMaps is designed as a Progressive Web App (PWA) with the following features:

- **Offline Support**: Access maps and saved locations without internet
- **Installable**: Add to home screen for app-like experience
- **Responsive Design**: Works on all device sizes
- **Fast Loading**: Optimized for quick startup and navigation

## 🧪 Testing

```bash
# Run tests
npm run test
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Project Link: [https://github.com/pburglin/RocketMap](https://github.com/pburglin/RocketMap)

---

Made with ❤️ by RocketMap
