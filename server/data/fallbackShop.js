const now = new Date().toISOString();
const img = path => `/Img/${path}`;

const characters = [
  {
    id: 'david',
    name: 'David',
    story_title: 'The Shepherd King',
    bible_reference: '1 Samuel 17',
    scripture_quote: 'The battle is the Lord\'s.',
    tagline: 'Courage rooted in faith.',
    description: 'David reminds children that faith, courage, and worship can stand tall even against impossible odds.',
    lid_image_url: img('david-and-goliath-character-story.png'),
    figure_image_url: img('david-collector-gift-box.png'),
    box_image_url: img('david-collector-gift-box.png'),
    model_3d_url: '',
    is_published: true,
    created_at: now,
  },
  {
    id: 'noah',
    name: 'Noah',
    story_title: 'The Faithful Builder',
    bible_reference: 'Genesis 6-9',
    scripture_quote: 'Noah did everything just as God commanded him.',
    tagline: 'Obedience when it matters.',
    description: 'Noah teaches steady obedience, patience, and trust in God through a story children remember.',
    lid_image_url: img('noah-unboxing-gift-box.png'),
    figure_image_url: img('noah-unboxing-gift-box.png'),
    box_image_url: img('noah-unboxing-gift-box.png'),
    model_3d_url: '',
    is_published: true,
    created_at: now,
  },
  {
    id: 'moses',
    name: 'Moses',
    story_title: 'The Deliverer',
    bible_reference: 'Exodus 14',
    scripture_quote: 'The Lord will fight for you.',
    tagline: 'Leadership through trust.',
    description: 'Moses helps children see that God can use ordinary people to lead, serve, and bring freedom.',
    lid_image_url: img('moses-collector-gift-box.png'),
    figure_image_url: img('moses-collector-gift-box.png'),
    box_image_url: img('moses-collector-gift-box.png'),
    model_3d_url: '',
    is_published: true,
    created_at: now,
  },
];

const products = characters.map((character, index) => ({
  id: `${character.id}-gift-box`,
  character_id: character.id,
  name: `${character.name} Collector Gift Box`,
  price: [34.99, 32.99, 36.99][index],
  currency: 'GBP',
  stock_qty: 25,
  includes: ['3D figure', 'bookmark', 'keychain', 'story card', 'voice card'],
  is_customisable: true,
  is_active: true,
  created_at: now,
  characters: character,
}));

const charactersWithProducts = characters.map(character => ({
  ...character,
  products: products.filter(product => product.character_id === character.id),
}));

module.exports = {
  characters,
  charactersWithProducts,
  products,
};
