"use client";

import { useEffect, useState } from "react";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./affiliate.module.css";
import { AEGIS_AFFILIATE_PARTNERS } from "@/lib/affiliate";

export default function AffiliatePage() {
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const res = await fetch("/api/aegis/affiliate");
        const data = await res.json();
        setTelemetry(data);
      } catch (e) {}
    }
    loadTelemetry();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header Title */}
      <section className={`${styles.pageHeader} glass`}>
        <div className={styles.headerTitleCol}>
          <span className="badge badge-green">[$] AEGIS MONETIZATION DASHBOARD</span>
          <h1 className={styles.title}>Publisher Earnings & Referral Engine</h1>
          <p className={styles.subtitle}>
            Direct merchant affiliate tracking, non-intrusive AdSense slots, and referral revenue telemetry.
          </p>
        </div>
      </section>

      {/* Revenue Telemetry Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <span className={styles.statIcon}>**</span>
          <div className={styles.statCol}>
            <span className={styles.statNum}>100% Retained</span>
            <span className={styles.statLabel}>Affiliate Revenue Share</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <span className={styles.statIcon}>[TARGET]</span>
          <div className={styles.statCol}>
            <span className={styles.statNum}>9 Active Networks</span>
            <span className={styles.statLabel}>Direct Store Partners</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <span className={styles.statIcon}>**</span>
          <div className={styles.statCol}>
            <span className={styles.statNum}>3 Ad Slots</span>
            <span className={styles.statLabel}>Header, Sidebar, Footer</span>
          </div>
        </div>
      </div>

      <div className="content-with-sidebar">
        <div className={styles.mainContent}>
          {/* Active Affiliate Partners Table */}
          <section className={`${styles.section} glass`}>
            <h2 className={styles.sectionTitle}>*** Configured Merchant Affiliate Tags</h2>
            <p className={styles.sectionSubtitle}>All direct store links on Aegis Hub automatically append these commission tags:</p>

            <div className={styles.partnersTable}>
              <div className={styles.tableHeader}>
                <span>Merchant Store</span>
                <span>Affiliate Parameter</span>
                <span>Tag Value</span>
                <span>Est. Commission</span>
              </div>
              {Object.values(AEGIS_AFFILIATE_PARTNERS).map((partner) => (
                <div key={partner.storeId} className={styles.tableRow}>
                  <span className={styles.storeName}>{partner.storeName}</span>
                  <span className={styles.codeTag}>?{partner.tagParam}=</span>
                  <span className={styles.cyanVal}>{partner.tagValue}</span>
                  <span className={styles.greenRate}>{partner.defaultCommissionRate}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            {/* Mandatory Architectural Sticky Sidebar Ad */}
            <AdSlot type="sidebar" />

            <div className={`${styles.widget} glass`}>
              <h3 className={styles.widgetTitle}>[UP] Platform Monetization Rules</h3>
              <p className={styles.widgetDesc}>
                1. Every outgoing deal link uses first-party affiliate tagging.<br />
                2. Architectural ad units preserve layout height without cumulative layout shift (CLS).<br />
                3. Zero middleman redirect fees.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
