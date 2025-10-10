# Deploying Pocket Symptom Tracker to Vercel

This guide walks you through deploying the Pocket Symptom Tracker PWA to Vercel for production hosting.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account (free tier is sufficient) - Sign up at [vercel.com](https://vercel.com)
- Your code pushed to a Git repository

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main  # or your default branch
```

### 2. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `symptom-tracker` repository
4. Vercel will auto-detect Next.js - click "Deploy"

That's it! Vercel will automatically:
- Install dependencies (`npm install`)
- Build your app (`npm run build`)
- Deploy to a production URL

### 3. Configure Your Deployment (Optional)

#### Custom Domain

1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### Environment Variables

If you add any environment variables in the future:

1. Go to "Settings" → "Environment Variables"
2. Add variables for Production, Preview, and Development
3. Redeploy for changes to take effect

## Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- **PWA Support**: Proper headers for service worker and manifest
- **Caching**: Optimized cache headers for icons and static assets
- **Framework Detection**: Automatic Next.js detection and optimization

## Build Configuration

- **Build Command**: `npm run build` (uses Next.js default compiler)
- **Output Directory**: `.next` (automatic)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Post-Deployment Checklist

After your first deployment:

- ✅ Visit your Vercel URL (e.g., `symptom-tracker.vercel.app`)
- ✅ Test PWA installation (look for "Install" prompt)
- ✅ Verify service worker registration in DevTools
- ✅ Test offline functionality
- ✅ Check IndexedDB data persistence
- ✅ Test on mobile devices
- ✅ Verify manifest.json is accessible at `/manifest.json`

## Automatic Deployments

Vercel automatically deploys:

- **Production**: Every push to your main/master branch
- **Preview**: Every push to other branches and pull requests
- Each deployment gets a unique URL for testing

## Key Features Enabled

### Progressive Web App (PWA)
- Service worker served with correct headers
- Manifest.json configured for installability
- Icon assets cached efficiently

### Performance Optimizations
- Automatic edge caching
- Image optimization via Next.js
- Static asset compression (gzip/brotli)
- Global CDN distribution

### Developer Experience
- Instant rollbacks to previous deployments
- Preview deployments for every PR
- Build logs and runtime logs
- Performance analytics

## Monitoring Your Deployment

### Build Logs
1. Go to your Vercel dashboard
2. Click on your deployment
3. View build logs under "Building" tab

### Runtime Logs
1. Go to your project dashboard
2. Click "Logs" tab
3. Monitor real-time application logs

### Analytics (Free)
1. Enable Vercel Analytics in project settings
2. View page views, performance metrics
3. Monitor Core Web Vitals

## Troubleshooting

### Build Failures

**ESLint Errors**: The build may fail due to ESLint warnings. To ignore them temporarily:

```json
// next.config.ts
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Not recommended for production
  },
  // ... rest of config
};
```

Better approach: Fix the errors shown in build logs.

### Service Worker Not Loading

Check that:
1. You're accessing via HTTPS (Vercel provides this automatically)
2. Service worker file is in `/public/sw.js`
3. Check browser console for registration errors

### IndexedDB Issues

IndexedDB works in all modern browsers on HTTPS. Test:
1. Open DevTools → Application → IndexedDB
2. Verify databases are created
3. Check that data persists after page reload

### Mobile Installation Issues

PWA installation requires:
- HTTPS (✅ automatic on Vercel)
- Valid manifest.json (✅ included)
- Service worker (✅ included)
- Sufficient icons (✅ in /public/icons)

## Environment-Specific Notes

### Production URLs
- Default: `https://your-project.vercel.app`
- Custom domain: Configure in Vercel dashboard

### Preview URLs
- Format: `https://your-project-git-branch.vercel.app`
- Created automatically for each branch/PR

### Development
- Local: `http://localhost:3001`
- Use `npm run dev` for local development

## Security Considerations

Since this is a privacy-first PWA:

- ✅ All data stored locally (IndexedDB)
- ✅ No backend servers required
- ✅ HTTPS enforced by Vercel
- ✅ No cookies or tracking
- ✅ No external API calls for personal data

## Updating Your Deployment

Simply push changes to your repository:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel automatically:
1. Detects the push
2. Runs build
3. Deploys to production (main branch) or preview (other branches)
4. Notifies you via email

## Cost Considerations

**Free Tier Includes**:
- Unlimited deployments
- HTTPS/SSL certificates
- Global CDN
- 100GB bandwidth/month
- Automatic optimizations

**This project fits entirely in the free tier** since:
- No backend/API routes consuming compute time
- Client-side only (PWA)
- Small bundle size
- Static asset serving

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

## Next Steps

After successful deployment:

1. **Test thoroughly** on multiple devices
2. **Share the URL** with beta testers
3. **Monitor analytics** to understand usage
4. **Set up custom domain** (optional)
5. **Enable Web Analytics** in Vercel dashboard

---

## Quick Deploy Button (Optional)

Add this to your README.md for one-click deploys:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/symptom-tracker)
```

Replace `YOUR_USERNAME` with your GitHub username.
