# Stremio - Freedom to Stream

![Build](https://github.com/stremio/stremio-web/workflows/Build/badge.svg?branch=development)
[![Github Page](https://img.shields.io/website?label=Page&logo=github&up_message=online&down_message=offline&url=https%3A%2F%2Fstremio.github.io%2Fstremio-web%2F)](https://stremio.github.io/stremio-web/development)

Stremio is a modern media center that's a one-stop solution for your video entertainment. You discover, watch and organize video content from easy to install addons.

## Build

### Prerequisites

* Node.js 20 or higher
* [pnpm](https://pnpm.io/installation) 10 or higher (recommended) or npm 8+

### Install dependencies

```bash
# With pnpm (recommended)
pnpm install

# Or with npm
npm install
```

### Start development server

```bash
# With pnpm
pnpm start

# Or with npm
npm start
```

### Production build

```bash
# With pnpm
pnpm run build

# Or with npm
npm run build
```

### Production server

```bash
# Build and start production server
npm run serve

# Or start production server only (requires built dist/)
npm run start-prod
```

## 🚂 Deploy to Railway

This project is optimized for Railway deployment with zero-config setup.

### Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/stremio-web)

### Manual Deploy

1. **Fork this repository**
2. **Connect to Railway**: Go to [railway.app](https://railway.app) and create new project from GitHub repo
3. **Configure**: Railway will auto-detect Node.js and use the railway.toml configuration
4. **Deploy**: Click deploy - that's it! 🎉

### Environment Variables (Optional)

```bash
NODE_ENV=production  # Automatically set by Railway
PORT=8080           # Automatically set by Railway
```

### Railway Features Used

- ✅ **Auto-detection**: Node.js project automatically detected
- ✅ **Health checks**: Built-in `/health` endpoint
- ✅ **Zero-config**: Uses `railway.toml` for optimized settings
- ✅ **Production ready**: Optimized Docker build and Express server
- ✅ **Graceful shutdown**: Proper SIGTERM/SIGINT handling

### Run with Docker

```bash
# Build image
docker build -t stremio-web .

# Run container
docker run -p 8080:8080 stremio-web

# Or use docker-compose
docker-compose up
```

### Local Development Commands

```bash
# Development with hot reload
npm run dev

# Production build + serve
npm run serve

# Lint code
npm run lint

# Run tests
npm test
```

## Screenshots

### Board

![Board](/screenshots/board.png)

### Discover

![Discover](/screenshots/discover.png)

### Meta Details

![Meta Details](/screenshots/metadetails.png)

## License

Stremio is copyright 2017-2023 Smart code and available under GPLv2 license. See the [LICENSE](/LICENSE.md) file in the project for more information.
