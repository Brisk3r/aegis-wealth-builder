'use client';

import { useState } from 'react';
import { Heart, Bell, Tag, Check, X } from 'lucide-react';
import { Game } from '@/types/gameHub';
import styles from './WishlistModal.module.css';

interface WishlistModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetPrice: number, notifyOnAllTimeLow: boolean) => void;
  currentWishlistTarget?: number;
}

export default function WishlistModal({
  game,
  isOpen,
  onClose,
  onSave,
  currentWishlistTarget,
}: WishlistModalProps) {
  const currentLowest = game.lowestCurrentPrice || 59.99;
  const [targetPrice, setTargetPrice] = useState<number>(
    currentWishlistTarget || Math.round(currentLowest * 0.8 * 100) / 100
  );
  const [notifyAllTimeLow, setNotifyAllTimeLow] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(targetPrice, notifyAllTimeLow);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleQuickPreset = (percent: number) => {
    const orig = game.highestOriginalPrice || currentLowest;
    const calc = Math.round(orig * (1 - percent / 100) * 100) / 100;
    setTargetPrice(calc);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <Heart className={styles.heartIcon} size={20} fill="var(--accent-purple)" />
            <h3>Configure Price Alert</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.gameSummary}>
          <p className={styles.gameTitle}>{game.title}</p>
          <div className={styles.priceMeta}>
            <span>Current Lowest: <strong>${currentLowest.toFixed(2)}</strong></span>
            {game.allTimeLowPrice && (
              <span style={{ color: 'var(--accent-green)' }}>
                All-Time Low: <strong>${game.allTimeLowPrice.toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span>Set Target Price ($ USD)</span>
              <span className={styles.subtext}>Notify me when price drops to or below:</span>
            </label>

            <div className={styles.priceInputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                type="number"
                step="0.01"
                min="0.99"
                max={game.highestOriginalPrice || 1000}
                className={styles.priceInput}
                value={targetPrice}
                onChange={e => setTargetPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className={styles.presetsRow}>
            <span className={styles.presetLabel}>Quick Presets:</span>
            <button type="button" className={styles.presetBtn} onClick={() => handleQuickPreset(25)}>
              -25% Off
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => handleQuickPreset(50)}>
              -50% Off
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => handleQuickPreset(75)}>
              -75% Off
            </button>
          </div>

          {/* Alert Toggles */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={notifyAllTimeLow}
                onChange={e => setNotifyAllTimeLow(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                <Tag size={14} className={styles.tagIcon} />
                Notify immediately if price hits a new <strong>All-Time Low</strong>
              </span>
            </label>
          </div>

          {savedSuccess ? (
            <div className={styles.successBox}>
              <Check size={18} /> Price Alert Saved to Wishlist!
            </div>
          ) : (
            <div className={styles.actions}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Bell size={16} /> Save Price Alert
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
