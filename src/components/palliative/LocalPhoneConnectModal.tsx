'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import styles from './palliative.module.css';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { CareSyncBus } from '@/utils/careSyncBus';

interface LocalPhoneConnectModalProps {
  onClose: () => void;
}

export default function LocalPhoneConnectModal({ onClose }: LocalPhoneConnectModalProps) {
  const [copied, setCopied] = useState(false);
  const [localIp, setLocalIp] = useState('192.168.0.222');
  const [port, setPort] = useState('3000');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [pingSuccess, setPingSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPort = window.location.port || '3000';
      setPort(currentPort);
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setLocalIp(window.location.hostname);
      }
    }
  }, []);

  const fullUrl = `http://${localIp}:${port}/palliative-care`;

  // Generate genuine ISO/IEC 18004 compliant scannable QR Code
  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 240,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, [fullUrl]);

  const handleCopy = () => {
    PalliativeSpeech.triggerHaptic('success');
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPing = () => {
    PalliativeSpeech.triggerHaptic('medium');
    CareSyncBus.broadcast('SYNC_PING', { pingFrom: 'Localhost Connect Hub' }, 'Desktop Host');
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(false), 3000);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Smartphone size={20} style={{ color: '#2A9D8F' }} />
              Pair Phone or Tablet
            </h2>
            <span style={{ fontSize: '0.825rem', color: 'var(--p-text-secondary)' }}>
              Scan from your camera to test multi-carer synchronization
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--p-text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* QR Code & Direct URL Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.25rem', 
          alignItems: 'center', 
          background: 'rgba(42, 157, 143, 0.05)', 
          padding: '1.25rem', 
          borderRadius: '16px', 
          border: '1px solid rgba(42, 157, 143, 0.15)', 
          marginBottom: '1.25rem' 
        }}>
          
          {/* Real QR Code Display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              background: '#ffffff', 
              padding: '10px', 
              borderRadius: '14px', 
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '210px',
              minWidth: '210px'
            }}>
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${fullUrl}`} 
                  width={190} 
                  height={190}
                  style={{ display: 'block', borderRadius: '6px' }} 
                />
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Generating QR Code...</div>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#2A9D8F', fontWeight: 600, marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <QrCode size={14} /> Scan with camera app
            </span>
          </div>

          {/* Connection URL & IP Settings */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--p-text-secondary)' }}>
              Local Wi-Fi IP Address
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className={styles.inputField}
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="e.g. 192.168.0.222"
                style={{ margin: 0, fontSize: '0.875rem' }}
              />
              <input
                type="text"
                className={styles.inputField}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                style={{ width: '75px', margin: 0, textAlign: 'center', fontSize: '0.875rem' }}
              />
            </div>

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--p-text-secondary)' }}>
              Direct Browser URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                readOnly
                className={styles.inputField}
                value={fullUrl}
                style={{ margin: 0, fontSize: '0.8rem', color: '#2A9D8F', fontWeight: 600 }}
              />
              <button
                onClick={handleCopy}
                style={{ 
                  minHeight: '44px', 
                  padding: '0 0.9rem', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(42, 157, 143, 0.3)', 
                  background: 'rgba(42, 157, 143, 0.15)', 
                  color: '#2A9D8F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Copy URL"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* Test Ping Broadcast Button */}
            <button
              onClick={handleSendPing}
              style={{ 
                width: '100%', 
                minHeight: '40px', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'var(--p-text-primary)',
                fontSize: '0.8rem', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Zap size={14} style={{ color: pingSuccess ? '#6B9080' : '#2A9D8F' }} />
              <span>{pingSuccess ? 'Signal broadcasted to all devices' : 'Test live sync signal'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Setup Instructions */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '1rem', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.06)', 
          marginBottom: '1.25rem' 
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2A9D8F', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wifi size={14} /> Quick connection tips
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--p-text-secondary)' }}>
            <div>
              <strong>1. Same Wi-Fi:</strong> Phone and computer must be connected to the same local Wi-Fi router.
            </div>
            <div>
              <strong>2. Camera Scan:</strong> Open your iPhone Camera or Android Google Lens and point it at the QR code above.
            </div>
            <div>
              <strong>3. Real-Time Sync:</strong> Once opened on your phone, changes logged on either device sync instantly!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ 
              minHeight: '42px', 
              padding: '0 1.5rem', 
              borderRadius: '24px', 
              border: 'none', 
              background: '#2A9D8F', 
              color: '#ffffff', 
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
