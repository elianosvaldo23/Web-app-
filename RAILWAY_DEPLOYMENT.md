# 🚂 Railway Deployment Guide for Stremio Web

## 📋 Quick Setup

This Stremio Web application has been optimized for **one-click deployment** on Railway with zero configuration required.

## 🚀 Deployment Methods

### Method 1: One-Click Deploy (Recommended)

1. Click the deploy button: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)
2. Connect your GitHub account
3. Select this repository: `elianosvaldo23/Web-app-`
4. Choose branch: `development`
5. Click "Deploy" - Railway will handle the rest!

### Method 2: Manual Deployment

1. **Fork Repository**:
   ```bash
   git clone https://github.com/elianosvaldo23/Web-app-.git
   cd Web-app-
   git checkout development
   ```

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Create new project → "Deploy from GitHub repo"
   - Select your forked repository
   - Choose `development` branch

3. **Deploy**:
   - Railway auto-detects Node.js
   - Uses `railway.toml` configuration
   - Builds and deploys automatically

## ⚙️ Configuration Files

The following files optimize Railway deployment:

### `railway.toml` - Railway Configuration
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start-prod"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### `server.js` - Production Server
- Express.js server optimized for Railway
- Health check endpoint at `/health`
- Graceful shutdown handling
- SPA routing support

### `.railwayignore` - Deployment Optimization
- Excludes unnecessary files from deployment
- Reduces build time and image size

## 🔧 Build Process

Railway automatically:
1. **Detects** Node.js project
2. **Installs** dependencies with npm
3. **Builds** production bundle (`npm run build`)
4. **Starts** server (`npm run start-prod`)

## 📊 Scripts Available

| Script | Description | Usage |
|--------|-------------|-------|
| `npm start` | Development server | Local development |
| `npm run build` | Production build | Creates `dist/` folder |
| `npm run start-prod` | Production server | Serves built files |
| `npm run serve` | Build + serve | One command deploy |
| `npm run dev` | Dev server (0.0.0.0) | Network accessible dev |

## 🌐 Environment Variables

Railway automatically sets:
- `NODE_ENV=production`
- `PORT=<dynamic>` (Railway assigns port)

Optional variables:
```bash
# Custom configuration (if needed)
CUSTOM_VAR=value
```

## 🏥 Health Monitoring

The app includes a health check endpoint:
- **URL**: `https://your-app.railway.app/health`
- **Response**: 
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "service": "stremio-web"
  }
  ```

## 🐳 Docker Support

Alternative deployment with Docker:

```bash
# Build image
docker build -t stremio-web .

# Run locally
docker run -p 8080:8080 stremio-web

# Or use compose
docker-compose up
```

## 📝 Post-Deployment

After successful deployment:

1. **Access your app**: Railway provides a public URL
2. **Custom domain** (optional): Configure in Railway settings
3. **Monitor**: Use Railway dashboard for logs and metrics
4. **Scale**: Railway handles scaling automatically

## 🔍 Troubleshooting

### Common Issues

**Build Fails**:
- Check Node.js version (requires 20+)
- Verify all dependencies in package.json
- Review build logs in Railway dashboard

**App Won't Start**:
- Ensure `server.js` exists
- Check `start-prod` script in package.json
- Verify health check endpoint responds

**404 Errors**:
- SPA routing configured in `server.js`
- All routes fallback to `index.html`

### Debug Commands

```bash
# Local testing
npm run build
npm run start-prod
curl http://localhost:8080/health

# Check build output
ls -la dist/
```

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Stremio Issues**: [GitHub Issues](https://github.com/elianosvaldo23/Web-app-/issues)
- **Railway Community**: [Discord](https://discord.gg/railway)

---

**✅ Ready to deploy!** Your Stremio Web app is optimized for Railway with zero configuration required.