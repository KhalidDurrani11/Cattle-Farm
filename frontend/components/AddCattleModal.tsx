'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createCattle, uploadImage } from '@/lib/api';
import { Loader2, X, Plus, Trash2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Bull', 'Cow', 'Calf', 'Buffalo', 'Goat', 'Sheep', 'Other'];
const BREEDS = ['Sahiwal', 'Cholistani', 'Thari', 'Dajal', 'Kankrej', 'Nili-Ravi', 'Murrah', 'Beetal', 'Dera Din Panah', 'Friesian', 'Crossbreed', 'Other'];
const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad'];

export default function AddCattleModal({ onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    breed: '',
    category: 'Bull',
    price: '',
    originalPrice: '',
    age: '',
    weight: '',
    gender: 'Male',
    location: '',
    tehsil: '',
    district: '',
    province: '',
    description: '',
    healthNotes: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        const res = await uploadImage(file, token);
        setImages(p => [...p, res.url]);
      }
    } catch {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(p => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      await createCattle({
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        images,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }, token);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Cattle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                {uploading ? <div className="spinner w-5 h-5" /> : <Plus className="w-6 h-6" />}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Breed *</label>
              <select name="breed" value={form.breed} onChange={handleChange} required className="input-field">
                <option value="">Select</option>
                {BREEDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (PKR) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required className="input-field ltr-only" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age *</label>
              <input name="age" value={form.age} onChange={handleChange} required className="input-field" placeholder="e.g. 3 years" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight *</label>
              <input name="weight" value={form.weight} onChange={handleChange} required className="input-field" placeholder="e.g. 400 kg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Province</label>
              <select name="province" value={form.province} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Health Notes</label>
            <textarea name="healthNotes" value={form.healthNotes} onChange={handleChange} rows={2} className="input-field resize-none" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || uploading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Add Cattle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
