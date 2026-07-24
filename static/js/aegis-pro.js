/**
 * Aegis Developer Hub - Client-Side Pro & Enterprise Membership Engine
 * Manages licensing state, Lemon Squeezy payment overlay, key validation, watermark controls, ad-free experience, and Pro feature unlocks.
 */

window.AegisPro = (function() {
    const STORAGE_KEY = 'aegis_license_tier';
    const KEY_STORAGE = 'aegis_license_key';

    const DEFAULT_PRO_CHECKOUT = 'https://aegishub.lemonsqueezy.com/checkout/buy/22815780-b4e8-466d-a4eb-5bd71d121707?embed=1';
    const DEFAULT_ENT_CHECKOUT = 'https://aegishub.lemonsqueezy.com/checkout/buy/0f7285e8-f8d2-4d19-8856-1e6d08ef423f?embed=1';

    const VALID_PRO_KEYS = ['AEGIS-PRO-2026', 'PRO-DEVELOPER-888', 'AEGIS-PRO-DEMO'];
    const VALID_ENT_KEYS = ['AEGIS-ENTERPRISE-2026', 'ENT-TEAM-999', 'AEGIS-ENT-DEMO'];

    function getTier() {
        return localStorage.getItem(STORAGE_KEY) || 'free';
    }

    function isPro() {
        const tier = getTier();
        return tier === 'pro' || tier === 'enterprise';
    }

    function isEnterprise() {
        return getTier() === 'enterprise';
    }

    function applyAdFreeExperience() {
        if (isPro()) {
            document.querySelectorAll('.adsense-wrapper, ins.adsbygoogle').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    /**
     * Initializes Lemon Squeezy JS Overlay
     */
    function initLemonSqueezy() {
        if (window.createLemonSqueezy) {
            try {
                window.createLemonSqueezy();
            } catch (err) {
                console.warn('Lemon Squeezy overlay init error:', err);
            }
        }
    }

    /**
     * Programmatically opens Lemon Squeezy checkout overlay or URL
     */
    function openCheckout(target) {
        let checkoutUrl = target;
        if (target === 'pro' || !target) {
            checkoutUrl = window.LEMON_SQUEEZY_PRO_URL || DEFAULT_PRO_CHECKOUT;
        } else if (target === 'enterprise') {
            checkoutUrl = window.LEMON_SQUEEZY_ENT_URL || DEFAULT_ENT_CHECKOUT;
        }

        if (window.LemonSqueezy && window.LemonSqueezy.Url) {
            try {
                window.LemonSqueezy.Url.Open(checkoutUrl);
                return;
            } catch (e) {
                console.warn('LemonSqueezy.Url.Open failed, falling back to window.open', e);
            }
        }
        window.open(checkoutUrl, '_blank');
    }

    /**
     * Local fallback activation check
     */
    function activateKeyLocal(key) {
        if (VALID_PRO_KEYS.includes(key) || key.startsWith('AEGIS-PRO')) {
            localStorage.setItem(STORAGE_KEY, 'pro');
            localStorage.setItem(KEY_STORAGE, key);
            updateUIBadge();
            applyAdFreeExperience();
            return { success: true, tier: 'pro', message: 'Pro Membership Activated! All Pro features unlocked & Ads Removed.' };
        }

        if (VALID_ENT_KEYS.includes(key) || key.startsWith('AEGIS-ENT') || key.startsWith('AEGIS-ENTERPRISE')) {
            localStorage.setItem(STORAGE_KEY, 'enterprise');
            localStorage.setItem(KEY_STORAGE, key);
            updateUIBadge();
            applyAdFreeExperience();
            return { success: true, tier: 'enterprise', message: 'Enterprise License Activated! Docker & SSO features unlocked & Ads Removed.' };
        }

        return { success: false, message: 'Invalid Key. Check your license key or try AEGIS-PRO-2026' };
    }

    /**
     * Validates key asynchronously against /api/validate-key serverless endpoint, with local fallback
     */
    async function activateKey(rawKey) {
        const key = (rawKey || '').trim().toUpperCase();
        if (!key) return { success: false, message: 'Please enter a valid license key.' };

        try {
            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid && (data.tier === 'pro' || data.tier === 'enterprise')) {
                    localStorage.setItem(STORAGE_KEY, data.tier);
                    localStorage.setItem(KEY_STORAGE, key);
                    updateUIBadge();
                    applyAdFreeExperience();
                    return {
                        success: true,
                        tier: data.tier,
                        message: data.message || `${data.tier.toUpperCase()} License Verified & Unlocked!`
                    };
                }
            }
        } catch (err) {
            console.warn('Network key validation endpoint unavailable, falling back to local validation:', err);
        }

        return activateKeyLocal(key);
    }

    function resetLicense() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(KEY_STORAGE);
        updateUIBadge();
        window.location.reload();
    }

    function updateUIBadge() {
        const badge = document.getElementById('aegis-pro-badge');
        if (!badge) return;

        const tier = getTier();
        if (tier === 'pro') {
            badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/30 cursor-pointer" onclick="AegisPro.openModal()"><span class="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>PRO MEMBER (AD-FREE)</span>`;
        } else if (tier === 'enterprise') {
            badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border border-purple-400/30 cursor-pointer" onclick="AegisPro.openModal()"><span class="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></span>ENTERPRISE (AD-FREE)</span>`;
        } else {
            badge.innerHTML = `<button onclick="AegisPro.openModal()" class="text-xs font-semibold text-blue-400 hover:text-blue-300 underline">Activate License</button>`;
        }
    }

    function openModal() {
        let modal = document.getElementById('aegis-pro-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'aegis-pro-modal';
            modal.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300';
            modal.innerHTML = `
                <div class="glass-card max-w-md w-full rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5 text-left relative bg-slate-900/95 text-white font-['Outfit']">
                    <button onclick="AegisPro.closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold">&times;</button>
                    
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg">A</div>
                        <div>
                            <h3 class="text-lg font-bold text-white">Aegis Hub Membership</h3>
                            <div class="text-xs text-gray-400">Current Status: <span id="modal-current-tier" class="font-bold text-blue-400 uppercase">FREE</span></div>
                        </div>
                    </div>

                    <!-- Instant Checkout Buttons -->
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <a href="https://aegishub.lemonsqueezy.com/checkout/buy/22815780-b4e8-466d-a4eb-5bd71d121707?embed=1" class="lemonsqueezy-button py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg text-center block no-underline">
                            Upgrade Pro ($9/mo)
                        </a>
                        <a href="https://aegishub.lemonsqueezy.com/checkout/buy/0f7285e8-f8d2-4d19-8856-1e6d08ef423f?embed=1" class="lemonsqueezy-button py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg text-center block no-underline">
                            Enterprise ($29/mo)
                        </a>
                    </div>

                    <div class="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-xs text-gray-300">
                        <div class="font-bold text-white text-xs mb-1">Have a License Key? Enter it below:</div>
                        <input type="text" id="aegis-key-input" placeholder="e.g. AEGIS-PRO-2026 or AEGIS-ENTERPRISE-2026" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500">
                        <div class="flex gap-2 pt-1">
                            <button onclick="AegisPro.handleKeySubmit()" class="flex-grow py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-xs border border-white/10 shadow-lg">Activate Key</button>
                            <button onclick="AegisPro.demoUnlock('pro')" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold text-xs border border-white/10">Demo Pro</button>
                        </div>
                    </div>

                    <div id="modal-msg" class="text-xs text-center font-semibold min-h-[18px]"></div>

                    <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                        <button onclick="AegisPro.resetLicense()" class="text-rose-400 hover:underline">Reset to Free Tier</button>
                        <button onclick="AegisPro.closeModal()" class="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-semibold">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            initLemonSqueezy();
        }

        document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
        modal.classList.remove('hidden');
    }

    function closeModal() {
        const modal = document.getElementById('aegis-pro-modal');
        if (modal) modal.classList.add('hidden');
    }

    async function handleKeySubmit() {
        const input = document.getElementById('aegis-key-input');
        const msg = document.getElementById('modal-msg');
        if (!input) return;

        msg.textContent = 'Verifying key...';
        msg.className = 'text-xs text-center font-semibold text-blue-400';

        const res = await activateKey(input.value);
        msg.textContent = res.message;
        msg.className = `text-xs text-center font-semibold ${res.success ? 'text-emerald-400' : 'text-rose-400'}`;

        if (res.success) {
            document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
            setTimeout(() => closeModal(), 1500);
        }
    }

    function demoUnlock(type) {
        const key = type === 'enterprise' ? 'AEGIS-ENTERPRISE-2026' : 'AEGIS-PRO-2026';
        activateKey(key).then(res => {
            const msg = document.getElementById('modal-msg');
            if (msg) {
                msg.textContent = `Unlocked ${type.toUpperCase()} Demo Mode (Ads Hidden)!`;
                msg.className = 'text-xs text-center font-semibold text-emerald-400';
            }
            document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
            setTimeout(() => closeModal(), 1200);
        });
    }

    function init() {
        updateUIBadge();
        applyAdFreeExperience();
        initLemonSqueezy();

        // Event delegation for Pro triggers
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-aegis-pro-trigger="true"]') || e.target.closest('.btn-pro-trigger')) {
                e.preventDefault();
                openModal();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', init);

    /**
     * Downloads digital product packages for Pro / Enterprise members
     */
    function downloadProduct(productKey) {
        if (!isPro()) {
            openModal();
            return { success: false, message: 'Pro Membership required to download this product package.' };
        }
        
        let fileUrl = '/static/downloads/MediaStorageOptimizer_v2.0.zip';
        if (productKey === 'media-optimizer' || !productKey) {
            fileUrl = '/static/downloads/MediaStorageOptimizer_v2.0.zip';
        }

        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileUrl.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, message: 'Download started!' };
    }

    return {
        getTier: getTier,
        isPro: isPro,
        isEnterprise: isEnterprise,
        openCheckout: openCheckout,
        downloadProduct: downloadProduct,
        activateKey: activateKey,
        resetLicense: resetLicense,
        openModal: openModal,
        closeModal: closeModal,
        handleKeySubmit: handleKeySubmit,
        demoUnlock: demoUnlock,
        init: init
    };
})();
