const crypto = require('crypto');

/**
 * Helper to get raw request body buffer from Vercel request
 */
async function getRawBody(req) {
  if (req.rawBody) {
    return req.rawBody;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body);
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

/**
 * Verify Lemon Squeezy X-Signature header against secret
 */
function verifyLemonSqueezySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    return digest.length === signatureBuffer.length && crypto.timingSafeEqual(digest, signatureBuffer);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Generate cryptographically signed Aegis License Key
 */
function generateLicenseKey(tier) {
  const prefix = tier === 'enterprise' ? 'AEGIS-ENTERPRISE' : 'AEGIS-PRO';
  const part1 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const checksumSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'aegis_default_secret';
  const checksum = crypto.createHmac('sha256', checksumSecret)
    .update(`${prefix}-${part1}-${part2}`)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();

  return `${prefix}-${part1}-${part2}-${checksum}`;
}

/**
 * Dispatch confirmation email via Resend API
 */
async function dispatchConfirmationEmail(email, licenseKey, tier) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey.includes('placeholder')) {
    console.log(`[Email Dispatch Log] (No active Resend API key) Email to ${email} with key ${licenseKey} for tier ${tier}`);
    return { dispatched: false, reason: 'No Resend API key configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Aegis Hub Licensing <licensing@aegishub.dev>',
        to: [email],
        subject: `Your Aegis Developer Hub ${tier.toUpperCase()} License Key`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #60a5fa;">Thank you for upgrading to Aegis Developer Hub ${tier.toUpperCase()}!</h2>
            <p>Your payment has been successfully processed. Here is your cryptographically signed license key:</p>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; color: #34d399; text-align: center; letter-spacing: 2px; margin: 20px 0;">
              ${licenseKey}
            </div>
            <p>To activate your license:</p>
            <ol>
              <li>Open <a href="https://aegishub.dev" style="color: #60a5fa;">Aegis Developer Hub</a></li>
              <li>Click <strong>Activate License</strong> in the top header bar</li>
              <li>Paste your license key above and click <strong>Activate Key</strong></li>
            </ol>
            <hr style="border-color: #334155; margin-top: 30px;" />
            <p style="font-size: 12px; color: #94a3b8;">Aegis Developer Hub — Privacy-First In-Browser Studio</p>
          </div>
        `
      })
    });
    const result = await response.json();
    return { dispatched: true, result };
  } catch (err) {
    console.error('Failed to dispatch email via Resend:', err);
    return { dispatched: false, error: err.message };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-signature'];
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // Signature Verification check if secret is configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      const isValid = verifyLemonSqueezySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid HMAC signature' });
      }
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const eventName = payload.meta?.event_name || req.body?.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const attributes = payload.data?.attributes || {};
    const status = attributes.status;

    console.log(`[Lemon Webhook] Received event: ${eventName}, status: ${status}`);

    const supportedEvents = ['subscription_created', 'subscription_updated', 'order_created'];
    if (!supportedEvents.includes(eventName)) {
      return res.status(200).json({ message: `Ignored event: ${eventName}` });
    }

    // Determine plan tier
    const variantId = String(attributes.variant_id || attributes.first_order_item?.variant_id || '');
    const entVariantId = String(process.env.LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID || '');
    
    let tier = 'pro';
    if (variantId && variantId === entVariantId) {
      tier = 'enterprise';
    } else if (attributes.product_name && attributes.product_name.toLowerCase().includes('enterprise')) {
      tier = 'enterprise';
    }

    // Customer email
    const customerEmail = attributes.user_email || attributes.customer_email || customData.user_email || 'developer@example.com';

    // Generate Aegis License Key
    const licenseKey = generateLicenseKey(tier);

    // Dispatch email
    const emailResult = await dispatchConfirmationEmail(customerEmail, licenseKey, tier);

    return res.status(200).json({
      success: true,
      event: eventName,
      tier: tier,
      license_key: licenseKey,
      customer_email: customerEmail,
      email_dispatched: emailResult.dispatched
    });
  } catch (error) {
    console.error('[Lemon Webhook Error]:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
