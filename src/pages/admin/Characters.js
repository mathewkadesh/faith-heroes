import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Eye, EyeOff, Trash2, Upload, BookOpen, Image as ImageIcon, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import ThreeViewer from '../../components/ThreeViewer';
import { characterAPI, signatureItemAPI, uploadAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '',
  story_title: '',
  bible_reference: '',
  scripture_quote: '',
  tagline: '',
  description: '',
  lid_image_url: '',
  figure_image_url: '',
  box_image_url: '',
  model_3d_url: '',
  is_published: false,
};

const EMPTY_SIGNATURE_ITEM = {
  name: '',
  slug: '',
  short_desc: '',
  story: '',
  scripture: '',
  scripture_quote: '',
  price: 0,
  stock_qty: 50,
  sort_order: 1,
  is_included: true,
  is_addon: false,
  scene_position: 'centre',
  material: '',
  dimensions: '',
  connects_to: '',
  badge_text: '',
  is_wearable: false,
  glow_in_dark: false,
};

function ImageThumb({ src, label }) {
  return (
    <div className="space-y-1">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg border border-gold/10 flex items-center justify-center">
        {src ? <img src={src} alt={label} className="w-full h-full object-cover" /> : <BookOpen size={18} className="text-gold/20" />}
      </div>
      <p className="text-[10px] text-muted text-center">{label}</p>
    </div>
  );
}

function ImagePreview({ label, file, existing }) {
  const previewUrl = useMemo(() => {
    if (!file) return existing || '';
    return URL.createObjectURL(file);
  }, [file, existing]);

  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  return (
    <div className="rounded-xl border border-gold/10 bg-bg overflow-hidden">
      <div className="h-[360px] flex items-center justify-center bg-[#120907]">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="w-full h-full object-contain p-4" />
        ) : (
          <ImageIcon size={28} className="text-gold/20" />
        )}
      </div>
      <div className="px-3 py-2 border-t border-gold/10">
        <p className="text-xs text-cream font-medium">{label}</p>
        <p className="text-[11px] text-muted truncate">{file?.name || (existing ? 'Current image' : 'No image selected')}</p>
      </div>
    </div>
  );
}

