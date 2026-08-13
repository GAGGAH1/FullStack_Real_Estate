import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Building } from 'lucide-react';

// Preset property images
const PRESET_IMAGES = [
  {
    name: 'Modern Glass Estate',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'
  },
  {
    name: 'Luxury Villa',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
  },
  {
    name: 'Contemporary House',
    url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea'
  },
  {
    name: 'Modern Residence',
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d'
  }
];

// Create a fresh form object whenever we need to reset the form
const getInitialFormData = () => ({
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

export default function PropertyFormModal({
  property,
  onClose,
  onSave
}) {
  const isEdit = Boolean(property);

  const [formData, setFormData] = useState(getInitialFormData);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /*
   * Populate form when editing.
   * Reset the form when switching back to create mode.
   */
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title ?? '',
        description: property.description ?? '',
        price: property.price ?? '',
        beds: property.beds ?? '',
        baths: property.baths ?? '',
        area: property.area ?? '',
        location: property.location ?? '',
        address: property.address ?? '',
        type: property.type ?? 'sale',
        image: property.image || PRESET_IMAGES[0].url
      });
    } else {
      setFormData(getInitialFormData());
    }

    setError('');
  }, [property]);

  /*
   * Handle all input changes.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Remove previous validation error once user starts correcting the form
    if (error) {
      setError('');
    }
  };

  /*
   * Select a preset property image.
   */
  const handleSelectPresetImage = (url) => {
    setFormData((prev) => ({
      ...prev,
      image: url
    }));
  };

  /*
   * Validate the form before sending the request.
   */
  const validateForm = () => {
    if (
      !formData.title.trim() ||
      !formData.price ||
      !formData.location.trim() ||
      !formData.address.trim()
    ) {
      return 'Please fill in all required fields (Title, Price, Location, Address).';
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      return 'Please enter a valid price greater than 0.';
    }

    if (formData.beds && Number(formData.beds) < 0) {
      return 'Number of beds cannot be negative.';
    }

    if (formData.baths && Number(formData.baths) < 0) {
      return 'Number of baths cannot be negative.';
    }

    if (formData.area && Number(formData.area) < 0) {
      return 'Property area cannot be negative.';
    }

    return null;
  };

  /*
   * Submit the form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Field validations
    if (
      !formData.title.trim() || 
      !formData.price || 
      !formData.location.trim() || 
      !formData.address.trim()
    ) {
      setError('Please fill in all required fields (Title, Price, Location, Address).'
      );
      return;
    }

    // Convert price to a number and validate
    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    setSubmitting(true);

    try {
      const propertyId = isEdit ? property._id || property.id : null;
      const url = isEdit ? `/api/properties/${propertyId}` : '/api/properties';
      const method = isEdit ? 'put' : 'post';

      /*
       * Convert form values from strings to numbers
       * before sending them to the backend.
       */
      const payload = {
        ...formData,
        title: formData.title.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),

        price: Number(formData.price),
        beds: parseInt(formData.beds, 10) || 0,
        baths: parseFloat(formData.baths) || 0,
        area: parseFloat(formData.area) || 0
      };

      

      const response = await axios[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = res.data;

      if (onSave) {
        onSave(data.property, isEdit);
      }
        
    } catch (err) {
      console.error('Property submission error:', err);

      if (err.response) {
        // Server responded with an error status
        setError(
          err.response.data?.message ||
          `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        // Request was sent but no response was received
        setError('Unable to reach the server. Please check your connection.');
      } else {
        // Something went wrong while creating the request
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Allow users to close the modal with Escape.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-form-title"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >

        {/* ================= HEADER ================= */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2
                id="property-form-title"
                className="text-xl font-semibold text-gray-900"
              >
                {isEdit ? 'Edit Property' : 'Add Property'}
              </h2>

              <p className="text-sm text-gray-500">
                {isEdit
                  ? 'Update the property information below.'
                  : 'Enter the property information below.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close property form"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit}>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="space-y-6 p-6">

            {/* ================= BASIC INFORMATION ================= */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">

                {/* Title */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="property-title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Property Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="property-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Luxury 4 Bedroom Duplex"
                    disabled={submitting}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="property-price"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Price <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="property-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 50000000"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label
                    htmlFor="property-type"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Property Type
                  </label>

                  <select
                    id="property-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

              </div>
            </section>

            {/* ================= LOCATION ================= */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Location
              </h3>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="property-location"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="property-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Abuja"
                    disabled={submitting}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="property-address"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="property-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter property address"
                    disabled={submitting}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

              </div>
            </section>

            {/* ================= PROPERTY DETAILS ================= */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Property Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">

                <div>
                  <label
                    htmlFor="property-beds"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Bedrooms
                  </label>

                  <input
                    id="property-beds"
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="0"
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="property-baths"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Bathrooms
                  </label>

                  <input
                    id="property-baths"
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    placeholder="0"
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="property-area"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Area
                  </label>

                  <input
                    id="property-area"
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 450"
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

              </div>
            </section>

            {/* ================= IMAGE SELECTION ================= */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Property Image
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PRESET_IMAGES.map((img) => {
                  const isSelected = formData.image === img.url;

                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => handleSelectPresetImage(img.url)}
                      disabled={submitting}
                      aria-label={`Select ${img.name}`}
                      aria-pressed={isSelected}
                      className={`group relative overflow-hidden rounded-xl border-2 transition ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
                          <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                            Selected
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ================= DESCRIPTION ================= */}
            <section>
              <label
                htmlFor="property-description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="property-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe the property..."
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </section>

          </div>

          {/* ================= FOOTER ================= */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              {/* {submitting ? 'Creating property...' : isEdit ? 'Update listing' : 'Submit Property'} */}
              {submitting
                ? isEdit
                  ? 'Updating property...'
                  : 'Creating property...'
                : isEdit
                  ? 'Update Listing'
                  : 'Submit Property'
            }
              <Save className="h-4 w-4" />

              {submitting
                ? isEdit
                  ? 'Updating property...'
                  : 'Creating property...'
                : isEdit
                  ? 'Update Listing'
                  : 'Submit Property'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

