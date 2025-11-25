# Deployment Guide: Vercel + GitHub + Custom Domain

This guide will walk you through deploying your site to Vercel with a custom domain.

## Prerequisites

- ✅ Git repository initialized (done!)
- GitHub account
- Vercel account (free tier is perfect for this)
- Custom domain with DNS access

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `perbergman-site` (or your preferred name)
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/perbergman-site.git

# Push code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" (or "Log In" if you have an account)
3. Choose "Continue with GitHub" for easiest integration
4. Authorize Vercel to access your GitHub account

### 3.2 Import Your Repository

1. From Vercel dashboard, click "Add New..." → "Project"
2. Find your `perbergman-site` repository in the list
3. Click "Import"

### 3.3 Configure Project

Vercel will auto-detect Next.js settings. You should see:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**No changes needed!** Just click "Deploy"

### 3.4 Wait for Deployment

Vercel will:
- Install dependencies
- Build your site
- Deploy to a `.vercel.app` URL

This takes 1-2 minutes. You'll get a URL like:
`https://perbergman-site.vercel.app`

## Step 4: Configure Custom Domain

### 4.1 Add Domain in Vercel

1. In your Vercel project, go to "Settings" → "Domains"
2. Enter your custom domain (e.g., `perbergman.com`)
3. Click "Add"

### 4.2 Configure DNS

Vercel will show you DNS records to add. You have two options:

#### Option A: Apex Domain (perbergman.com)

Add an **A Record**:
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
```

#### Option B: Subdomain (www.perbergman.com)

Add a **CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Option C: Both (Recommended)

Add both records above, then in Vercel:
- Set `perbergman.com` as primary
- Add `www.perbergman.com` as redirect

### 4.3 Update DNS at Your Registrar

1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Find DNS settings
3. Add the A and/or CNAME records from above
4. Save changes

**Note**: DNS propagation can take 5 minutes to 48 hours (usually ~15 minutes)

### 4.4 Verify in Vercel

1. Back in Vercel, click "Verify" next to your domain
2. Once verified, Vercel will automatically provision an SSL certificate
3. Your site will be live at your custom domain! 🎉

## Step 5: Automatic Deployments

Now whenever you push to GitHub:

```bash
git add .
git commit -m "Update content"
git push
```

Vercel will automatically:
- Detect the push
- Build your site
- Deploy the new version
- Update your live site

**No manual deployment needed!**

## Environment Variables (Optional)

If you need environment variables:

1. In Vercel, go to "Settings" → "Environment Variables"
2. Add variables for Production, Preview, and Development
3. Redeploy for changes to take effect

## Troubleshooting

### Build Fails

- Check the build logs in Vercel
- Ensure `npm run build` works locally
- Check for TypeScript errors

### Domain Not Working

- Wait 15-30 minutes for DNS propagation
- Use https://dnschecker.org to verify DNS records
- Ensure DNS records match exactly what Vercel shows

### SSL Certificate Issues

- Vercel auto-provisions SSL (Let's Encrypt)
- Can take 5-10 minutes after domain verification
- If issues persist, remove and re-add the domain

## Next Steps

- Add more content to `content/` directories
- Customize styling in `app/globals.css`
- Update metadata in `app/layout.tsx`
- Add analytics (Vercel Analytics is built-in and free)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Custom Domains on Vercel](https://vercel.com/docs/concepts/projects/domains)

