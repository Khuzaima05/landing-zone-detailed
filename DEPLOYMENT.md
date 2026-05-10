# Deployment Guide

Complete guide for deploying the IBM Cloud Landing Zone Documentation website to Vercel.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)
- [Alternative Deployment Options](#alternative-deployment-options)

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account**
   - Repository with your documentation
   - Push access to the repository

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Free tier is sufficient for most documentation sites

3. **Local Setup** (for testing)
   - Python 3.8 or later
   - pip package manager
   - Git

## Vercel Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### Step 2: Configure Build Settings

Vercel will automatically detect the `vercel.json` configuration file. Verify these settings:

```json
{
  "buildCommand": "cd docs-website && uv pip install --system -r requirements.txt && mkdocs build",
  "outputDirectory": "docs-website/site",
  "framework": null,
  "devCommand": "cd docs-website && mkdocs serve"
}
```

**Important**: Vercel uses `uv` (a fast Python package installer) to manage Python environments. You **must** use `uv pip install --system` instead of regular `pip` commands:

- ✅ **Correct**: `uv pip install --system -r requirements.txt`
- ❌ **Incorrect**: `pip install -r requirements.txt`
- ❌ **Incorrect**: `pip install --upgrade pip`

The `--system` flag tells uv to install packages system-wide, which is required in Vercel's managed environment. Regular `pip` commands are blocked and will cause build failures.

**Manual Configuration** (if needed):

- **Framework Preset**: `Other`
- **Root Directory**: `./` (leave as root)
- **Build Command**: `cd docs-website && uv pip install --system -r requirements.txt && mkdocs build`
- **Output Directory**: `docs-website/site`
- **Install Command**: Leave empty (Vercel handles this automatically)

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be live at `https://your-project.vercel.app`

### Step 4: Verify Deployment

1. Visit your Vercel URL
2. Check that all pages load correctly
3. Test navigation and search functionality
4. Verify dark/light mode toggle works
5. Test on mobile devices

## Environment Variables

Currently, no environment variables are required. If you need to add any in the future:

1. Go to **Project Settings** → **Environment Variables**
2. Add variables for:
   - `Production` (main branch)
   - `Preview` (pull requests)
   - `Development` (local development)

Example variables you might add:

```bash
# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Search
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key

# Custom settings
SITE_URL=https://your-domain.com
```

## Custom Domain Setup

### Step 1: Add Domain to Vercel

1. Go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name (e.g., `docs.yourcompany.com`)
4. Click **"Add"**

### Step 2: Configure DNS

Vercel will provide DNS records. Add them to your domain provider:

**Option A: Using Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: Using A/CNAME Records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Verify Domain

1. Wait for DNS propagation (5-60 minutes)
2. Vercel will automatically verify and provision SSL
3. Your site will be available at your custom domain

### SSL Certificate

- Automatically provisioned by Vercel
- Renews automatically
- Supports wildcard domains
- Free with all plans

## Troubleshooting

### Build Failures

**Problem**: Build fails with `pip` command errors on Vercel

**Solution**:
Vercel uses `uv` (a fast Python package installer) to manage Python environments and blocks regular `pip` commands. You **must** use `uv pip install --system` instead:

1. **Correct vercel.json configuration**:
   ```json
   {
     "buildCommand": "cd docs-website && uv pip install --system -r requirements.txt && mkdocs build",
     "outputDirectory": "docs-website/site",
     "framework": null,
     "devCommand": "cd docs-website && mkdocs serve"
   }
   ```

2. **Why `--system` flag is required**:
   - Vercel's environment is managed by `uv`
   - Regular `pip` commands are blocked
   - The `--system` flag installs packages system-wide in uv's managed environment
   - Without it, you'll get permission errors or package installation failures

3. **Alternative: Use the build script**:
   ```json
   {
     "buildCommand": "cd docs-website && bash build-vercel.sh",
     "outputDirectory": "docs-website/site",
     "framework": null
   }
   ```
   The `build-vercel.sh` script already uses `uv pip install --system`.

4. **Common errors and fixes**:
   - ❌ `pip: command not found` → Use `uv pip` instead
   - ❌ `pip install --upgrade pip` blocked → Remove this command, uv manages pip
   - ❌ Permission denied errors → Add `--system` flag to `uv pip install`

**Problem**: Build fails with Python errors

**Solution**:
```bash
# Check requirements.txt has all dependencies
cd docs-website
pip install -r requirements.txt
mkdocs build

# If successful locally, check Vercel logs
```

**Problem**: Module not found errors

**Solution**:
- Ensure all dependencies are in `requirements.txt`
- Check Python version compatibility (3.8+)
- Verify file paths in `mkdocs.yml`

### Deployment Issues

**Problem**: Site deploys but pages are blank

**Solution**:
- Check `outputDirectory` is set to `docs-website/site`
- Verify `mkdocs build` creates files in `site/` directory
- Check browser console for JavaScript errors

**Problem**: CSS/JavaScript not loading

**Solution**:
- Verify `site_url` in `mkdocs.yml` matches your domain
- Check that static files are in the `site/` directory
- Clear browser cache and hard reload

### Domain Issues

**Problem**: Domain not verifying

**Solution**:
- Wait 24-48 hours for DNS propagation
- Use [DNS Checker](https://dnschecker.org) to verify records
- Ensure no conflicting DNS records exist
- Contact your domain provider if issues persist

**Problem**: SSL certificate not provisioning

**Solution**:
- Ensure domain is verified first
- Check that DNS records are correct
- Wait up to 24 hours for certificate issuance
- Contact Vercel support if needed

### Performance Issues

**Problem**: Slow page loads

**Solution**:
- Enable Vercel's Edge Network (automatic)
- Optimize images (use WebP format)
- Minimize custom JavaScript
- Use Vercel Analytics to identify bottlenecks

## Alternative Deployment Options

### GitHub Pages

Deploy using the included GitHub Actions workflow:

```bash
cd docs-website
./deploy.sh
```

Or push to trigger automatic deployment:
```bash
git push origin main
```

Site will be available at: `https://username.github.io/repository-name`

### Netlify

1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `cd docs-website && pip install -r requirements.txt && mkdocs build`
   - Publish directory: `docs-website/site`
3. Deploy

### AWS S3 + CloudFront

```bash
# Build site
cd docs-website
./build.sh

# Upload to S3
aws s3 sync site/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker Container

```dockerfile
FROM python:3.11-slim

WORKDIR /docs
COPY docs-website/requirements.txt .
RUN pip install -r requirements.txt

COPY docs-website/ .
RUN mkdocs build

FROM nginx:alpine
COPY --from=0 /docs/site /usr/share/nginx/html
```

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

### Manual Deployments

Trigger manual deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Rollback

If a deployment has issues:
1. Go to **Deployments** in Vercel dashboard
2. Find the last working deployment
3. Click **"..."** → **"Promote to Production"**

## Monitoring

### Vercel Analytics

Enable analytics in Project Settings:
- Page views and unique visitors
- Top pages and referrers
- Performance metrics
- Real user monitoring

### Custom Monitoring

Add monitoring tools:
- Google Analytics
- Plausible Analytics
- Fathom Analytics
- Matomo

## Support

### Vercel Support

- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Support**: Available for Pro and Enterprise plans

### Project Support

- **Issues**: [GitHub Issues](https://github.com/your-org/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/your-repo/discussions)

## Best Practices

1. **Test Locally First**
   ```bash
   cd docs-website
   ./serve.sh
   ```

2. **Use Preview Deployments**
   - Create pull requests for changes
   - Review preview deployment before merging

3. **Monitor Performance**
   - Enable Vercel Analytics
   - Check Core Web Vitals
   - Optimize images and assets

4. **Keep Dependencies Updated**
   ```bash
   pip list --outdated
   pip install --upgrade -r requirements.txt
   ```

5. **Use Environment Variables**
   - Never commit secrets
   - Use Vercel's environment variables
   - Different values for production/preview

## Security

1. **HTTPS Only**
   - Enforced by default on Vercel
   - Automatic SSL certificate renewal

2. **Security Headers**
   Add to `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ]
   }
   ```

3. **Access Control**
   - Use Vercel's password protection for staging
   - Configure IP allowlists if needed
   - Enable Vercel Authentication for team access

## Cost Optimization

### Free Tier Limits
- 100 GB bandwidth per month
- Unlimited deployments
- Automatic SSL
- Edge Network included

### Pro Tier Benefits ($20/month)
- 1 TB bandwidth
- Advanced analytics
- Priority support
- Team collaboration features

### Tips to Stay Within Free Tier
- Optimize images (use WebP)
- Enable caching headers
- Minimize external resources
- Use Vercel's image optimization

---

**Need Help?** Open an issue on GitHub or contact the team.

**Last Updated**: 2026-05-10