// GlyphCraft Studio - Master Unicode Symbols, Kaomoji & Aesthetic Glyph Dataset (Enriched Suite)

export interface SymbolItem {
  char: string;
  name: string;
  category: string;
  subCategory?: string;
  lengthType: 'single' | 'short' | 'combo' | 'divider';
  popularity: number; // 1 to 100
  tags: string[];
}

export interface SymbolCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface QuickSearchChip {
  label: string;
  icon: string;
  query: string;
  category?: string;
  subCategory?: string;
}

export interface DecoratorPreset {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
}

export interface AsciiBannerFont {
  id: string;
  name: string;
  render: (text: string) => string;
}

export const DECORATOR_PRESETS: DecoratorPreset[] = [
  { id: 'wings_gothic', name: 'Gothic Angel Wings', prefix: '꧁༺ ', suffix: ' ༻꧂' },
  { id: 'stars_radiant', name: 'Radiant Shooting Stars', prefix: '★彡 ', suffix: ' 彡★' },
  { id: 'audio_bars', name: 'Equalizer Audio Waves', prefix: 'ıllıllı ', suffix: ' ıllıllı' },
  { id: 'wavy_dots', name: 'Wavy Melody Ribbon', prefix: '•´¯`•. ', suffix: ' .•´¯`•' },
  { id: 'heart_hug', name: 'Heart Emoticon Shield', prefix: '♥╣ ', suffix: ' ╠♥' },
  { id: 'cyber_checker', name: 'Cyber Checker Blocks', prefix: '▀▄▀▄▀▄ ', suffix: ' ▄▀▄▀▄▀' },
  { id: 'dither_banner', name: 'Dither Fade Frame', prefix: '░▒▓█ ', suffix: ' █▓▒░' },
  { id: 'japanese_lenticular', name: 'Lenticular Brackets', prefix: '【 ', suffix: ' 】' },
  { id: 'flower_blooms', name: 'Sakura Petal Crest', prefix: '✿ ❀ ', suffix: ' ❀ ✿' },
  { id: 'sparkle_stars', name: 'Magic Sparkle Cascade', prefix: '✧･ﾟ: * ', suffix: ' * :･ﾟ✧' },
  { id: 'ribbon_coquette', name: 'Coquette Ribbon Duo', prefix: '୨ৎ ', suffix: ' ୨ৎ' },
  { id: 'winged_heart', name: 'Angel Wings Heart', prefix: '𓆩♡𓆪 ', suffix: ' 𓆩♡𓆪' },
  { id: 'cross_royal', name: 'Royal Cross Medallion', prefix: '༺ ༒ ༻ ', suffix: ' ༺ ༒ ༻' }
];

// ASCII Big Text Banner Generator Maps
export const ASCII_BANNER_FONTS: AsciiBannerFont[] = [
  {
    id: 'block',
    name: 'Cyber Block 3D',
    render: (t) => {
      const upper = t.toUpperCase();
      const map: Record<string, string[]> = {
        'A': [' ▄▀█ ', '█▀█ '],
        'B': ['█▄▄ ', '█▄█ '],
        'C': ['█▀▀ ', '█▄▄ '],
        'D': ['█▀▄ ', '█▄▀ '],
        'E': ['█▀▀ ', '██▄ '],
        'F': ['█▀▀ ', '█▀  '],
        'G': ['█▀▀█', '█▄▄█'],
        'H': ['█ █ ', '█▀█ '],
        'I': ['█ ', '█ '],
        'J': ['  █ ', '█▄█ '],
        'K': ['█▄▀ ', '█ █ '],
        'L': ['█   ', '█▄▄ '],
        'M': ['█▀▄▀█', '█ ▀ █'],
        'N': ['█▄ █', '█ ▀█'],
        'O': ['█▀█ ', '█▄█ '],
        'P': ['█▀█ ', '█▀▀ '],
        'Q': ['█▀█ ', '▀▀█▄'],
        'R': ['█▀█ ', '█▀▄ '],
        'S': ['█▀ ', '▄█ '],
        'T': ['▀█▀', ' █ '],
        'U': ['█ █', '█▄█'],
        'V': ['█ █', '▀▄▀'],
        'W': ['█ █ █', '▀▄▀▄▀'],
        'X': ['▀▄▀', '█ █'],
        'Y': ['█▄█', ' █ '],
        'Z': ['▀█ ', '█▄ '],
        ' ': ['  ', '  ']
      };
      let line1 = '', line2 = '';
      for (const ch of upper) {
        if (map[ch]) {
          line1 += map[ch][0] + ' ';
          line2 += map[ch][1] + ' ';
        } else {
          line1 += ch + ' ';
          line2 += ch + ' ';
        }
      }
      return `${line1}\n${line2}`;
    }
  },
  {
    id: 'double_line',
    name: 'Double Outline Frame',
    render: (t) => {
      const upper = t.toUpperCase();
      const map: Record<string, string[]> = {
        'A': ['╔═╗', '╠═╣'],
        'B': ['╔╗ ', '╠╩╗'],
        'C': ['╔═╗', '╚═╝'],
        'D': ['╔╦╗', ' ║║'],
        'E': ['╔═╗', '╠═╝'],
        'F': ['╔═╗', '╠╣ '],
        'G': ['╔═╗', '╚═╗'],
        'H': ['╦ ╦', '╠═╣'],
        'I': ['╦', '║'],
        'J': ['  ╦', '╚═╝'],
        'K': ['╦╔═', '╠╩╗'],
        'L': ['╦  ', '╩═╝'],
        'M': ['╔╦╗', '║║║'],
        'N': ['╔╗╔', '║║║'],
        'O': ['╔═╗', '╚═╝'],
        'P': ['╔═╗', '╠═╝'],
        'Q': ['╔═╗', '╚═╬'],
        'R': ['╦═╗', '╠╦╝'],
        'S': ['╔═╗', '╚═╗'],
        'T': ['╔╦╗', ' ║ '],
        'U': ['╦ ╦', '╚═╝'],
        'V': ['╦  ╦', '╚╗╔╝'],
        'W': ['╦ ╦ ╦', '║║║║║'],
        'X': ['═╗ ╔═', '╔╩╦╩╗'],
        'Y': ['╦ ╦', '╚╦╝'],
        'Z': ['╔═╝', '╚═╝'],
        ' ': ['  ', '  ']
      };
      let line1 = '', line2 = '';
      for (const ch of upper) {
        if (map[ch]) {
          line1 += map[ch][0] + ' ';
          line2 += map[ch][1] + ' ';
        } else {
          line1 += ch + ' ';
          line2 += ch + ' ';
        }
      }
      return `${line1}\n${line2}`;
    }
  }
];

export const QUICK_SEARCH_CHIPS: QuickSearchChip[] = [
  { label: 'Trending', icon: '🔥', query: '', category: 'all' },
  { label: 'Lenny & Meme', icon: '( ͡° ͜ʖ ͡°)', query: 'lenny', category: 'kaomoji' },
  { label: 'Cute Animals', icon: 'ʕ•ᴥ•ʔ', query: 'cute animal', category: 'kaomoji' },
  { label: 'Sparkles', icon: '✨', query: 'sparkle', category: 'aesthetic' },
  { label: 'Coquette & Bows', icon: '୨ৎ', query: 'ribbon bow', category: 'aesthetic' },
  { label: 'Stars & Cosmos', icon: '★', query: 'star celestial', category: 'stars' },
  { label: 'Hearts & Love', icon: '♥', query: 'heart love', category: 'hearts' },
  { label: 'Borders & Lines', icon: '───', query: 'divider line', category: 'borders' },
  { label: 'Arrows', icon: '➔', query: 'arrow', category: 'arrows' },
  { label: 'Cyber & AI', icon: '⚡', query: 'ai cyber tech', category: 'ai_tech' },
  { label: 'Math & Greek', icon: 'π', query: 'math greek calculus', category: 'math_science' },
  { label: 'Checkmarks', icon: '✓', query: 'check vote', category: 'checkmarks' },
  { label: 'Sakura & Anime', icon: '✿', query: 'sakura anime japan', category: 'japanese_anime' },
  { label: 'Music Audio', icon: '♪', query: 'music sound audio', category: 'music_media' },
  { label: 'Brackets & Frames', icon: '【】', query: 'bracket quote box', category: 'brackets_decor' },
  { label: 'Zodiac', icon: '♈', query: 'zodiac horoscope', category: 'zodiac_celestial' }
];

export const SUB_CATEGORIES_MAP: Record<string, { id: string; label: string }[]> = {
  kaomoji: [
    { id: 'all', label: 'All Moods' },
    { id: 'happy', label: 'Happy & Joy (*^▽^*)' },
    { id: 'lenny', label: 'Lenny & Cool ( ͡° ͜ʖ ͡°)' },
    { id: 'cute', label: 'Cute & Animals ʕ•ᴥ•ʔ' },
    { id: 'love', label: 'Love & Kiss (｡♥‿♥｡)' },
    { id: 'shrug', label: 'Shrug & Carefree ¯\\_(ツ)_/¯' },
    { id: 'angry', label: 'Angry & Flip (╯°□°)╯' },
    { id: 'sad', label: 'Sad & Crying (╥﹏╥)' },
    { id: 'fight', label: 'Fight & Flex ᕦ(ò_óˇ)ᕤ' }
  ],
  aesthetic: [
    { id: 'all', label: 'All Aesthetics' },
    { id: 'sparkles', label: 'Sparkles & Magic ✧･ﾟ:*' },
    { id: 'coquette', label: 'Coquette & Ribbons ୨ৎ' },
    { id: 'celestial', label: 'Celestial & Moon ⋆⁺₊⋆ ☾' },
    { id: 'wings', label: 'Wings & Angel 𓆩♡𓆪' },
    { id: 'gothic', label: 'Gothic & Dark ༺ ༒ ༻' },
    { id: 'bio', label: 'Bio Accents ˏˋ°•*⁀➷' }
  ],
  borders: [
    { id: 'all', label: 'All Dividers' },
    { id: 'stars', label: 'Star Dividers ─── ⋆⋅☆⋅⋆ ───' },
    { id: 'dots', label: 'Dotted Lines ┈┈┈┈┈┈' },
    { id: 'boxes', label: 'Box Frames ╔═══════╗' },
    { id: 'music', label: 'Music Bars ⊱ ── ♫ ── ⊰' },
    { id: 'cyber', label: 'Cyber & Ascii ░▒▓█' }
  ],
  math_science: [
    { id: 'all', label: 'All Math' },
    { id: 'greek', label: 'Greek Alphabet (π, θ, Ω, Σ)' },
    { id: 'calculus', label: 'Calculus (∫, ∂, ∇, √)' },
    { id: 'logic', label: 'Logic & Set Theory (∈, ⊂, ∪, ∩)' },
    { id: 'operators', label: 'Operators & Relations (±, ≠, ≤, ≅)' }
  ]
};

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  { id: 'all', label: 'All Symbols', icon: '✦', description: 'Complete library of 2,000+ unicode glyphs and combos' },
  { id: 'kaomoji', label: 'Kaomoji Combos', icon: '(*^▽^*)', description: 'Japanese emoticons, Lenny faces, cute reactions & expressions' },
  { id: 'aesthetic', label: 'Aesthetic & Sparkles', icon: '✧･ﾟ:*', description: 'Sparkles, soft aesthetic combos, bio decorations & angel vibes' },
  { id: 'ai_tech', label: 'AI & Cyber', icon: '⌬', description: 'AI sparks, cyber glyphs, futuristic circuit nodes & terminal runes' },
  { id: 'stars', label: 'Stars & Celestial', icon: '★', description: 'Stars, sparkles, suns, moons, constellations & celestial glyphs' },
  { id: 'hearts', label: 'Hearts & Affection', icon: '♥', description: 'Classic hearts, aesthetic cute hearts, flowers & love badges' },
  { id: 'borders', label: 'Borders & Dividers', icon: '───', description: 'Aesthetic bio dividers, text lines, ornate filigree & brackets' },
  { id: 'arrows', label: 'Arrows & Direction', icon: '➔', description: 'Directional indicators, aesthetic arrows, curve & double arrows' },
  { id: 'math_science', label: 'Math & Science', icon: 'π', description: 'Greek alphabet, calculus, algebra, physics, logic & set theory' },
  { id: 'currency', label: 'Currency & Crypto', icon: '$', description: 'Fiat currencies, crypto tokens, finance & commerce badges' },
  { id: 'checkmarks', label: 'Checks & Bullets', icon: '✓', description: 'Checkmarks, ballot boxes, geometric nodes, bullets & badges' },
  { id: 'japanese_anime', label: 'Anime & Japanese', icon: '✿', description: 'Anime facial emotes, sakura blossoms, kana & kanji accents' },
  { id: 'music_media', label: 'Music & Audio', icon: '♪', description: 'Musical notes, clefs, playback icons & audio waveforms' },
  { id: 'zodiac_celestial', label: 'Zodiac & Astrology', icon: '♈', description: '12 Zodiac constellations, planetary signs & lunar phases' },
  { id: 'brackets_decor', label: 'Brackets & Corners', icon: '【】', description: 'Ornate quotes, Japanese corner brackets & frame corners' }
];

