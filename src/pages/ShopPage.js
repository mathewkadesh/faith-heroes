import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, ChevronRight, Crown, Eye, Search, ShoppingCart } from 'lucide-react';
import { characterAPI, productAPI } from '../lib/api';
import { assetUrl } from '../lib/assets';
import { useCart } from '../context/CartContext';
import ThreeViewerModal from '../components/ThreeViewerModal';

const oldTestament = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 'Samuel', 'Kings', 'Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
const newTestament = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'Jude', 'Revelation'];

function WordsPullUp({ text, className = '' }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, index) => (
        <motion.span key={`${word}-${index}`} className="mr-[0.18em] inline-block" initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.78, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function CrossWatermark() {
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-[#FDF5F0] opacity-[0.025]" aria-hidden="true">
      <path fill="currentColor" d="M86 20h28v54h46v28h-46v78H86v-78H40V74h46V20Z" />
    </svg>
  );
}

function productFromCharacter(character) {
  return {
    id: `preview-${character.id}`,
    character_id: character.id,
    name: `${character.name} Collector Gift Box`,
    price: 24.99,
    currency: 'GBP',
    stock_qty: 0,
    is_preview: true,
    created_at: character.created_at,
    characters: character,
  };
}

function getCharacter(product) {
  return product.characters || product.character || {};
}

function isOldTestament(ref = '') {
  return oldTestament.some(book => ref.toLowerCase().includes(book.toLowerCase()));
}

function isNewTestament(ref = '') {
  return newTestament.some(book => ref.toLowerCase().includes(book.toLowerCase()));
}

function applyFilter(product, filter) {
  const character = getCharacter(product);
  if (filter === 'Old Testament') return isOldTestament(character.bible_reference);
  if (filter === 'New Testament') return isNewTestament(character.bible_reference);
  if (filter === 'For Children') return true;
  if (filter === 'In Stock') return Number(product.stock_qty || 0) > 0 && !product.is_preview;
  return true;
}

function sortProducts(a, b, sortBy) {
  if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
  if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
  if (sortBy === 'name_asc') return (getCharacter(a).name || a.name || '').localeCompare(getCharacter(b).name || b.name || '');
  if (sortBy === 'bestseller') return Number(b.stock_qty || 0) - Number(a.stock_qty || 0);
  return new Date(b.created_at || 0) - new Date(a.created_at || 0);
}

export default function ShopPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [previewCharacter, setPreviewCharacter] = useState(null);
  const [addedId, setAddedId] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Shop - Faith Heroes';
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      const [productsResponse, charactersResponse] = await Promise.all([
        productAPI.getAll(),
        characterAPI.getAll(),
      ]);
      const activeProducts = productsResponse.data || [];
      const productCharacterIds = new Set(activeProducts.map(product => product.character_id).filter(Boolean));
      const previews = (charactersResponse.data || [])
        .filter(character => !productCharacterIds.has(character.id))
        .map(productFromCharacter);
      setProducts([...activeProducts, ...previews]);
    } catch (err) {
      console.error('Failed to load shop:', err);
      setError('Could not load products');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return products
      .filter(product => {
        const character = getCharacter(product);
        const haystack = `${character.name || ''} ${product.name || ''}`.toLowerCase();
        return searchQuery ? haystack.includes(searchQuery.toLowerCase()) : true;
      })
      .filter(product => activeFilter === 'All' ? true : applyFilter(product, activeFilter))
      .sort((a, b) => sortProducts(a, b, sortBy));
  }, [products, searchQuery, activeFilter, sortBy]);

  function clearFilters() {
    setSearchQuery('');
    setActiveFilter('All');
    setSortBy('newest');
  }

  function addProduct(product) {
    if (product.is_preview || Number(product.stock_qty || 0) === 0) {
      toast.error('This box is not available yet');
      return;
    }
    const character = getCharacter(product);
    addItem({
      product_id: product.id,
      name: product.name,
      unit_price: Number(product.price || 0),
      quantity: 1,
      image_url: assetUrl(character.figure_image_url || character.lid_image_url || character.box_image_url),
      character_name: character.name,
      customisation: null,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(''), 450);
    toast.success('Added to cart');
  }

  return (
    <main className="min-h-screen bg-[#0A0505] text-[#FDF5F0]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#180C0C] to-[#0A0505] py-20">
        <img src={assetUrl('/Img/faith-heroes-brand-hero.png')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#180C0C]/80 to-[#0A0505]" />
        <div className="landing-grain absolute inset-0 opacity-[0.05]" />
        <CrossWatermark />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[#FDF5F0]/40">
            <Link to="/" className="hover:text-[#C9A84C]">Home</Link>
            <ChevronRight size={12} />
            <span>Shop</span>
          </div>
          <span className="inline-flex rounded-full border border-[#8B1A1A]/40 bg-[#8B1A1A]/20 px-4 py-1.5 text-[10px] uppercase tracking-widest text-[#E05555]">Gift Boxes</span>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.88] tracking-[-0.03em] text-[#FDF5F0] sm:text-6xl md:text-7xl lg:text-8xl">
            <WordsPullUp text="The Collection" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#FDF5F0]/60 md:text-base">
            Each box is a curated journey through a Bible hero's story - handcrafted and made to last.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 flex justify-center gap-8">
            <Stat value={products.length || 3} label="Heroes Available" />
            <Stat value="5" label="Items Per Box" />
            <Stat value="£24.99" label="Starting From" />
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-20 border-b border-[#8B1A1A]/20 bg-[#0A0505]/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FDF5F0]/30" />
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search characters..." className="w-full rounded-full border border-[#8B1A1A]/30 bg-[#180C0C] py-2.5 pl-9 pr-4 text-sm text-[#FDF5F0] placeholder:text-[#FDF5F0]/25 transition focus:border-[#C9A84C] focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Old Testament', 'New Testament', 'For Children', 'In Stock'].map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-xs font-medium transition ${activeFilter === filter ? 'bg-[#8B1A1A] text-[#FDF5F0]' : 'border border-[#8B1A1A]/30 text-[#FDF5F0]/50 hover:border-[#8B1A1A]/60'}`}>
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="w-40 appearance-none rounded-xl border border-[#8B1A1A]/30 bg-[#180C0C] px-4 py-2.5 text-xs text-[#FDF5F0] focus:border-[#C9A84C] focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="bestseller">Bestseller</option>
            </select>
            <span className="hidden text-xs text-[#FDF5F0]/40 sm:inline">Showing {filtered.length} gift boxes</span>
          </div>
        </div>
      </section>

      <section className="min-h-screen bg-[#0A0505] py-16">
        <div className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <AlertCircle size={40} className="mx-auto text-[#E05555]" />
              <p className="mt-3 text-sm text-[#FDF5F0]/50">Could not load products</p>
              <button onClick={fetchProducts} className="mt-5 rounded-full bg-[#8B1A1A] px-6 py-3 text-sm text-[#FDF5F0]">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Search size={40} className="mx-auto text-[#C9A84C]/30" />
              <p className="mt-3 text-sm text-[#FDF5F0]/50">No boxes match your search</p>
              <button onClick={clearFilters} className="mt-5 rounded-full border border-[#C9A84C]/40 px-6 py-3 text-sm text-[#C9A84C]">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product, index) => (
                <ShopProductCard key={product.id} product={product} index={index} added={addedId === product.id} onAdd={() => addProduct(product)} onPreview={() => setPreviewCharacter(getCharacter(product))} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ThreeViewerModal isOpen={!!previewCharacter} onClose={() => setPreviewCharacter(null)} character={previewCharacter} onAddToCart={() => {
        const product = products.find(item => item.character_id === previewCharacter?.id);
        if (product) addProduct(product);
      }} />
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-bold text-[#C9A84C]">{value}</p>
      <p className="mt-1 text-xs text-[#FDF5F0]/50">{label}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#8B1A1A]/15 bg-[#180C0C]">
      <div className="h-56 rounded-t-2xl bg-[#2A1010]" />
      <div className="p-4">
        <div className="h-4 w-3/4 rounded-full bg-[#2A1010]" />
        <div className="mt-3 h-3 w-1/2 rounded-full bg-[#2A1010]" />
        <div className="mt-6 h-8 w-full rounded-full bg-[#2A1010]" />
      </div>
    </div>
  );
}

function ShopProductCard({ product, index, onAdd, onPreview, added }) {
  const navigate = useNavigate();
  const character = getCharacter(product);
  const image = assetUrl(character.figure_image_url || character.lid_image_url || character.box_image_url);
  const stock = Number(product.stock_qty || 0);

  return (
    <motion.article initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-[#180C0C] transition-all duration-500 hover:border-[#C9A84C]/35 hover:shadow-[0_0_40px_rgba(139,26,26,0.18)] ${added ? 'border-green-500/50' : 'border-[#8B1A1A]/20'}`}>
      <div className="relative h-56 overflow-hidden">
        {image ? (
          <img src={image} alt={character.name} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2A1010] to-[#180C0C]">
            <Crown size={52} className="text-[#C9A84C]/25" />
            <p className="text-xs text-[#FDF5F0]/15">{character.name}</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#180C0C] via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {character.bible_reference && <span className="rounded-full border border-[#C9A84C]/25 bg-[#0A0505]/85 px-2 py-1 text-[9px] text-[#C9A84C] backdrop-blur-sm">{character.bible_reference}</span>}
          {stock > 0 && stock < 5 && <span className="rounded-full border border-[#E05555]/30 bg-[#E05555]/20 px-2 py-1 text-[9px] text-[#E05555]">Only {stock} left</span>}
          {(stock === 0 || product.is_preview) && <span className="rounded-full bg-[#2A1010] px-2 py-1 text-[9px] text-[#FDF5F0]/40">{product.is_preview ? 'Coming Soon' : 'Out of Stock'}</span>}
        </div>
        <button onClick={event => { event.stopPropagation(); onPreview(); }} className="absolute right-3 top-3 rounded-full border border-[#8B1A1A]/40 bg-[#0A0505]/85 p-2 text-[#FDF5F0] opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <Eye size={14} />
        </button>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold leading-tight text-[#FDF5F0]">{character.name || product.name}</h3>
        <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#C9A84C]">{character.tagline || 'FAITH. COURAGE. HOPE.'}</p>
        <p className="mt-3 line-clamp-2 border-l-2 border-[#8B1A1A]/50 pl-3 text-xs italic text-[#FDF5F0]/50">{character.scripture_quote || 'A handcrafted Bible story gift box made to inspire lasting faith.'}</p>
        <div className="my-4 border-t border-[#8B1A1A]/15" />
        <div className="flex items-center justify-between">
          <p className="font-display text-xl font-bold text-[#C9A84C]">£{Number(product.price || 24.99).toFixed(2)}</p>
          <div className="flex gap-2">
            <button onClick={event => { event.stopPropagation(); onAdd(); }} className="rounded-full bg-[#8B1A1A] p-2.5 text-[#FDF5F0] transition hover:bg-[#E05555]"><ShoppingCart size={16} /></button>
            <button onClick={() => navigate(`/shop/${character.id || product.character_id}`)} className="rounded-full border border-[#8B1A1A]/40 p-2.5 text-[#FDF5F0]/60 transition hover:border-[#C9A84C] hover:text-[#C9A84C]"><ArrowRight size={16} /></button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
