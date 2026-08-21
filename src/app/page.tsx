import type { Metadata } from 'next';
import SymbolStudio from '@/components/symbols/SymbolStudio';

export const metadata: Metadata = {
  title: 'GlyphCraft Studio | Aegis Hub -- 2,000+ Cool Symbols, Kaomoji & Unicode Font Forge',
  description: 'The ultimate 1-click clipboard forge for over 2,000+ aesthetic symbols, Lenny face kaomoji, 22+ Unicode font styles, Big ASCII banners, and social media bio templates.',
  keywords: [
    'cool symbols',
    'kaomoji copy paste',
    'lenny face',
    'aesthetic symbols',
    'unicode font generator',
    'discord symbols',
    'instagram bio symbols',
    'ascii art generator',
    'big text banner',
    'sparkle symbols',
    'coquette ribbon unicode',
    'math symbols copy',
    'aegis hub'
  ],
  openGraph: {
    title: 'GlyphCraft Studio | Cool Symbols, Kaomoji & Unicode Font Forge',
    description: 'Instant 1-click copy & paste forge with 2,000+ aesthetic glyphs, Lenny combos, 22+ Unicode fonts, and social bio builders.',
    url: 'https://aegishub.dev',
    siteName: 'Aegis Hub GlyphCraft Studio',
    type: 'website'
  }
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'GlyphCraft Studio',
        'url': 'https://aegishub.dev',
        'description': 'Online suite for discovering, filtering, and copying aesthetic unicode symbols, kaomoji emoticons, and stylized typography.',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I copy symbols and kaomoji to my clipboard?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Click any symbol or kaomoji card on the platform. It immediately copies to your clipboard and appends to your live Collector Tray.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Are these Unicode symbols supported on Discord, Instagram, and TikTok?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! All glyphs and fonts in GlyphCraft Studio use universal Unicode characters supported across iOS, Android, macOS, Windows, Linux, Instagram, Discord, and TikTok.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is GlyphCraft Studio completely free?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, GlyphCraft Studio is 100% free with zero downloads, logins, or hidden paywalls required.'
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <SymbolStudio />
      </main>
    </>
  );
}
