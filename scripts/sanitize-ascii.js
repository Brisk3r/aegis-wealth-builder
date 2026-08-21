// Aegis Hub - Codebase 7-bit ASCII & Zero-Mojibake Sanitizer
// Strictly normalizes Unicode emojis, typographic dashes, and curly quotes to 7-bit ASCII.

const fs = require('fs');
const path = require('path');

const replacements = [
  // Multi-char emojis / compound
  [/\uD83C\uDDE6\uD83C\uDDFA/g, '[AU]'],
  [/\uD83C\uDDFA\uD83C\uDDF8/g, '[US]'],
  [/\uD83C\uDDEC\uD83C\uDDE7/g, '[GB]'],
  [/\uD83C\uDDE8\uD83C\uDDE6/g, '[CA]'],
  [/\uD83C\uDDE9\uD83C\uDDEA/g, '[DE]'],
  [/\uD83C\uDDEB\uD83C\uDDF7/g, '[FR]'],
  [/\uD83C\uDDEF\uD83C\uDDF5/g, '[JP]'],
  [/\uD83C\uDDE7\uD83C\uDDF7/g, '[BR]'],
  [/\uD83C\uDDEA\uD83C\uDDFA/g, '[EU]'],
  [/\u26A0\uFE0F?/g, '[!]'],
  [/\u2139\uFE0F?/g, '[i]'],
  [/\u2699\uFE0F?/g, '[*]'],
  [/\uD83D\uDD12/g, '[LOCK]'],
  [/\uD83D\uDD13/g, '[UNLOCK]'],
  [/\uD83D\uDC75/g, '[SENIOR]'],
  [/\uD83D\uDC15/g, '[PET]'],
  [/\uD83C\uDF92/g, '[CHILD]'],
  [/\uD83E\uDE79/g, '[RECOVERY]'],
  [/\uD83D\uDCA9/g, '[BM]'],
  [/\uD83C\uDF10/g, '[GLOBAL]'],
  [/\uD83D\uDEE1\uFE0F?/g, '[AEGIS]'],
  [/\uD83C\uDFC6/g, '[TOP]'],
  [/\uD83C\uDF81/g, '[GIFT]'],
  [/\uD83D\uDE80/g, '[>]'],
  [/\uD83D\uDC8E/g, '[CRYSTAL]'],
  [/\u23F1\uFE0F?/g, '[TIME]'],
  [/\uD83C\uDFAE/g, '[GAME]'],
  [/\uD83D\uDFE3/g, '[GOG]'],
  [/\u26A1/g, '[EPIC]'],
  [/\uD83D\uDCE6/g, '[BOX]'],
  [/\uD83D\uDD25/g, '[HOT]'],
  [/\uD83D\uDD34/g, '[LIVE]'],
  [/\uD83D\uDFE2/g, '[ACTIVE]'],
  [/\uD83D\uDCBB/g, '[PC]'],
  [/\uD83D\uDCDC/g, '[RPS]'],
  [/\uD83C\uDFAF/g, '[TARGET]'],
  [/\uD83C\uDFF7\uFE0F?/g, '[TAG]'],
  [/\uD83D\uDD0D/g, '[FIND]'],
  [/\uD83D\uDD2C/g, '[ANALYSIS]'],
  [/\uD83D\uDCB0/g, '[$]'],
  [/\uD83D\uDCCA/g, '[CHART]'],
  [/\uD83D\uDD27/g, '[TOOL]'],
  [/\uD83D\uDCC8/g, '[UP]'],
  [/\uD83D\uDCC9/g, '[DOWN]'],
  [/\u2728/g, '*'],
  [/\u2B50/g, '*'],
  [/\u2605/g, '*'],
  [/\u2606/g, '*'],
  [/\uD83C\uDF89/g, '[CELEBRATE]'],
  [/\uD83D\uDCA1/g, '[INFO]'],
  [/\uD83D\uDCAC/g, '[MSG]'],
  [/\uD83D\uDD14/g, '[ALERT]'],
  [/\uD83D\uDC51/g, '[CROWN]'],
  [/\uD83C\uDFB2/g, '[DICE]'],
  [/\uD83D\uDD79\uFE0F?/g, '[JOYSTICK]'],
  [/\uD83E\uDE90/g, '[ORBIT]'],
  [/\uD83C\uDF20/g, '*'],
  [/\uD83C\uDF0C/g, '[GALAXY]'],
  [/\uD83C\uDFB5/g, '[NOTE]'],
  [/\uD83C\uDFB6/g, '[MUSIC]'],
  [/\uD83D\uDD0A/g, '[AUDIO]'],
  [/\uD83D\uDD07/g, '[MUTE]'],
  [/\u23F8\uFE0F?/g, '[PAUSE]'],
  [/\u23F9\uFE0F?/g, '[STOP]'],
  [/\uD83D\uDD04/g, '[SYNC]'],
  [/\u2705/g, '[OK]'],
  [/\u274C/g, '[X]'],
  [/\uD83D\uDEA8/g, '[ALERT]'],
  // Typographic chars
  [/\u2013/g, '--'],
  [/\u2014/g, '--'],
  [/\u2018/g, "'"],
  [/\u2019/g, "'"],
  [/\u201C/g, '"'],
  [/\u201D/g, '"'],
  [/\u2022/g, '*'],
  [/\u2026/g, '...'],
  [/\u2122/g, '(TM)'],
  [/\u00AE/g, '(R)'],
  [/\u00A9/g, '(C)'],
  [/\u00B0/g, ' deg'],
  [/\u00B2/g, '^2'],
  [/\u00B3/g, '^3'],
  [/\u00F6/g, 'o'],
  [/\u00F8/g, 'o'],
  [/\u00E9/g, 'e'],
  [/\u00FC/g, 'u'],
  [/\u00E1/g, 'a'],
  [/\u00ED/g, 'i'],
  [/\u00F3/g, 'o'],
  [/\u2713/g, '[OK]'],
  [/\u2714/g, '[OK]'],
  [/\u2715/g, '[X]'],
  [/\u2716/g, '[X]'],
  [/\u25B2/g, '^'],
  [/\u25BC/g, 'v'],
  [/\u25C0/g, '<'],
  [/\u25B6/g, '>'],
  [/\u25C6/g, '*'],
  [/\u25A0/g, '*'],
  [/\u25CF/g, '*'],
  [/\u20AC/g, 'EUR'],
  [/\u00A3/g, 'GBP'],
  [/\u00A5/g, 'JPY'],
];

function sanitizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  // Remove or replace any remaining non-ASCII character
  let clean = '';
  let fallbackCount = 0;
  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    if (code > 127) {
      clean += '*';
      fallbackCount++;
    } else {
      clean += content[i];
    }
  }
  if (clean !== original) {
    fs.writeFileSync(filePath, clean, 'utf8');
    console.log('Sanitized: ' + path.relative('.', filePath) + (fallbackCount > 0 ? ' [fallback count: ' + fallbackCount + ']' : ''));
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git' && entry.name !== '.agents') {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?|mjs|json|css)$/.test(entry.name)) {
      sanitizeFile(fullPath);
    }
  }
}

console.log('Starting 7-bit ASCII sanitization pass across src/, scripts/, tests/ ...');
walkDir(path.resolve('src'));
walkDir(path.resolve('scripts'));
walkDir(path.resolve('tests'));
console.log('Sanitization complete.');
