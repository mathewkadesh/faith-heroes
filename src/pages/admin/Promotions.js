import { useEffect, useMemo, useState } from 'react';
import { Edit2, Eye, EyeOff, Plus, Tag, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { characterAPI, promotionAPI } from '../../lib/api';

const EMPTY = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  season: 'summer',
  theme_colour: '#C9A84C',
  theme_colour_lt: '#E8C97A',
  bg_colour: '#1A1000',
  character_id: '',
  original_price: 34.99,
  promo_price: 27.99,
  saving_pct: 20,
  currency: 'GBP',
  total_stock: 100,
  remaining_stock: 100,
  is_limited: true,
  low_stock_threshold: 20,
  starts_at: '',
  ends_at: '',
  badge_text: 'Limited Edition',
  is_featured: false,
  show_countdown: true,
  show_stock_count: true,
  promo_code: '',
  promo_code_discount_pct: 0,
  is_active: true,
  sort_order: 0,
};

const EMPTY_ITEM = {
  name: '',
  slug: '',
  short_desc: '',
  story: '',
  scripture: '',
  scripture_quote: '',
  price: 0,
  is_included: false,
  is_addon: true,
  scene_position: 'centre',
  material: '',
  dimensions: '',
  is_wearable: false,
  glow_in_dark: false,
  stock_qty: 50,
  sort_order: 1,
  badge_text: '',
  is_active: true,
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value) {
  return value ? new Date(value).toISOString() : null;
}

