# Aegis-100K: Monetization Guide & Tomorrow's Sprint Notes

This document details where and how earnings are collected, how to configure the active accounts, and a roadmap to perfect the visual and functional aspects of the Aegis Developer Hub during tomorrow's sprint.

---

## 1. Monetization Channels & Money Flow

### A. Digital Goods Sales (Lemon Squeezy)
* **What it is:** The visual tools (Flexbox Playground, FlowState Journal, Ideation Hub) now have CTA checkouts offering premium PDF cheat sheets, branch CLI hooks, and Next.js startup code templates.
* **How it works:** 
  1. Lemon Squeezy acts as the **Merchant of Record** (MoR).
  2. When a customer buys a product, Lemon Squeezy handles the card processing, invoicing, and **global sales tax (including Australian GST)** automatically.
  3. The funds are held in your Lemon Squeezy balance.
  4. Payouts are made automatically once a week to your AU bank account or PayPal via Stripe Connect.
* **Setup Action:** Complete the signup on the prepped Lemon Squeezy tab, verify your store, create your digital products (priced at $4.99, $9.99, and $29.00), and copy the checkout links.

### B. Display Ad Revenue (Carbon Ads & EthicalAds)
* **What it is:** Minimalist, contextual developer ads displayed in the hero section and at the bottom of pages.
* **How it works:**
  1. Ad networks serve contextual, developer-related ads on your pages.
  2. Earnings accrue based on impressions (CPM) and clicks (CPC).
  3. Payouts are made monthly via direct deposit/wire or PayPal.
* **Setup Action:** Submit your website (`https://aegis-wealth-builder.vercel.app/`) to Carbon Ads and EthicalAds on the prepped browser tabs. Once approved, copy the script source URL.

### C. Developer Referral & Affiliate Commissions
* **DigitalOcean:** Earns **$25 cash** once a referred user spends $25. Accumulated payouts are sent to your bank/PayPal.
* **Hostinger:** Earns up to **60% commission** per transaction on web hosting plans via Impact Radius network.
* **Setup Action:** Get your unique referral/affiliate links from their portals (prepped in your browser tabs).

---

## 2. Configuring the Active Links in `.env`

Once you have set up your accounts, open your local [.env](file:///C:/Users/avram/Documents/antigravity/joyful-bell/.env) file and replace the placeholder fields:

```env
# Custom domain canonical target
AEGIS_CUSTOM_DOMAIN=aegisdev.com

# Carbon Ads script source (e.g. //cdn.carbonads.com/carbon.js?serve=XXXXXX&placement=YYYYYY)
CARBON_ADS_SRC=

# Affiliate Links JSON dictionary
AFFILIATE_LINKS_JSON='{
    "digitalocean": "https://m.do.co/c/your-real-tag",
    "vercel": "https://vercel.com/v0?utm_source=aegis",
    "hosting": "https://hostinger.com?referral=your-real-tag"
}'
```

*Note: In tomorrow's sprint, we will also replace the hardcoded placeholder checkout links inside the tools with your real Lemon Squeezy product URLs.*

---

## 3. Tomorrow's Sprint: Front-Facing Visuals & Image Generation

To elevate the Aegis Developer Hub from a simple static index page into a premium, state-of-the-art developer platform:

### A. High-End Banners & Logo Generation
* **Goal:** Create visual brand assets (a logo icon and a hero banner) to replace plain typography.
* **Asset Creation:**
  1. Run `generate_image` tool with prompts like: *"A sleek, minimalist vector logo for 'Aegis Dev Hub', dark theme, blue neon lines, tech aesthetic"* and save it as `static/logo.png`.
  2. Generate a hero illustration: *"A premium, high-contrast abstract grid design with glassmorphism overlays and glowing developer symbols, dark blue and cyan color palette"* and save it as `static/hero_banner.jpg`.
  3. Inject these images into the landing page templates.

### B. Overhauling the Visual presentation
* **Branding Navigation:** Standardize a header block across all pages using the newly generated logo and styled links.
* **Glassmorphism Refinement:** Add subtle background blur effects (`backdrop-filter: blur(12px)`) and glowing borders to cards to create a more tactile, premium developer interface.
* **Compliance Footers:** Maintain Australian Privacy Principles (APPs), GDPR, and ASIC financial disclaimers uniformly across new pages.
