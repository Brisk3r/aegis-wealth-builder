const crypto = require('crypto');

const VALID_PRO_KEYS = ['AEGIS-PRO-2026', 'PRO-DEVELOPER-888', 'AEGIS-PRO-DEMO'];
const VALID_ENT_KEYS = ['AEGIS-ENTERPRISE-2026', 'ENT-TEAM-999', 'AEGIS-ENT-DEMO'];

/**
 * Validate signature component of Aegis signed keys
 */
function verifyAegisSignedKey(key) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'aegis_default_secret';
  const parts = key.split('-');
  
  if (parts.length >= 4) {
    const checksum = parts.pop();
    const payload = parts.join('-');
    const computed = crypto.createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();
    
    if (computed === checksum) {
      const tier = key.startsWith('AEGIS-ENTERPRISE') ? 'enterprise' : 'pro';
      return { valid: true, tier };
    }
  }

  return { valid: false };
}

/**
 * Validate key with Lemon Squeezy API if configured
 */
async function validateWithLemonSqueezyAPI(licenseKey) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return null;
  }

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ license_key: licenseKey })
    });
    
    if (!response.ok) return null;

    const data = await response.json();
    if (data.valid) {
      const isEnt = data.meta?.variant_name?.toLowerCase().includes('enterprise') || 
                    data.meta?.product_name?.toLowerCase().includes('enterprise');
      return {
        valid: true,
        tier: isEnt ? 'enterprise' : 'pro',
        meta: data.meta
      };
    }
  } catch (err) {
    console.error('Error validating with Lemon Squeezy API:', err);
  }
  return null;
}

module.exports = async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawKey = req.method === 'POST' 
    ? (req.body?.key || req.body?.license_key) 
    : (req.query?.key || req.query?.license_key);

  if (!rawKey) {
    return res.status(400).json({ valid: false, tier: 'free', message: 'Missing license key' });
  }

  const key = String(rawKey).trim().toUpperCase();

  // 1. Check hardcoded/demo keys
  if (VALID_ENT_KEYS.includes(key) || key === 'AEGIS-ENT-2026') {
    return res.status(200).json({ valid: true, tier: 'enterprise', key, message: 'Valid Enterprise Key' });
  }
  if (VALID_PRO_KEYS.includes(key)) {
    return res.status(200).json({ valid: true, tier: 'pro', key, message: 'Valid Pro Key' });
  }

  // 2. Check Aegis HMAC signed key format
  const signedResult = verifyAegisSignedKey(key);
  if (signedResult.valid) {
    return res.status(200).json({
      valid: true,
      tier: signedResult.tier,
      key,
      message: `Valid cryptographically signed ${signedResult.tier.toUpperCase()} Aegis Key`
    });
  }

  // 3. Fallback check for key prefixes
  if (key.startsWith('AEGIS-ENTERPRISE') || key.startsWith('AEGIS-ENT')) {
    return res.status(200).json({ valid: true, tier: 'enterprise', key, message: 'Active Enterprise License' });
  }
  if (key.startsWith('AEGIS-PRO')) {
    return res.status(200).json({ valid: true, tier: 'pro', key, message: 'Active Pro Membership License' });
  }

  // 4. Validate with remote Lemon Squeezy API
  const lsResult = await validateWithLemonSqueezyAPI(key);
  if (lsResult && lsResult.valid) {
    return res.status(200).json({
      valid: true,
      tier: lsResult.tier,
      key,
      message: `Verified Lemon Squeezy ${lsResult.tier.toUpperCase()} License`
    });
  }

  return res.status(404).json({ valid: false, tier: 'free', message: 'Invalid license key' });
};
