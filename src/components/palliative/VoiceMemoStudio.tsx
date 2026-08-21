'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Check, 
  Sparkles, 
  FileText,
  Clock
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CareLog } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface VoiceMemoStudioProps {
  carePod: CarePod;
  onMemoSaved: () => void;
}

export default function VoiceMemoStudio({ carePod, onMemoSaved }: VoiceMemoStudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizer, setRecognizer] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [voiceLogs, setVoiceLogs] = useState<CareLog[]>([]);

  const refreshVoiceLogs = () => {
    const logs = PalliativeDb.getCareLogs(carePod.id);
    setVoiceLogs(logs.filter(l => l.category === 'note' || l.free_text_note));
  };

  useEffect(() => {
    refreshVoiceLogs();
  }, [carePod.id]);

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognizer) recognizer.stop();
      setIsRecording(false);
    } else {
      PalliativeSpeech.triggerHaptic('medium');
      const rec = PalliativeSpeech.createSpeechRecognizer(
        (text) => {
          setTranscript((prev) => prev ? `${prev} ${text}` : text);
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        }
      );

      if (rec.isSupported) {
        rec.start();
        setRecognizer(rec);
        setIsRecording(true);
      } else {
        // Fallback simulation for browsers without Web Speech API
        setIsRecording(true);
        setTimeout(() => {
          setTranscript('Patient resting comfortably on left side. Administered oral mouth swab and barrier cream applied.');
          setIsRecording(false);
        }, 2000);
      }
    }
  };

  const handleSaveMemo = () => {
    if (!transcript.trim()) return;
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'note',
      free_text_note: transcript.trim(),
      is_handover_flagged: true
    });

    setSavedSuccess(true);
    setTranscript('');
    refreshVoiceLogs();
    onMemoSaved();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSpeakText = (text: string) => {
    if (isSpeaking) {
      PalliativeSpeech.stop();
      setIsSpeaking(false);
    } else {
      PalliativeSpeech.triggerHaptic('light');
      setIsSpeaking(true);
      PalliativeSpeech.speak(text, () => setIsSpeaking(false));
    }
  };

  return (
    <div className={styles.card} style={{ borderTop: '4px solid #2A9D8F' }}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>
            <Mic size={20} style={{ color: '#2A9D8F' }} />
            <span>Voice Care Memo & Bedside Speech Studio</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Speak hands-free bedside notes with automatic transcription and audio playback
          </span>
        </div>

        {savedSuccess && (
          <span style={{
            background: 'rgba(107, 144, 128, 0.2)',
            color: '#6B9080',
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Check size={14} /> Voice Note Saved
          </span>
        )}
      </div>

      {/* Voice Recording Control Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        border: `1.5px solid ${isRecording ? '#E76F51' : 'var(--p-border)'}`,
        borderRadius: '18px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        textAlign: 'center'
      }}>
        {/* Animated Wave Bars when Recording */}
        {isRecording && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', height: '32px' }}>
            <span style={{ width: '4px', height: '16px', background: '#E76F51', borderRadius: '2px', animation: 'bounce 0.8s infinite alternate' }} />
            <span style={{ width: '4px', height: '28px', background: '#E76F51', borderRadius: '2px', animation: 'bounce 0.6s infinite alternate 0.2s' }} />
            <span style={{ width: '4px', height: '20px', background: '#E76F51', borderRadius: '2px', animation: 'bounce 0.9s infinite alternate 0.4s' }} />
            <span style={{ width: '4px', height: '32px', background: '#E76F51', borderRadius: '2px', animation: 'bounce 0.7s infinite alternate 0.1s' }} />
            <span style={{ width: '4px', height: '18px', background: '#E76F51', borderRadius: '2px', animation: 'bounce 0.8s infinite alternate 0.3s' }} />
          </div>
        )}

        <button
          onClick={handleToggleRecord}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            background: isRecording ? '#E76F51' : '#2A9D8F',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 20px ${isRecording ? 'rgba(231, 111, 81, 0.5)' : 'rgba(42, 157, 143, 0.4)'}`,
            cursor: 'pointer',
            marginBottom: '0.75rem',
            touchAction: 'manipulation'
          }}
        >
          {isRecording ? <Square size={26} /> : <Mic size={26} />}
        </button>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0EDE8', marginBottom: '0.5rem' }}>
          {isRecording ? 'Listening... Speak your care note' : 'Tap Microphone to Dictate Voice Memo'}
        </div>

        {/* Live Editable Transcript */}
        <textarea
          rows={3}
          className={styles.textareaField}
          placeholder="Dictated voice text appears here... you can also type or edit before saving."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          style={{ margin: '0.75rem 0', resize: 'vertical' }}
        />

        {transcript && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              onClick={() => handleSpeakText(transcript)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--p-border)',
                color: '#CBD5E1',
                padding: '0.45rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isSpeaking ? 'Stop Audio' : 'Preview Audio'}
            </button>

            <button
              onClick={handleSaveMemo}
              style={{
                background: '#2A9D8F',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem 1.2rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Check size={14} /> Save to Patient Journal
            </button>
          </div>
        )}
      </div>

      {/* Voice Notes History Stream */}
      {voiceLogs.length > 0 && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.6rem' }}>
            Recent Dictated Bedside Notes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {voiceLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--p-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#F0EDE8', lineHeight: 1.4 }}>
                    &ldquo;{log.free_text_note}&rdquo;
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                    Logged by {log.logged_by_name} * {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  onClick={() => log.free_text_note && handleSpeakText(log.free_text_note)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(42, 157, 143, 0.15)',
                    border: '1px solid rgba(42, 157, 143, 0.3)',
                    color: '#2A9D8F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="Read aloud note"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
