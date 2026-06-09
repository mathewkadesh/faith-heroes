export const signatureEmoji = {
  'eden-tree': '🌳',
  'garden-base': '🌸',
  'forbidden-apple': '🍎',
  'leaf-garment': '🍃',
  'the-serpent': '🐍',
  'rainbow-bookmark': '🌈',
  'mini-ark': '🚢',
  'dove-olive': '🕊️',
  'burning-bush': '🔥',
  'stone-tablets': '📜',
  'parted-sea-base': '🌊',
  'five-smooth-stones': '🪨',
  'shepherds-sling': '🎯',
  'anointing-crown': '👑',
  'royal-sceptre': '⚜️',
  'crown-robe': '👘',
  'banquet-table': '🍽️',
  'coat-bookmark': '🎨',
  'dream-scroll': '✨',
  'signet-ring': '💍',
  'mini-lion': '🦁',
  'prayer-window': '🪟',
  'fiery-furnace': '🔥',
  'wheat-sheaf': '🌾',
  'redeemer-scroll': '📜',
  'threshing-floor': '🌻',
  'great-fish': '🐋',
  'runaway-ship': '⛵',
  'nineveh-gate': '🏛️',
  'flame-keychain': '🕯️',
  'still-small-voice': '🪨',
  'chariot-of-fire': '🔥',
  'olive-wood-cross': '✝️',
  'baby-manger': '⭐',
  'bethlehem-star': '⭐',
  'fishing-net': '🎣',
  'water-walking-base': '🌊',
  'church-keys': '🗝️',
  'papyrus-scroll': '📜',
  'damascus-lightning': '⚡',
  'prison-chains': '⛓️',
};

export function emojiForSignatureItem(item) {
  return signatureEmoji[item?.slug] || '👑';
}

export function humaniseSlug(value) {
  if (!value) return '';
  if (value === 'figure') return 'Character Figure';
  return String(value).split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
