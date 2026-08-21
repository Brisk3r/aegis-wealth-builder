'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from '@/app/symbols/symbols.module.css';
import AdSlot from '@/components/layout/AdSlot';
import QRCode from 'qrcode';
import {
  SYMBOL_CATEGORIES,
  SYMBOLS_COLLECTION,
  FONT_STYLES,
  BIO_TEMPLATES,
  QUICK_SEARCH_CHIPS,
  SUB_CATEGORIES_MAP,
  DECORATOR_PRESETS,
  ASCII_BANNER_FONTS,
  ADSENSE_FAQS,
  generateZalgo
} from '@/data/symbolsData';
import {
  Copy,
  Check,
  Star,
  Trash2,
  Sparkles,
  Type,
  Smile,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  ArrowUpDown,
  X,
  Keyboard,
  Flame,
  Layers,
  Wand2,
  Filter,
  Download,
  QrCode,
  Volume2,
  VolumeX,
  HelpCircle,
  ShieldCheck,
  FileText,
  Info,
  Mail,
  Palette,
  LayoutTemplate
} from 'lucide-react';

type SortOption = 'trending' | 'az' | 'za' | 'short' | 'long' | 'frequency';
type LengthFilter = 'all' | 'single' | 'short' | 'combo' | 'divider';
type ActiveTabType = 'symbols' | 'fonts' | 'kaomoji' | 'banner' | 'decorator' | 'bio';

