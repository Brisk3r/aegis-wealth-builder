'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Calendar, Filter, TrendingDown } from 'lucide-react';
import { PriceHistory } from '@/types/gameHub';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './PriceHistoryChart.module.css';

interface PriceHistoryChartProps {
  histories: (PriceHistory & { storeName: string; storeId: string })[];
  allTimeLow?: number;
  historicalAverage?: number;
}

const STORE_COLORS: Record<string, string> = {
  Steam: '#00f0ff',
  'Nintendo eShop': '#ef4444',
  'PlayStation Store': '#3b82f6',
  'Xbox Store': '#10b981',
  'GOG.com': '#a855f7',
  Amazon: '#f97316',
  'Best Buy': '#f59e0b',
};

export default function PriceHistoryChart({ histories, allTimeLow, historicalAverage }: PriceHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180' | '365' | 'ALL'>('90');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const { formatPrice, convertPrice, currency } = useCurrency();

  // Unique store names from dataset
  const availableStores = useMemo(() => {
    const storeSet = new Set<string>();
    histories.forEach(h => storeSet.add(h.storeName));
    return Array.from(storeSet);
  }, [histories]);

  // Filter histories based on selected time range and store filters, converting to localized values
  const chartData = useMemo(() => {
    if (histories.length === 0) return [];

    let filtered = [...histories];

    if (timeRange !== 'ALL') {
      const days = parseInt(timeRange, 10);
      const cutoff = new Date('2026-08-05T12:00:00Z');
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(h => new Date(h.recordedAt) >= cutoff);
    }

    if (selectedStores.length > 0) {
      filtered = filtered.filter(h => selectedStores.includes(h.storeName));
    }

    // Group logs by formatted date
    const dateMap = new Map<string, Record<string, any>>();

    filtered.forEach(item => {
      const dateStr = new Date(item.recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, timestamp: new Date(item.recordedAt).getTime() });
      }

      const point = dateMap.get(dateStr)!;
      point[item.storeName] = convertPrice(item.price);
    });

    return Array.from(dateMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [histories, timeRange, selectedStores, currency.code]);

  const toggleStore = (storeName: string) => {
    if (selectedStores.includes(storeName)) {
      setSelectedStores(selectedStores.filter(s => s !== storeName));
    } else {
      setSelectedStores([...selectedStores, storeName]);
    }
  };

  return (
    <div className={`${styles.chartContainer} glass`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.chartTitle}>[UP] Historical Price Analytics</h3>
          <p className={styles.chartSubtitle}>Track price drops and historical lows across digital & physical storefronts ({currency.code})</p>
        </div>

        {/* Analytics Badges */}
        <div className={styles.analyticsStats}>
          {typeof allTimeLow === 'number' && allTimeLow > 0 && (
            <div className={styles.statBadge}>
              <span className={styles.statLabel}>All-Time Low</span>
              <span className={styles.statVal} style={{ color: 'var(--accent-green)' }}>
                {formatPrice(allTimeLow)}
              </span>
            </div>
          )}

          {typeof historicalAverage === 'number' && historicalAverage > 0 && (
            <div className={styles.statBadge}>
              <span className={styles.statLabel}>90d Avg Price</span>
              <span className={styles.statVal} style={{ color: 'var(--accent-cyan)' }}>
                {formatPrice(historicalAverage)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        {/* Time Range Selector */}
        <div className={styles.timeRangeGroup}>
          <Calendar size={14} className={styles.icon} />
          {(['30', '90', '180', '365', 'ALL'] as const).map(range => (
            <button
              key={range}
              className={`${styles.rangeBtn} ${timeRange === range ? styles.activeRange : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range === 'ALL' ? 'All Time' : `${range}d`}
            </button>
          ))}
        </div>

        {/* Store Filters */}
        <div className={styles.storeFilterGroup}>
          <Filter size={14} className={styles.icon} />
          {availableStores.map(store => (
            <button
              key={store}
              className={`${styles.storePill} ${
                selectedStores.length === 0 || selectedStores.includes(store) ? styles.activePill : ''
              }`}
              onClick={() => toggleStore(store)}
              style={{
                borderColor: STORE_COLORS[store] || 'var(--accent-cyan)',
              }}
            >
              <span
                className={styles.colorDot}
                style={{ backgroundColor: STORE_COLORS[store] || 'var(--accent-cyan)' }}
              />
              {store}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Component */}
      <div className={styles.chartWrapper}>
        {chartData.length === 0 ? (
          <div className={styles.emptyState}>
            <TrendingDown size={32} />
            <p>No historical price logs available for the selected filters.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tickFormatter={val => `${currency.symbol}${val}`} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 21, 39, 0.95)',
                  borderColor: 'rgba(0, 240, 255, 0.3)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  fontFamily: 'var(--font-outfit)',
                }}
                formatter={(value: any) => [`${currency.symbol}${Number(value).toFixed(2)}`, 'Price']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {availableStores.map(store => {
                if (selectedStores.length > 0 && !selectedStores.includes(store)) return null;
                return (
                  <Line
                    key={store}
                    type="monotone"
                    dataKey={store}
                    name={store}
                    stroke={STORE_COLORS[store] || '#00f0ff'}
                    strokeWidth={3}
                    dot={{ r: 4, fill: STORE_COLORS[store] || '#00f0ff' }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
