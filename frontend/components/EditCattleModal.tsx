'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateCattle, uploadImage } from '@/lib/api';
import { Cattle } from '@/types';
import { X, Upload, Trash2, Plus } from 'lucide-react';

interface Props {
  cattle: Cattle;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Bull', 'Cow', 'Calf', 'Buffalo', 'Goat', 'Sheep', 'Other'];
const BREEDS = ['Sahiwal', 'Cholistani', 'Thari', 'Dajal', 'Kankrej', 'Nili-Ravi', 'Murrah', 'Beetal', 'Dera Din Panah', 'Friesian', 'Crossbreed', 'Other'];
const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad'];
const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'unavailable', label: 'Unavailable' },
];

export default function EditCattleModal({ cattle, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: cattle.name,
    breed: cattle.breed,
    category: cattle.category,
    price: cattle.price.toString(),
    originalPrice: cattle.originalPrice?.toString() || '',
    age: cattle.age,
    weight: cattle.weight,
    gender: cattle.gender,
    location: cattle.location,
    tehsil: cattle.tehsil || '',
    district: cattle.district || '',
    province: cattle.province || '',
    description: cattle.description || '',
    healthNotes: cattle.healthNotes || '',
    status: cattle.status,
    isFeatured: cattle.isFeatured || false,
    tags: cattle.tags?.join(', ') || '',
  });

  const [images, setImages] = useState<string[]>(cattle.images || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        const res = await uploadImage(file, token);
        setImages(prev => [...prev, res.url]);
      }
    } catch {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const data = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        images,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      await updateCattle(cattle._id, data, token);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update cattle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Cattle Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((url, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || images.length >= 5}
                className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="spinner w-5 h-5" />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500">Max 5 images. First image will be the cover.</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. Healthy Sahiwal Bull"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Breed *
              </label>
              <select
                name="breed"
                value={form.breed}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select breed</option>
                {BREEDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (PKR) *
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                className="input-field ltr-only"
                placeholder="e.g. 150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price (PKR)
              </label>
              <input
                name="originalPrice"
                type="number"
                value={form.originalPrice}
                onChange={handleChange}
                min="0"
                className="input-field ltr-only"
                placeholder="For showing discount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age *
              </label>
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. 3 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight *
              </label>
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. 400 kg"
              />
            </div>
          </div>

          {/* Location */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Village/Area *
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g. Bhalwal, Sargodha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tehsil
                </label>
                <input
                  name="tehsil"
                  value={form.tehsil}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Province
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select province</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe the cattle, its health, behavior, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Health Notes
                </label>
                <textarea
                  name="healthNotes"
                  value={form.healthNotes}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any health information, vaccinations, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. organic, vaccinated, premium"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Feature this listing</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
