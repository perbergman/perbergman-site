# Quick Start Guide

## 🚀 Deploy to Vercel (5 minutes)

### 1. Create GitHub Repo
```bash
# Go to: https://github.com/new
# Create repo, then run:

git remote add origin https://github.com/YOUR_USERNAME/perbergman-site.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Click "Deploy" (no config needed!)

**Done!** Your site is live at `https://your-project.vercel.app`

### 3. Add Custom Domain (Optional)
1. In Vercel: Settings → Domains
2. Add your domain
3. Update DNS at your registrar:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. Wait 15 minutes for DNS propagation

**Done!** Your site is live at your custom domain! 🎉

---

## ✍️ Add Content

Just add `.mdx` files to these directories:

```
content/
├── notebook/     # Personal notes
├── art/          # Art projects
├── writing/      # Essays & articles
└── systems/      # Architecture docs
```

### File Format
```mdx
---
title: "Your Title"
date: "2025-11-25"
summary: "Brief description"
---

# Your Content

Write here...
```

---

## 🔄 Update Your Site

```bash
# Make changes, then:
git add .
git commit -m "Add new content"
git push
```

Vercel automatically deploys! ⚡

---

## 📚 Full Documentation

- **Deployment**: See `DEPLOYMENT.md`
- **Content**: See `README.md`
- **Vercel Docs**: https://vercel.com/docs