export default function SymbolStudio() {
  // Main view state
  const [activeTab, setActiveTab] = useState<ActiveTabType>('symbols');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio & Queue Settings
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [queueMode, setQueueMode] = useState<boolean>(false);
  
  // Tray & Editor state
  const [trayText, setTrayText] = useState<string>('');
  const trayInputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Favorites, Recents & Copy Frequency
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [copyFrequency, setCopyFrequency] = useState<Record<string, number>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showRecentsOnly, setShowRecentsOnly] = useState<boolean>(false);
  
  // Font styler input
  const [fontInput, setFontInput] = useState<string>('Aegis GlyphCraft');
  const [zalgoIntensity, setZalgoIntensity] = useState<number>(3);
  
  // ASCII Banner & Text Decorator state
  const [bannerInput, setBannerInput] = useState<string>('AEGIS');
  const [selectedBannerFont, setSelectedBannerFont] = useState<string>('block');
  const [decoratorInput, setDecoratorInput] = useState<string>('Aesthetic Text');
  
  // Bio Builder & Social Mockup state
  const [selectedBioIndex, setSelectedBioIndex] = useState<number>(0);
  const [bioContent, setBioContent] = useState<string>(BIO_TEMPLATES[0].template);
  const [mockupPlatform, setMockupPlatform] = useState<'Instagram' | 'Discord' | 'TikTok'>('Instagram');
  const [mockupHandle, setMockupHandle] = useState<string>('aegis_creator');
  
  // Export Modals & Generated Data
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'privacy' | 'terms' | 'about' | 'contact' | null>(null);
  
  // Toast & Copied state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  // Synthesized Web Audio Click
  const playClickSound = useCallback(() => {
    if (!audioFeedback || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [audioFeedback]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('aegis_symbol_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedRecents = localStorage.getItem('aegis_symbol_recents');
      if (savedRecents) setRecents(JSON.parse(savedRecents));
      const savedFreq = localStorage.getItem('aegis_symbol_freq');
      if (savedFreq) setCopyFrequency(JSON.parse(savedFreq));
      const savedSearches = localStorage.getItem('aegis_symbol_searches');
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
      const savedAudio = localStorage.getItem('aegis_symbol_audio');
      if (savedAudio !== null) setAudioFeedback(JSON.parse(savedAudio));
    } catch {
      // Ignore
    }
  }, []);

  // Keyboard shortcut listener (/ or Ctrl+K to search, Esc to clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current && document.activeElement !== trayInputRef.current) {
        e.preventDefault();
        setActiveTab('symbols');
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        }
        setShowQrModal(false);
        setShowPolicyModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  const copyToClipboard = (text: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    playClickSound();
    setCopiedChar(text);
    setTimeout(() => setCopiedChar(null), 1200);
    triggerToast(label ? `Copied ${label} to clipboard!` : `Copied "${text}" to clipboard!`);

    // Track recently copied
    setRecents(prev => {
      const filtered = prev.filter(item => item !== text);
      const updated = [text, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('aegis_symbol_recents', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });

    // Track copy frequency
    setCopyFrequency(prev => {
      const updated = { ...prev, [text]: (prev[text] || 0) + 1 };
      try {
        localStorage.setItem('aegis_symbol_freq', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const toggleFavorite = (char: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setFavorites(prev => {
      let updated: string[];
      if (prev.includes(char)) {
        updated = prev.filter(c => c !== char);
      } else {
        updated = [char, ...prev];
      }
      try {
        localStorage.setItem('aegis_symbol_favs', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleSymbolClick = (char: string) => {
    if (!queueMode) {
      copyToClipboard(char);
    } else {
      playClickSound();
      triggerToast(`Added "${char}" to queue tray`);
    }
    
    // Append to tray editor
    if (trayInputRef.current) {
      const start = trayInputRef.current.selectionStart || trayText.length;
      const end = trayInputRef.current.selectionEnd || trayText.length;
      const newText = trayText.substring(0, start) + char + trayText.substring(end);
      setTrayText(newText);
    } else {
      setTrayText(prev => prev + char);
    }
  };

  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.toLowerCase() !== q.toLowerCase().trim());
        const updated = [q.trim(), ...filtered].slice(0, 6);
        try {
          localStorage.setItem('aegis_symbol_searches', JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    }
  };

  const applyQuickChip = (chip: typeof QUICK_SEARCH_CHIPS[0]) => {
    playClickSound();
    setActiveTab('symbols');
    setShowFavoritesOnly(false);
    setShowRecentsOnly(false);
    if (chip.category && chip.category !== 'all') {
      setSelectedCategory(chip.category);
    } else {
      setSelectedCategory('all');
    }
    setSelectedSubCategory('all');
    setSearchQuery(chip.query);
    if (chip.query) {
      handleSearchSubmit(chip.query);
    }
  };

  const resetAllFilters = () => {
    playClickSound();
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setLengthFilter('all');
    setSortBy('trending');
    setShowFavoritesOnly(false);
    setShowRecentsOnly(false);
  };

  // Tray Transformations
  const applyTransform = (type: 'spaced' | 'upper' | 'lower' | 'reverse' | 'sparkle' | 'heart' | 'bracket' | 'wings') => {
    if (!trayText) return;
    playClickSound();
    let result = trayText;
    switch (type) {
      case 'spaced':
        result = trayText.split('').join(' ');
        break;
      case 'upper':
        result = trayText.toUpperCase();
        break;
      case 'lower':
        result = trayText.toLowerCase();
        break;
      case 'reverse':
        result = trayText.split('').reverse().join('');
        break;
      case 'sparkle':
        result = `✧･ﾟ: * ${trayText} * :･ﾟ✧`;
        break;
      case 'heart':
        result = `♥ ${trayText} ♥`;
        break;
      case 'bracket':
        result = `【 ${trayText} 】`;
        break;
      case 'wings':
        result = `༺ ${trayText} ༻`;
        break;
    }
    setTrayText(result);
    triggerToast(`Applied ${type.toUpperCase()} transform!`);
  };

  // Export functions: Text file, Aesthetic Image Card & QR Code
  const downloadAsTextFile = () => {
    if (!trayText) return;
    const blob = new Blob([trayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glyphcraft-symbols-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Downloaded .txt file!');
  };

  const generateCardImage = () => {
    if (!trayText) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Dark Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#090d16');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle Glow Accent
    ctx.beginPath();
    ctx.arc(600, 315, 280, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.fill();

    // Border Frame
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1120, 550);

    // Watermark & Brand
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ GLYPHCRAFT STUDIO -- AEGIS SOFTWARE ✦', 600, 95);

    // Center Rendered Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px sans-serif';
    const lines = trayText.split('\n');
    const startY = 315 - ((lines.length - 1) * 30);
    lines.forEach((line, idx) => {
      ctx.fillText(line, 600, startY + (idx * 60));
    });

    // Subtitle Link
    ctx.fillStyle = '#38bdf8';
    ctx.font = '20px sans-serif';
    ctx.fillText('https://aegishub.dev', 600, 545);

    // Trigger Download
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `glyphcraft-art-${Date.now()}.png`;
    a.click();
    triggerToast('Generated & downloaded aesthetic PNG image!');
  };

  const handleGenerateQR = async () => {
    if (!trayText) return;
    try {
      const url = await QRCode.toDataURL(trayText, { width: 320, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
      setQrCodeUrl(url);
      setShowQrModal(true);
    } catch {
      triggerToast('Failed to generate QR Code');
    }
  };

  // Category items count map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SYMBOLS_COLLECTION.length };
    SYMBOL_CATEGORIES.forEach(c => {
      if (c.id !== 'all') {
        counts[c.id] = SYMBOLS_COLLECTION.filter(s => s.category === c.id).length;
      }
    });
    return counts;
  }, []);

  // Multi-dimensional filtering and sorting calculation
  const filteredSymbols = useMemo(() => {
    let list = [...SYMBOLS_COLLECTION];

    if (showFavoritesOnly) {
      list = list.filter(item => favorites.includes(item.char));
    } else if (showRecentsOnly) {
      list = list.filter(item => recents.includes(item.char));
    } else {
      if (selectedCategory !== 'all') {
        list = list.filter(item => item.category === selectedCategory);
      }
      if (selectedSubCategory !== 'all') {
        list = list.filter(item => item.subCategory === selectedSubCategory);
      }
    }

    if (lengthFilter !== 'all') {
      list = list.filter(item => item.lengthType === lengthFilter);
    }

    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list.filter(item => {
        const targetStr = `${item.char} ${item.name} ${item.category} ${item.subCategory || ''} ${item.tags.join(' ')}`.toLowerCase();
        return tokens.every(token => targetStr.includes(token));
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'trending') return (b.popularity || 50) - (a.popularity || 50);
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      if (sortBy === 'short') return a.char.length - b.char.length || a.name.localeCompare(b.name);
      if (sortBy === 'long') return b.char.length - a.char.length || a.name.localeCompare(b.name);
      if (sortBy === 'frequency') {
        const freqA = copyFrequency[a.char] || 0;
        const freqB = copyFrequency[b.char] || 0;
        return freqB - freqA || (b.popularity || 50) - (a.popularity || 50);
      }
      return 0;
    });

    return list;
  }, [
    selectedCategory,
    selectedSubCategory,
    lengthFilter,
    sortBy,
    searchQuery,
    showFavoritesOnly,
    showRecentsOnly,
    favorites,
    recents,
    copyFrequency
  ]);

  const activeSubCategories = selectedCategory !== 'all' ? SUB_CATEGORIES_MAP[selectedCategory] : undefined;
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedSubCategory !== 'all' ||
    lengthFilter !== 'all' ||
    sortBy !== 'trending' ||
    showFavoritesOnly ||
    showRecentsOnly
  );

  return (
    <div className={styles.studioContainer}>
      {/* Toast Banner */}
      {toastMessage && (
        <div className={styles.toastNotification}>
          <Sparkles size={16} className={styles.toastIcon} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Ad Space */}
      <div className={styles.topAdWrapper}>
        <AdSlot type="banner" />
      </div>

      {/* Hero Header */}
      <div className={styles.heroSection}>
        <div className={styles.brandBadge}>
          <Wand2 size={14} className={styles.pulseIcon} />
          <span>GLYPHCRAFT STUDIO -- UNICODE & AESTHETIC FORGE</span>
        </div>
        <h1 className={styles.heroTitle}>
          Cool Symbols, Kaomoji & Font Generator
        </h1>
        <p className={styles.heroSubtitle}>
          Discover, customize, and 1-click copy 2,000+ aesthetic symbols, Lenny faces, fancy Unicode fonts, Big ASCII banners, and social profile templates.
        </p>

        {/* Studio Sub-Navigation Tabs */}
        <div className={styles.tabNavRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'symbols' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('symbols'); setShowFavoritesOnly(false); setShowRecentsOnly(false); playClickSound(); }}
          >
            <Sparkles size={16} />
            <span>Symbols & Glyphs ({SYMBOLS_COLLECTION.length}+)</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'fonts' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('fonts'); playClickSound(); }}
          >
            <Type size={16} />
            <span>Unicode Font Styler (22+ Styles)</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'banner' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('banner'); playClickSound(); }}
          >
            <Palette size={16} />
            <span>ASCII Big Text Banners</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'decorator' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('decorator'); playClickSound(); }}
          >
            <LayoutTemplate size={16} />
            <span>Text Decorator Wrappers</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'bio' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('bio'); playClickSound(); }}
          >
            <Layers size={16} />
            <span>Social Bio & Live Mockups</span>
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className={styles.mainGridWrapper}>
        {/* Left Column: Tools & Grids */}
        <div className={styles.primaryContentCol}>
          {/* TAB 1: SYMBOL BROWSER */}
          {activeTab === 'symbols' && (
            <div>
              {/* Universal Search & Sorting Command Bar */}
              <div className={styles.searchCommandDeck}>
                <div className={styles.searchBoxWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search 2,000+ symbols (Press '/' or 'Ctrl+K' to focus)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(searchQuery); }}
                    className={styles.searchInput}
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => { setSearchQuery(''); playClickSound(); }}
                      className={styles.clearSearchBtn}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <div className={styles.searchShortcutTag}>
                      <Keyboard size={12} />
                      <span>/</span>
                    </div>
                  )}
                </div>

                {/* Sorting Dropdown Control */}
                <div className={styles.sortingControlBox}>
                  <ArrowUpDown size={15} color="#94a3b8" />
                  <span className={styles.sortLabel}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value as SortOption); playClickSound(); }}
                    className={styles.sortSelect}
                  >
                    <option value="trending">🔥 Trending / Popularity</option>
                    <option value="az">🔤 Name: A to Z</option>
                    <option value="za">🔤 Name: Z to A</option>
                    <option value="short">📏 Length: Short to Long</option>
                    <option value="long">📐 Length: Long to Short</option>
                    <option value="frequency">⚡ My Most Copied</option>
                  </select>
                </div>

                {/* Audio Haptics & Queue Mode Toggles */}
                <div className={styles.settingsTogglesBar}>
                  <button
                    className={`${styles.toggleSettingBtn} ${audioFeedback ? styles.toggleActiveSetting : ''}`}
                    onClick={() => {
                      const next = !audioFeedback;
                      setAudioFeedback(next);
                      try { localStorage.setItem('aegis_symbol_audio', JSON.stringify(next)); } catch {}
                    }}
                    title={audioFeedback ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted'}
                  >
                    {audioFeedback ? <Volume2 size={15} color="#38bdf8" /> : <VolumeX size={15} color="#64748b" />}
                  </button>

                  <button
                    className={`${styles.toggleSettingBtn} ${queueMode ? styles.toggleActiveSetting : ''}`}
                    onClick={() => { setQueueMode(!queueMode); playClickSound(); }}
                    title={queueMode ? 'Multi-Select Queue Mode: Active' : 'Auto-Copy Mode: Active'}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                      {queueMode ? 'QUEUE MODE' : 'AUTO-COPY'}
                    </span>
                  </button>
                </div>

                {/* Favorites & Recent Quick Filters */}
                <div className={styles.quickFilterToggles}>
                  <button
                    className={`${styles.toggleFilterBtn} ${showFavoritesOnly ? styles.toggleActive : ''}`}
                    onClick={() => {
                      playClickSound();
                      setShowFavoritesOnly(!showFavoritesOnly);
                      setShowRecentsOnly(false);
                    }}
                    title="View Starred Favorites"
                  >
                    <Star size={14} fill={showFavoritesOnly ? '#fbbf24' : 'none'} color="#fbbf24" />
                    <span>Favorites ({favorites.length})</span>
                  </button>

                  <button
                    className={`${styles.toggleFilterBtn} ${showRecentsOnly ? styles.toggleActive : ''}`}
                    onClick={() => {
                      playClickSound();
                      setShowRecentsOnly(!showRecentsOnly);
                      setShowFavoritesOnly(false);
                    }}
                    title="View Recently Copied Symbols"
                  >
                    <RotateCcw size={14} color="#38bdf8" />
                    <span>Recent ({recents.length})</span>
                  </button>
                </div>
              </div>

              {/* Quick Search Chips */}
              <div className={styles.quickSearchChipsRow}>
                <span className={styles.chipsHeading}><Flame size={13} color="#f97316" /> QUICK SHORTCUTS:</span>
                {QUICK_SEARCH_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => applyQuickChip(chip)}
                    className={styles.quickSearchChip}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent Searches Tags */}
              {recentSearches.length > 0 && (
                <div className={styles.recentSearchesBar}>
                  <span className={styles.recentSearchesLabel}>Recent Searches:</span>
                  {recentSearches.map(q => (
                    <button
                      key={q}
                      onClick={() => { setSearchQuery(q); playClickSound(); }}
                      className={styles.recentSearchTag}
                    >
                      <span>{q}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      try { localStorage.removeItem('aegis_symbol_searches'); } catch {}
                    }}
                    className={styles.clearRecentSearchesBtn}
                  >
                    Clear History
                  </button>
                </div>
              )}

              {/* Category Navigation Pills */}
              {!showFavoritesOnly && !showRecentsOnly && (
                <div className={styles.categoryPillsScroll}>
                  {SYMBOL_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        className={`${styles.categoryPill} ${isSelected ? styles.categoryPillActive : ''}`}
                        onClick={() => {
                          playClickSound();
                          setSelectedCategory(cat.id);
                          setSelectedSubCategory('all');
                        }}
                      >
                        <span className={styles.catIcon}>{cat.icon}</span>
                        <span className={styles.catLabel}>{cat.label}</span>
                        <span className={styles.catCountBadge}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Sub-Category Pills */}
              {activeSubCategories && !showFavoritesOnly && !showRecentsOnly && (
                <div className={styles.subCategoryRow}>
                  <span className={styles.subCatHeading}><Filter size={12} /> SUB-CATEGORIES:</span>
                  <div className={styles.subCategoryPills}>
                    {activeSubCategories.map(sub => {
                      const isSubActive = selectedSubCategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          className={`${styles.subCategoryPill} ${isSubActive ? styles.subPillActive : ''}`}
                          onClick={() => { setSelectedSubCategory(sub.id); playClickSound(); }}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Length & Complexity Filter Segment */}
              <div className={styles.secondaryFilterBar}>
                <div className={styles.lengthSegmentGroup}>
                  <span className={styles.filterBarLabel}>GLYPH SIZE:</span>
                  <button
                    className={`${styles.segmentBtn} ${lengthFilter === 'all' ? styles.segmentBtnActive : ''}`}
                    onClick={() => { setLengthFilter('all'); playClickSound(); }}
                  >
                    All Sizes
                  </button>
                  <button
                    className={`${styles.segmentBtn} ${lengthFilter === 'single' ? styles.segmentBtnActive : ''}`}
                    onClick={() => { setLengthFilter('single'); playClickSound(); }}
                  >
                    Single (1)
                  </button>
                  <button
                    className={`${styles.segmentBtn} ${lengthFilter === 'short' ? styles.segmentBtnActive : ''}`}
                    onClick={() => { setLengthFilter('short'); playClickSound(); }}
                  >
                    Short (2-5)
                  </button>
                  <button
                    className={`${styles.segmentBtn} ${lengthFilter === 'combo' ? styles.segmentBtnActive : ''}`}
                    onClick={() => { setLengthFilter('combo'); playClickSound(); }}
                  >
                    Combos (6-15)
                  </button>
                  <button
                    className={`${styles.segmentBtn} ${lengthFilter === 'divider' ? styles.segmentBtnActive : ''}`}
                    onClick={() => { setLengthFilter('divider'); playClickSound(); }}
                  >
                    Dividers (16+)
                  </button>
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className={styles.activeFiltersDeck}>
                  <span className={styles.activeFiltersLabel}>Active Filters:</span>
                  {selectedCategory !== 'all' && (
                    <span className={styles.activeFilterBadge}>
                      Category: {SYMBOL_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                      <button onClick={() => setSelectedCategory('all')}>✕</button>
                    </span>
                  )}
                  {selectedSubCategory !== 'all' && (
                    <span className={styles.activeFilterBadge}>
                      Mood: {selectedSubCategory}
                      <button onClick={() => setSelectedSubCategory('all')}>✕</button>
                    </span>
                  )}
                  {lengthFilter !== 'all' && (
                    <span className={styles.activeFilterBadge}>
                      Size: {lengthFilter}
                      <button onClick={() => setLengthFilter('all')}>✕</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className={styles.activeFilterBadge}>
                      Query: &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery('')}>✕</button>
                    </span>
                  )}
                  {showFavoritesOnly && (
                    <span className={styles.activeFilterBadge}>
                      Favorites Only
                      <button onClick={() => setShowFavoritesOnly(false)}>✕</button>
                    </span>
                  )}
                  {showRecentsOnly && (
                    <span className={styles.activeFilterBadge}>
                      Recently Copied
                      <button onClick={() => setShowRecentsOnly(false)}>✕</button>
                    </span>
                  )}
                  <button onClick={resetAllFilters} className={styles.clearAllFiltersBtn}>
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Symbol Grid Header */}
              <div className={styles.gridMetaHeader}>
                <span className={styles.gridCountText}>
                  Showing <strong>{filteredSymbols.length}</strong> glyphs & combinations
                </span>
                <span className={styles.gridHintText}>
                  {queueMode ? 'Queue Mode Active: Click to add to tray' : '1-Click Auto Copy enabled'}
                </span>
              </div>

              {/* High-Density Symbol Cards Grid */}
              <div className={styles.symbolGrid}>
                {filteredSymbols.map((item, idx) => {
                  const isFav = favorites.includes(item.char);
                  const isCopied = copiedChar === item.char;
                  const isLargeCombo = item.char.length > 5;

                  return (
                    <div
                      key={`${item.char}-${idx}`}
                      className={`${styles.symbolCard} ${isLargeCombo ? styles.symbolCardWide : ''} ${isCopied ? styles.symbolCardCopied : ''}`}
                      onClick={() => handleSymbolClick(item.char)}
                      title={`${item.name} -- Click to copy`}
                    >
                      <button
                        className={styles.favIconBtn}
                        onClick={(e) => toggleFavorite(item.char, e)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          size={12}
                          fill={isFav ? '#fbbf24' : 'transparent'}
                          color={isFav ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'}
                        />
                      </button>

                      <div className={styles.symbolGlyphDisplay}>
                        {item.char}
                      </div>

                      <div className={styles.symbolCardFooter}>
                        <span className={styles.symbolNameText}>{item.name}</span>
                        {isCopied ? (
                          <span className={styles.copiedBadge}><Check size={11} /> Copied!</span>
                        ) : (
                          <span className={styles.copyHoverPrompt}>[COPY]</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSymbols.length === 0 && (
                <div className={styles.emptyStateContainer}>
                  <p className={styles.emptyTitle}>No symbols match your query</p>
                  <p className={styles.emptySubtitle}>Try adjusting your search terms or clearing active filters to view all 2,000+ glyphs.</p>
                  <button onClick={resetAllFilters} className={styles.resetSearchBtn}>
                    Reset All Filters & Search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNICODE FONT STYLER */}
          {activeTab === 'fonts' && (
            <div className={styles.fontStylerContainer}>
              <div className={styles.fontInputCard}>
                <div className={styles.fontInputHeader}>
                  <Type size={18} color="#a855f7" />
                  <span className={styles.fontInputTitle}>Live Text to Fancy Unicode Converter</span>
                </div>
                <input
                  type="text"
                  value={fontInput}
                  onChange={(e) => setFontInput(e.target.value)}
                  placeholder="Type anything here to convert into 22+ stylish fonts..."
                  className={styles.fontMasterInput}
                />
                
                {/* Zalgo Chaos Slider */}
                <div className={styles.zalgoControlRow}>
                  <SlidersHorizontal size={14} color="#94a3b8" />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Glitch / Zalgo Chaos Intensity:</span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={zalgoIntensity}
                    onChange={(e) => setZalgoIntensity(Number(e.target.value))}
                    className={styles.intensitySlider}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a855f7' }}>Level {zalgoIntensity}</span>
                </div>
              </div>

              {/* Font Cards Grid */}
              <div className={styles.fontVariantsGrid}>
                {FONT_STYLES.map(style => {
                  const transformed = style.id === 'zalgo'
                    ? generateZalgo(fontInput || 'Aegis GlyphCraft', zalgoIntensity)
                    : style.transform(fontInput || 'Aegis GlyphCraft');

                  const isCopied = copiedChar === transformed;

                  return (
                    <div key={style.id} className={styles.fontVariantCard}>
                      <div className={styles.fontCardTop}>
                        <span className={styles.fontStyleName}>{style.name}</span>
                        <span className={styles.fontCategoryTag}>{style.category}</span>
                      </div>

                      <div className={styles.fontSampleOutput}>
                        {transformed}
                      </div>

                      <div className={styles.fontCardActions}>
                        <button
                          onClick={() => copyToClipboard(transformed, style.name)}
                          className={styles.fontCopyBtn}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copied!' : 'Copy Style'}</span>
                        </button>
                        <button
                          onClick={() => setTrayText(prev => prev + (prev ? ' ' : '') + transformed)}
                          className={styles.fontAppendBtn}
                          title="Append to Collector Tray"
                        >
                          + Add to Tray
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ASCII BANNER FORGE */}
          {activeTab === 'banner' && (
            <div className={styles.bannerForgeContainer}>
              <div className={styles.fontInputCard}>
                <div className={styles.fontInputHeader}>
                  <Palette size={18} color="#38bdf8" />
                  <span className={styles.fontInputTitle}>ASCII Big Text & Figlet Banner Generator</span>
                </div>
                <input
                  type="text"
                  value={bannerInput}
                  onChange={(e) => setBannerInput(e.target.value)}
                  placeholder="Type a word or title for 3D ASCII Banner Art..."
                  className={styles.fontMasterInput}
                />
                
                <div className={styles.bannerFontRow}>
                  {ASCII_BANNER_FONTS.map(f => (
                    <button
                      key={f.id}
                      className={`${styles.bannerFontBtn} ${selectedBannerFont === f.id ? styles.bannerFontActive : ''}`}
                      onClick={() => setSelectedBannerFont(f.id)}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.asciiBannerPreviewCard}>
                <div className={styles.asciiBannerCardTop}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>Rendered ASCII Banner</span>
                  <button
                    onClick={() => {
                      const font = ASCII_BANNER_FONTS.find(f => f.id === selectedBannerFont) || ASCII_BANNER_FONTS[0];
                      copyToClipboard(font.render(bannerInput || 'AEGIS'), 'ASCII Banner');
                    }}
                    className={styles.bioCopyHeaderBtn}
                  >
                    <Copy size={14} />
                    <span>Copy Banner</span>
                  </button>
                </div>
                <pre className={styles.asciiPreBlock}>
                  {((ASCII_BANNER_FONTS.find(f => f.id === selectedBannerFont) || ASCII_BANNER_FONTS[0]).render(bannerInput || 'AEGIS'))}
                </pre>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      const font = ASCII_BANNER_FONTS.find(f => f.id === selectedBannerFont) || ASCII_BANNER_FONTS[0];
                      setTrayText(font.render(bannerInput || 'AEGIS'));
                    }}
                    className={styles.fontAppendBtn}
                  >
                    + Load into Collector Tray
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEXT DECORATOR WRAPPERS */}
          {activeTab === 'decorator' && (
            <div className={styles.decoratorContainer}>
              <div className={styles.fontInputCard}>
                <div className={styles.fontInputHeader}>
                  <LayoutTemplate size={18} color="#c084fc" />
                  <span className={styles.fontInputTitle}>Aesthetic Text Decorator & Fancy Wrapper</span>
                </div>
                <input
                  type="text"
                  value={decoratorInput}
                  onChange={(e) => setDecoratorInput(e.target.value)}
                  placeholder="Enter your username, title, or status message..."
                  className={styles.fontMasterInput}
                />
              </div>

              <div className={styles.decoratorGrid}>
                {DECORATOR_PRESETS.map(preset => {
                  const wrapped = `${preset.prefix}${decoratorInput || 'Aesthetic Text'}${preset.suffix}`;
                  const isCopied = copiedChar === wrapped;

                  return (
                    <div key={preset.id} className={styles.decoratorCard}>
                      <span className={styles.decoratorName}>{preset.name}</span>
                      <div className={styles.decoratorOutput}>{wrapped}</div>
                      <div className={styles.decoratorActions}>
                        <button
                          onClick={() => copyToClipboard(wrapped, preset.name)}
                          className={styles.fontCopyBtn}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => setTrayText(prev => prev + (prev ? ' ' : '') + wrapped)}
                          className={styles.fontAppendBtn}
                        >
                          + Tray
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: BIO & SOCIAL MOCKUPS */}
          {activeTab === 'bio' && (
            <div className={styles.bioBuilderContainer}>
              <div className={styles.bioSelectorRow}>
                {BIO_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={tmpl.title}
                    className={`${styles.bioTemplatePill} ${selectedBioIndex === idx ? styles.bioPillActive : ''}`}
                    onClick={() => {
                      setSelectedBioIndex(idx);
                      setBioContent(tmpl.template);
                      setMockupPlatform(tmpl.platform as 'Instagram' | 'Discord' | 'TikTok');
                    }}
                  >
                    <Bookmark size={14} />
                    <span>{tmpl.title}</span>
                  </button>
                ))}
              </div>

              {/* Split Editor and Mockup Canvas */}
              <div className={styles.bioSplitGrid}>
                {/* Editor Column */}
                <div className={styles.bioEditorCard}>
                  <div className={styles.bioCardHeader}>
                    <div>
                      <h3 className={styles.bioCardTitle}>{BIO_TEMPLATES[selectedBioIndex].title}</h3>
                      <span className={styles.bioPlatformTag}>Platform: {BIO_TEMPLATES[selectedBioIndex].platform}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bioContent, 'Bio Template')}
                      className={styles.bioCopyHeaderBtn}
                    >
                      <Copy size={14} />
                      <span>Copy Full Bio</span>
                    </button>
                  </div>

                  <textarea
                    value={bioContent}
                    onChange={(e) => setBioContent(e.target.value)}
                    className={styles.bioTextarea}
                    rows={8}
                    placeholder="Customize your bio template here..."
                  />

                  <div className={styles.bioFooterHelp}>
                    <span>[TIP] Click symbols above to build custom aesthetics</span>
                    <button
                      onClick={() => setTrayText(bioContent)}
                      className={styles.bioSendToTrayBtn}
                    >
                      Load into Collector Tray
                    </button>
                  </div>
                </div>

                {/* Live Social Mockup Frame */}
                <div className={styles.socialMockupCard}>
                  <div className={styles.mockupHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={styles.mockupLiveDot} />
                      <span className={styles.mockupTitleText}>Live {mockupPlatform} Preview</span>
                    </div>
                    <div className={styles.mockupPlatformBtns}>
                      <button
                        className={`${styles.mockupTab} ${mockupPlatform === 'Instagram' ? styles.mockupTabActive : ''}`}
                        onClick={() => setMockupPlatform('Instagram')}
                      >
                        IG
                      </button>
                      <button
                        className={`${styles.mockupTab} ${mockupPlatform === 'Discord' ? styles.mockupTabActive : ''}`}
                        onClick={() => setMockupPlatform('Discord')}
                      >
                        Discord
                      </button>
                      <button
                        className={`${styles.mockupTab} ${mockupPlatform === 'TikTok' ? styles.mockupTabActive : ''}`}
                        onClick={() => setMockupPlatform('TikTok')}
                      >
                        TikTok
                      </button>
                    </div>
                  </div>

                  {/* Profile Mockup Visual Box */}
                  <div className={styles.mockupProfileBox}>
                    <div className={styles.mockupAvatarRow}>
                      <div className={styles.mockupAvatarRing}>
                        <div className={styles.mockupAvatar}>✦</div>
                      </div>
                      <div className={styles.mockupStatsRow}>
                        <div><strong>1.2k</strong><span>posts</span></div>
                        <div><strong>24.8k</strong><span>followers</span></div>
                        <div><strong>420</strong><span>following</span></div>
                      </div>
                    </div>

                    <div className={styles.mockupBioHeader}>
                      <span className={styles.mockupHandle}>@{mockupHandle}</span>
                      <input
                        type="text"
                        value={mockupHandle}
                        onChange={(e) => setMockupHandle(e.target.value)}
                        className={styles.mockupHandleEdit}
                        title="Edit preview handle"
                      />
                    </div>

                    <div className={styles.mockupBioRendered}>
                      {bioContent}
                    </div>

                    <div className={styles.mockupActionButtons}>
                      <button className={styles.mockupFollowBtn}>Follow</button>
                      <button className={styles.mockupMsgBtn}>Message</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* In-Content Architectural Banner Ad */}
          <div className={styles.inContentAdWrapper}>
            <AdSlot type="in-article" />
          </div>

          {/* Educational Content & FAQ Section for Google AdSense Compliance */}
          <div className={styles.educationalContentSection}>
            <h2 className={styles.educationalTitle}>
              Mastering Aesthetic Unicode Symbols, Kaomoji & Typography
            </h2>
            <p className={styles.educationalParagraph}>
              Unicode represents the international computing standard for the consistent encoding, representation, and handling of text and glyphs across modern operating systems. With over 149,000 characters standardized by the Unicode Consortium, aesthetic designers, social media creators, and software engineers leverage mathematical alphanumeric symbols, special runes, and Japanese emoticons (Kaomoji) to craft distinctive digital identities.
            </p>

            <h3 className={styles.faqHeading}>Frequently Asked Questions</h3>
            <div className={styles.faqList}>
              {ADSENSE_FAQS.map((faq, idx) => (
                <div key={idx} className={styles.faqItem}>
                  <h4 className={styles.faqQuestion}>✦ {faq.question}</h4>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              ))}
            </div>

            {/* Compliance Footer Links */}
            <div className={styles.complianceLinksRow}>
              <button onClick={() => setShowPolicyModal('about')} className={styles.policyLinkBtn}>
                <Info size={13} /> About Aegis Hub
              </button>
              <button onClick={() => setShowPolicyModal('privacy')} className={styles.policyLinkBtn}>
                <ShieldCheck size={13} /> Privacy Policy
              </button>
              <button onClick={() => setShowPolicyModal('terms')} className={styles.policyLinkBtn}>
                <FileText size={13} /> Terms of Service
              </button>
              <button onClick={() => setShowPolicyModal('contact')} className={styles.policyLinkBtn}>
                <Mail size={13} /> Contact & Support
              </button>
            </div>
          </div>
        </div>

        {/* Right Rail: Architectural Skyscraper & Quick Combos */}
        <aside className={styles.sidebarCol}>
          <div className={styles.stickySidebarContent}>
            {/* Category Quick Jump Deck */}
            <div className={styles.categoryJumpDeck}>
              <div className={styles.deckHeader}>
                <Sparkles size={16} color="#a855f7" />
                <span className={styles.deckTitle}>Category Quick Jump</span>
              </div>
              <div className={styles.categoryJumpList}>
                {SYMBOL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryJumpBtn} ${selectedCategory === cat.id ? styles.categoryJumpBtnActive : ''}`}
                    onClick={() => {
                      playClickSound();
                      setActiveTab('symbols');
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('all');
                      setShowFavoritesOnly(false);
                      setShowRecentsOnly(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <span className={styles.jumpCountBadge}>{categoryCounts[cat.id] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Kaomoji Trending Deck */}
            <div className={styles.trendingDeckCard}>
              <div className={styles.deckHeader}>
                <Flame size={16} color="#f97316" />
                <span className={styles.deckTitle}>Trending Kaomoji</span>
              </div>
              <div className={styles.quickDeckList}>
                {['( ͡° ͜ʖ ͡°)', '(｡♥‿♥｡)', '¯\\_(ツ)_/¯', 'ʕ•ᴥ•ʔ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', 'ᕦ(ò_óˇ)ᕤ', '(╯°□°)╯︵ ┻━┻', 'ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧', '໒꒰ྀི´ ˘ ` ꒱ྀིა'].map(k => (
                  <button
                    key={k}
                    onClick={() => handleSymbolClick(k)}
                    className={styles.quickDeckItem}
                  >
                    <span>{k}</span>
                    <Copy size={12} className={styles.quickCopyIcon} />
                  </button>
                ))}
              </div>
            </div>

            {/* Skyscraper Architectural Ad Unit */}
            <div className={styles.sidebarAdWrapper}>
              <AdSlot type="sidebar" />
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ACTION COLLECTOR TRAY ("COPY COOL SYMBOLS")                     */}
      {/* ========================================================================= */}
      <div className={styles.floatingCollectorTray}>
        <div className={styles.trayInner}>
          <div className={styles.trayHeaderRow}>
            <div className={styles.trayBrandTitle}>
              <Sparkles size={14} color="#38bdf8" />
              <span>COLLECTOR FORGE & TRAY</span>
            </div>

            {/* Live Metrics & Export Suite */}
            <div className={styles.trayMetricsActionsRow}>
              <div className={styles.trayMetrics}>
                <span>Chars: <strong>{trayText.length}</strong></span>
                <span>Words: <strong>{trayText.trim() ? trayText.trim().split(/\s+/).length : 0}</strong></span>
              </div>

              <div className={styles.trayExportTools}>
                <button
                  onClick={downloadAsTextFile}
                  disabled={!trayText}
                  className={styles.trayExportBtn}
                  title="Download .txt file"
                >
                  <Download size={13} />
                  <span>.TXT</span>
                </button>

                <button
                  onClick={generateCardImage}
                  disabled={!trayText}
                  className={styles.trayExportBtn}
                  title="Download aesthetic PNG image card"
                >
                  <Palette size={13} />
                  <span>PNG Card</span>
                </button>

                <button
                  onClick={handleGenerateQR}
                  disabled={!trayText}
                  className={styles.trayExportBtn}
                  title="Generate QR Code for mobile"
                >
                  <QrCode size={13} />
                  <span>QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Text Input Box */}
          <div className={styles.trayInputRow}>
            <textarea
              ref={trayInputRef}
              value={trayText}
              onChange={(e) => setTrayText(e.target.value)}
              placeholder="Your copied symbols & text will collect here... Type or click symbols to combine!"
              className={styles.trayTextarea}
              rows={2}
            />

            {/* Primary Action Buttons */}
            <div className={styles.trayPrimaryActions}>
              <button
                onClick={() => copyToClipboard(trayText, 'All Tray Text')}
                disabled={!trayText}
                className={styles.trayCopyAllBtn}
              >
                <Copy size={16} />
                <span>COPY ALL</span>
              </button>

              <button
                onClick={() => { setTrayText(''); playClickSound(); }}
                disabled={!trayText}
                className={styles.trayClearBtn}
                title="Clear all collected text"
              >
                <Trash2 size={16} />
                <span>CLEAR</span>
              </button>
            </div>
          </div>

          {/* Quick Transform Controls Bar */}
          <div className={styles.trayTransformRow}>
            <span className={styles.transformLabel}>TRANSFORMS:</span>
            <button onClick={() => applyTransform('spaced')} className={styles.transformPill}>[S P A C E D]</button>
            <button onClick={() => applyTransform('sparkle')} className={styles.transformPill}>[✧ SPARKLE ✧]</button>
            <button onClick={() => applyTransform('heart')} className={styles.transformPill}>[♥ HEART ♥]</button>
            <button onClick={() => applyTransform('bracket')} className={styles.transformPill}>[【 BRACKET 】]</button>
            <button onClick={() => applyTransform('wings')} className={styles.transformPill}>[༺ WINGS ༻]</button>
            <button onClick={() => applyTransform('upper')} className={styles.transformPill}>[UPPERCASE]</button>
            <button onClick={() => applyTransform('lower')} className={styles.transformPill}>[lowercase]</button>
            <button onClick={() => applyTransform('reverse')} className={styles.transformPill}>[REVERSE]</button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeUrl && (
        <div className={styles.modalBackdrop} onClick={() => setShowQrModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Scan QR Code on Mobile</h3>
              <button onClick={() => setShowQrModal(false)} className={styles.closeModalBtn}>✕</button>
            </div>
            <div className={styles.qrCodeWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="GlyphCraft QR Code" className={styles.qrImage} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.75rem' }}>
              Scan with your iOS or Android camera to transfer your collected symbols instantly!
            </p>
          </div>
        </div>
      )}

      {/* AdSense Compliance Modals */}
      {showPolicyModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowPolicyModal(null)}>
          <div className={styles.modalCardLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {showPolicyModal === 'privacy' && 'Privacy Policy'}
                {showPolicyModal === 'terms' && 'Terms of Service'}
                {showPolicyModal === 'about' && 'About Aegis Hub'}
                {showPolicyModal === 'contact' && 'Contact & Support'}
              </h3>
              <button onClick={() => setShowPolicyModal(null)} className={styles.closeModalBtn}>✕</button>
            </div>

            <div className={styles.modalContentBody}>
              {showPolicyModal === 'privacy' && (
                <div>
                  <p><strong>Effective Date:</strong> January 2026</p>
                  <p>Aegis Hub (&quot;we&quot;, &quot;us&quot;) operates GlyphCraft Studio as a free, client-side browser utility. We value your privacy and do not sell, rent, or collect personal data.</p>
                  <h4>1. Data Collection & Local Storage</h4>
                  <p>Your starred symbols, recent clipboard history, and custom settings are stored exclusively in your browser&apos;s local storage. This data never leaves your device.</p>
                  <h4>2. Third-Party Advertisements</h4>
                  <p>We partner with Google AdSense to serve ads. Google may use cookies to serve personalized or non-personalized ads based on your visit to this and other websites on the Internet.</p>
                  <h4>3. Contact Us</h4>
                  <p>For privacy inquiries, reach out to contact@aegishub.dev.</p>
                </div>
              )}

              {showPolicyModal === 'terms' && (
                <div>
                  <p><strong>Effective Date:</strong> January 2026</p>
                  <h4>1. Acceptance of Terms</h4>
                  <p>By accessing Aegis Hub and GlyphCraft Studio, you agree to use the service for lawful personal and commercial purposes in accordance with these Terms.</p>
                  <h4>2. Intellectual Property</h4>
                  <p>All Unicode characters and glyphs are part of the universal Unicode standard. The application interface, layout, and brand assets are copyright Aegis Software Productions.</p>
                  <h4>3. Disclaimer of Warranty</h4>
                  <p>GlyphCraft Studio is provided &quot;as is&quot; without warranties of any kind. We are not liable for any character rendering differences across legacy operating systems.</p>
                </div>
              )}

              {showPolicyModal === 'about' && (
                <div>
                  <h4>About Aegis Hub & GlyphCraft Studio</h4>
                  <p>Aegis Hub is an independent software studio committed to creating high-performance, dark-mode developer tools, aesthetic typography suites, and digital utilities.</p>
                  <p>GlyphCraft Studio was built to solve the frustration of low-quality symbol sites by providing an ultra-responsive, zero-clutter forge with real-time transforms, ASCII banners, and social profile previews.</p>
                </div>
              )}

              {showPolicyModal === 'contact' && (
                <div>
                  <h4>Contact Aegis Hub Team</h4>
                  <p>We welcome feature requests, symbol submissions, and feedback!</p>
                  <p><strong>Email:</strong> support@aegishub.dev</p>
                  <p><strong>Website:</strong> https://aegishub.dev</p>
                  <p><strong>GitHub:</strong> https://github.com/Brisk3r/aegis-wealth-builder</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