function statusOf(promotion) {
  const now = Date.now();
  const starts = new Date(promotion.starts_at).getTime();
  const ends = new Date(promotion.ends_at).getTime();
  if (!promotion.is_active) return 'Inactive';
  if (starts > now) return 'Upcoming';
  if (ends < now) return 'Ended';
  return 'Active';
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState('details');
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState(null);
  const [itemFile, setItemFile] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);

  useEffect(() => {
    fetchPromotions();
    characterAPI.getAllAdmin().then(res => setCharacters(res.data || [])).catch(() => setCharacters([]));
  }, []);

  async function fetchPromotions() {
    try {
      const response = await promotionAPI.getAllAdmin();
      setPromotions(response.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load promotions');
      setPromotions([]);
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'All') return promotions;
    return promotions.filter(promotion => statusOf(promotion) === filter);
  }, [filter, promotions]);

  const stats = useMemo(() => ({
    active: promotions.filter(p => statusOf(p) === 'Active').length,
    upcoming: promotions.filter(p => statusOf(p) === 'Upcoming').length,
    ended: promotions.filter(p => statusOf(p) === 'Ended').length,
    remaining: promotions.reduce((sum, p) => sum + Number(p.remaining_stock || 0), 0),
  }), [promotions]);

  function openAdd() {
    setEditing(null);
    setForm({
      ...EMPTY,
      starts_at: toDateTimeLocal(new Date().toISOString()),
      ends_at: toDateTimeLocal(new Date(Date.now() + 30 * 86400000).toISOString()),
    });
    setBannerFile(null);
    setModalTab('details');
    setItems([]);
    setItemForm(null);
    setModalOpen(true);
  }

  function openEdit(promotion) {
    setEditing(promotion.id);
    setForm({
      ...EMPTY,
      ...promotion,
      starts_at: toDateTimeLocal(promotion.starts_at),
      ends_at: toDateTimeLocal(promotion.ends_at),
    });
    setBannerFile(null);
    setModalTab('details');
    setItemForm(null);
    fetchItems(promotion.id);
    setModalOpen(true);
  }

  async function fetchItems(promotionId = editing) {
    if (!promotionId) return;
    try {
      const response = await promotionAPI.getItems(promotionId);
      setItems(response.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load promotion items');
      setItems([]);
    }
  }

  function updateField(key, value) {
    setForm(current => {
      const next = { ...current, [key]: value };
      if (key === 'name' && !current.slug) next.slug = slugify(value);
      if (key === 'original_price' || key === 'promo_price') {
        const original = Number(key === 'original_price' ? value : next.original_price);
        const promo = Number(key === 'promo_price' ? value : next.promo_price);
        next.saving_pct = original > 0 ? Math.round(((original - promo) / original) * 100) : 0;
      }
      return next;
    });
  }

  async function savePromotion(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        character_id: form.character_id || null,
        original_price: Number(form.original_price) || 0,
        promo_price: Number(form.promo_price) || 0,
        saving_pct: Number(form.saving_pct) || 0,
        total_stock: Number(form.total_stock) || 0,
        remaining_stock: Number(form.remaining_stock) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 0,
        promo_code: form.promo_code ? form.promo_code.toUpperCase() : null,
        promo_code_discount_pct: Number(form.promo_code_discount_pct) || 0,
        sort_order: Number(form.sort_order) || 0,
        starts_at: fromDateTimeLocal(form.starts_at),
        ends_at: fromDateTimeLocal(form.ends_at),
      };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.characters;
      delete payload.promotion_signature_items;

      const response = editing
        ? await promotionAPI.update(editing, payload)
        : await promotionAPI.create(payload);

      if (bannerFile) await promotionAPI.uploadBanner(response.data.id, bannerFile);

      toast.success(editing ? 'Promotion updated' : 'Promotion created');
      setModalOpen(false);
      fetchPromotions();
    } catch (err) {
      toast.error(err.message || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  }

  async function togglePromotion(id) {
    try {
      await promotionAPI.toggle(id);
      fetchPromotions();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle promotion');
    }
  }

  async function deletePromotion(id) {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await promotionAPI.delete(id);
      toast.success('Promotion deleted');
      fetchPromotions();
    } catch (err) {
      toast.error(err.message || 'Failed to delete promotion');
    }
  }

  function openItemAdd() {
    setItemForm({ ...EMPTY_ITEM });
    setItemFile(null);
  }

  function openItemEdit(item) {
    setItemForm({ ...EMPTY_ITEM, ...item });
    setItemFile(null);
  }

  async function saveItem(event) {
    event.preventDefault();
    if (!editing || !itemForm) return;
    setItemSaving(true);
    try {
      const payload = {
        ...itemForm,
        slug: itemForm.slug || slugify(itemForm.name),
        price: Number(itemForm.price) || 0,
        stock_qty: Number(itemForm.stock_qty) || 0,
        sort_order: Number(itemForm.sort_order) || 99,
      };
      delete payload.id;
      delete payload.created_at;
      delete payload.promotion_id;

      const response = itemForm.id
        ? await promotionAPI.updateItem(itemForm.id, payload)
        : await promotionAPI.createItem(editing, payload);
      if (itemFile) await promotionAPI.uploadItemImage(response.data.id, itemFile);
      toast.success(itemForm.id ? 'Promotion item updated' : 'Promotion item created');
      setItemForm(null);
      setItemFile(null);
      fetchItems(editing);
    } catch (err) {
      toast.error(err.message || 'Failed to save promotion item');
    } finally {
      setItemSaving(false);
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await promotionAPI.deleteItem(item.id);
      toast.success('Promotion item deleted');
      fetchItems(editing);
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  }

  async function uploadItemImage(item, file) {
    if (!file) return;
    try {
      await promotionAPI.uploadItemImage(item.id, file);
      toast.success('Item image uploaded');
      fetchItems(editing);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream">Promotions</h2>
          <p className="mt-1 text-xs text-muted">Seasonal editions, limited stock and landing page banners.</p>
        </div>
        <Button variant="gold" size="sm" onClick={openAdd}><Plus size={16} className="mr-1.5" /> Add Promotion</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Active Now', stats.active],
          ['Upcoming', stats.upcoming],
          ['Ended', stats.ended],
          ['Units Remaining', stats.remaining],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gold/10 bg-card p-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-black text-gold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Active', 'Upcoming', 'Ended', 'Inactive'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} className={`rounded-full px-4 py-2 text-xs transition ${filter === tab ? 'bg-gold text-bg' : 'border border-gold/15 text-muted hover:text-gold'}`}>{tab}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(promotion => {
          const status = statusOf(promotion);
          const accent = promotion.theme_colour || '#C9A84C';
          const pct = Math.max(0, Math.min(100, (Number(promotion.remaining_stock || 0) / Math.max(1, Number(promotion.total_stock || 1))) * 100));
          return (
            <article key={promotion.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-gold/10 bg-card p-5">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-bg">
                {promotion.banner_image_url ? <img src={promotion.banner_image_url} alt="" className="h-full w-full object-cover" /> : <Tag style={{ color: accent }} />}
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="font-display text-lg font-bold text-cream">{promotion.name}</p>
                <p className="text-xs text-muted">{promotion.season} · {new Date(promotion.starts_at).toLocaleDateString()} - {new Date(promotion.ends_at).toLocaleDateString()}</p>
              </div>
              <div className="w-44">
                <div className="h-2 rounded-full bg-bg"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} /></div>
                <p className="mt-1 text-[10px] text-muted">{promotion.remaining_stock}/{promotion.total_stock} remaining</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] ${status === 'Active' ? 'bg-green-500/10 text-green-400' : status === 'Upcoming' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-muted'}`}>{status}</span>
              <p className="font-display text-xl font-bold text-gold">£{Number(promotion.promo_price || 0).toFixed(2)}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(promotion)} className="text-muted hover:text-gold"><Edit2 size={15} /></button>
                <button onClick={() => togglePromotion(promotion.id)} className={promotion.is_active ? 'text-green-400' : 'text-muted'}>{promotion.is_active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button onClick={() => deletePromotion(promotion.id)} className="text-muted hover:text-accent-light"><Trash2 size={15} /></button>
              </div>
            </article>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Promotion' : 'Add Promotion'} size="2xl">
        {editing && (
          <div className="mb-5 flex gap-2 border-b border-gold/10 pb-3">
            <button type="button" onClick={() => setModalTab('details')} className={`rounded-full px-4 py-2 text-xs transition ${modalTab === 'details' ? 'bg-gold text-bg' : 'border border-gold/20 text-muted hover:text-gold'}`}>Promotion Details</button>
            <button type="button" onClick={() => { setModalTab('items'); fetchItems(editing); }} className={`rounded-full px-4 py-2 text-xs transition ${modalTab === 'items' ? 'bg-gold text-bg' : 'border border-gold/20 text-muted hover:text-gold'}`}>Signature Items</button>
          </div>
        )}

        {modalTab === 'details' ? (
        <form onSubmit={savePromotion} className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name *" value={form.name} onChange={e => updateField('name', e.target.value)} required />
            <Input label="Slug" value={form.slug || ''} onChange={e => updateField('slug', slugify(e.target.value))} />
            <Input label="Tagline" value={form.tagline || ''} onChange={e => updateField('tagline', e.target.value)} className="sm:col-span-2" />
            <Textarea label="Description" rows={5} value={form.description || ''} onChange={e => updateField('description', e.target.value)} className="sm:col-span-2" />

            <label className="block">
              <span className="mb-1 block text-xs text-muted">Season</span>
              <select value={form.season || 'summer'} onChange={e => updateField('season', e.target.value)} className="w-full rounded-xl border border-gold/20 bg-bg px-3 py-2.5 text-sm text-cream outline-none focus:border-gold">
                {['summer', 'christmas', 'easter', 'harvest', 'valentines', 'mothers_day', 'fathers_day', 'back_to_school', 'custom'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Character</span>
              <select value={form.character_id || ''} onChange={e => updateField('character_id', e.target.value)} className="w-full rounded-xl border border-gold/20 bg-bg px-3 py-2.5 text-sm text-cream outline-none focus:border-gold">
                <option value="">None</option>
                {characters.map(character => <option key={character.id} value={character.id}>{character.name}</option>)}
              </select>
            </label>

            <Input label="Original Price" type="number" step="0.01" value={form.original_price} onChange={e => updateField('original_price', e.target.value)} />
            <Input label="Promo Price" type="number" step="0.01" value={form.promo_price} onChange={e => updateField('promo_price', e.target.value)} />
            <Input label="Saving %" type="number" value={form.saving_pct} onChange={e => updateField('saving_pct', e.target.value)} />
            <Input label="Total Stock" type="number" value={form.total_stock} onChange={e => updateField('total_stock', e.target.value)} />
            <Input label="Remaining Stock" type="number" value={form.remaining_stock} onChange={e => updateField('remaining_stock', e.target.value)} />
            <Input label="Low Stock Threshold" type="number" value={form.low_stock_threshold} onChange={e => updateField('low_stock_threshold', e.target.value)} />
            <Input label="Starts At" type="datetime-local" value={form.starts_at || ''} onChange={e => updateField('starts_at', e.target.value)} />
            <Input label="Ends At" type="datetime-local" value={form.ends_at || ''} onChange={e => updateField('ends_at', e.target.value)} />
            <Input label="Promo Code" value={form.promo_code || ''} onChange={e => updateField('promo_code', e.target.value.toUpperCase())} />
            <Input label="Promo Code Discount %" type="number" value={form.promo_code_discount_pct || 0} onChange={e => updateField('promo_code_discount_pct', e.target.value)} />
            <Input label="Badge Text" value={form.badge_text || ''} onChange={e => updateField('badge_text', e.target.value)} />
            <Input label="Sort Order" type="number" value={form.sort_order || 0} onChange={e => updateField('sort_order', e.target.value)} />

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              {[
                ['theme_colour', 'Accent'],
                ['theme_colour_lt', 'Accent Light'],
                ['bg_colour', 'Background'],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-xs text-muted">{label}</span>
                  <input type="color" value={form[key] || '#C9A84C'} onChange={e => updateField(key, e.target.value)} className="h-11 w-full rounded-xl border border-gold/20 bg-bg p-1" />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-5 sm:col-span-2">
              {[
                ['is_featured', 'Featured'],
                ['show_countdown', 'Show countdown'],
                ['show_stock_count', 'Show stock'],
                ['is_active', 'Active'],
                ['is_limited', 'Limited'],
              ].map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-cream">
                  <input type="checkbox" checked={Boolean(form[key])} onChange={e => updateField(key, e.target.checked)} className="h-4 w-4 accent-gold" />
                  {label}
                </label>
              ))}
            </div>

            <div className="sm:col-span-2">
              <p className="mb-1 text-xs text-muted">Banner Image</p>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gold/20 p-3 transition-colors hover:border-gold/40">
                <Upload size={15} className="text-gold" />
                <span className="truncate text-xs text-muted">{bannerFile ? bannerFile.name : form.banner_image_url ? 'Current banner uploaded' : 'Upload banner image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setBannerFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" disabled={saving}>{saving ? 'Saving...' : 'Save Promotion'}</Button>
            </div>
          </div>

          <aside className="space-y-3">
            <p className="text-sm font-medium text-cream">Live Preview</p>
            <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: form.bg_colour, borderColor: `${form.theme_colour}55` }}>
              <div className="p-5">
                <span className="rounded-full px-2 py-1 text-[9px] text-bg" style={{ backgroundColor: form.theme_colour }}>{form.badge_text || 'Limited Edition'}</span>
                <h3 className="mt-3 font-display text-2xl font-bold text-cream">{form.name || 'Promotion Name'}</h3>
                <p className="mt-1 text-sm italic" style={{ color: form.theme_colour }}>{form.tagline || 'Promotion tagline'}</p>
                <p className="mt-4 font-display text-3xl font-black" style={{ color: form.theme_colour }}>£{Number(form.promo_price || 0).toFixed(2)}</p>
              </div>
            </div>
          </aside>
        </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold text-cream">{form.name} Signature Items</p>
                <p className="text-xs text-muted">{items.length} exclusive promotion items</p>
              </div>
              <Button variant="gold" size="sm" onClick={openItemAdd}><Plus size={15} className="mr-1.5" /> Add Item</Button>
            </div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gold/20 bg-bg p-8 text-center text-sm text-muted">No promotion signature items yet.</div>
              ) : items.map(item => (
                <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gold/10 bg-bg p-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gold/10 bg-card">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-1" /> : <Tag className="text-gold/30" size={20} />}
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className="text-sm font-medium text-cream">{item.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.short_desc || item.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.is_included && <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[9px] text-green-400">INCLUDED</span>}
                    {item.is_addon && <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[9px] text-gold">ADD-ON · £{Number(item.price || 0).toFixed(2)}</span>}
                    <span className="rounded-full border border-gold/10 bg-card px-2 py-0.5 text-[9px] text-muted">Stock {item.stock_qty ?? 0}</span>
                  </div>
                  <label className="cursor-pointer text-muted hover:text-gold" title="Upload image">
                    <Upload size={15} />
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadItemImage(item, e.target.files?.[0])} />
                  </label>
                  <button onClick={() => openItemEdit(item)} className="text-muted hover:text-gold"><Edit2 size={15} /></button>
                  <button onClick={() => deleteItem(item)} className="text-muted hover:text-accent-light"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>

            {itemForm && (
              <form onSubmit={saveItem} className="rounded-2xl border border-gold/15 bg-bg p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-lg text-cream">{itemForm.id ? 'Edit Item' : 'Add Item'}</p>
                  <button type="button" onClick={() => setItemForm(null)} className="text-muted hover:text-cream">Close</button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Name *" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} required />
                  <Input label="Slug" value={itemForm.slug || ''} onChange={e => setItemForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
                  <Input label="Short Description" value={itemForm.short_desc || ''} onChange={e => setItemForm(f => ({ ...f, short_desc: e.target.value }))} className="sm:col-span-2" />
                  <Textarea label="Story" rows={4} value={itemForm.story || ''} onChange={e => setItemForm(f => ({ ...f, story: e.target.value }))} className="sm:col-span-2" />
                  <Input label="Scripture" value={itemForm.scripture || ''} onChange={e => setItemForm(f => ({ ...f, scripture: e.target.value }))} />
                  <Input label="Scripture Quote" value={itemForm.scripture_quote || ''} onChange={e => setItemForm(f => ({ ...f, scripture_quote: e.target.value }))} />
                  <Input label="Price" type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} />
                  <Input label="Stock Qty" type="number" value={itemForm.stock_qty} onChange={e => setItemForm(f => ({ ...f, stock_qty: e.target.value }))} />
                  <Input label="Sort Order" type="number" value={itemForm.sort_order} onChange={e => setItemForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">Scene Position</span>
                    <select value={itemForm.scene_position || 'centre'} onChange={e => setItemForm(f => ({ ...f, scene_position: e.target.value }))} className="w-full rounded-xl border border-gold/20 bg-bg px-3 py-2.5 text-sm text-cream outline-none focus:border-gold">
                      {['left', 'right', 'top-left', 'top-right', 'top-centre', 'bottom-left', 'bottom-right', 'bottom-centre', 'centre', 'figure'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                  </label>
                  <Input label="Material" value={itemForm.material || ''} onChange={e => setItemForm(f => ({ ...f, material: e.target.value }))} />
                  <Input label="Dimensions" value={itemForm.dimensions || ''} onChange={e => setItemForm(f => ({ ...f, dimensions: e.target.value }))} />
                  <Input label="Badge Text" value={itemForm.badge_text || ''} onChange={e => setItemForm(f => ({ ...f, badge_text: e.target.value }))} />
                </div>
                <div className="mt-4 flex flex-wrap gap-5">
                  {[
                    ['is_included', 'Included free'],
                    ['is_addon', 'Purchasable add-on'],
                    ['is_wearable', 'Wearable'],
                    ['glow_in_dark', 'Glows in the dark'],
                    ['is_active', 'Active'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-cream">
                      <input type="checkbox" checked={Boolean(itemForm[key])} onChange={e => setItemForm(f => ({ ...f, [key]: e.target.checked }))} className="h-4 w-4 accent-gold" />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="mb-1 text-xs text-muted">Image</p>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gold/20 p-3 transition-colors hover:border-gold/40">
                    <Upload size={15} className="text-gold" />
                    <span className="truncate text-xs text-muted">{itemFile ? itemFile.name : itemForm.image_url ? 'Current image uploaded' : 'Upload item photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setItemFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <Button type="submit" variant="gold" className="mt-5 w-full" disabled={itemSaving}>{itemSaving ? 'Saving...' : 'Save Item'}</Button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
