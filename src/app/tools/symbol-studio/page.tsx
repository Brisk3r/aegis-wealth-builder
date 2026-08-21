import { Metadata } from 'next';
import SymbolStudio from '@/components/symbols/SymbolStudio';

export const metadata: Metadata = {
  title: 'GlyphCraft Studio | Cool Symbols, Kaomoji & Unicode Font Forge',
  description: 'Copy and paste over 1,500+ cool symbols, aesthetic sparkles, kaomoji combinations, Lenny faces, fancy Unicode fonts, and bio templates.',
  keywords: ['cool symbols', 'copy paste symbols', 'kaomoji', 'font generator', 'GlyphCraft Studio']
};

export default function ToolSymbolStudioPage() {
  return <SymbolStudio />;
}
