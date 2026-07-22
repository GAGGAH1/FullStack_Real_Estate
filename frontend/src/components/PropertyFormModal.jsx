import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Building } from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'Modern Glass Estate', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cozy Architectural Retreat', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tropical Beach Villa', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80' },
  { name: 'Eco Contemporary Forest Cabin', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { name: 'Warm Bricks Classic Home', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }
];

export default function PropertyFormModal({ property, onClose, onSave }) {
  const isEdit = !!property;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    beds: '',
    baths: '',
    area: '',
    location: '',
    address: '',
    type: 'sale',
    image: PRESET_IMAGES[0].url
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        beds: property.beds || '',
        baths: property.baths || '',
        area: property.area || '',
        location: property.location || '',
        address: property.address || '',
        type: property.type || 'sale',
        image: property.image || PRESET_IMAGES[0].url
      });
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPresetImage = (url) => {
    setFormData(prev => ({
      ...prev,
      image: url
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validations
    if (!formData.title || !formData.price || !formData.location || !formData.address) {
      setError('Please fill in all required fields (Title, Price, Location, Address).');
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit ? `/api/properties/${property.id}` : '/api/properties';
      const method = isEdit ? 'put' : 'post';
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        beds: parseInt(formData.beds) || 0,
        baths: parseFloat(formData.baths) || 0,
        area: parseInt(formData.area) || 0
      };

      const res = await axios[method](url, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = res.data;
      if (onSave) onSave(data.property, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="property_form_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div id="property_form_container" className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-slate-900" />
            <h2 className="font-sans font-bold text-lg text-slate-900">
              {isEdit ? 'Edit Property Listing' : 'Create New Property Listing'}
            </h2>
          </div>
          <button
            id="btn_close_property_form"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="property_form_element" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <p id="form_error_message" className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg">
              {error}
            </p>
          )}

          {/* Form Fields: Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Property Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Modern Glass Penthouse"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Listing Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white transition-all"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Price (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={formData.type === 'rent' ? 'e.g. 2500 / month' : 'e.g. 750000'}
                  className="w-full text-xs pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Region/Location Summary */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                City / Region <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Austin, TX"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Full Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 102 Greenbelt Rd, Austin, TX 78746"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Beds */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Bedrooms
              </label>
              <input
                type="number"
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                placeholder="e.g. 3"
                min="0"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Baths */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Bathrooms
              </label>
              <input
                type="number"
                step="0.5"
                name="baths"
                value={formData.baths}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                min="0"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Total Area (sqft)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. 2400"
                min="0"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Listing Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe key features, schools, amenities, recent renovations, neighborhood quality, and community access..."
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Preset Image Library Selection */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Select Listing Hero Image
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {PRESET_IMAGES.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPresetImage(img.url)}
                    className={`group relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      formData.image === img.url 
                        ? 'border-slate-900 ring-2 ring-slate-900/10 scale-98' 
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] font-semibold text-white text-center truncate">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Image URL input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Or Paste Custom Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
            <button
              id="btn_cancel_form"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn_save_property"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              <Save size={14} />
              {submitting ? 'Saving changes...' : isEdit ? 'Update Listing' : 'Submit Property'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
