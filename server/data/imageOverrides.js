const characterImages = {
  david: {
    figure_image_url: '/Img/david-collector-gift-box.png',
    lid_image_url: '/Img/david-and-goliath-character-story.png',
    box_image_url: '/Img/david-collector-gift-box.png',
  },
  noah: {
    figure_image_url: '/Img/noah-unboxing-gift-box.png',
    lid_image_url: '/Img/noah-unboxing-gift-box.png',
    box_image_url: '/Img/noah-unboxing-gift-box.png',
  },
  moses: {
    figure_image_url: '/Img/moses-collector-gift-box.png',
    lid_image_url: '/Img/moses-collector-gift-box.png',
    box_image_url: '/Img/moses-collector-gift-box.png',
  },
  mary: {
    box_image_url: '/Img/cross-keychain-signature-item.png',
  },
};

function withCharacterImageOverrides(character = {}) {
  const key = String(character.name || '').toLowerCase();
  return { ...character, ...(characterImages[key] || {}) };
}

function withProductImageOverrides(product = {}) {
  if (!product.characters) return product;
  return { ...product, characters: withCharacterImageOverrides(product.characters) };
}

module.exports = {
  withCharacterImageOverrides,
  withProductImageOverrides,
};
