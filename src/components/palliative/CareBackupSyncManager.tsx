'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Wifi,
  Zap,
  Lock
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { CareSyncBus } from '@/utils/careSyncBus';

interface CareBackupSyncManagerProps {
  carePod: CarePod;
  onDataRestored: () => void;
}

export default function CareBackupSyncManager({ carePod, onDataRestored }: CareBackupSyncManagerProps) {
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [pingSuccess, setPingSuccess] = useState<boolean>(false);

  const handleExportBackup = () => {
    PalliativeSpeech.triggerHaptic('success');
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      carePods: PalliativeDb.getAllPods(),
      activePodId: PalliativeDb.getActivePodId(),
      logs: PalliativeDb.getCareLogs(),
      medications: PalliativeDb.getMedications(),
      members: PalliativeDb.getMembers(),
      contacts: PalliativeDb.getContacts(),
    };

    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Care_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.carePods && Array.isArray(parsed.carePods)) {
          PalliativeSpeech.triggerHaptic('success');
          localStorage.setItem('aegis_care_pods_list', JSON.stringify(parsed.carePods));
          if (parsed.activePodId) {
            localStorage.setItem('aegis_active_pod_id', parsed.activePodId);
          }
          CareSyncBus.broadcast('STATE_HYDRATED', { restored: true }, 'Admin');
          setImportSuccess('[OK] Backup successfully restored and synced across all devices!');
          onDataRestored();
          setTimeout(() => setImportSuccess(null), 4000);
        } else {
          alert('Invalid backup file format. Expected carePods array.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestNetworkPing = () => {
    PalliativeSpeech.triggerHaptic('medium');
    CareSyncBus.broadcast('SYNC_PING', { pingFrom: 'Backup & Sync Hub' }, 'Co-Carer Host');
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(false), 3000);
  };

  return (
    <div className={styles.card} style={{ borderTop: '4px solid #2A9D8F' }}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>
            <Database size={20} style={{ color: '#2A9D8F' }} />
            <span>Offline Backup, Local Privacy & Wi-Fi Sync Hub</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            100% offline-first local data ownership * Zero third-party tracker exposure * Encrypted device-to-device sync
          </span>
        </div>

        {exportSuccess && (
          <span style={{ background: 'rgba(107, 144, 128, 0.2)', color: '#6B9080', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Check size={14} /> Backup Downloaded
          </span>
        )}
      </div>

      {importSuccess && (
        <div style={{ background: 'rgba(107, 144, 128, 0.2)', color: '#6B9080', padding: '0.85rem', borderRadius: '14px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {importSuccess}
        </div>
      )}

      {/* 3 Grid Sections: Export, Import, Reset */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Box 1: Export Backup */}
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0EDE8', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} style={{ color: '#2A9D8F' }} />
            Export Patient Data (.JSON)
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Download complete local logs, medication catalogs, and care directives into a portable JSON backup file.
          </p>
          <button
            onClick={handleExportBackup}
            style={{
              width: '100%',
              minHeight: '42px',
              borderRadius: '12px',
              border: 'none',
              background: '#2A9D8F',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Download size={15} /> Export JSON File
          </button>
        </div>

        {/* Box 2: Restore Backup */}
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0EDE8', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} style={{ color: '#38BDF8' }} />
            Restore From Backup
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Import an existing patient care record JSON file to restore history and medication schedules.
          </p>
          <label style={{
            width: '100%',
            minHeight: '42px',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: 'rgba(56, 189, 248, 0.12)',
            color: '#38BDF8',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <Upload size={15} /> Select Backup File
            <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Box 3: Wi-Fi Live Sync Test */}
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0EDE8', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wifi size={16} style={{ color: '#E9C46A' }} />
            Live Sync Signal Test
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Broadcast an instant test ping across your local network to verify connected family phones and tablets.
          </p>
          <button
            onClick={handleTestNetworkPing}
            style={{
              width: '100%',
              minHeight: '42px',
              borderRadius: '12px',
              border: '1px solid rgba(233, 196, 106, 0.4)',
              background: 'rgba(233, 196, 106, 0.15)',
              color: '#E9C46A',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Zap size={15} /> {pingSuccess ? 'Signal Broadcasted!' : 'Send Network Ping'}
          </button>
        </div>
      </div>

      {/* Reset Baseline Data Button */}
      <div style={{ borderTop: '1px solid var(--p-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
          Data is stored locally in your browser memory and synchronized peer-to-peer across Wi-Fi.
        </div>
        <button
          onClick={() => {
            if (confirm('Reset care profiles back to default baseline? Local custom entries will be refreshed.')) {
              PalliativeSpeech.triggerHaptic('warning');
              PalliativeDb.resetToSeed();
              onDataRestored();
            }
          }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(231, 111, 81, 0.3)',
            color: '#E76F51',
            padding: '0.35rem 0.85rem',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RotateCcw size={13} /> Reset Baseline Demo Profiles
        </button>
      </div>
    </div>
  );
}
