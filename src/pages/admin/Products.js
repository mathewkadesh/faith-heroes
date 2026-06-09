import { useEffect, useState } from 'react';
import { Edit2, Package, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { characterAPI, productAPI } from '../../lib/api';

const EMPTY = {
  character_id: '',
  name: '',
  price: '',
  currency: 'GBP',
  stock_qty: 0,
  includes: '',
  is_customisable: true,
  is_active: true,
};

function formFromProduct(product) {
  return {
    character_id: product.character_id || '',
    name: product.name || '',
    price: product.price || '',
    currency: product.currency || 'GBP',
    stock_qty: product.stock_qty || 0,
    includes: Array.isArray(product.includes) ? product.includes.join('\n') : '',
    is_customisable: product.is_customisable !== false,
    is_active: product.is_active !== false,
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [productsResponse, charactersResponse] = await Promise.all([
        productAPI.getAllAdmin(),
        characterAPI.getAllAdmin(),
      ]);
      setProducts(productsResponse.data || []);
      setCharacters(charactersResponse.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product.id);
    setForm(formFromProduct(product));
    setModalOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock_qty: Number(form.stock_qty || 0),
        includes: form.includes.split('\n').map(item => item.trim()).filter(Boolean),
      };

      if (editing) await productAPI.update(editing, payload);
      else await productAPI.create(payload);

      toast.success(editing ? 'Product updated' : 'Product created');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-cream font-bold">Products</h2>
          <p className="text-muted text-sm mt-1">Manage gift boxes, pricing, stock, and availability.</p>
        </div>
        <Button variant="gold" onClick={openAdd}>
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-card border border-gold/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg/60 text-muted">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3">Character</th>
              <th className="text-left font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Stock</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-10 text-center text-muted">Loading products...</td></tr>
            ) : products.length > 0 ? products.map(product => (
              <tr key={product.id} className="hover:bg-gold/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg border border-gold/10 overflow-hidden flex items-center justify-center">
                      {product.characters?.figure_image_url || product.characters?.lid_image_url ? (
                        <img src={product.characters.figure_image_url || product.characters.lid_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-gold/40" />
                      )}
                    </div>
                    <span className="text-cream">{product.name || 'Untitled product'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{product.characters?.name || 'Unlinked'}</td>
                <td className="px-4 py-3 text-gold font-semibold">{product.currency || 'GBP'} {Number(product.price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-cream">{product.stock_qty || 0}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.is_active ? 'green' : 'muted'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(product)} className="text-muted hover:text-gold"><Edit2 size={15} /></button>
                    <button onClick={() => deleteProduct(product.id)} className="text-muted hover:text-accent-light"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-4 py-10 text-center text-muted">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Select label="Character" value={form.character_id} onChange={e => setForm(f => ({ ...f, character_id: e.target.value }))} required className="col-span-2">
            <option value="">Select character</option>
            {characters.map(character => <option key={character.id} value={character.id}>{character.name}</option>)}
          </Select>
          <Input label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="col-span-2" />
          <Input label="Price" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          <Input label="Stock Quantity" type="number" min="0" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} required />
          <Textarea label="Includes (one per line)" rows={5} value={form.includes} onChange={e => setForm(f => ({ ...f, includes: e.target.value }))} className="col-span-2" />
          <label className="flex items-center gap-2 text-cream text-sm">
            <input type="checkbox" checked={form.is_customisable} onChange={e => setForm(f => ({ ...f, is_customisable: e.target.checked }))} className="w-4 h-4 accent-gold" />
            Customisable
          </label>
          <label className="flex items-center gap-2 text-cream text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-gold" />
            Active
          </label>
          <div className="col-span-2 flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gold" className="flex-1" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
