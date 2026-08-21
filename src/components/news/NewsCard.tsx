"use client";

import Image from "next/image";
import styles from "./NewsCard.module.css";
import { NewsArticle } from "@/utils/news";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <div className={`${styles.card} glass`}>
      {article.imageUrl && (
        <div className={styles.imageWrapper}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            unoptimized
            className={styles.thumbImage}
          />
          {article.isHot && (
            <div className={styles.hotBadge}>
              [HOT] HOT COVERAGE
            </div>
          )}
          <div className={styles.sourceTag}>
            {article.sourceBadge}
          </div>
        </div>
      )}

      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span className={styles.categoryBadge}>{article.category}</span>
          <span className={styles.readTime}>[TIME] {article.readTime}</span>
        </div>

        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.summary}>{article.summary}</p>

        <div className={styles.cardFooter}>
          <span className={styles.sourceText}>{article.source}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.readBtn}
          >
            Read Article *
          </a>
        </div>
      </div>
    </div>
  );
}
