'use client';

import { ExternalLink, Tag, CheckCircle2, XCircle, Info, Globe } from 'lucide-react';
import { StoreListing } from '@/types/gameHub';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './PriceComparisonTable.module.css';

interface PriceComparisonTableProps {
  storeListings: StoreListing[];
  lowestPrice: number;
}

export default function PriceComparisonTable({ storeListings, lowestPrice }: PriceComparisonTableProps) {
  const { formatPrice, currency, location } = useCurrency();

  if (!storeListings || storeListings.length === 0) {
    return (
      <div className={`${styles.tableWrapper} glass`}>
        <p className={styles.emptyMsg}>No active store listings found for this title.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.tableWrapper} glass`}>
      <div className={styles.tableHeader}>
        <div>
          <h3 className={styles.tableTitle}>** Store Price Comparison</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Converted to active currency: <strong>{currency.code} ({currency.symbol})</strong>
          </p>
        </div>
        <span className="badge badge-cyan">{storeListings.length} Retailers Tracked</span>
      </div>

      {/* Regional Price Notice Callout */}
      <div
        style={{
          background: 'rgba(0, 240, 255, 0.06)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <Info size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
        <span>
          <strong>Why storefront prices vary:</strong> Official digital stores (Steam, Nintendo eShop, PlayStation Store, Xbox) apply localized regional pricing and regional taxes at checkout based on your IP region ({location?.countryName || 'Global'}) and account store currency settings.
        </span>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Storefront</th>
              <th>Format</th>
              <th>Status</th>
              <th>Original Price</th>
              <th>Discount</th>
              <th>Current Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {storeListings.map(listing => {
              const isLowest = listing.currentPrice === lowestPrice && lowestPrice > 0;
              const storeName = listing.store?.name || 'Store';
              const storeType = listing.store?.storeType || 'DIGITAL';

              return (
                <tr key={listing.id} className={isLowest ? styles.lowestRow : ''}>
                  <td className={styles.storeCol}>
                    <span className={styles.storeName}>{storeName}</span>
                    {isLowest && (
                      <span className={styles.lowestBadge}>
                        <Tag size={10} /> Best Deal
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={storeType === 'DIGITAL' ? 'badge badge-purple' : 'badge badge-orange'}>
                      {storeType}
                    </span>
                  </td>

                  <td>
                    {listing.isAvailable ? (
                      <span className={styles.available}>
                        <CheckCircle2 size={14} /> In Stock
                      </span>
                    ) : (
                      <span className={styles.unavailable}>
                        <XCircle size={14} /> Out of Stock
                      </span>
                    )}
                  </td>

                  <td className={styles.origPrice}>{formatPrice(listing.originalPrice)}</td>

                  <td>
                    {listing.discountPercent > 0 ? (
                      <span className={styles.discountTag}>-{Math.round(listing.discountPercent)}%</span>
                    ) : (
                      <span className={styles.noDiscount}>0%</span>
                    )}
                  </td>

                  <td className={styles.priceCell}>
                    <span className={`${styles.currentPrice} ${isLowest ? styles.lowestPriceText : ''}`}>
                      {formatPrice(listing.currentPrice)}
                    </span>
                  </td>

                  <td>
                    <a
                      href={listing.storeItemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isLowest ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      Buy Deal <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
