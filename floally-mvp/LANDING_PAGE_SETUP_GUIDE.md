# Landing Page Setup Guide

## ✅ Completed by Dev Team

- ✅ Landing page component built (`LandingPage.jsx`)
- ✅ Waitlist signup API endpoint (`/api/waitlist/signup`)
- ✅ Backend router configured
- ✅ Email capture form with validation
- ✅ Conversion-optimized design
- ✅ Mobile-responsive layout
- ✅ Analytics event tracking (Google Analytics)

---

## 🎯 Your Action Items (30-60 minutes)

### 1. Configure Custom Domain (Hey Aimi.com)

**On Vercel Dashboard:**

1. Go to https://vercel.com/mardsan/floally-mvp-frontend
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `okaimy.com` and `www.okaimy.com`
5. Vercel will give you DNS records to add

**On Your Domain Registrar (GoDaddy/Namecheap/etc.):**

1. Log in to your domain registrar
2. Find DNS settings for `okaimy.com`
3. Add the records Vercel provided:
   - **A Record:** Point `@` to Vercel's IP (e.g., `76.76.21.21`)
   - **CNAME Record:** Point `www` to `cname.vercel-dns.com`
4. Save changes (DNS propagation takes 5-60 minutes)

**Test:**
- Visit http://okaimy.com (should redirect to HTTPS)
- Visit http://www.okaimy.com (should also work)
- Both should show the landing page

---

### 2. Set Up Google Analytics (Free)

**Create GA4 Property:**

1. Go to https://analytics.google.com
2. Click **Admin** (gear icon, bottom left)
3. Create Account:
   - Account Name: "Hey Aimi"
   - Click **Next**
4. Create Property:
   - Property Name: "Hey Aimi Landing Page"
   - Time Zone: Your timezone
   - Currency: USD
   - Click **Next**
5. Business Details:
   - Industry: "Technology" or "Software"
   - Business Size: Select appropriate size
   - Click **Next**
6. Skip business objectives or select "Generate leads"
7. Click **Create**

**Get Measurement ID:**

1. After creation, you'll see a **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID

**Add to Vercel Environment Variables:**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add new variable:
   - **Name:** `VITE_GA_MEASUREMENT_ID`
   - **Value:** Your `G-XXXXXXXXXX` ID
   - **Environment:** Production, Preview, Development (select all)
3. Click **Save**
4. Redeploy your app (Settings → Deployments → ... → Redeploy)

**Add Google Tag to Landing Page:**

Add this to `/frontend/index.html` in the `<head>` section:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

---

### 3. Set Up Email Capture Service (Choose One)

**Option A: EmailOctopus (Recommended - Free tier)**

1. Go to https://emailoctopus.com
2. Sign up (Free for up to 2,500 subscribers)
3. Create a new list: "Hey Aimi Waitlist"
4. Export waitlist from your backend:
   - Visit: https://floally-mvp-production.up.railway.app/api/waitlist/export
   - Copy the JSON data
5. Import to EmailOctopus (or manually add emails)

**Option B: ConvertKit (14-day free trial, then $29/mo)**

1. Go to https://convertkit.com
2. Sign up (Free for first 1,000 subscribers)
3. Create a form: "Hey Aimi Early Access"
4. Get form embed code or API key
5. Optional: Set up automated welcome email

**Option C: Keep Using File-Based Storage (Simplest)**

- Waitlist signups are saved to `/backend/waitlist_signups.json`
- Download this file periodically to back up
- Use `/api/waitlist/export` endpoint to get JSON
- Import to email tool when ready to send updates

---

### 4. Test the Full Flow

**Landing Page Test:**

1. Visit https://okaimy.com (or your Vercel URL)
2. Fill out the waitlist form with test data
3. Submit and verify "You're on the list!" confirmation appears
4. Check backend logs or download `waitlist_signups.json`

**Analytics Test:**

1. Visit https://analytics.google.com
2. Go to Reports → Realtime
3. Open your landing page in another tab
4. You should see "1 user active now"
5. Submit the form
6. Check for the "generate_lead" event in GA

**Email Test (if using EmailOctopus/ConvertKit):**

1. Add a test email to your list
2. Send a test campaign: "Welcome to Hey Aimi Early Access!"
3. Verify email delivery

---

### 5. Set Up Ad Campaigns (Week 1)

**Facebook/Instagram Ads Manager:**

1. Go to https://business.facebook.com/adsmanager
2. Create new campaign:
   - **Objective:** Lead Generation
   - **Name:** "Hey Aimi Early Access - Test 1"
3. Ad Set:
   - **Audience:** 
     - Location: US, UK, Canada, Australia
     - Age: 25-45
     - Interests: Productivity, Project Management, Creative Work, Entrepreneurship
   - **Budget:** $20-30/day
   - **Schedule:** 10-14 days
4. Ad Creative:
   - **Format:** Carousel (3 slides)
   - **Images:** Screenshots of Standup dashboard (I can help create these)
   - **Primary Text:** See sample copy below
   - **Call to Action:** "Sign Up"
   - **Destination:** https://okaimy.com

**Sample Ad Copy (Test A - "Flow State"):**

```
Headline: Stay in flow. Never drop the ball.

Primary Text:
Creative professionals spend 2.5 hours/day managing email instead of creating.

What if an AI partner handled that for you?

Every morning, Aimi tells you THE ONE THING that matters.
You focus. She handles the rest.

Join 50+ creative professionals on the waitlist for early access.

[Sign Up Button → okaimy.com]
```

