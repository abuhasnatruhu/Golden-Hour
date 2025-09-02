# Golden Hour Calculator - Vercel Deployment Guide

This guide will help you deploy your Golden Hour Calculator app to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **API Keys**: Obtain required API keys (see Environment Variables section)

## Quick Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

#### Required Variables

\`\`\`bash
# Database (for production, use a cloud database)
DATABASE_URL=your-production-database-url

# Authentication
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app

# Weather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key

# Image APIs (Optional but recommended)
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
UNSPLASH_APPLICATION_ID=your-unsplash-app-id
UNSPLASH_SECRET_KEY=your-unsplash-secret-key
PEXELS_API_KEY=your-pexels-api-key
\`\`\`

### 3. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## Getting API Keys

### OpenWeatherMap API (Required)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it as `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### Unsplash API (Optional - for photography inspiration)
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key, Application ID, and Secret Key
4. Add them to your environment variables

### Pexels API (Optional - alternative image source)
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up and get your API key
3. Add it as `PEXELS_API_KEY`

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)
1. In your Vercel project, go to **Storage**
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

### Option 2: External Database
Use services like:
- [PlanetScale](https://planetscale.com/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

## Environment Variable Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** to your repository
2. **Regenerate API keys** if they've been exposed
3. **Use different keys** for development and production
4. **Set up proper CORS** for your APIs

## Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to use your custom domain

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are resolved

### Environment Variables
- Double-check variable names (case-sensitive)
- Ensure all required variables are set
- Redeploy after adding new variables

### Database Issues
- Verify `DATABASE_URL` is correct
- Check database connection limits
- Ensure database is accessible from Vercel

## Performance Optimization

The included `vercel.json` file optimizes:
- Static asset caching
- API route performance
- CORS headers
- Function timeouts

## Monitoring

1. **Analytics**: Enable Vercel Analytics in project settings
2. **Logs**: Check function logs in Vercel dashboard
3. **Performance**: Monitor Core Web Vitals

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review build logs
3. Verify environment variables
4. Test locally first

---

**Your Golden Hour Calculator is now ready for the world! 🌅📸**
