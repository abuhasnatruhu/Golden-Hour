# 🚀 Live Version Deployment Guide

This guide shows you how to see each version of your project live online in real-time.

## 🌐 Option 1: Vercel (Recommended - FREE)

Vercel automatically creates live preview URLs for every branch (version) you push to GitHub.

### Setup Steps:

1. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

2. **Import Your Project**
   - Click "New Project"
   - Select your `Golden-Hour` repository
   - Click "Import"

3. **Configure Settings**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   OPENWEATHER_API_KEY=79c1bbcbb08bd676c2b2498bfc0f353d
   UNSPLASH_ACCESS_KEY=HT7RNqQ_jGXVGcttet8ttcmebRG5wD9qXi3DhZCJnQg
   PEXELS_API_KEY=WxPmRxrHuriDMZQKMU5bTisqn58a9ghq5E0ESWpEN7b8S4jAFmRTOyzY
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes

### 🎉 Result: Live URLs for Each Version

After setup, you'll get:

| Version | Live URL |
|---------|----------|
| Main (Production) | `https://golden-hour.vercel.app` |
| Version 1 (Initial) | `https://golden-hour-git-version-v-2025-08-31t17-54-27-373z-bc8cyx.vercel.app` |
| Version 2 (Test) | `https://golden-hour-git-version-v-2025-08-31t17-59-19-034z-e8p6ym.vercel.app` |
| Version 3 (v1) | `https://golden-hour-git-version-v-2025-08-31t18-40-08-336z-ozl9tm.vercel.app` |

**Every new version you push will automatically get its own URL!**

## 🔄 Option 2: Netlify (Alternative - FREE)

Similar to Vercel, with automatic branch deployments.

### Setup:
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Import your repository
4. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: .next
   ```
5. Add environment variables
6. Deploy

### URLs Pattern:
- Main: `https://golden-hour.netlify.app`
- Branches: `https://version-[branch-name]--golden-hour.netlify.app`

## 🖥️ Option 3: GitHub Pages (Static Only)

For simpler static previews:

1. **Enable GitHub Pages**
   - Go to your repo Settings
   - Click "Pages"
   - Source: Deploy from a branch
   - Branch: Select your version branch

2. **Access URLs**
   - Main: `https://abuhasnatruhu.github.io/Golden-Hour/`
   - Switch branches to see different versions

## ⚡ Option 4: Render.com (FREE)

1. Sign up at [render.com](https://render.com)
2. Connect GitHub
3. Create "Web Service"
4. Configure for Next.js
5. Enable "Auto-Deploy" for all branches

## 🎯 Quick Vercel Setup Script

Run this to prepare for Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy current version
vercel

# Deploy specific branch
vercel --prod --scope your-username
```

## 📱 How to View Live Versions

### After Vercel Setup:

1. **Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click your project
   - Click "View Deployments"
   - See all branches with live URLs

2. **Direct URLs**
   Each branch gets a URL like:
   ```
   https://golden-hour-git-[branch-name]-[username].vercel.app
   ```

3. **GitHub Integration**
   - Every push shows a preview link in GitHub
   - Check Pull Requests for preview URLs
   - See deployment status on commits

## 🔗 Automatic Version Links

After deployment, your versions will be live at:

```javascript
// Version URLs Generator
const getVersionURL = (versionId) => {
  const branchName = `version-${versionId}`;
  return `https://golden-hour-git-${branchName}-abuhasnatruhu.vercel.app`;
}

// Example URLs:
// v1: https://golden-hour-git-version-v-2025-08-31t18-40-08-336z-ozl9tm-abuhasnatruhu.vercel.app
```

## 📊 Version Switching Interface

Create a version switcher in your app:

```javascript
// Add to your app
const versions = [
  { id: 'main', url: 'https://golden-hour.vercel.app', name: 'Latest' },
  { id: 'v1', url: 'https://golden-hour-git-version-v1.vercel.app', name: 'Version 1' },
  // Add more versions
];
```

## 🚀 One-Click Deploy Buttons

Add these to your README for instant deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abuhasnatruhu/Golden-Hour)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abuhasnatruhu/Golden-Hour)

## 📝 Commands After Setup

```bash
# Push new version and auto-deploy
npm run version:save "New feature"
npm run github:push
# Vercel automatically deploys it!

# Check deployment status
vercel ls

# Get deployment URL
vercel inspect [deployment-url]
```

## 🎉 Benefits

✅ **Every version gets a unique URL**
✅ **Automatic deployment on push**
✅ **Share specific versions with clients**
✅ **Test different versions simultaneously**
✅ **No manual deployment needed**
✅ **Free hosting for all versions**

## 🔍 Example Live URLs (After Setup)

Your versions will be accessible at:

1. **Production (main branch)**
   ```
   https://golden-hour.vercel.app
   ```

2. **Version Previews**
   ```
   https://golden-hour-git-version-[id].vercel.app
   ```

3. **Custom Domains** (Optional)
   ```
   https://v1.yourdomain.com
   https://v2.yourdomain.com
   ```

## 💡 Pro Tips

1. **Bookmark Version URLs** - Save each version's URL for quick access
2. **Share with Clients** - Send specific version URLs for review
3. **A/B Testing** - Run different versions simultaneously
4. **Rollback Instantly** - Just share the old version's URL

---

**Ready to go live?** Start with Vercel - it's the easiest and gives you instant live URLs for every version!