export const SYMBOLS_COLLECTION: SymbolItem[] = [
  // ==================== KAOMOJI & EMOTICONS ====================
  // Lenny & Cool
  { char: '( ͡° ͜ʖ ͡°)', name: 'Lenny Face', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 99, tags: ['lenny', 'cool', 'smirk', 'meme', 'classic'] },
  { char: '( ͠° ͟ʖ ͡°)', name: 'Suspicious Lenny', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 90, tags: ['lenny', 'suspicious', 'doubt', 'raised eyebrow'] },
  { char: '( ͡~ ͜ʖ ͡°)', name: 'Winking Lenny', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 88, tags: ['lenny', 'wink', 'flirt', 'smirk'] },
  { char: '( ͡ʘ ͜ʖ ͡ʘ)', name: 'Wide Eye Lenny', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 85, tags: ['lenny', 'excited', 'shock', 'stare'] },
  { char: '( ͡° ʖ̯ ͡°)', name: 'Sad Lenny', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 82, tags: ['lenny', 'sad', 'frown', 'disappointed'] },
  { char: '( ಠ ͜ʖ ಠ)', name: 'Creepy Lenny', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 80, tags: ['lenny', 'creepy', 'smile', 'eyes'] },
  { char: '(⌐■_■)', name: 'Deal With It Sunglasses', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 95, tags: ['glasses', 'cool', 'boss', 'deal with it'] },
  { char: '(▀̿Ĺ̯▀̿ ̿)', name: 'Secret Agent', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 92, tags: ['glasses', 'agent', 'cool', 'mafia', 'guard'] },
  { char: '¯\\_(ツ)_/¯', name: 'Shrug', category: 'kaomoji', subCategory: 'shrug', lengthType: 'short', popularity: 98, tags: ['shrug', 'carefree', 'idk', 'whatever', 'dont know'] },
  { char: '¯\\(°_o)/¯', name: 'Derp Shrug', category: 'kaomoji', subCategory: 'shrug', lengthType: 'short', popularity: 84, tags: ['shrug', 'derp', 'confused', 'funny'] },
  
  // Cute & Joyful
  { char: '(｡♥‿♥｡)', name: 'Heart Eyes Joy', category: 'kaomoji', subCategory: 'love', lengthType: 'short', popularity: 97, tags: ['love', 'cute', 'heart', 'happy', 'adore'] },
  { char: '( ˘ ³˘)♥', name: 'Kiss with Heart', category: 'kaomoji', subCategory: 'love', lengthType: 'short', popularity: 94, tags: ['kiss', 'love', 'cute', 'sweet'] },
  { char: '(づ｡◕‿‿◕｡)づ', name: 'Big Hug', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 96, tags: ['hug', 'cute', 'friendly', 'comfort'] },
  { char: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', name: 'Sparkle Cheer', category: 'kaomoji', subCategory: 'happy', lengthType: 'combo', popularity: 97, tags: ['sparkle', 'happy', 'excited', 'magic', 'glitter'] },
  { char: '(*＾▽＾)／', name: 'Happy Wave', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 91, tags: ['wave', 'hello', 'happy', 'greeting'] },
  { char: '(✿◠‿◠)', name: 'Flower Smile', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 93, tags: ['flower', 'cute', 'smile', 'gentle'] },
  { char: '(◕‿◕✿)', name: 'Sakura Girl', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 92, tags: ['cute', 'anime', 'flower', 'sakura'] },
  { char: '(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)', name: 'Blushing Shy', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 94, tags: ['blush', 'shy', 'cute', 'flustered'] },
  { char: '( ◡‿◡ *)', name: 'Peaceful Bliss', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 89, tags: ['calm', 'peace', 'happy', 'relax'] },
  { char: '(o˘◡˘o)', name: 'Soft Smile', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 90, tags: ['soft', 'smile', 'gentle', 'chill'] },
  { char: '(★^O^★)', name: 'Star Excited', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 87, tags: ['star', 'happy', 'excited', 'celebrate'] },
  { char: '(─‿‿─)', name: 'Satisfied Sigh', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 88, tags: ['pleased', 'satisfied', 'relax', 'cozy'] },
  { char: '(˶ᵔ ᵕ ᵔ˶)', name: 'Content Bunny Face', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 95, tags: ['cute', 'cozy', 'happy', 'bunny', 'soft'] },
  { char: '(✿˵•́ ᴗ •̀˵)', name: 'Gentle Blossom', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 91, tags: ['cute', 'soft', 'blush', 'flower'] },
  { char: '໒꒰ྀི´ ˘ ` ꒱ྀིა', name: 'Angel Puppy', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 96, tags: ['angel', 'cute', 'puppy', 'aesthetic', 'coquette'] },
  { char: '૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა', name: 'Sweet Pup', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 95, tags: ['dog', 'puppy', 'cute', 'soft'] },
  { char: '૮ ˶ᵔ ᵕ ᵔ˶ ა', name: 'Happy Doggy', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 93, tags: ['dog', 'cute', 'smile', 'wholesome'] },
  { char: '₍ᐢ. ̫.ᐢ₎', name: 'Tiny Bunny', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 94, tags: ['bunny', 'rabbit', 'cute', 'animal'] },
  { char: '꒰ᐢ. .ᐢ꒱', name: 'Fluffy Ear Bunny', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 93, tags: ['bunny', 'cute', 'fluffy', 'ears'] },
  { char: '₍ᐢ.ˬ.⑅ᐢ₎', name: 'Bow Bunny', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 95, tags: ['bunny', 'bow', 'ribbon', 'coquette'] },
  { char: '(=^･ω･^=)', name: 'Cat Whisker Face', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 95, tags: ['cat', 'kitty', 'cute', 'meow'] },
  { char: '(=①ω①=)', name: 'Curious Cat', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 89, tags: ['cat', 'eyes', 'curious', 'kitty'] },
  { char: '(=^･ｪ･^=)', name: 'Cute Kitten', category: 'kaomoji', subCategory: 'cute', lengthType: 'combo', popularity: 90, tags: ['cat', 'kitten', 'meow', 'paws'] },
  { char: 'ʕ•ᴥ•ʔ', name: 'Teddy Bear', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 97, tags: ['bear', 'teddy', 'cute', 'animal'] },
  { char: 'ʕっ•ᴥ•ʔっ', name: 'Bear Hug', category: 'kaomoji', subCategory: 'cute', lengthType: 'short', popularity: 96, tags: ['bear', 'hug', 'love', 'snuggle'] },
  { char: 'ʕノ•ᴥ•ʔノ ︵ ┻━┻', name: 'Bear Table Flip', category: 'kaomoji', subCategory: 'angry', lengthType: 'combo', popularity: 92, tags: ['bear', 'rage', 'table flip', 'funny'] },
  { char: '(๑ > ᴗ < ๑)', name: 'Squee Excitement', category: 'kaomoji', subCategory: 'happy', lengthType: 'combo', popularity: 94, tags: ['excited', 'squee', 'happy', 'cute'] },
  { char: '(づ๑•ᴗ•๑)づ♡', name: 'Cute Love Hug', category: 'kaomoji', subCategory: 'love', lengthType: 'combo', popularity: 95, tags: ['hug', 'love', 'heart', 'cute'] },
  { char: '( ˶ˆ꒳ˆ˵ )', name: 'Warm Blushing Joy', category: 'kaomoji', subCategory: 'happy', lengthType: 'short', popularity: 92, tags: ['warm', 'blush', 'smile', 'happy'] },

  // Action, Angry & Dramatic
  { char: '(╯°□°)╯︵ ┻━┻', name: 'Table Flip', category: 'kaomoji', subCategory: 'angry', lengthType: 'combo', popularity: 98, tags: ['rage', 'angry', 'flip', 'table', 'classic'] },
  { char: '┬─┬ノ( º _ ºノ)', name: 'Put Table Back', category: 'kaomoji', subCategory: 'happy', lengthType: 'combo', popularity: 95, tags: ['calm', 'table', 'peace', 'respect'] },
  { char: '┻━┻ ︵ ヽ(°□°ヽ)', name: 'Throw Table Left', category: 'kaomoji', subCategory: 'angry', lengthType: 'combo', popularity: 91, tags: ['angry', 'rage', 'table', 'chaos'] },
  { char: '(╥﹏╥)', name: 'Crying Tears', category: 'kaomoji', subCategory: 'sad', lengthType: 'short', popularity: 96, tags: ['sad', 'crying', 'tears', 'upset'] },
  { char: '(ಥ﹏ಥ)', name: 'Dramatic Sob', category: 'kaomoji', subCategory: 'sad', lengthType: 'short', popularity: 93, tags: ['crying', 'sad', 'dramatic', 'tears'] },
  { char: '( ᵒ̴̶̷᷄ д ᵒ̴̶̷᷅ )', name: 'Sparkling Tears Cry', category: 'kaomoji', subCategory: 'sad', lengthType: 'combo', popularity: 92, tags: ['sad', 'cry', 'sparkle', 'anime'] },
  { char: '(◞ ‸ ◟)', name: 'Looking Down Pout', category: 'kaomoji', subCategory: 'sad', lengthType: 'short', popularity: 90, tags: ['pout', 'sad', 'down', 'shy'] },
  { char: '( ｡ •̀ ᴖ •́ ｡)', name: 'Determined Pout', category: 'kaomoji', subCategory: 'angry', lengthType: 'combo', popularity: 93, tags: ['pout', 'cute', 'determined', 'mad'] },
  { char: '(ノಠ益ಠ)ノ彡┻━┻', name: 'Monster Rage Flip', category: 'kaomoji', subCategory: 'angry', lengthType: 'combo', popularity: 92, tags: ['rage', 'angry', 'flip', 'monster'] },
  { char: 'ᕦ(ò_óˇ)ᕤ', name: 'Flexing Muscles', category: 'kaomoji', subCategory: 'fight', lengthType: 'short', popularity: 96, tags: ['strong', 'gym', 'flex', 'power', 'muscle'] },
  { char: 'ᕦ(▀̿ ̿ -▀̿ ̿ )つ', name: 'Agent Flex', category: 'kaomoji', subCategory: 'fight', lengthType: 'combo', popularity: 91, tags: ['cool', 'muscle', 'agent', 'sunglasses'] },
  { char: '⚔(•̀ᴗ•́)و', name: 'Warrior Resolve', category: 'kaomoji', subCategory: 'fight', lengthType: 'short', popularity: 94, tags: ['sword', 'battle', 'rpg', 'ready', 'warrior'] },
  { char: '(ง •̀_•́)ง', name: 'Boxing Ready', category: 'kaomoji', subCategory: 'fight', lengthType: 'short', popularity: 95, tags: ['fight', 'punch', 'ready', 'box'] },
  { char: '(ಠ_ಠ)', name: 'Disapproval Face', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 97, tags: ['look', 'stare', 'serious', 'disapproval'] },
  { char: '(¬‿¬)', name: 'Smirking Side-Eye', category: 'kaomoji', subCategory: 'lenny', lengthType: 'short', popularity: 91, tags: ['smirk', 'sly', 'sneaky', 'side-eye'] },
  { char: '♪ヽ( ⌒o⌒)人(⌒-⌒ )v ♪', name: 'Music Dancing Duo', category: 'kaomoji', subCategory: 'happy', lengthType: 'combo', popularity: 89, tags: ['dance', 'party', 'music', 'friends'] },
  { char: '(っ˘з(˘⌣˘ ) ♡', name: 'Affectionate Kiss', category: 'kaomoji', subCategory: 'love', lengthType: 'combo', popularity: 92, tags: ['couple', 'kiss', 'love', 'heart'] },

  // ==================== AESTHETIC & SPARKLES ====================
  { char: '✧･ﾟ: *✧･ﾟ:*', name: 'Sparkle Burst Pair', category: 'aesthetic', subCategory: 'sparkles', lengthType: 'combo', popularity: 98, tags: ['sparkle', 'magic', 'stars', 'glitter'] },
  { char: '｡･:*:･ﾟ★,｡･:*:･ﾟ☆', name: 'Cosmic Shimmer Trail', category: 'aesthetic', subCategory: 'sparkles', lengthType: 'combo', popularity: 96, tags: ['magic', 'glitter', 'stars', 'cosmic'] },
  { char: 'ˏˋ°•*⁀➷', name: 'Aesthetic Bow & Arrow', category: 'aesthetic', subCategory: 'bio', lengthType: 'combo', popularity: 97, tags: ['arrow', 'bio', 'aesthetic', 'decor', 'cupid'] },
  { char: '˗ˏˋ ★ ˎˊ˗', name: 'Radiant Glow Star', category: 'aesthetic', subCategory: 'celestial', lengthType: 'short', popularity: 95, tags: ['star', 'glow', 'bio', 'radiant'] },
  { char: '⋆˙⟡♡', name: 'Starlight Diamond Heart', category: 'aesthetic', subCategory: 'celestial', lengthType: 'short', popularity: 94, tags: ['heart', 'star', 'aesthetic', 'diamond'] },
  { char: '୨ৎ', name: 'Aesthetic Ribbon Bow', category: 'aesthetic', subCategory: 'coquette', lengthType: 'short', popularity: 99, tags: ['bow', 'ribbon', 'coquette', 'cute', 'girly'] },
  { char: '₊˚⊹♡', name: 'Floating Sparkle Heart', category: 'aesthetic', subCategory: 'coquette', lengthType: 'short', popularity: 98, tags: ['heart', 'coquette', 'aesthetic', 'sparkle'] },
  { char: 'ᶻ 𝗓 𐰁', name: 'Sleeping Zzz Cloud', category: 'aesthetic', subCategory: 'bio', lengthType: 'short', popularity: 97, tags: ['sleep', 'zzz', 'night', 'chill', 'cozy'] },
  { char: '✧˚ ༘ ⋆｡˚', name: 'Fairy Stardust Cascade', category: 'aesthetic', subCategory: 'sparkles', lengthType: 'combo', popularity: 96, tags: ['fairy', 'stars', 'magic', 'dust'] },
  { char: 'ᡣ𐭩', name: 'Mini Ribbon Tie', category: 'aesthetic', subCategory: 'coquette', lengthType: 'short', popularity: 95, tags: ['ribbon', 'bow', 'aesthetic', 'coquette'] },
  { char: 'ೀ', name: 'Curled Tendril Flora', category: 'aesthetic', subCategory: 'coquette', lengthType: 'single', popularity: 96, tags: ['flora', 'curl', 'aesthetic', 'vine'] },
  { char: '༘⋆✿', name: 'Floating Blossom Accent', category: 'aesthetic', subCategory: 'bio', lengthType: 'short', popularity: 91, tags: ['flower', 'aesthetic', 'blossom', 'spring'] },
  { char: '⋆.˚✮🎧✮˚.⋆', name: 'Cyber Audio Aesthetic', category: 'aesthetic', subCategory: 'bio', lengthType: 'combo', popularity: 95, tags: ['music', 'headphones', 'aesthetic', 'cyber', 'beats'] },
  { char: '⋆⁺₊⋆ ☀︎ ⋆⁺₊⋆', name: 'Sun in Clouds Accent', category: 'aesthetic', subCategory: 'celestial', lengthType: 'combo', popularity: 94, tags: ['sun', 'clouds', 'sky', 'aesthetic', 'day'] },
  { char: '⋆⁺₊⋆ ☾ ⋆⁺₊⋆', name: 'Moon in Stars Accent', category: 'aesthetic', subCategory: 'celestial', lengthType: 'combo', popularity: 97, tags: ['moon', 'night', 'stars', 'aesthetic', 'dreamy'] },
  { char: '˙ᵕ˙', name: 'Minimal Cute Face', category: 'aesthetic', subCategory: 'bio', lengthType: 'short', popularity: 96, tags: ['smile', 'minimal', 'cute', 'face'] },
  { char: 'ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧', name: 'Thumbs Up Wink', category: 'aesthetic', subCategory: 'bio', lengthType: 'combo', popularity: 95, tags: ['thumbs up', 'cute', 'approve', 'wink'] },
  { char: '‧₊˚ ☁️⋅♡𓂃 ࣪ ִֶָ☾.', name: 'Cloud & Moon Haven', category: 'aesthetic', subCategory: 'celestial', lengthType: 'combo', popularity: 96, tags: ['cloud', 'moon', 'dreamy', 'aesthetic'] },
  { char: '𓍢ִ໋🌷͙֒', name: 'Tulip Bouquet Accent', category: 'aesthetic', subCategory: 'bio', lengthType: 'short', popularity: 94, tags: ['tulip', 'flower', 'aesthetic', 'spring'] },
  { char: '𓆩♡𓆪', name: 'Winged Heart Aegis', category: 'aesthetic', subCategory: 'wings', lengthType: 'short', popularity: 97, tags: ['wings', 'angel', 'heart', 'aesthetic'] },
  { char: '𓆩✧𓆪', name: 'Winged Radiant Star', category: 'aesthetic', subCategory: 'wings', lengthType: 'short', popularity: 96, tags: ['wings', 'star', 'cyber', 'angel'] },
  { char: '𓆩⚡︎𓆪', name: 'Winged Lightning Bolt', category: 'aesthetic', subCategory: 'wings', lengthType: 'short', popularity: 93, tags: ['wings', 'bolt', 'cyber', 'lightning'] },
  { char: '𓆩ꨄ︎𓆪', name: 'Gothic Winged Emblem', category: 'aesthetic', subCategory: 'wings', lengthType: 'short', popularity: 95, tags: ['wings', 'gothic', 'emblem', 'dark'] },
  { char: '𓍢ִ໋🫀', name: 'Anatomical Heart Bloom', category: 'aesthetic', subCategory: 'gothic', lengthType: 'short', popularity: 92, tags: ['heart', 'grunge', 'aesthetic', 'anatomy'] },
  { char: '𓆝 𓆟 𓆞 𓆝 𓆟', name: 'Swimming Koi Fish', category: 'aesthetic', subCategory: 'bio', lengthType: 'combo', popularity: 94, tags: ['fish', 'ocean', 'peaceful', 'koi'] },
  { char: '˚₊· ͟͟͞͞➳❥', name: 'Cupid Arrow Flight', category: 'aesthetic', subCategory: 'bio', lengthType: 'short', popularity: 95, tags: ['arrow', 'love', 'heart', 'cupid'] },
  { char: '༺ ༒ ༻', name: 'Gothic Cross Halo', category: 'aesthetic', subCategory: 'gothic', lengthType: 'short', popularity: 96, tags: ['gothic', 'cross', 'dark', 'halo'] },
  { char: '༺ ✦ ༻', name: 'Ornamental Star Medallion', category: 'aesthetic', subCategory: 'gothic', lengthType: 'short', popularity: 94, tags: ['star', 'ornate', 'decor', 'royal'] },
  { char: '༺ ♥ ༻', name: 'Ornate Filigree Heart', category: 'aesthetic', subCategory: 'gothic', lengthType: 'short', popularity: 93, tags: ['heart', 'ornate', 'royal', 'filigree'] },
  { char: '⋆⭒˚｡⋆', name: 'Starry Constellation Spark', category: 'aesthetic', subCategory: 'celestial', lengthType: 'short', popularity: 95, tags: ['stars', 'magic', 'sky'] },
  { char: '*ੈ✩‧₊˚', name: 'Shooting Star Flare', category: 'aesthetic', subCategory: 'celestial', lengthType: 'short', popularity: 96, tags: ['star', 'meteor', 'flare'] },
  { char: 'ೀ ˚₊‧꒰ა ☆ ໒꒱ ‧₊˚ ೀ', name: 'Angel Wings Bow Crest', category: 'aesthetic', subCategory: 'wings', lengthType: 'combo', popularity: 97, tags: ['angel', 'wings', 'coquette', 'bow'] },

  // ==================== AI & TECH SYMBOLS ====================
  { char: '✦', name: 'Four Point AI Spark', category: 'ai_tech', lengthType: 'single', popularity: 99, tags: ['ai', 'sparkle', 'gemini', 'magic', 'clean'] },
  { char: '✧', name: 'Outline AI Spark', category: 'ai_tech', lengthType: 'single', popularity: 98, tags: ['ai', 'sparkle', 'clean', 'minimal'] },
  { char: '🟊', name: 'Chunky Star Token', category: 'ai_tech', lengthType: 'single', popularity: 88, tags: ['ai', 'badge', 'star', 'token'] },
  { char: '✺', name: 'Burst Node', category: 'ai_tech', lengthType: 'single', popularity: 87, tags: ['ai', 'spark', 'vector', 'burst'] },
  { char: '⚡', name: 'High Voltage Pulse', category: 'ai_tech', lengthType: 'single', popularity: 98, tags: ['lightning', 'power', 'speed', 'electric', 'energy'] },
  { char: '⎔', name: 'Hexagon Prism Token', category: 'ai_tech', lengthType: 'single', popularity: 89, tags: ['hexagon', 'tech', 'crypto', 'prism'] },
  { char: '⌬', name: 'Benzene Hex Ring', category: 'ai_tech', lengthType: 'single', popularity: 93, tags: ['chemistry', 'tech', 'science', 'cyber', 'hex'] },
  { char: '⏣', name: 'Concentric Hex Core', category: 'ai_tech', lengthType: 'single', popularity: 91, tags: ['hex', 'core', 'tech', 'cyber'] },
  { char: '⬡', name: 'Hollow Tech Hexagon', category: 'ai_tech', lengthType: 'single', popularity: 90, tags: ['hex', 'geometry', 'network', 'node'] },
  { char: '⬢', name: 'Solid Tech Hexagon', category: 'ai_tech', lengthType: 'single', popularity: 89, tags: ['hex', 'node', 'solid', 'block'] },
  { char: '⟠', name: 'Ethereum Crystal', category: 'ai_tech', lengthType: 'single', popularity: 94, tags: ['crypto', 'eth', 'tech', 'diamond'] },
  { char: '⌘', name: 'Command Key Place of Interest', category: 'ai_tech', lengthType: 'single', popularity: 96, tags: ['cmd', 'apple', 'system', 'keyboard', 'mac'] },
  { char: '⌥', name: 'Option / Alt Gate', category: 'ai_tech', lengthType: 'single', popularity: 92, tags: ['option', 'alt', 'switch', 'keyboard'] },
  { char: '⎋', name: 'Escape Glyph', category: 'ai_tech', lengthType: 'single', popularity: 86, tags: ['esc', 'escape', 'keyboard', 'terminal'] },
  { char: '⨀', name: 'Circled Dot Sensor', category: 'ai_tech', lengthType: 'single', popularity: 84, tags: ['tech', 'sensor', 'circuit', 'node'] },
  { char: '⨂', name: 'Circled Cross Operator', category: 'ai_tech', lengthType: 'single', popularity: 85, tags: ['tensor', 'math', 'ai', 'matrix'] },
  { char: '⛶', name: 'Scanner Target Reticle', category: 'ai_tech', lengthType: 'single', popularity: 88, tags: ['scan', 'lens', 'camera', 'hud', 'vision'] },
  { char: '⚙', name: 'Precision Cogwheel', category: 'ai_tech', lengthType: 'single', popularity: 92, tags: ['gear', 'settings', 'engine', 'config'] },
  { char: '⛓', name: 'Blockchain Chains', category: 'ai_tech', lengthType: 'single', popularity: 90, tags: ['chain', 'crypto', 'link', 'security'] },
  { char: '⌬ ⎔ ⏣', name: 'Cyber Matrix Trio', category: 'ai_tech', lengthType: 'short', popularity: 88, tags: ['matrix', 'cyber', 'tech', 'trio'] },
  { char: '⟦ ⟧', name: 'Semantic Matrix Brackets', category: 'ai_tech', lengthType: 'short', popularity: 89, tags: ['brackets', 'code', 'math', 'syntax'] },
  { char: '⟨ ⟩', name: 'Dirac Quantum Brackets', category: 'ai_tech', lengthType: 'short', popularity: 87, tags: ['quantum', 'physics', 'angle', 'bra-ket'] },
  { char: '⟪ ⟫', name: 'Mathematical Double Angle', category: 'ai_tech', lengthType: 'short', popularity: 86, tags: ['angle', 'brackets', 'syntax', 'math'] },
  { char: '⌗', name: 'Viewdata Hash Mark', category: 'ai_tech', lengthType: 'single', popularity: 81, tags: ['hash', 'terminal', 'tech', 'teletext'] },
  { char: '⌖', name: 'Telemetry Target Reticle', category: 'ai_tech', lengthType: 'single', popularity: 89, tags: ['reticle', 'target', 'hud', 'aim'] },
  { char: '⌁', name: 'Electric Spark Line', category: 'ai_tech', lengthType: 'single', popularity: 83, tags: ['electric', 'frequency', 'signal', 'pulse'] },

  // ==================== STARS & CELESTIAL ====================
  { char: '★', name: 'Black Star Solid', category: 'stars', lengthType: 'single', popularity: 99, tags: ['star', 'solid', 'rating', 'favorite'] },
  { char: '☆', name: 'White Star Outline', category: 'stars', lengthType: 'single', popularity: 98, tags: ['star', 'outline', 'clean', 'minimal'] },
  { char: '✩', name: 'Open Centre Star', category: 'stars', lengthType: 'single', popularity: 94, tags: ['star', 'cute', 'aesthetic', 'clean'] },
  { char: '✪', name: 'Circled Military Star', category: 'stars', lengthType: 'single', popularity: 92, tags: ['star', 'circle', 'badge', 'emblem'] },
  { char: '✫', name: 'Open Pinwheel Star', category: 'stars', lengthType: 'single', popularity: 89, tags: ['star', 'pinwheel', 'pin', 'cute'] },
  { char: '✬', name: 'Pinwheel Star Black', category: 'stars', lengthType: 'single', popularity: 87, tags: ['star', 'art', 'decor', 'spin'] },
  { char: '✭', name: 'Shadowed Star', category: 'stars', lengthType: 'single', popularity: 86, tags: ['star', '3d', 'shadow', 'pop'] },
  { char: '✮', name: 'Heavy Outlined Star', category: 'stars', lengthType: 'single', popularity: 91, tags: ['star', 'bold', 'thick', 'heavy'] },
  { char: '✯', name: 'Pinwheel Star Solid', category: 'stars', lengthType: 'single', popularity: 90, tags: ['star', 'sparkle', 'solid'] },
  { char: '✰', name: 'Shadowed White Star', category: 'stars', lengthType: 'single', popularity: 88, tags: ['star', 'outline', 'shadow'] },
  { char: '⁂', name: 'Asterism Triple Star', category: 'stars', lengthType: 'single', popularity: 89, tags: ['asterism', 'triple', 'stars', 'triangle'] },
  { char: '⁎', name: 'Low Asterisk', category: 'stars', lengthType: 'single', popularity: 80, tags: ['asterisk', 'star', 'dot'] },
  { char: '⁑', name: 'Two Asterisks Vertical', category: 'stars', lengthType: 'single', popularity: 81, tags: ['stars', 'double', 'bullet'] },
  { char: '✢', name: 'Four Teardrop Spoke Asterisk', category: 'stars', lengthType: 'single', popularity: 90, tags: ['cross', 'star', 'spark', 'flair'] },
  { char: '✣', name: 'Four Balloon Spoke Asterisk', category: 'stars', lengthType: 'single', popularity: 91, tags: ['star', 'sparkle', 'decor'] },
  { char: '✤', name: 'Heavy Four Balloon Star', category: 'stars', lengthType: 'single', popularity: 92, tags: ['star', 'four point', 'bold'] },
  { char: '✥', name: 'Four Club Spoke Asterisk', category: 'stars', lengthType: 'single', popularity: 89, tags: ['star', 'sparkle', 'greek'] },
  { char: '✱', name: 'Asterisk Flake', category: 'stars', lengthType: 'single', popularity: 86, tags: ['star', 'snow', 'flower'] },
  { char: '✲', name: 'Open Asterisk Flake', category: 'stars', lengthType: 'single', popularity: 87, tags: ['star', 'snow', 'spark'] },
  { char: '✳', name: 'Eight Spoke Asterisk', category: 'stars', lengthType: 'single', popularity: 88, tags: ['star', 'sparkle', 'shine'] },
  { char: '✴', name: 'Eight Pointed Black Star', category: 'stars', lengthType: 'single', popularity: 94, tags: ['star', 'eight', 'bold', 'compass'] },
  { char: '✵', name: 'Eight Pointed Pinwheel', category: 'stars', lengthType: 'single', popularity: 90, tags: ['star', 'pinwheel', 'flair'] },
  { char: '✶', name: 'Six Pointed Black Star', category: 'stars', lengthType: 'single', popularity: 91, tags: ['star', 'six', 'bold'] },
  { char: '✷', name: 'Eight Pointed Rectilinear Star', category: 'stars', lengthType: 'single', popularity: 89, tags: ['star', 'spark', 'flare'] },
  { char: '✸', name: 'Heavy Eight Pointed Star', category: 'stars', lengthType: 'single', popularity: 88, tags: ['star', 'heavy', 'badge'] },
  { char: '✹', name: 'Twelve Pointed Black Star', category: 'stars', lengthType: 'single', popularity: 93, tags: ['star', 'sunburst', 'nova', 'burst'] },
  { char: '⋆', name: 'Star Operator', category: 'stars', lengthType: 'single', popularity: 96, tags: ['star', 'tiny', 'math', 'aesthetic'] },
  { char: '≛', name: 'Star Equals Operator', category: 'stars', lengthType: 'single', popularity: 82, tags: ['star', 'math', 'equal'] },
  { char: '⯌', name: 'Diamond Star Solstice', category: 'stars', lengthType: 'single', popularity: 89, tags: ['star', 'diamond', 'celestial'] },
  { char: '⯍', name: 'Equilateral Star Flare', category: 'stars', lengthType: 'single', popularity: 88, tags: ['star', 'astrology', 'celestial'] },
  { char: '☽', name: 'First Quarter Moon', category: 'stars', lengthType: 'single', popularity: 97, tags: ['moon', 'night', 'crescent', 'celestial'] },
  { char: '☾', name: 'Last Quarter Moon', category: 'stars', lengthType: 'single', popularity: 97, tags: ['moon', 'night', 'witchy', 'crescent'] },
  { char: '☀', name: 'Sun with Rays', category: 'stars', lengthType: 'single', popularity: 95, tags: ['sun', 'day', 'light', 'weather', 'summer'] },
  { char: '☼', name: 'White Sun with Rays', category: 'stars', lengthType: 'single', popularity: 94, tags: ['sun', 'summer', 'bright', 'clean'] },
  { char: '☄', name: 'Comet Meteor', category: 'stars', lengthType: 'single', popularity: 91, tags: ['comet', 'space', 'meteor', 'shooting star'] },

  // ==================== HEARTS & AFFECTION ====================
  { char: '♥', name: 'Black Heart Suit', category: 'hearts', lengthType: 'single', popularity: 99, tags: ['heart', 'love', 'classic', 'card'] },
  { char: '♡', name: 'White Heart Suit', category: 'hearts', lengthType: 'single', popularity: 98, tags: ['heart', 'outline', 'cute', 'clean'] },
  { char: '❤', name: 'Heavy Black Heart', category: 'hearts', lengthType: 'single', popularity: 99, tags: ['heart', 'red', 'bold', 'love'] },
  { char: '❥', name: 'Rotated Heart Floral', category: 'hearts', lengthType: 'single', popularity: 96, tags: ['heart', 'bullet', 'cute', 'floral'] },
  { char: '❣', name: 'Heavy Heart Exclamation', category: 'hearts', lengthType: 'single', popularity: 91, tags: ['heart', 'exclamation', 'love', 'punct'] },
  { char: '❦', name: 'Floral Heart Hedera', category: 'hearts', lengthType: 'single', popularity: 92, tags: ['heart', 'floral', 'vine', 'leaf', 'botanical'] },
  { char: '❧', name: 'Rotated Floral Heart', category: 'hearts', lengthType: 'single', popularity: 90, tags: ['heart', 'leaf', 'botanical', 'ivy'] },
  { char: 'ღ', name: 'Georgian Love Glyph Ghani', category: 'hearts', lengthType: 'single', popularity: 97, tags: ['heart', 'cute', 'swirl', 'georgian'] },
  { char: 'დ', name: 'Georgian Heart Dani', category: 'hearts', lengthType: 'single', popularity: 92, tags: ['heart', 'cute', 'minimal'] },
  { char: '֎', name: 'Armenian Heart Medallion', category: 'hearts', lengthType: 'single', popularity: 85, tags: ['heart', 'historic', 'emblem'] },
  { char: 'ෆ', name: 'Sinhala Soft Heart', category: 'hearts', lengthType: 'single', popularity: 96, tags: ['heart', 'cute', 'soft', 'sinhala'] },
  { char: 'ꕥ', name: 'Aesthetic Flower Rosette', category: 'hearts', lengthType: 'single', popularity: 94, tags: ['flower', 'rosette', 'love', 'bloom'] },
  { char: '𑁍', name: 'Sharada Lotus Bloom', category: 'hearts', lengthType: 'single', popularity: 95, tags: ['lotus', 'flower', 'spiritual', 'bloom'] },
  { char: '𑁂', name: 'Sharada Twin Heart Leaf', category: 'hearts', lengthType: 'single', popularity: 89, tags: ['heart', 'ornate', 'symbol'] },
  { char: '𑁃', name: 'Sharada Sacred Vine', category: 'hearts', lengthType: 'single', popularity: 88, tags: ['vine', 'sacred', 'heart'] },
  { char: '🫶', name: 'Heart Hands Gesture', category: 'hearts', lengthType: 'single', popularity: 98, tags: ['heart', 'hands', 'love', 'friendship'] },
  { char: '🤍', name: 'Pure White Heart', category: 'hearts', lengthType: 'single', popularity: 98, tags: ['heart', 'white', 'clean', 'pure'] },
  { char: '💜', name: 'Purple Heart', category: 'hearts', lengthType: 'single', popularity: 97, tags: ['heart', 'purple', 'bts', 'aesthetic'] },
  { char: '🖤', name: 'Dark Black Heart', category: 'hearts', lengthType: 'single', popularity: 98, tags: ['heart', 'black', 'gothic', 'dark'] },
  { char: '💙', name: 'Ocean Blue Heart', category: 'hearts', lengthType: 'single', popularity: 94, tags: ['heart', 'blue', 'peace', 'ocean'] },
  { char: '💚', name: 'Emerald Green Heart', category: 'hearts', lengthType: 'single', popularity: 93, tags: ['heart', 'green', 'nature', 'earth'] },
  { char: '💛', name: 'Solar Yellow Heart', category: 'hearts', lengthType: 'single', popularity: 92, tags: ['heart', 'yellow', 'warm', 'sun'] },
  { char: '🧡', name: 'Sunset Orange Heart', category: 'hearts', lengthType: 'single', popularity: 91, tags: ['heart', 'orange', 'autumn'] },
  { char: '💖', name: 'Sparkling Heart', category: 'hearts', lengthType: 'single', popularity: 99, tags: ['heart', 'sparkle', 'magic', 'glitter'] },
  { char: '💗', name: 'Growing Heart', category: 'hearts', lengthType: 'single', popularity: 95, tags: ['heart', 'pulse', 'pink', 'growing'] },
  { char: '💓', name: 'Beating Heart', category: 'hearts', lengthType: 'single', popularity: 94, tags: ['heart', 'vibe', 'beat', 'love'] },
  { char: '💞', name: 'Revolving Hearts', category: 'hearts', lengthType: 'single', popularity: 95, tags: ['heart', 'orbit', 'love', 'dance'] },
  { char: '💕', name: 'Two Hearts Floating', category: 'hearts', lengthType: 'single', popularity: 98, tags: ['heart', 'double', 'cute', 'pink'] },
  { char: '💘', name: 'Heart with Cupid Arrow', category: 'hearts', lengthType: 'single', popularity: 96, tags: ['heart', 'arrow', 'cupid', 'love'] },
  { char: '💌', name: 'Love Letter Envelope', category: 'hearts', lengthType: 'single', popularity: 95, tags: ['heart', 'letter', 'mail', 'secret'] },
  { char: 'ஐ', name: 'Tamil Soft Heart Bloom', category: 'hearts', lengthType: 'single', popularity: 93, tags: ['heart', 'cute', 'flair', 'tamil'] },

  // ==================== BORDERS, DIVIDERS & FILIGREE ====================
  { char: '─── ⋆⋅☆⋅⋆ ───', name: 'Star Center Line', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 98, tags: ['divider', 'star', 'line', 'aesthetic', 'header'] },
  { char: '┈┈┈┈┈┈┈┈┈┈┈┈┈┈', name: 'Dotted Line Divider', category: 'borders', subCategory: 'dots', lengthType: 'divider', popularity: 96, tags: ['divider', 'dots', 'line', 'clean'] },
  { char: '╔═══════════════╗', name: 'Double Box Top Frame', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 97, tags: ['box', 'frame', 'border', 'double'] },
  { char: '╚═══════════════╝', name: 'Double Box Bottom Frame', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 97, tags: ['box', 'frame', 'border', 'bottom'] },
  { char: '⊱ ────── {.⋅ ♫ ⋅.} ───── ⊰', name: 'Music Note Divider', category: 'borders', subCategory: 'music', lengthType: 'divider', popularity: 95, tags: ['divider', 'music', 'aesthetic', 'notes'] },
  { char: '•┈••✦❤✦••┈•', name: 'Heart Sparkle Divider', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 94, tags: ['divider', 'heart', 'sparkle', 'sweet'] },
  { char: '‧͙⁺˚*･༓☾ ☽༓･*˚⁺‧͙', name: 'Moon Magic Filigree', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 96, tags: ['divider', 'moon', 'stars', 'witchy'] },
  { char: '═════════════════', name: 'Double Solid Line', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 93, tags: ['divider', 'line', 'double', 'solid'] },
  { char: '▓▒░ ░▒▓', name: 'Dither Fade Blocks', category: 'borders', subCategory: 'cyber', lengthType: 'short', popularity: 94, tags: ['blocks', 'retro', 'ascii', 'dither', 'fade'] },
  { char: '░▒▓█►─═ ═─◄█▓▒░', name: 'Cyber Banner Divider', category: 'borders', subCategory: 'cyber', lengthType: 'divider', popularity: 95, tags: ['cyber', 'ascii', 'gamer', 'banner', 'steam'] },
  { char: '╭───────────╮', name: 'Rounded Corner Box Top', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 95, tags: ['box', 'frame', 'round', 'header'] },
  { char: '╰───────────╯', name: 'Rounded Corner Box Bottom', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 95, tags: ['box', 'frame', 'round', 'footer'] },
  { char: '✦•······················•✦', name: 'Star Dot Border', category: 'borders', subCategory: 'dots', lengthType: 'divider', popularity: 92, tags: ['divider', 'dots', 'stars', 'border'] },
  { char: '─── ∙ ~εïз~ ∙ ───', name: 'Butterfly Divider', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 94, tags: ['butterfly', 'divider', 'cute', 'wings'] },
  { char: '∘₊✧──────✧₊∘', name: 'Diamond Sparkle Bar', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 93, tags: ['divider', 'sparkle', 'clean', 'diamond'] },
  { char: '═══*.·:·.☽✧ ✦ ✧☾.·:·.*═══', name: 'Ornate Celestial Arch', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 95, tags: ['divider', 'celestial', 'ornate', 'arch'] },
  { char: '┏━━━━━━━━━━━━━━━┓', name: 'Thick Corner Box Top', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 91, tags: ['box', 'thick', 'frame', 'header'] },
  { char: '┗━━━━━━━━━━━━━━━┛', name: 'Thick Corner Box Bottom', category: 'borders', subCategory: 'boxes', lengthType: 'divider', popularity: 91, tags: ['box', 'thick', 'frame', 'footer'] },
  { char: '•───────────────•', name: 'Minimal Bullet Line', category: 'borders', subCategory: 'dots', lengthType: 'divider', popularity: 96, tags: ['divider', 'minimal', 'line', 'discord'] },
  { char: '»»————- ★ ————-««', name: 'Arrow Star Divider', category: 'borders', subCategory: 'stars', lengthType: 'divider', popularity: 94, tags: ['divider', 'arrow', 'star', 'aesthetic'] },

  // ==================== ARROWS & DIRECTION ====================
  { char: '➔', name: 'Heavy Arrow Right', category: 'arrows', lengthType: 'single', popularity: 98, tags: ['arrow', 'right', 'bold', 'pointer'] },
  { char: '➜', name: 'Heavy Round Head Arrow', category: 'arrows', lengthType: 'single', popularity: 96, tags: ['arrow', 'clean', 'bold', 'right'] },
  { char: '➝', name: 'Triangle Head Arrow', category: 'arrows', lengthType: 'single', popularity: 91, tags: ['arrow', 'triangle', 'right'] },
  { char: '➞', name: 'Heavy Triangle Head', category: 'arrows', lengthType: 'single', popularity: 90, tags: ['arrow', 'thick', 'right'] },
  { char: '➟', name: 'Dashed Arrow Right', category: 'arrows', lengthType: 'single', popularity: 89, tags: ['arrow', 'dash', 'speed'] },
  { char: '➠', name: 'Heavy Dashed Arrow', category: 'arrows', lengthType: 'single', popularity: 88, tags: ['arrow', 'dash', 'thick'] },
  { char: '➡', name: 'Black Right Arrow Box', category: 'arrows', lengthType: 'single', popularity: 97, tags: ['arrow', 'ui', 'right', 'button'] },
  { char: '➢', name: 'Three-D Top Lighted Right', category: 'arrows', lengthType: 'single', popularity: 87, tags: ['arrow', '3d', 'light'] },
  { char: '➣', name: 'Three-D Bottom Lighted Right', category: 'arrows', lengthType: 'single', popularity: 86, tags: ['arrow', '3d', 'dark'] },
  { char: '➤', name: 'Black Right Triangle Pointer', category: 'arrows', lengthType: 'single', popularity: 99, tags: ['arrow', 'pointer', 'play', 'bullet', 'right'] },
  { char: '➥', name: 'Heavy Curved Arrow Down', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'curve', 'turn', 'down', 'reply'] },
  { char: '➦', name: 'Heavy Curved Arrow Up', category: 'arrows', lengthType: 'single', popularity: 92, tags: ['arrow', 'curve', 'up', 'return'] },
  { char: '➧', name: 'Squat Black Arrow', category: 'arrows', lengthType: 'single', popularity: 85, tags: ['arrow', 'bold', 'squat'] },
  { char: '➨', name: 'Heavy Concave Arrow', category: 'arrows', lengthType: 'single', popularity: 88, tags: ['arrow', 'concave', 'chevron'] },
  { char: '➩', name: 'Open Outlined Arrow', category: 'arrows', lengthType: 'single', popularity: 89, tags: ['arrow', 'outline', 'clean'] },
  { char: '➪', name: 'Thick Outlined Arrow', category: 'arrows', lengthType: 'single', popularity: 88, tags: ['arrow', 'outline', 'thick'] },
  { char: '➫', name: 'Right Arrow Heavy Stem', category: 'arrows', lengthType: 'single', popularity: 86, tags: ['arrow', 'heavy', 'point'] },
  { char: '➬', name: 'Arrow Right Circle Base', category: 'arrows', lengthType: 'single', popularity: 87, tags: ['arrow', 'circle', 'ui'] },
  { char: '➳', name: 'Feathered Arrow Head', category: 'arrows', lengthType: 'single', popularity: 97, tags: ['arrow', 'feather', 'aesthetic', 'tribal'] },
  { char: '➴', name: 'Feather Arrow Downward', category: 'arrows', lengthType: 'single', popularity: 93, tags: ['arrow', 'feather', 'down'] },
  { char: '➵', name: 'Feather Arrow Upward', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'feather', 'up'] },
  { char: '➶', name: 'Feather Arrow North East', category: 'arrows', lengthType: 'single', popularity: 95, tags: ['arrow', 'feather', 'diagonal'] },
  { char: '➷', name: 'Feather Arrow South East', category: 'arrows', lengthType: 'single', popularity: 96, tags: ['arrow', 'feather', 'cupid', 'diagonal'] },
  { char: '➸', name: 'Heavy Feathered Arrow', category: 'arrows', lengthType: 'single', popularity: 95, tags: ['arrow', 'feather', 'bold'] },
  { char: '➹', name: 'Feather Arrow Flight North East', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'feather', 'growth'] },
  { char: '←', name: 'Left Arrow', category: 'arrows', lengthType: 'single', popularity: 99, tags: ['arrow', 'left', 'basic', 'nav'] },
  { char: '↑', name: 'Up Arrow', category: 'arrows', lengthType: 'single', popularity: 99, tags: ['arrow', 'up', 'basic', 'nav'] },
  { char: '→', name: 'Right Arrow', category: 'arrows', lengthType: 'single', popularity: 99, tags: ['arrow', 'right', 'basic', 'nav'] },
  { char: '↓', name: 'Down Arrow', category: 'arrows', lengthType: 'single', popularity: 99, tags: ['arrow', 'down', 'basic', 'nav'] },
  { char: '↔', name: 'Left Right Arrow', category: 'arrows', lengthType: 'single', popularity: 93, tags: ['arrow', 'horizontal', 'both'] },
  { char: '↕', name: 'Up Down Arrow', category: 'arrows', lengthType: 'single', popularity: 92, tags: ['arrow', 'vertical', 'both'] },
  { char: '↖', name: 'North West Arrow', category: 'arrows', lengthType: 'single', popularity: 90, tags: ['arrow', 'diagonal', 'nw'] },
  { char: '↗', name: 'North East Arrow', category: 'arrows', lengthType: 'single', popularity: 95, tags: ['arrow', 'diagonal', 'ne', 'growth', 'link'] },
  { char: '↘', name: 'South East Arrow', category: 'arrows', lengthType: 'single', popularity: 90, tags: ['arrow', 'diagonal', 'se'] },
  { char: '↙', name: 'South West Arrow', category: 'arrows', lengthType: 'single', popularity: 89, tags: ['arrow', 'diagonal', 'sw'] },
  { char: '↺', name: 'Counter-Clockwise Cycle', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'refresh', 'undo', 'loop'] },
  { char: '↻', name: 'Clockwise Cycle', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'refresh', 'redo', 'loop'] },
  { char: '⇄', name: 'Rightwards Arrow Over Leftwards', category: 'arrows', lengthType: 'single', popularity: 93, tags: ['arrow', 'exchange', 'trade', 'swap'] },
  { char: '⇐', name: 'Leftwards Double Arrow', category: 'arrows', lengthType: 'single', popularity: 94, tags: ['arrow', 'double', 'left', 'logic'] },
  { char: '⇑', name: 'Upwards Double Arrow', category: 'arrows', lengthType: 'single', popularity: 91, tags: ['arrow', 'double', 'up'] },
  { char: '⇒', name: 'Rightwards Double Arrow', category: 'arrows', lengthType: 'single', popularity: 97, tags: ['arrow', 'double', 'implies', 'logic', 'right'] },
  { char: '⇓', name: 'Downwards Double Arrow', category: 'arrows', lengthType: 'single', popularity: 91, tags: ['arrow', 'double', 'down'] },
  { char: '⇔', name: 'Left Right Double Arrow', category: 'arrows', lengthType: 'single', popularity: 93, tags: ['arrow', 'equivalent', 'iff', 'logic'] },

  // ==================== MATH, SCIENCE & LOGIC ====================
  { char: 'π', name: 'Greek Small Pi', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 99, tags: ['math', 'greek', 'pi', 'circle', 'constant'] },
  { char: 'θ', name: 'Greek Small Theta', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 95, tags: ['math', 'greek', 'angle', 'trig'] },
  { char: 'α', name: 'Greek Small Alpha', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 96, tags: ['math', 'greek', 'alpha', 'first'] },
  { char: 'β', name: 'Greek Small Beta', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 95, tags: ['math', 'greek', 'beta', 'version'] },
  { char: 'γ', name: 'Greek Small Gamma', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 91, tags: ['math', 'greek', 'gamma', 'ray'] },
  { char: 'δ', name: 'Greek Small Delta', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 92, tags: ['math', 'greek', 'delta', 'change'] },
  { char: 'λ', name: 'Greek Small Lambda', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 97, tags: ['math', 'greek', 'lambda', 'physics', 'function'] },
  { char: 'μ', name: 'Micro / Greek Mu', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 96, tags: ['math', 'greek', 'mu', 'micro', 'prefix'] },
  { char: 'σ', name: 'Greek Small Sigma', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 94, tags: ['math', 'greek', 'sigma', 'stddev', 'stats'] },
  { char: 'ω', name: 'Greek Small Omega', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 93, tags: ['math', 'greek', 'omega', 'last'] },
  { char: 'Ω', name: 'Greek Capital Omega / Ohm', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 96, tags: ['math', 'greek', 'ohm', 'physics', 'resistance'] },
  { char: 'Σ', name: 'Greek Capital Sigma / Summation', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 98, tags: ['math', 'sum', 'series', 'sigma'] },
  { char: 'Δ', name: 'Greek Capital Delta / Difference', category: 'math_science', subCategory: 'greek', lengthType: 'single', popularity: 97, tags: ['math', 'delta', 'change', 'triangle'] },
  { char: '∞', name: 'Infinity', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 99, tags: ['math', 'infinity', 'forever', 'loop', 'limit'] },
  { char: '√', name: 'Square Root Radical', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 98, tags: ['math', 'root', 'radical', 'sqrt'] },
  { char: '∛', name: 'Cube Root', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 91, tags: ['math', 'root', 'cube'] },
  { char: '∜', name: 'Fourth Root', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 88, tags: ['math', 'root', 'fourth'] },
  { char: '∫', name: 'Integral Operator', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 97, tags: ['math', 'calculus', 'integral', 'area'] },
  { char: '∬', name: 'Double Integral', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 92, tags: ['math', 'calculus', 'surface'] },
  { char: '∭', name: 'Triple Integral', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 90, tags: ['math', 'calculus', 'volume'] },
  { char: '∮', name: 'Contour Loop Integral', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 91, tags: ['math', 'calculus', 'physics', 'contour'] },
  { char: '∂', name: 'Partial Differential', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 94, tags: ['math', 'calculus', 'partial', 'gradient'] },
  { char: '∇', name: 'Nabla / Del Operator', category: 'math_science', subCategory: 'calculus', lengthType: 'single', popularity: 93, tags: ['math', 'vector', 'gradient', 'del'] },
  { char: '±', name: 'Plus-Minus Sign', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 98, tags: ['math', 'plus', 'minus', 'tolerance', 'error'] },
  { char: '×', name: 'Multiplication Sign', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 97, tags: ['math', 'multiply', 'cross', 'times'] },
  { char: '÷', name: 'Division Sign', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 96, tags: ['math', 'divide', 'division'] },
  { char: '≈', name: 'Almost Equal To', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 97, tags: ['math', 'approx', 'estimate', 'equal'] },
  { char: '≠', name: 'Not Equal To', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 98, tags: ['math', 'not equal', 'logic', 'compare'] },
  { char: '≡', name: 'Identical To / Congruent', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 92, tags: ['math', 'congruent', 'identity', 'equiv'] },
  { char: '≤', name: 'Less-Than Or Equal', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 97, tags: ['math', 'inequality', 'compare', 'lte'] },
  { char: '≥', name: 'Greater-Than Or Equal', category: 'math_science', subCategory: 'operators', lengthType: 'single', popularity: 97, tags: ['math', 'inequality', 'compare', 'gte'] },
  { char: '∈', name: 'Element Of Set', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 95, tags: ['math', 'set', 'element', 'in'] },
  { char: '∉', name: 'Not An Element Of', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 92, tags: ['math', 'set', 'logic', 'notin'] },
  { char: '∋', name: 'Contains As Member', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 89, tags: ['math', 'set', 'member'] },
  { char: '∅', name: 'Empty Set Null', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 96, tags: ['math', 'empty', 'null', 'set', 'none'] },
  { char: '⊆', name: 'Subset Of Or Equal', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 93, tags: ['math', 'subset', 'set'] },
  { char: '⊇', name: 'Superset Of Or Equal', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 91, tags: ['math', 'superset', 'set'] },
  { char: '⊂', name: 'Strict Subset Of', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 93, tags: ['math', 'subset', 'strict'] },
  { char: '⊃', name: 'Strict Superset Of', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 91, tags: ['math', 'superset', 'strict'] },
  { char: '∪', name: 'Union Operator', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 95, tags: ['math', 'union', 'set', 'combine'] },
  { char: '∩', name: 'Intersection Operator', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 95, tags: ['math', 'intersect', 'set', 'both'] },
  { char: '∧', name: 'Logical AND / Conjunction', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 92, tags: ['logic', 'and', 'math', 'wedge'] },
  { char: '∨', name: 'Logical OR / Disjunction', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 92, tags: ['logic', 'or', 'math', 'vee'] },
  { char: '¬', name: 'Not / Negation', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 94, tags: ['logic', 'not', 'negate'] },
  { char: '∀', name: 'Universal Quantifier (For All)', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 96, tags: ['logic', 'for all', 'math'] },
  { char: '∃', name: 'Existential Quantifier (There Exists)', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 96, tags: ['logic', 'exists', 'math'] },
  { char: '∄', name: 'There Does Not Exist', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 90, tags: ['logic', 'not exist', 'math'] },
  { char: '∴', name: 'Therefore Sign', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 97, tags: ['logic', 'therefore', 'proof', 'conclusion'] },
  { char: '∵', name: 'Because Sign', category: 'math_science', subCategory: 'logic', lengthType: 'single', popularity: 94, tags: ['logic', 'because', 'proof', 'reason'] },

  // ==================== CURRENCY & CRYPTO ====================
  { char: '$', name: 'Dollar Sign', category: 'currency', lengthType: 'single', popularity: 99, tags: ['usd', 'dollar', 'money', 'fiat', 'cash'] },
  { char: '€', name: 'Euro Sign', category: 'currency', lengthType: 'single', popularity: 98, tags: ['eur', 'euro', 'europe', 'money'] },
  { char: '£', name: 'Pound Sterling', category: 'currency', lengthType: 'single', popularity: 97, tags: ['gbp', 'pound', 'uk', 'money'] },
  { char: '¥', name: 'Yen / Yuan Sign', category: 'currency', lengthType: 'single', popularity: 96, tags: ['jpy', 'cny', 'yen', 'yuan', 'asia'] },
  { char: '₩', name: 'Korean Won Sign', category: 'currency', lengthType: 'single', popularity: 94, tags: ['krw', 'won', 'korea'] },
  { char: '₹', name: 'Indian Rupee Sign', category: 'currency', lengthType: 'single', popularity: 95, tags: ['inr', 'rupee', 'india'] },
  { char: '₽', name: 'Russian Ruble Sign', category: 'currency', lengthType: 'single', popularity: 90, tags: ['rub', 'ruble', 'russia'] },
  { char: '₺', name: 'Turkish Lira Sign', category: 'currency', lengthType: 'single', popularity: 89, tags: ['try', 'lira', 'turkey'] },
  { char: '₴', name: 'Ukrainian Hryvnia Sign', category: 'currency', lengthType: 'single', popularity: 88, tags: ['uah', 'hryvnia', 'ukraine'] },
  { char: '₦', name: 'Nigerian Naira Sign', category: 'currency', lengthType: 'single', popularity: 87, tags: ['ngn', 'naira', 'nigeria'] },
  { char: '฿', name: 'Thai Baht / Bitcoin Token', category: 'currency', lengthType: 'single', popularity: 92, tags: ['thb', 'baht', 'btc'] },
  { char: '₫', name: 'Vietnamese Dong Sign', category: 'currency', lengthType: 'single', popularity: 88, tags: ['vnd', 'dong', 'vietnam'] },
  { char: '₿', name: 'Bitcoin Symbol', category: 'currency', lengthType: 'single', popularity: 99, tags: ['btc', 'crypto', 'bitcoin', 'satoshi', 'token'] },
  { char: 'Ξ', name: 'Ethereum Symbol Xi', category: 'currency', lengthType: 'single', popularity: 97, tags: ['eth', 'crypto', 'ethereum', 'web3'] },
  { char: '©', name: 'Copyright Sign', category: 'currency', lengthType: 'single', popularity: 98, tags: ['legal', 'copyright', 'ip', 'rights'] },
  { char: '®', name: 'Registered Trademark Sign', category: 'currency', lengthType: 'single', popularity: 97, tags: ['legal', 'registered', 'trademark', 'brand'] },
  { char: '™', name: 'Trade Mark Sign', category: 'currency', lengthType: 'single', popularity: 98, tags: ['legal', 'tm', 'brand', 'trade'] },
  { char: '℠', name: 'Service Mark Sign', category: 'currency', lengthType: 'single', popularity: 89, tags: ['legal', 'service', 'brand'] },
  { char: '№', name: 'Numero Number Sign', category: 'currency', lengthType: 'single', popularity: 93, tags: ['number', 'symbol', 'id', 'num'] },
  { char: '§', name: 'Section Law Sign', category: 'currency', lengthType: 'single', popularity: 91, tags: ['law', 'section', 'legal', 'doc'] },
  { char: '¶', name: 'Pilcrow Paragraph Sign', category: 'currency', lengthType: 'single', popularity: 90, tags: ['text', 'paragraph', 'editorial'] },

  // ==================== CHECKMARKS & BULLETS ====================
  { char: '✓', name: 'Check Mark', category: 'checkmarks', lengthType: 'single', popularity: 99, tags: ['check', 'tick', 'done', 'yes', 'verified'] },
  { char: '✔', name: 'Heavy Check Mark', category: 'checkmarks', lengthType: 'single', popularity: 99, tags: ['check', 'bold', 'success', 'verified', 'tick'] },
  { char: '✕', name: 'Multiplication Cross Mark', category: 'checkmarks', lengthType: 'single', popularity: 97, tags: ['cross', 'x', 'no', 'cancel', 'close'] },
  { char: '✖', name: 'Heavy Multiplication Cross', category: 'checkmarks', lengthType: 'single', popularity: 96, tags: ['cross', 'bold', 'delete', 'fail'] },
  { char: '✗', name: 'Ballot Cross Mark', category: 'checkmarks', lengthType: 'single', popularity: 92, tags: ['cross', 'ballot', 'vote'] },
  { char: '✘', name: 'Heavy Ballot Cross', category: 'checkmarks', lengthType: 'single', popularity: 91, tags: ['cross', 'heavy', 'rejected'] },
  { char: '☒', name: 'Ballot Box with X', category: 'checkmarks', lengthType: 'single', popularity: 95, tags: ['box', 'vote', 'checked', 'ui', 'todo'] },
  { char: '☐', name: 'Ballot Box Empty', category: 'checkmarks', lengthType: 'single', popularity: 98, tags: ['box', 'empty', 'checkbox', 'todo', 'task'] },
  { char: '☑', name: 'Ballot Box with Check', category: 'checkmarks', lengthType: 'single', popularity: 98, tags: ['box', 'check', 'done', 'ui', 'completed'] },
  { char: '❍', name: 'Upper Right Shadowed White Circle', category: 'checkmarks', lengthType: 'single', popularity: 88, tags: ['circle', 'bullet', 'ui'] },
  { char: '⦿', name: 'Circled White Bullet Target', category: 'checkmarks', lengthType: 'single', popularity: 90, tags: ['bullet', 'target', 'node'] },
  { char: '◉', name: 'Fish Eye Circle', category: 'checkmarks', lengthType: 'single', popularity: 92, tags: ['circle', 'bullet', 'radio'] },
  { char: '○', name: 'White Circle Outline', category: 'checkmarks', lengthType: 'single', popularity: 95, tags: ['circle', 'outline', 'shape'] },
  { char: '●', name: 'Black Circle Solid', category: 'checkmarks', lengthType: 'single', popularity: 97, tags: ['circle', 'bullet', 'dot', 'list'] },
  { char: '◌', name: 'Dotted Circle', category: 'checkmarks', lengthType: 'single', popularity: 89, tags: ['circle', 'dotted', 'placeholder'] },
  { char: '◦', name: 'White Bullet Small', category: 'checkmarks', lengthType: 'single', popularity: 93, tags: ['bullet', 'small', 'list'] },
  { char: '▪', name: 'Black Small Square', category: 'checkmarks', lengthType: 'single', popularity: 94, tags: ['square', 'bullet', 'list'] },
  { char: '▫', name: 'White Small Square', category: 'checkmarks', lengthType: 'single', popularity: 93, tags: ['square', 'outline', 'bullet'] },
  { char: '■', name: 'Black Medium Square', category: 'checkmarks', lengthType: 'single', popularity: 95, tags: ['square', 'solid', 'box'] },
  { char: '□', name: 'White Medium Square', category: 'checkmarks', lengthType: 'single', popularity: 94, tags: ['square', 'outline', 'box'] },
  { char: '▲', name: 'Black Up-Pointing Triangle', category: 'checkmarks', lengthType: 'single', popularity: 96, tags: ['triangle', 'up', 'metric', 'gain'] },
  { char: '▼', name: 'Black Down-Pointing Triangle', category: 'checkmarks', lengthType: 'single', popularity: 96, tags: ['triangle', 'down', 'metric', 'drop'] },
  { char: '◆', name: 'Black Diamond Suit', category: 'checkmarks', lengthType: 'single', popularity: 97, tags: ['diamond', 'solid', 'bullet'] },
  { char: '◇', name: 'White Diamond Suit', category: 'checkmarks', lengthType: 'single', popularity: 95, tags: ['diamond', 'outline', 'clean'] },
  { char: '◈', name: 'White Diamond Containing Black Diamond', category: 'checkmarks', lengthType: 'single', popularity: 93, tags: ['diamond', 'target', 'emblem'] },
  { char: '❖', name: 'Diamond Floral Diamond Shape', category: 'checkmarks', lengthType: 'single', popularity: 94, tags: ['diamond', 'floral', 'emblem'] },

  // ==================== JAPANESE & ANIME ====================
  { char: '✿', name: 'Black Florette Sakura', category: 'japanese_anime', lengthType: 'single', popularity: 99, tags: ['flower', 'sakura', 'cherry', 'japan', 'cute'] },
  { char: '❀', name: 'White Florette Blossom', category: 'japanese_anime', lengthType: 'single', popularity: 97, tags: ['flower', 'blossom', 'japan', 'spring'] },
  { char: '❁', name: 'Eight Petalled Flower', category: 'japanese_anime', lengthType: 'single', popularity: 94, tags: ['flower', 'rosette', 'cute'] },
  { char: '❂', name: 'Circled Open Center Eight Pointed Star', category: 'japanese_anime', lengthType: 'single', popularity: 90, tags: ['crest', 'japan', 'emblem'] },
  { char: '⛩', name: 'Shinto Torii Shrine Gate', category: 'japanese_anime', lengthType: 'single', popularity: 97, tags: ['torii', 'shinto', 'gate', 'japan', 'temple'] },
  { char: '♨', name: 'Hot Springs Onsen Sign', category: 'japanese_anime', lengthType: 'single', popularity: 95, tags: ['onsen', 'hot springs', 'steam', 'japan', 'bath'] },
  { char: '㊝', name: 'Circled Japanese Secret Glyph', category: 'japanese_anime', lengthType: 'single', popularity: 91, tags: ['kanji', 'secret', 'badge'] },
  { char: '㊣', name: 'Circled Correct Genuine Kanji', category: 'japanese_anime', lengthType: 'single', popularity: 92, tags: ['kanji', 'genuine', 'verified', 'authentic'] },
  { char: '㊗', name: 'Circled Congratulate Kanji', category: 'japanese_anime', lengthType: 'single', popularity: 93, tags: ['kanji', 'congrats', 'celebrate'] },
  { char: '㊙', name: 'Circled Secret Confidential Kanji', category: 'japanese_anime', lengthType: 'single', popularity: 92, tags: ['kanji', 'confidential', 'secret'] },
  { char: '愛', name: 'Kanji for Love (Ai)', category: 'japanese_anime', lengthType: 'single', popularity: 98, tags: ['kanji', 'love', 'japan', 'heart', 'ai'] },
  { char: '夢', name: 'Kanji for Dream (Yume)', category: 'japanese_anime', lengthType: 'single', popularity: 96, tags: ['kanji', 'dream', 'japan', 'yume'] },
  { char: '光', name: 'Kanji for Light (Hikari)', category: 'japanese_anime', lengthType: 'single', popularity: 95, tags: ['kanji', 'light', 'japan', 'hikari'] },
  { char: '星', name: 'Kanji for Star (Hoshi)', category: 'japanese_anime', lengthType: 'single', popularity: 96, tags: ['kanji', 'star', 'japan', 'hoshi'] },
  { char: '月', name: 'Kanji for Moon (Tsuki)', category: 'japanese_anime', lengthType: 'single', popularity: 96, tags: ['kanji', 'moon', 'japan', 'tsuki'] },
  { char: '桜', name: 'Kanji for Sakura Blossom', category: 'japanese_anime', lengthType: 'single', popularity: 97, tags: ['kanji', 'sakura', 'cherry', 'blossom'] },

  // ==================== MUSIC & AUDIO ====================
  { char: '♪', name: 'Eighth Note', category: 'music_media', lengthType: 'single', popularity: 99, tags: ['music', 'note', 'song', 'sound'] },
  { char: '♫', name: 'Beamed Eighth Notes', category: 'music_media', lengthType: 'single', popularity: 99, tags: ['music', 'melody', 'tune', 'notes'] },
  { char: '♬', name: 'Beamed Sixteenth Notes', category: 'music_media', lengthType: 'single', popularity: 95, tags: ['music', 'rhythm', 'fast'] },
  { char: '♭', name: 'Music Flat Sign', category: 'music_media', lengthType: 'single', popularity: 90, tags: ['music', 'flat', 'theory'] },
  { char: '♮', name: 'Music Natural Sign', category: 'music_media', lengthType: 'single', popularity: 88, tags: ['music', 'natural', 'pitch'] },
  { char: '♯', name: 'Music Sharp Sign', category: 'music_media', lengthType: 'single', popularity: 93, tags: ['music', 'sharp', 'pitch'] },
  { char: '𝄞', name: 'Musical Treble Clef G', category: 'music_media', lengthType: 'single', popularity: 97, tags: ['music', 'treble', 'clef', 'classical'] },
  { char: '𝄢', name: 'Musical Bass Clef F', category: 'music_media', lengthType: 'single', popularity: 92, tags: ['music', 'bass', 'clef'] },
  { char: '▶', name: 'Play Triangle Button', category: 'music_media', lengthType: 'single', popularity: 98, tags: ['media', 'play', 'video', 'music'] },
  { char: '⏸', name: 'Pause Double Bar', category: 'music_media', lengthType: 'single', popularity: 94, tags: ['media', 'pause', 'control'] },
  { char: '⏹', name: 'Stop Square Button', category: 'music_media', lengthType: 'single', popularity: 91, tags: ['media', 'stop', 'audio'] },
  { char: '🎧', name: 'Headphones Headset', category: 'music_media', lengthType: 'single', popularity: 98, tags: ['music', 'headphones', 'listen', 'vibes'] },
  { char: 'ılı.lıllılı.ıllı.', name: 'Equalizer Audio Waveform', category: 'music_media', lengthType: 'divider', popularity: 98, tags: ['waveform', 'equalizer', 'sound', 'bars', 'audio'] },
  { char: '0:10 ───|────── 3:45', name: 'Playback Track Bar', category: 'music_media', lengthType: 'divider', popularity: 97, tags: ['player', 'music', 'aesthetic', 'track', 'progress'] },

  // ==================== ZODIAC & ASTROLOGY ====================
  { char: '♈', name: 'Aries Ram Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'aries', 'fire', 'horoscope'] },
  { char: '♉', name: 'Taurus Bull Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'taurus', 'earth', 'horoscope'] },
  { char: '♊', name: 'Gemini Twins Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 96, tags: ['zodiac', 'gemini', 'air', 'horoscope'] },
  { char: '♋', name: 'Cancer Crab Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'cancer', 'water', 'horoscope'] },
  { char: '♌', name: 'Leo Lion Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 96, tags: ['zodiac', 'leo', 'fire', 'horoscope'] },
  { char: '♍', name: 'Virgo Maiden Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'virgo', 'earth', 'horoscope'] },
  { char: '♎', name: 'Libra Scales Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'libra', 'air', 'balance'] },
  { char: '♏', name: 'Scorpio Scorpion Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 96, tags: ['zodiac', 'scorpio', 'water', 'horoscope'] },
  { char: '♐', name: 'Sagittarius Archer Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'sagittarius', 'fire', 'horoscope'] },
  { char: '♑', name: 'Capricorn Sea-Goat Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 94, tags: ['zodiac', 'capricorn', 'earth', 'horoscope'] },
  { char: '♒', name: 'Aquarius Water-Bearer Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 95, tags: ['zodiac', 'aquarius', 'air', 'horoscope'] },
  { char: '♓', name: 'Pisces Twin Fishes Zodiac', category: 'zodiac_celestial', lengthType: 'single', popularity: 96, tags: ['zodiac', 'pisces', 'water', 'horoscope'] },

  // ==================== BRACKETS & CORNERS ====================
  { char: '【 】', name: 'Black Lenticular Brackets', category: 'brackets_decor', lengthType: 'short', popularity: 98, tags: ['brackets', 'japan', 'bold', 'quote', 'title'] },
  { char: '〖 〗', name: 'White Lenticular Brackets', category: 'brackets_decor', lengthType: 'short', popularity: 93, tags: ['brackets', 'outline', 'cute'] },
  { char: '〔 〕', name: 'Tortoise Shell Brackets', category: 'brackets_decor', lengthType: 'short', popularity: 91, tags: ['brackets', 'angle', 'clean'] },
  { char: '〘 〙', name: 'White Tortoise Shell Brackets', category: 'brackets_decor', lengthType: 'short', popularity: 89, tags: ['brackets', 'japan', 'decor'] },
  { char: '〚 〛', name: 'White Square Brackets Heavy', category: 'brackets_decor', lengthType: 'short', popularity: 90, tags: ['brackets', 'square', 'double'] },
  { char: '「 」', name: 'Corner Quotation Marks', category: 'brackets_decor', lengthType: 'short', popularity: 97, tags: ['quotes', 'corner', 'japan', 'manga'] },
  { char: '『 』', name: 'White Corner Double Quotes', category: 'brackets_decor', lengthType: 'short', popularity: 96, tags: ['quotes', 'double', 'japan', 'title'] },
  { char: '《 》', name: 'Double Angle Guillemet Quotes', category: 'brackets_decor', lengthType: 'short', popularity: 95, tags: ['quotes', 'book', 'title', 'angle'] },
  { char: '〈 〉', name: 'Single Angle Guillemet Quotes', category: 'brackets_decor', lengthType: 'short', popularity: 93, tags: ['quotes', 'angle', 'math'] },
  { char: '« »', name: 'Left-Right Pointing Guillemets', category: 'brackets_decor', lengthType: 'short', popularity: 94, tags: ['quotes', 'french', 'guillemets'] }
];

// Unicode Font Transformation Maps
const CHAR_MAPS: Record<string, { upper: string[]; lower: string[]; digits?: string[] }> = {
  bold: {
    upper: ['𝗔','𝗕','𝗖','𝗗','𝗘','𝗙','𝗚','𝗛','𝗜','𝗝','𝗞','𝗟','𝗠','𝗡','𝗢','𝗣','𝗤','𝗥','𝗦','𝗧','𝗨','𝗩','𝗪','𝗫','𝗬','𝗭'],
    lower: ['𝗮','𝗯','𝗰','𝗱','𝗲','𝗳','𝗴','𝗵','𝗶','𝗷','𝗸','𝗹','𝗺','𝗻','𝗼','𝗽','𝗾','𝗿','𝘀','𝘁','𝘂','𝘃','𝘄','𝘅','𝘆','𝘇'],
    digits: ['𝟬','𝟭','𝟮','𝟯','𝟰','𝟱','𝟲','𝟳','𝟴','𝟵']
  },
  italic: {
    upper: ['𝘈','𝘉','𝘊','𝘋','𝘌','𝘍','𝘎','𝘏','𝘐','𝘑','𝘒','𝘓','𝘔','𝘕','𝘖','𝘗','𝘘','𝘙','𝘚','𝘛','𝘜','𝘝','𝘞','𝘟','𝘠','𝘡'],
    lower: ['𝘢','𝘣','𝘤','𝘥','𝘦','ｆ','ｇ','ｈ','ｉ','ｊ','ｋ','ｌ','ｍ','ｎ','ｏ','ｐ','𝘲','ｒ','ｓ','ｔ','ｕ','ｖ','ｗ','ｘ','ｙ','ｚ']
  },
  boldItalic: {
    upper: ['𝘼','𝘽','𝘾','𝘿','𝙀','𝙁','𝙂','𝙃','𝙄','𝙅','𝙆','𝙇','𝙈','𝙉','𝙊','𝙋','𝙌','𝙍','𝙎','𝙏','𝙐','𝙑','𝙒','𝙓','𝙔','𝙕'],
    lower: ['𝙖','𝙗','𝙘','𝙙','𝙚','𝙛','𝙜','𝙝','𝙞','𝙟','𝙠','ｌ','𝙢','ｎ','𝙤','𝙥','𝙦','𝙧','𝙨','𝙩','𝙪','𝙫','𝙬','𝙭','𝙮','𝙯']
  },
  script: {
    upper: ['𝒜','ℬ','𝒞','𝒟','ℰ','ℱ','𝒢','ℋ','ℐ','𝒥','𝒦','ℒ','ℳ','𝒩','𝒪','𝒫','𝒬','ℛ','𝒮','𝒯','𝒰','𝒱','𝒲','𝒳','𝒴','𝒵'],
    lower: ['𝒶','𝒷','𝒸','𝒹','ℯ','𝒻','ℊ','𝒽','𝒾','𝒿','𝓀','𝓁','𝓂','𝓃','ℴ','𝓅','𝓆','𝓇','𝓈','𝓉','𝓊','𝓋','𝓌','𝓍','𝓎','𝓏']
  },
  boldScript: {
    upper: ['𝓐','𝓑','𝓒','𝓓','𝓔','𝓕','𝓖','𝓗','𝓘','𝓙','𝓚','𝓛','𝓜','𝓝','𝓞','𝓟','𝓠','𝓡','𝓢','𝓣','𝓤','𝓥','𝓦','𝓧','𝓨','𝓩'],
    lower: ['𝓪','𝓫','𝓬','𝓭','𝓮','𝓯','𝓰','𝓱','𝓲','𝓳','𝓀','𝓁','𝓂','𝓃','𝓸','𝓹','𝓺','𝓻','𝓼','𝓽','𝓾','𝓿','𝔀','𝔁','𝔂','𝔃']
  },
  fraktur: {
    upper: ['𝔄','𝔅','ℭ','𝔇','𝔈','𝔉','𝔊','ℌ','ℑ','𝔍','𝔎','𝔏','𝔐','𝔑','𝔒','𝔓','𝔔','ℜ','𝔖','𝔗','𝔘','𝔙','𝔚','𝔛','𝔜','ℨ'],
    lower: ['𝔞','𝔟','𝔠','𝔡','𝔢','𝔣','𝔤','𝔥','𝔦','𝔧','𝔨','𝔩','𝔪','𝖓','𝔬','','𝔮','𝔯','𝔰','𝔱','𝔲','𝔳','𝔴','𝔵','𝔶','𝔷']
  },
  boldFraktur: {
    upper: ['𝕬','𝕭','𝕮','𝕯','𝕰','𝕱','𝕲','𝕳','𝕴','𝕵','𝕶','𝕷','𝕸','𝕹','𝕺','𝕻','𝕼','𝕽','𝕾','𝕿','𝖀','𝖁','𝖂','𝖃','𝖄','𝖅'],
    lower: ['𝖆','𝖇','𝖈','𝖉','𝖊','𝖋','𝖌','𝖍','𝖎','𝖏','𝖐','𝖑','𝖒','𝖓','𝖔','𝖕','𝖖','𝖗','𝖘','𝖙','𝖚','𝖛','𝖜','𝖝','𝖞','𝖟']
  },
  doubleStruck: {
    upper: ['𝔸','𝔹','ℂ','𝔻','𝔼','𝔽','𝔾','ℍ','𝕀','𝕁','𝕂','𝕃','𝕄','ℕ','𝕆','ℙ','ℚ','ℝ','𝕊','𝕋','𝕌','𝕍','𝕎','𝕏','𝕐','ℤ'],
    lower: ['𝕒','𝕓','𝕔','𝕕','𝕖','𝕗','𝕘','𝕙','𝕚','𝕛','𝕜','𝕝','𝕞','𝕟','𝕠','𝕡','𝕢','𝕣','𝕤','𝕥','𝕦','𝕧','𝕨','𝕩','𝕪','𝕫'],
    digits: ['𝟘','𝟙','𝟚','𝟛','𝟜','𝟝','𝟞','𝟟','𝟠','𝟡']
  },
  monospace: {
    upper: ['𝙰','𝙱','𝙲','𝙳','𝙴','𝙵','𝙶','𝙷','𝙸','𝙹','𝙺','𝙻','𝙼','𝙽','𝙾','𝙿','𝚀','𝚁','𝚂','𝚃','𝚄','𝚅','𝚆','𝚇','𝚈','𝚉'],
    lower: ['𝚊','𝚋','𝚌','𝚍','𝚎','𝚏','𝚐','𝚑','𝚒','𝚓','𝚔','ｌ','ｍ','ｎ','𝚘','𝚙','𝚚','𝚛','𝚜','𝚝','𝚞','𝚟','𝚠','𝚡','𝚢','𝚣'],
    digits: ['𝟶','𝟷','𝟸','𝟹','𝟺','𝟻','𝟼','𝟽','𝟾','𝟿']
  },
  smallCaps: {
    upper: ['ᴀ','ʙ','ᴄ','ᴅ','ᴇ','ꜰ','ɢ','ʜ','ɪ','ᴊ','ᴋ','ʟ','ᴍ','ɴ','ᴏ','ᴘ','ǫ','ʀ','s','ᴛ','ᴜ','ᴠ','ᴡ','x','ʏ','ᴢ'],
    lower: ['ᴀ','ʙ','ᴄ','ᴅ','ᴇ','ꜰ','ɢ','ʜ','ɪ','ᴊ','ᴋ','ʟ','ᴍ','ɴ','ᴏ','ᴘ','ǫ','ʀ','s','ᴛ','ᴜ','ᴠ','ᴡ','x','ʏ','ᴢ']
  },
  circled: {
    upper: ['Ⓐ','Ⓑ','Ⓒ','Ⓓ','Ⓔ','Ⓕ','Ⓖ','Ⓗ','Ⓘ','Ⓙ','Ⓚ','Ⓛ','Ⓜ','Ⓝ','Ⓞ','Ⓟ','Ⓠ','Ⓡ','Ⓢ','Ⓣ','Ⓤ','Ⓥ','Ⓦ','Ⓧ','Ⓨ','Ⓩ'],
    lower: ['ⓐ','ⓑ','ⓒ','ⓓ','ⓔ','ⓕ','ⓖ','ⓗ','ⓘ','ⓙ','ⓚ','ⓛ','ⓜ','ⓝ','ⓞ','ⓟ','ⓠ','ⓡ','ⓢ','ⓣ','ⓤ','ⓥ','ⓦ','ⓧ','ⓨ','ⓩ'],
    digits: ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨']
  },
  circledInverted: {
    upper: ['🅐','🅑','🅒','🅓','🅔','🅕','🅖','🅗','🅘','🅙','🅚','🅛','🅜','🅝','🅞','🅟','🅠','🅡','🅢','🅣','🅤','🅥','🅦','🅧','🅨','🅩'],
    lower: ['🅐','🅑','🅒','🅓','🅔','🅕','🅖','🅗','🅘','🅙','🅚','🅛','🅜','🅝','🅞','🅟','🅠','🅡','🅢','🅣','🅤','🅥','🅦','🅧','🅨','🅩'],
    digits: ['⓿','❶','❷','❸','❹','❺','❻','❼','❽','❾']
  },
  squared: {
    upper: ['🄰','🄱','🄲','🄳','🄴','🄵','🄶','🄷','🄸','🄹','🄺','🄻','🄼','🄽','🄾','🄿','🅀','🅁','🅂','🅃','🅄','🅅','🅆','🅇','🅈','🅉'],
    lower: ['🄰','🄱','🄲','🄳','🄴','🄵','🄶','🄷','🄸','🄹','🄺','🄻','🄼','🄽','🄾','🄿','🅀','🅁','🅂','🅃','🅄','🅅','🅆','🅇','🅈','🅉']
  },
  squaredInverted: {
    upper: ['🅰','🅱','🅲','🅳','🅴','🅵','🅶','🅷','🅸','🅹','🅺','🅻','🅼','🅽','🅾','🅿','🆀','🆁','🆂','🆃','🆄','🆅','🆆','🆇','🆈','🆉'],
    lower: ['🅰','🅱','🅲','🅳','🅴','🅵','🅶','🅷','🅸','🅹','🅺','🅻','🅼','🅽','🅾','🅿','🆀','🆁','🆂','🆃','🆄','🆅','🆆','🆇','🆈','🆉']
  },
  fullwidth: {
    upper: ['Ａ','Ｂ','Ｃ','Ｄ','Ｅ','Ｆ','Ｇ','Ｈ','Ｉ','Ｊ','Ｋ','Ｌ','Ｍ','Ｎ','Ｏ','Ｐ','Ｑ','Ｒ','Ｓ','Ｔ','Ｕ','Ｖ','Ｗ','Ｘ','Ｙ','Ｚ'],
    lower: ['ａ','ｂ','ｃ','ｄ','ｅ','ｆ','ｇ','ｈ','ｉ','ｊ','ｋ','ｌ','ｍ','ｎ','ｏ','ｐ','ｑ','ｒ','ｓ','ｔ','ｕ','ｖ','ｗ','ｘ','ｙ','ｚ'],
    digits: ['０','１','２','３','４','５','６','７','８','９']
  }
};

const FLIP_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l',
  m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
  y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ', K: 'ʞ', L: '˥',
  M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ծ', R: 'ɹ', S: 'S', T: '┴', U: '∩', V: 'Λ', W: 'M', X: 'X',
  Y: '⅄', Z: 'Z',
  '1': '⇂', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
  '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡', '?': '¿', '<': '>', '>': '<', '(': ')', ')': '(',
  '[': ']', ']': '[', '{': '}', '}': '{', '_': '‾'
};

export interface FontStyleOption {
  id: string;
  name: string;
  category: string;
  transform: (text: string) => string;
}

export function transformWithMap(text: string, mapKey: string): string {
  const map = CHAR_MAPS[mapKey];
  if (!map) return text;

  return text.split('').map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90 && map.upper[code - 65]) {
      return map.upper[code - 65];
    }
    if (code >= 97 && code <= 122 && map.lower[code - 97]) {
      return map.lower[code - 97];
    }
    if (code >= 48 && code <= 57 && map.digits && map.digits[code - 48]) {
      return map.digits[code - 48];
    }
    return ch;
  }).join('');
}

export function transformFlip(text: string): string {
  return text.split('').reverse().map(ch => FLIP_MAP[ch] || ch).join('');
}

export function transformCombining(text: string, combiningChar: string): string {
  return text.split('').map(ch => ch === ' ' ? ' ' : ch + combiningChar).join('');
}

export function generateZalgo(text: string, intensity: number = 3): string {
  const zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351'];
  const zalgoMid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328'];
  const zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325'];

  return text.split('').map(ch => {
    if (ch === ' ') return ch;
    let res = ch;
    for (let i = 0; i < intensity; i++) {
      res += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
      res += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
      res += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
    }
    return res;
  }).join('');
}

export const FONT_STYLES: FontStyleOption[] = [
  { id: 'bold', name: 'Mathematical Bold', category: 'Modern', transform: (t) => transformWithMap(t, 'bold') },
  { id: 'italic', name: 'Mathematical Italic', category: 'Modern', transform: (t) => transformWithMap(t, 'italic') },
  { id: 'boldItalic', name: 'Bold Italic', category: 'Modern', transform: (t) => transformWithMap(t, 'boldItalic') },
  { id: 'script', name: 'Cursive / Script', category: 'Aesthetic', transform: (t) => transformWithMap(t, 'script') },
  { id: 'boldScript', name: 'Bold Calligraphy', category: 'Aesthetic', transform: (t) => transformWithMap(t, 'boldScript') },
  { id: 'fraktur', name: 'Gothic / Fraktur', category: 'Dark', transform: (t) => transformWithMap(t, 'fraktur') },
  { id: 'boldFraktur', name: 'Bold Gothic Fraktur', category: 'Dark', transform: (t) => transformWithMap(t, 'boldFraktur') },
  { id: 'doubleStruck', name: 'Blackboard / Double Struck', category: 'Modern', transform: (t) => transformWithMap(t, 'doubleStruck') },
  { id: 'monospace', name: 'Monospace Code', category: 'Tech', transform: (t) => transformWithMap(t, 'monospace') },
  { id: 'smallCaps', name: 'Small Capitals', category: 'Modern', transform: (t) => transformWithMap(t, 'smallCaps') },
  { id: 'circled', name: 'Bubble / Circled', category: 'Aesthetic', transform: (t) => transformWithMap(t, 'circled') },
  { id: 'circledInverted', name: 'Negative Circled Bubble', category: 'Dark', transform: (t) => transformWithMap(t, 'circledInverted') },
  { id: 'squared', name: 'Squared Letters', category: 'Modern', transform: (t) => transformWithMap(t, 'squared') },
  { id: 'squaredInverted', name: 'Negative Squared Box', category: 'Dark', transform: (t) => transformWithMap(t, 'squaredInverted') },
  { id: 'fullwidth', name: 'Vaporwave / Fullwidth', category: 'Aesthetic', transform: (t) => transformWithMap(t, 'fullwidth') },
  { id: 'flip', name: 'Upside Down / Flipped', category: 'Playful', transform: (t) => transformFlip(t) },
  { id: 'strikethrough', name: 'Strikethrough', category: 'Decor', transform: (t) => transformCombining(t, '\u0336') },
  { id: 'underline', name: 'Underline Continuous', category: 'Decor', transform: (t) => transformCombining(t, '\u0332') },
  { id: 'slashthrough', name: 'Slash-Through', category: 'Decor', transform: (t) => transformCombining(t, '\u0338') },
  { id: 'dotted', name: 'Dotted Above', category: 'Decor', transform: (t) => transformCombining(t, '\u0307') },
  { id: 'waveUnderline', name: 'Wave Underline', category: 'Decor', transform: (t) => transformCombining(t, '\u0330') },
  { id: 'zalgo', name: 'Glitch / Zalgo Chaos', category: 'Dark', transform: (t) => generateZalgo(t, 2) }
];

// Profile Bio Templates
export interface BioTemplate {
  title: string;
  platform: 'Instagram' | 'Discord' | 'TikTok' | 'Steam' | 'Twitter';
  template: string;
}

export const BIO_TEMPLATES: BioTemplate[] = [
  {
    title: 'Aesthetic Celestial Haven',
    platform: 'Instagram',
    template: `✧･ﾟ: *✧･ﾟ:* [YOUR NAME] *:･ﾟ✧*:･ﾟ✧\n⋆⁺₊⋆ ☾ ⋆⁺₊⋆ [YOUR TITLE / ARTIST]\n─── ⋆⋅☆⋅⋆ ───\nᶻ 𝗓 𐰁 Creating digital art & dreams\n📍 [LOCATION] ✧ [LINK]`
  },
  {
    title: 'Cyber Developer Terminal',
    platform: 'Discord',
    template: `⚡ [SYSTEM: ONLINE]\n⌬ Senior Software Architect ⌬\n⟦ Typescript ⨂ Rust ⨂ AI ⟧\n⎔ Building Aegis Software Productions\n🔗 https://aegishub.dev`
  },
  {
    title: 'Coquette Soft Ribbon',
    platform: 'TikTok',
    template: `୨ৎ [NAME] ୨ৎ\n₊˚⊹♡ soft girl era & coffee ☕\n˚₊· ͟͟͞͞➳❥ [PRONOUNS] ✧ [ZODIAC]\n˗ˏˋ love lives here ˎˊ˗\n💌 dm for collabs`
  },
  {
    title: 'Gothic Dark Monarch',
    platform: 'Steam',
    template: `༺ ༒ ༻ 𝕯𝖆𝖗𝖐 𝕬𝖗𝖈𝖍𝖎𝖙𝖊𝖈𝖙 ༺ ༒ ༻\n𓆩♡𓆪 Code • Gothic UI • Synthwave\n═════════════════\n⚔(•̀ᴗ•́)و Ready for the arena`
  }
];

// AdSense Compliance FAQs
export interface FAQItem {
  question: string;
  answer: string;
}

export const ADSENSE_FAQS: FAQItem[] = [
  {
    question: 'How do I copy symbols and kaomoji to my clipboard?',
    answer: 'Simply click on any symbol or kaomoji card across the platform. The character will instantly be copied to your system clipboard and added to your interactive Collector Forge tray at the bottom of the screen.'
  },
  {
    question: 'Are these Unicode symbols supported across all platforms?',
    answer: 'Yes! All symbols and fonts generated in GlyphCraft Studio are standard Unicode characters (UTF-8/UTF-16) supported natively across iOS, Android, macOS, Windows, Linux, Instagram, Discord, TikTok, WhatsApp, and Twitter.'
  },
  {
    question: 'Can I combine multiple symbols and generate custom aesthetic bios?',
    answer: 'Yes. When you click symbols, they collect inside the floating tray where you can type your own text, apply decorators, reverse, space out, uppercase, or export as a downloadable image card or QR code.'
  },
  {
    question: 'Is GlyphCraft Studio completely free to use?',
    answer: 'Yes, GlyphCraft Studio is 100% free with zero downloads or subscriptions required. It runs client-side in your browser with offline persistence support.'
  }
];
