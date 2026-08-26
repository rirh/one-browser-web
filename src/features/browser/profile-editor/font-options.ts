export const additionalFontOptions = [
  '-apple-system',
  'Academy Engraved LET',
  'Adobe Devanagari',
  'Agency FB',
  'Algerian',
  'Apple Braille Outline 6 Dot',
  'Apple Braille Pinpoint 6 Dot',
  'Apple Braille',
  'Apple Color Emoji',
  'Apple SD Gothic Neo',
  'Apple Symbols',
  'Arial',
  'Arial Black',
  'Arial Hebrew',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Avenir',
  'Avenir Next',
  'Avenir Next Condensed',
  'Baskerville',
  'Big Caslon',
  'Bodoni 72',
  'Bodoni 72 Smallcaps',
  'Bodoni 72 Oldstyle',
  'Bradley Hand',
  'Brush Script MT',
  'Calibri',
  'Cambria',
  'Candara',
  'Chalkboard',
  'Chalkboard SE',
  'Chalkduster',
  'Charter',
  'Cochin',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Copperplate',
  'Courier',
  'Courier New',
  'Damascus',
  'Devanagari Sangam MN',
  'Didot',
  'DIN Alternate',
  'DIN Condensed',
  'Euphemia UCAS',
  'Futura',
  'Geneva',
  'Georgia',
  'Gill Sans',
  'Helvetica',
  'Helvetica Neue',
  'Herculanum',
  'Hoefler Text',
  'Impact',
  'InaiMathi',
  'Kannada Sangam MN',
  'Kefa',
  'Khmer Sangam MN',
  'Kohinoor Bangla',
  'Kohinoor Devanagari',
  'Kohinoor Gujarati',
  'Kohinoor Telugu',
  'Lao Sangam MN',
  'Lucida Grande',
  'Luminari',
  'Marker Felt',
  'Menlo',
  'Microsoft Sans Serif',
  'Monaco',
  'Myanmar Sangam MN',
  'Noto Nastaliq Urdu',
  'Optima',
  'Palatino',
  'Papyrus',
  'Phosphate',
  'PingFang HK',
  'PingFang SC',
  'PingFang TC',
  'Rockwell',
  'Savoye LET',
  'SignPainter',
  'Silom',
  'Sinhala Sangam MN',
  'Snell Roundhand',
  'Songti SC',
  'STIX Two Math',
  'Symbol',
  'Tahoma',
  'Times',
  'Times New Roman',
  'Trattatello',
  'Trebuchet MS',
  'Verdana',
  'Zapfino',
] as const;

export const defaultAdditionalFontsValue = serializeFontList(
  additionalFontOptions,
);

export function parseFontList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeFontList(fonts: readonly string[]) {
  return fonts.join(', ');
}

export function systemFontsLabel(system: string) {
  if (/win/i.test(system)) {
    return 'Windows';
  }

  if (/mac|darwin|apple/i.test(system)) {
    return 'macOS';
  }

  if (/linux/i.test(system)) {
    return 'Linux';
  }

  return system.trim() || '系统字体';
}
