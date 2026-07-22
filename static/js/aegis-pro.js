/**
 * Aegis Developer Hub - Client-Side Pro & Enterprise Membership Engine
 * Manages licensing state, key validation, watermark controls, and Pro feature unlocks.
 */

window.AegisPro = (function() {
    const STORAGE_KEY = 'aegis_license_tier';
    const KEY_STORAGE = 'aegis_license_key';

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

    function activateKey(rawKey) {
        const key = (rawKey || '').trim().toUpperCase();
        if (!key) return { success: false, message: 'Please enter a valid license key.' };

        if (VALID_PRO_KEYS.includes(key) || key.startsWith('AEGIS-PRO')) {
            localStorage.setItem(STORAGE_KEY, 'pro');
            localStorage.setItem(KEY_STORAGE, key);
            updateUIBadge();
            return { success: true, tier: 'pro', message: 'Pro Membership Activated! All Pro features unlocked.' };
        }

        if (VALID_ENT_KEYS.includes(key) || key.startsWith('AEGIS-ENT') || key.startsWith('AEGIS-ENTERPRISE')) {
            localStorage.setItem(STORAGE_KEY, 'enterprise');
            localStorage.setItem(KEY_STORAGE, key);
            updateUIBadge();
            return { success: true, tier: 'enterprise', message: 'Enterprise License Activated! Docker & SSO features unlocked.' };
        }

        return { success: false, message: 'Invalid Key. Try AEGIS-PRO-2026 or AEGIS-ENTERPRISE-2026' };
    }

    function resetLicense() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(KEY_STORAGE);
        updateUIBadge();
    }

    function updateUIBadge() {
        const badge = document.getElementById('aegis-pro-badge');
        if (!badge) return;

        const tier = getTier();
        if (tier === 'pro') {
            badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/30 cursor-pointer" onclick="AegisPro.openModal()"><span class="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>PRO MEMBER</span>`;
        } else if (tier === 'enterprise') {
            badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border border-purple-400/30 cursor-pointer" onclick="AegisPro.openModal()"><span class="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></span>ENTERPRISE UNLOCKED</span>`;
        } else {
            badge.innerHTML = `<button onclick="AegisPro.openModal()" class="text-xs font-semibold text-blue-400 hover:text-blue-300 underline">Activate License</button>`;
        }
    }

    function openModal() {
        let modal = document.getElementById('aegis-pro-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'aegis-pro-modal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300';
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

                    <div class="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-xs text-gray-300">
                        <div class="font-bold text-white text-xs mb-1">Enter Pro or Enterprise License Key:</div>
                        <input type="text" id="aegis-key-input" placeholder="e.g. AEGIS-PRO-2026 or AEGIS-ENTERPRISE-2026" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500">
                        <div class="flex gap-2 pt-1">
                            <button onclick="AegisPro.handleKeySubmit()" class="flex-grow py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg">Activate Key</button>
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
        }

        document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
        modal.classList.remove('hidden');
    }

    function closeModal() {
        const modal = document.getElementById('aegis-pro-modal');
        if (modal) modal.classList.add('hidden');
    }

    function handleKeySubmit() {
        const input = document.getElementById('aegis-key-input');
        const msg = document.getElementById('modal-msg');
        if (!input) return;

        const res = activateKey(input.value);
        msg.textContent = res.message;
        msg.className = `text-xs text-center font-semibold ${res.success ? 'text-emerald-400' : 'text-rose-400'}`;

        if (res.success) {
            document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
            setTimeout(() => closeModal(), 1500);
        }
    }

    function demoUnlock(type) {
        const key = type === 'enterprise' ? 'AEGIS-ENTERPRISE-2026' : 'AEGIS-PRO-2026';
        activateKey(key);
        const msg = document.getElementById('modal-msg');
        if (msg) {
            msg.textContent = `Unlocked ${type.toUpperCase()} Demo Mode!`;
            msg.className = 'text-xs text-center font-semibold text-emerald-400';
        }
        document.getElementById('modal-current-tier').textContent = getTier().toUpperCase();
        setTimeout(() => closeModal(), 1200);
    }

    function init() {
        updateUIBadge();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        getTier: getTier,
        isPro: isPro,
        isEnterprise: isEnterprise,
        activateKey: activateKey,
        resetLicense: resetLicense,
        openModal: openModal,
        closeModal: closeModal,
        handleKeySubmit: handleKeySubmit,
        demoUnlock: demoUnlock,
        init: init
    };
})();