export default function AdminCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [figureFile, setFigureFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewModel, setPreviewModel] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [signatureItems, setSignatureItems] = useState([]);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureForm, setSignatureForm] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureSaving, setSignatureSaving] = useState(false);

  useEffect(() => { fetchCharacters(); }, []);

  const fetchSignatureItems = useCallback(async (characterId = editing) => {
    if (!characterId) return;
    setSignatureLoading(true);
    try {
      const response = await signatureItemAPI.getAdmin(characterId);
      setSignatureItems(response.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load signature items');
      setSignatureItems([]);
    } finally {
      setSignatureLoading(false);
    }
  }, [editing]);

  useEffect(() => {
    if (modalOpen && editing && activeTab === 'signature') fetchSignatureItems(editing);
  }, [modalOpen, editing, activeTab, fetchSignatureItems]);

  async function fetchCharacters() {
    setLoading(true);
    setLoadError('');
    try {
      const response = await characterAPI.getAllAdmin();
      setCharacters(response.data || []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load characters');
      toast.error(err.message || 'Failed to load characters');
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }

  function resetFiles() {
    setFigureFile(null);
    setModelFile(null);
  }

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
    setActiveTab('details');
    resetFiles();
    setModalOpen(true);
  }

  function openEdit(c) {
    setForm({ ...EMPTY, ...c });
    setEditing(c.id);
    setActiveTab('details');
    resetFiles();
    setModalOpen(true);
  }

  async function uploadFile(file, type, folder) {
    const response = type === 'model'
      ? await uploadAPI.uploadModel(file, folder)
      : await uploadAPI.uploadImage(file, folder);
    return response.url;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let lid_image_url = form.lid_image_url;
      let figure_image_url = form.figure_image_url;
      let box_image_url = form.box_image_url;
      let model_3d_url = form.model_3d_url;

      if (figureFile) figure_image_url = await uploadFile(figureFile, 'image', 'figures');
      if (modelFile) model_3d_url = await uploadFile(modelFile, 'model', 'characters');

      const payload = { ...form, lid_image_url, figure_image_url, box_image_url, model_3d_url };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.products;

      if (editing) {
        await characterAPI.update(editing, payload);
      } else {
        await characterAPI.create(payload);
      }
      toast.success(editing ? 'Character updated!' : 'Character created!');
      setModalOpen(false);
      fetchCharacters();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  async function togglePublish(id, current) {
    try {
      await characterAPI.update(id, { is_published: !current });
      fetchCharacters();
    } catch (err) {
      toast.error(err.message || 'Failed to update publish status');
    }
  }

  async function deleteCharacter(id) {
    if (!window.confirm('Delete this character?')) return;
    try {
      await characterAPI.delete(id);
      toast.success('Deleted');
      fetchCharacters();
    } catch (err) {
      toast.error(err.message || 'Failed to delete character');
    }
  }

  function slugify(value) {
    return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function openSignatureAdd() {
    setSignatureForm({ ...EMPTY_SIGNATURE_ITEM, character_id: editing });
    setSignatureFile(null);
  }

  function openSignatureEdit(item) {
    setSignatureForm({ ...EMPTY_SIGNATURE_ITEM, ...item });
    setSignatureFile(null);
  }

  async function saveSignatureItem(event) {
    event.preventDefault();
    if (!editing || !signatureForm) return;
    setSignatureSaving(true);
    try {
      const payload = {
        ...signatureForm,
        character_id: editing,
        slug: signatureForm.slug || slugify(signatureForm.name),
        price: Number(signatureForm.price) || 0,
        stock_qty: Number(signatureForm.stock_qty) || 0,
        sort_order: Number(signatureForm.sort_order) || 99,
      };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const response = signatureForm.id
        ? await signatureItemAPI.update(signatureForm.id, payload)
        : await signatureItemAPI.create(payload);

      if (signatureFile) await signatureItemAPI.uploadImage(response.data.id, signatureFile);

      toast.success(signatureForm.id ? 'Signature item updated' : 'Signature item created');
      setSignatureForm(null);
      setSignatureFile(null);
      fetchSignatureItems(editing);
    } catch (err) {
      toast.error(err.message || 'Failed to save signature item');
    } finally {
      setSignatureSaving(false);
    }
  }

  async function uploadSignatureImage(item, file) {
    if (!file) return;
    try {
      await signatureItemAPI.uploadImage(item.id, file);
      toast.success('Image uploaded');
      fetchSignatureItems(editing);
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    }
  }

  async function toggleSignatureItem(item) {
    try {
      await signatureItemAPI.toggleActive(item.id);
      fetchSignatureItems(editing);
    } catch (err) {
      toast.error(err.message || 'Failed to update item');
    }
  }

  async function deleteSignatureItem(item) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await signatureItemAPI.delete(item.id);
      toast.success('Signature item deleted');
      fetchSignatureItems(editing);
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-cream font-semibold">Bible Characters</h2>
        <Button variant="gold" size="sm" onClick={openAdd}><Plus size={16} className="mr-1.5" /> Add Character</Button>
      </div>

      <div className="bg-card border border-gold/15 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {['Figure', 'Name', 'Bible Ref', 'Tagline', 'Published', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">Loading...</td></tr>
            ) : loadError ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <p className="text-accent-light font-medium">Could not load characters</p>
                  <p className="text-muted text-xs mt-1">{loadError}</p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={fetchCharacters}>Retry</Button>
                </td>
              </tr>
            ) : characters.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">No characters found.</td></tr>
            ) : characters.map(c => (
              <tr key={c.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <ImageThumb src={c.figure_image_url} label="Figure" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-cream font-medium">{c.name}</p>
                  <p className="text-muted text-xs">{c.story_title}</p>
                </td>
                <td className="px-4 py-3 text-muted">{c.bible_reference || '—'}</td>
                <td className="px-4 py-3 text-muted text-xs">{c.tagline || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(c.id, c.is_published)} className={c.is_published ? 'text-green-400' : 'text-muted'}>
                    {c.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  {c.model_3d_url && (
                    <button onClick={() => setPreviewModel(c.model_3d_url)} className="text-gold hover:text-gold-light text-xs">3D</button>
                  )}
                  <button onClick={() => openEdit(c)} className="text-muted hover:text-gold"><Edit2 size={15} /></button>
                  <button onClick={() => deleteCharacter(c.id)} className="text-muted hover:text-accent-light"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Character' : 'Add Character'} size="2xl">
        {editing && (
          <div className="mb-5 flex gap-2 border-b border-gold/10 pb-3">
            <button type="button" onClick={() => setActiveTab('details')} className={`rounded-full px-4 py-2 text-xs transition ${activeTab === 'details' ? 'bg-gold text-bg' : 'border border-gold/20 text-muted hover:text-gold'}`}>Character Details</button>
            <button type="button" onClick={() => setActiveTab('signature')} className={`rounded-full px-4 py-2 text-xs transition ${activeTab === 'signature' ? 'bg-gold text-bg' : 'border border-gold/20 text-muted hover:text-gold'}`}>Signature Items</button>
          </div>
        )}

        {activeTab === 'details' ? (
        <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="col-span-2 sm:col-span-1" />
            <Input label="Story Title" value={form.story_title || ''} onChange={e => setForm(f => ({ ...f, story_title: e.target.value }))} className="col-span-2 sm:col-span-1" />
            <Input label="Bible Reference" placeholder="Genesis 6:22" value={form.bible_reference || ''} onChange={e => setForm(f => ({ ...f, bible_reference: e.target.value }))} />
            <Input label="Tagline" placeholder="FAITH. COURAGE. TRUST." value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            <Textarea label="Scripture Quote" rows={3} value={form.scripture_quote || ''} onChange={e => setForm(f => ({ ...f, scripture_quote: e.target.value }))} className="col-span-2" />
            <Textarea label="Description" rows={5} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="col-span-2" />

            {[
              { label: 'Figure Photo', file: figureFile, setter: setFigureFile, accept: 'image/*', existing: form.figure_image_url },
              { label: '3D Model (.glb)', file: modelFile, setter: setModelFile, accept: '.glb,.gltf', existing: form.model_3d_url },
            ].map(({ label, file, setter, accept, existing }) => (
              <div key={label} className={label.includes('3D') ? 'col-span-2 sm:col-span-1' : ''}>
                <p className="text-xs text-muted mb-1">{label}</p>
                <label className="flex items-center gap-2 border border-dashed border-gold/20 rounded-xl p-3 cursor-pointer hover:border-gold/40 transition-colors">
                  <Upload size={15} className="text-gold" />
                  <span className="text-xs text-muted truncate">{file ? file.name : existing ? 'Uploaded' : 'Upload file'}</span>
                  <input type="file" accept={accept} className="hidden" onChange={e => setter(e.target.files?.[0] || null)} />
                </label>
              </div>
            ))}

            <label className="col-span-2 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-gold" />
              <span className="text-cream text-sm">Published (visible on site)</span>
            </label>

            <div className="col-span-2 flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>

          <aside className="space-y-3">
            <div>
              <p className="text-sm text-cream font-medium">Preview</p>
              <p className="text-xs text-muted mt-1">Check the figure before saving.</p>
            </div>
            <ImagePreview label="Figure photo" file={figureFile} existing={form.figure_image_url} />
            <div className="rounded-xl border border-gold/10 bg-bg px-3 py-2">
              <p className="text-xs text-cream font-medium">3D model</p>
              <p className="text-[11px] text-muted truncate">{modelFile?.name || (form.model_3d_url ? 'Current model uploaded' : 'No model selected')}</p>
            </div>
          </aside>
        </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-cream">{form.name}'s Signature Items</p>
                <p className="text-xs text-muted">{signatureItems.length} items connected to this character</p>
              </div>
              <Button variant="gold" size="sm" onClick={openSignatureAdd}><Plus size={15} className="mr-1.5" /> Add Item</Button>
            </div>

            {signatureLoading ? (
              <div className="rounded-xl border border-gold/10 bg-bg p-6 text-center text-sm text-muted">Loading signature items...</div>
            ) : signatureItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gold/20 bg-bg p-8 text-center">
                <BookOpen size={28} className="mx-auto text-gold/30" />
                <p className="mt-3 text-sm text-muted">No signature items yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {signatureItems.map(item => (
                  <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gold/10 bg-bg p-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gold/10 bg-card">
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-1" /> : <BookOpen size={20} className="text-gold/30" />}
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-sm font-medium text-cream">{item.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.short_desc || item.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.is_included && <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[9px] text-green-400">INCLUDED</span>}
                      {item.is_addon && <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[9px] text-gold">ADD-ON · £{Number(item.price || 0).toFixed(2)}</span>}
                      <span className="rounded-full border border-gold/10 bg-card px-2 py-0.5 text-[9px] text-muted">{item.scene_position || 'centre'}</span>
                      <span className="rounded-full border border-gold/10 bg-card px-2 py-0.5 text-[9px] text-muted">Stock {item.stock_qty ?? 0}</span>
                    </div>
                    <button onClick={() => toggleSignatureItem(item)} className={item.is_active ? 'text-green-400' : 'text-muted'} title={item.is_active ? 'Active' : 'Inactive'}>
                      {item.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <label className="cursor-pointer text-muted hover:text-gold" title="Upload image">
                      <Camera size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={e => uploadSignatureImage(item, e.target.files?.[0])} />
                    </label>
                    <button onClick={() => openSignatureEdit(item)} className="text-muted hover:text-gold"><Edit2 size={15} /></button>
                    <button onClick={() => deleteSignatureItem(item)} className="text-muted hover:text-accent-light"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}

            {signatureForm && (
              <form onSubmit={saveSignatureItem} className="rounded-2xl border border-gold/15 bg-bg p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-lg text-cream">{signatureForm.id ? 'Edit Signature Item' : 'Add Signature Item'}</p>
                  <button type="button" onClick={() => setSignatureForm(null)} className="text-muted hover:text-cream">Close</button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Name *" value={signatureForm.name} onChange={e => setSignatureForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} required />
                  <Input label="Slug" value={signatureForm.slug || ''} onChange={e => setSignatureForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
                  <Input label="Short Description" value={signatureForm.short_desc || ''} onChange={e => setSignatureForm(f => ({ ...f, short_desc: e.target.value }))} className="sm:col-span-2" />
                  <Textarea label="Full Story" rows={5} value={signatureForm.story || ''} onChange={e => setSignatureForm(f => ({ ...f, story: e.target.value }))} className="sm:col-span-2" />
                  <Input label="Scripture Reference" value={signatureForm.scripture || ''} onChange={e => setSignatureForm(f => ({ ...f, scripture: e.target.value }))} />
                  <Input label="Scripture Quote" value={signatureForm.scripture_quote || ''} onChange={e => setSignatureForm(f => ({ ...f, scripture_quote: e.target.value }))} />
                  <Input label="Price" type="number" step="0.01" min="0" value={signatureForm.price} onChange={e => setSignatureForm(f => ({ ...f, price: e.target.value }))} />
                  <Input label="Stock Qty" type="number" min="0" value={signatureForm.stock_qty} onChange={e => setSignatureForm(f => ({ ...f, stock_qty: e.target.value }))} />
                  <Input label="Sort Order" type="number" min="1" value={signatureForm.sort_order} onChange={e => setSignatureForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">Scene Position</span>
                    <select value={signatureForm.scene_position || 'centre'} onChange={e => setSignatureForm(f => ({ ...f, scene_position: e.target.value }))} className="w-full rounded-xl border border-gold/20 bg-bg px-3 py-2.5 text-sm text-cream outline-none focus:border-gold">
                      {['left', 'right', 'top-left', 'top-right', 'top-centre', 'bottom-left', 'bottom-right', 'bottom-centre', 'centre', 'figure'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                  </label>
                  <Input label="Material" value={signatureForm.material || ''} onChange={e => setSignatureForm(f => ({ ...f, material: e.target.value }))} />
                  <Input label="Dimensions" value={signatureForm.dimensions || ''} onChange={e => setSignatureForm(f => ({ ...f, dimensions: e.target.value }))} />
                  <Input label="Connects To" value={signatureForm.connects_to || ''} onChange={e => setSignatureForm(f => ({ ...f, connects_to: e.target.value }))} />
                  <Input label="Badge Text" value={signatureForm.badge_text || ''} onChange={e => setSignatureForm(f => ({ ...f, badge_text: e.target.value }))} />
                </div>

                <div className="mt-4 flex flex-wrap gap-5">
                  {[
                    ['is_included', 'Included free in box'],
                    ['is_addon', 'Purchasable add-on'],
                    ['is_wearable', 'Wearable'],
                    ['glow_in_dark', 'Glows in the dark'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-cream">
                      <input type="checkbox" checked={Boolean(signatureForm[key])} onChange={e => setSignatureForm(f => ({ ...f, [key]: e.target.checked }))} className="h-4 w-4 accent-gold" />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs text-muted">Image</p>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gold/20 p-3 transition-colors hover:border-gold/40">
                    <Upload size={15} className="text-gold" />
                    <span className="truncate text-xs text-muted">{signatureFile ? signatureFile.name : signatureForm.image_url ? 'Current image uploaded' : 'Upload signature item photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setSignatureFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <Button type="submit" variant="gold" className="mt-5 w-full" disabled={signatureSaving}>{signatureSaving ? 'Saving...' : 'Save Signature Item'}</Button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* 3D Preview Modal */}
      <Modal isOpen={!!previewModel} onClose={() => setPreviewModel(null)} title="3D Model Preview" size="lg">
        <div className="h-[400px] rounded-xl overflow-hidden bg-bg">
          <ThreeViewer modelUrl={previewModel} />
        </div>
      </Modal>
    </div>
  );
}