**Sample Ad Copy (Test B - "AI Chief of Staff"):**

```
Headline: Your AI chief of staff for creative work

Primary Text:
Never miss a deadline. Never drop the ball.

Aimi is your AI partner who:
→ Analyzes your inbox and tells you what matters
→ Handles follow-ups and scheduling
→ Keeps everything running while you create

Join the waitlist for early access + founding member pricing (50% off for life).

[Sign Up Button → okaimy.com]
```

---

## 📊 Track These Metrics (Weekly)

Create a simple spreadsheet to track:

| Metric | Week 1 | Week 2 | Goal |
|--------|--------|--------|------|
| Landing page visitors | | | 500+ |
| Waitlist signups | | | 50+ |
| Conversion rate (%) | | | 10%+ |
| Cost per signup | | | <$10 |
| Demo requests | | | 10+ |
| Ad spend | | | $200-500 |

**Track in Google Analytics:**
- Go to Reports → Acquisition → Traffic Acquisition
- See which channels drive most traffic (Paid Social, Direct, Referral)

**Track Signups:**
- Visit `/api/waitlist/stats` endpoint
- Shows total signups and breakdown by "struggle" type
- Update "X on waitlist" copy in landing page weekly

---

## 🚀 Week 1 Launch Checklist

**Monday:**
- [ ] Configure okaimy.com domain on Vercel
- [ ] Set up Google Analytics
- [ ] Test landing page end-to-end
- [ ] Create Facebook Ads account
- [ ] Design ad creatives (or use placeholders)

**Tuesday-Wednesday:**
- [ ] Launch first ad campaign ($20/day budget)
- [ ] Monitor analytics hourly
- [ ] Test different ad copy variations
- [ ] Respond to any questions via email

**Thursday-Friday:**
- [ ] Review metrics (visitors, signups, cost per lead)
- [ ] Adjust ad targeting if needed
- [ ] A/B test headlines (change landing page headline)
- [ ] Reach out to first 10 signups for demo calls

**Weekend:**
- [ ] Analyze week 1 results
- [ ] Plan week 2 improvements
- [ ] Prepare for first demo calls
- [ ] Draft welcome email for week 2 signups

---

## 💡 Pro Tips

**Landing Page Optimization:**
- Change headline every 3-4 days, track which converts better
- Add testimonials as you get them from demos
- Update "X on waitlist" number weekly (creates FOMO)
- Add demo booking calendar link (Calendly) after 20+ signups

**Email Nurture Sequence (Set up in EmailOctopus/ConvertKit):**
1. **Day 0 (Immediate):** Welcome! You're on the list.
2. **Day 3:** Here's what Aimi does differently (education)
3. **Day 7:** Want to see a demo? (calendar link)
4. **Day 14:** We're getting close to launch! (urgency)

**Ad Campaign Tips:**
- Start with small budget ($20/day) to test
- Run 2-3 ad variations simultaneously
- Check cost per lead daily - pause if >$15
- Successful ads: Scale budget to $50-100/day
- Failed ads: Turn off, try new creative

**Conversion Boosters:**
- Add "As seen in..." if you get any press
- Add "Trusted by X professionals" (update number)
- Show screenshots of the actual product
- Add FAQ section if same questions appear
- Offer "Book a demo" option for serious prospects

---

## 🆘 Troubleshooting

**"Domain not working after 1 hour":**
- DNS can take up to 48 hours, but usually 5-60 minutes
- Clear browser cache and try incognito mode
- Check DNS propagation: https://dnschecker.org

**"Waitlist form not submitting":**
- Check browser console for errors (F12)
- Verify backend is running: https://floally-mvp-production.up.railway.app/api/health
- Check CORS settings in backend

**"Google Analytics not tracking":**
- Verify Measurement ID is correct
- Check if ad blockers are enabled (they block GA)
- Use GA Debugger Chrome extension
- Wait 24 hours for data to appear (realtime should be instant)

**"Cost per signup too high (>$15)":**
- Narrow audience targeting (too broad)
- Test different ad creative
- Improve landing page headline
- Add social proof / testimonials

**"High traffic, low conversions (<5%)":**
- Headline doesn't match ad promise
- Form too long (remove fields)
- Add trust signals (testimonials, guarantees)
- Test different CTAs

---

## 📞 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check backend Railway logs
4. Test the API endpoint directly: `/api/waitlist/signup`
5. Ask me for help with specific errors

---

## 🎯 Success Criteria (End of Week 2)

**Green Light (Keep building):**
- ✅ 50+ waitlist signups
- ✅ 10%+ conversion rate
- ✅ <$10 cost per signup
- ✅ 5+ demo requests
- ✅ Positive feedback on value prop

**Action needed (Iterate messaging):**
- ⚠️ 20-50 signups (test new headlines)
- ⚠️ 5-10% conversion (improve landing page)
- ⚠️ $10-15 cost per signup (narrow targeting)

**Pivot required (<20 signups):**
- ❌ Value prop doesn't resonate
- ❌ Wrong audience
- ❌ Need different messaging approach

Either way, you'll have DATA to make decisions! 🎉

---

**Next Steps After This Setup:**
1. Run ads for 2 weeks
2. Collect signups and feedback
3. Run 5-10 demo calls
4. Iterate based on feedback
5. Launch beta with best prospects
6. Collect testimonials
7. Prepare for paid launch

You're building this the RIGHT way - validating demand before heavy development. Smart! 🚀
