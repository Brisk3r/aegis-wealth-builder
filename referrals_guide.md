# Aegis Hub: Australian Monetization & Referrals Guide

This guide details the signup processes, traffic requirements, and payouts structure for your developer tools hub. Since you are operating from **Australia**, this documentation outlines specific requirements for Australian Business Numbers (ABN), identity checks, and Stripe Connect routing.

---

## 1. Digital Goods Sales (Lemon Squeezy)

Lemon Squeezy acts as your **Merchant of Record** (MoR). They handle payment processing, compliance, refund disputes, and globally calculate and remit **Australian GST** (and other sales taxes) on your behalf.

| Requirement | Details for Australia (AU) | Action Link |
| :--- | :--- | :--- |
| **Portal Account** | Sign up with your email and name. | [Sign Up General](https://app.lemonsqueezy.com/register) |
| **Store Country** | Select **Australia** (currency defaults to AUD for local payouts). | [General Settings](https://app.lemonsqueezy.com/settings/general) |
| **KYC Identity Verification** | Upload a photo of a government ID (AU Passport, Driver's Licence, or Proof of Age card). | General settings sidebar |
| **Tax Information** | Provide your **Australian Business Number (ABN)** (or register as a sole trader if not operating under a registered company). | Store General Setup |
| **Payout Method** | Link your Australian bank account or PayPal via **Stripe Connect** (integrated natively). | Payout general settings |
| **Approval Timeline** | General review takes 2-3 business days. | Balance tab |

---

## 2. Developer Ad Networks

Display ads should be contextual and developer-focused. Avoid general networks (like AdSense) due to developer ad-blocker rates.

### EthicalAds
* **Signup Portal:** [EthicalAds Publishers](https://www.ethicalads.io/publishers/)
* **Approval Criteria:**
  * Requires a baseline of **50,000 monthly pageviews** to apply.
  * Content must be strictly developer-focused (documentation, tutorials, tools).
* **Payout Method:** Monthly payouts via **PayPal**, **Stripe Link**, or direct bank transfers.

---

## 3. Developer Affiliate & Referral Portals

Affiliate portals track referrals and pay commissions when users register and spend money.

```
                  +-----------------------------------------+
                  |  Customer clicks affiliate link on hub  |
                  +---------------------+-------------------+
                                        |
                                        v
                  +-----------------------------------------+
                  | Customer signs up & completes purchase  |
                  +---------------------+-------------------+
                                        |
                                        v
                  +-----------------------------------------+
                  | Commissions accumulate in partner portal|
                  +---------------------+-------------------+
                                        |
                                        v
                  +-----------------------------------------+
                  | Direct deposit payout to AU bank (AUD)  |
                  +-----------------------------------------+
```

### A. DigitalOcean Referral & Partner Program
* **Referral Link (Hosting Credit):**
  * **Dashboard Portal:** Inside your DigitalOcean account under **Settings > Referrals**.
  * **Link Format:** `https://www.digitalocean.com/?refcode=your-refcode-hash`
  * **Reward:** Referred users get $200 in 60-day credit. You get **$25 cash** once they spend their first $25.
* **Affiliate Link (Cash Commission):**
  * **Portal Account:** Hosted on Impact (Impact Radius) at [DigitalOcean Partner Sign Up](https://app.impact.com/advertiser-advertiser-info/DigitalOcean.brand).

### B. Hostinger Affiliate Program
* **Affiliate Portal:** Integrated with **Impact Radius** (impact.com).
* **Signup Link:** [Hostinger Affiliate Registration](https://www.hostinger.com/au/affiliates)
* **Terms:** Pays **40% minimum commission** on hosting plans. Payouts require a minimum threshold of $100 USD.
