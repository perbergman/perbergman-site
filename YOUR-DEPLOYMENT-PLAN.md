# Your Deployment Plan: Replace Current Site

Since you want to replace your current site, here's the streamlined plan:

## Phase 1: Capture Content from Old Site (Do This First!)

Before changing anything, save content from your current AWS LightSail site:

### Option A: Manual Capture
1. Visit your current site
2. Copy/paste any text content you want to keep
3. Download any images/files
4. Save to a local folder

### Option B: Use wget (if it's a simple site)
```bash
# Download entire site
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent https://your-domain.com -P old-site-backup/
```

### Where to Put Old Content

Add it to your new site's content directories:
- Text content → Convert to `.mdx` files in `content/writing/` or `content/notebook/`
- Images → Create a `public/images/` directory
- Other files → `public/` directory

---

## Phase 2: Deploy New Site to Vercel

### 1. Create GitHub Repository
```bash
# Go to: https://github.com/new
# Create repo named: perbergman-site
# Then run:

git remote add origin https://github.com/YOUR_USERNAME/perbergman-site.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `perbergman-site`
5. Click "Deploy"

**Wait for deployment to complete** - you'll get a URL like:
`https://perbergman-site.vercel.app`

### 3. Test Your Vercel Site
- Visit the `.vercel.app` URL
- Make sure everything works
- Add any missing content
- Test all sections

---

## Phase 3: Switch DNS to New Site

### Step 1: Get Current DNS Records (for backup)

1. Go to AWS Console → Route 53
2. Click "Hosted zones"
3. Click your domain
4. **Take a screenshot** or note down all records
5. Specifically note the A record IP (your LightSail IP)

### Step 2: Add Your Domain in Vercel

1. In Vercel project → Settings → Domains
2. Add your apex domain: `yourdomain.com`
3. Add www subdomain: `www.yourdomain.com`
4. Vercel will show you the DNS records needed

### Step 3: Update Route 53 Records

**For apex domain (yourdomain.com):**

1. Find existing A record for `@` or `yourdomain.com`
2. Edit it:
   ```
   Record name: @ (or leave blank)
   Record type: A
   Value: 76.76.21.21  ← Vercel's IP
   TTL: 300
   ```

**For www subdomain:**

1. Find or create CNAME record for `www`
2. Edit/Create it:
   ```
   Record name: www
   Record type: CNAME
   Value: cname.vercel-dns.com
   TTL: 300
   ```

3. Click "Save changes"

### Step 4: Verify in Vercel

1. Back in Vercel, click "Verify" next to both domains
2. Should verify within 1-5 minutes (Route 53 is fast)
3. Vercel will auto-provision SSL certificate
4. Wait 5-10 minutes for SSL

### Step 5: Test Your Live Site

Visit your domain - you should see your new site! 🎉

---

## Phase 4: Archive Old Site (Optional)

If you want to keep the old site accessible:

### Option A: Move to Subdomain

**In Route 53:**
1. Create new A record:
   ```
   Record name: old
   Record type: A
   Value: [Your LightSail IP from backup]
   TTL: 300
   ```

Your old site is now at `old.yourdomain.com`

### Option B: Shut Down LightSail

If you don't need the old site:
1. Download any remaining content
2. Take final screenshots
3. Delete LightSail instance (saves money!)

---

## Timeline

- **Phase 1** (Content capture): 30 minutes - 2 hours
- **Phase 2** (Deploy to Vercel): 10 minutes
- **Phase 3** (DNS switch): 5 minutes + 15 minutes propagation
- **Phase 4** (Archive): 5 minutes or skip

**Total: ~1-3 hours** depending on how much content to migrate

---

## Rollback Plan (Just in Case)

If something goes wrong, you can quickly rollback:

**In Route 53:**
1. Change A record back to your LightSail IP
2. Change CNAME back to old value (if applicable)
3. Wait 5 minutes for DNS to propagate

This is why we took screenshots/notes in Step 1!

---

## What You Need

Before starting:

1. **Your domain name** - What is it?
2. **GitHub username** - For creating repo
3. **Content from old site** - Captured and ready
4. **30 minutes of focused time** - To do the switch

---

## Next Steps

**Tell me:**
1. What's your domain name?
2. Do you want help capturing content from the old site?
3. Are you ready to start, or want to wait?

I can provide exact DNS records once I know your domain name!

