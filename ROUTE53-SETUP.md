# Route 53 Setup for Vercel (with Existing AWS LightSail Site)

Since you already have a domain in Route 53 pointing to AWS LightSail, you have a few options for adding your new Vercel site.

## Your Options

### Option 1: Subdomain (Recommended - Easiest)
Keep your existing site at the main domain, add new site on subdomain.

**Example:**
- `perbergman.com` → AWS LightSail (existing site)
- `portfolio.perbergman.com` → Vercel (new site)
- OR `www.perbergman.com` → Vercel (new site)

### Option 2: Different Path (Not Possible)
❌ Can't do `perbergman.com/portfolio` pointing to Vercel while root is on LightSail.
This would require a reverse proxy.

### Option 3: Swap Sites
Move existing site to subdomain, new site to main domain.

**Example:**
- `perbergman.com` → Vercel (new site)
- `old.perbergman.com` → AWS LightSail (existing site)

---

## Recommended: Option 1 - Subdomain Setup

This is the cleanest approach and doesn't affect your existing site.

### Step 1: Choose Your Subdomain

Pick one:
- `portfolio.perbergman.com`
- `www.perbergman.com`
- `site.perbergman.com`
- `me.perbergman.com`
- Any subdomain you prefer

### Step 2: Deploy to Vercel First

1. Push code to GitHub (see `QUICK-START.md`)
2. Deploy to Vercel
3. Get your `.vercel.app` URL working first
4. Then add custom domain

### Step 3: Add Domain in Vercel

1. In Vercel project → Settings → Domains
2. Enter your subdomain: `portfolio.perbergman.com`
3. Click "Add"
4. Vercel will show you need to add a CNAME record

### Step 4: Add CNAME Record in Route 53

1. Go to AWS Console → Route 53
2. Click "Hosted zones"
3. Click your domain (e.g., `perbergman.com`)
4. Click "Create record"

**Record details:**
```
Record name: portfolio (or www, or your chosen subdomain)
Record type: CNAME
Value: cname.vercel-dns.com
TTL: 300 (5 minutes)
Routing policy: Simple routing
```

5. Click "Create records"

### Step 5: Verify in Vercel

1. Back in Vercel, click "Verify" next to your domain
2. Should verify within 1-2 minutes
3. Vercel will auto-provision SSL certificate
4. Your site is live! 🎉

---

## Alternative: Option 3 - Swap Sites (Main Domain)

If you want your new site on the main domain:

### Step 1: Update Existing LightSail Site

First, move your existing site to a subdomain:

**In Route 53:**
1. Find your existing A record for `@` or `perbergman.com`
2. Note the IP address (your LightSail IP)
3. Change the record name from `@` to `old` (or another subdomain)
4. Save

Your existing site is now at `old.perbergman.com`

### Step 2: Add New Site to Main Domain

**In Route 53:**
1. Create new A record:
   ```
   Record name: @ (leave blank for apex domain)
   Record type: A
   Value: 76.76.21.21
   TTL: 300
   ```

2. Create CNAME for www:
   ```
   Record name: www
   Record type: CNAME
   Value: cname.vercel-dns.com
   TTL: 300
   ```

**In Vercel:**
1. Add domain: `perbergman.com`
2. Add domain: `www.perbergman.com`
3. Set `perbergman.com` as primary
4. Verify both

---

## DNS Propagation

- Route 53 is fast: usually 1-5 minutes
- Check status: https://dnschecker.org
- SSL certificate: 5-10 minutes after verification

---

## Example Route 53 Records (Option 1 - Subdomain)

Your hosted zone would look like:

```
Name                          Type    Value
--------------------------------------------
perbergman.com                A       [LightSail IP]        ← Existing site
www.perbergman.com            A       [LightSail IP]        ← Existing site (if applicable)
portfolio.perbergman.com      CNAME   cname.vercel-dns.com  ← New Vercel site
```

---

## Example Route 53 Records (Option 3 - Swap)

Your hosted zone would look like:

```
Name                          Type    Value
--------------------------------------------
perbergman.com                A       76.76.21.21           ← New Vercel site
www.perbergman.com            CNAME   cname.vercel-dns.com  ← New Vercel site
old.perbergman.com            A       [LightSail IP]        ← Old site moved here
```

---

## Troubleshooting

### CNAME Already Exists
If you get "CNAME already exists" error:
- You might have an A record for that subdomain
- Delete the A record first, then add CNAME

### SSL Certificate Issues
- Wait 10 minutes after verification
- Vercel auto-provisions Let's Encrypt SSL
- Check Vercel dashboard for status

### DNS Not Resolving
```bash
# Check DNS propagation
dig portfolio.perbergman.com

# Should show CNAME to vercel
```

---

## Recommended Approach

**I recommend Option 1 (subdomain)** because:
- ✅ Zero downtime for existing site
- ✅ No risk to current setup
- ✅ Easy to test before switching
- ✅ Can always swap later if needed
- ✅ Clean separation of sites

**Suggested subdomain:** `portfolio.perbergman.com` or `www.perbergman.com`

---

## Questions to Answer

Before proceeding, decide:

1. **Which option do you prefer?**
   - Subdomain (recommended)
   - Swap sites

2. **If subdomain, which one?**
   - `portfolio.perbergman.com`
   - `www.perbergman.com`
   - Other?

3. **What's your domain name?**
   - So I can give you exact DNS records

Let me know and I can provide exact step-by-step instructions!

