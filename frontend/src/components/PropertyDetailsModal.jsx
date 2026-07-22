import { useState } from 'react';
import axios from 'axios';
import { X, Send, MapPin, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';

export default function PropertyDetailsModal({ property, user, onClose, onInquirySubmit, onAuthRequired }) {
  const [message, setMessage] = useState(`Hi, I am interested in your property listing at ${property.address}. Please let me know the next steps to arrange a viewing!`);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!message.trim()) {
      setError('Inquiry message cannot be empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await axios.post('/api/inquiries', 
        {
          propertyId: property.id,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = res.data;
      setSuccess(true);
      if (onInquirySubmit) onInquirySubmit(data.inquiry);
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);

    return type === 'rent' ? `${formatted} / mo` : formatted;
  };

  const isMyProperty = user && user.id === property.agentId;

  return (
    <div id="property_details_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div id="property_details_modal_content" className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Left Side: Property Hero Image */}
        <div className="relative md:w-1/2 bg-gray-900 aspect-video md:aspect-auto">
          <img
            src={property.image}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span className={`self-start px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg text-white mb-2 shadow-sm ${
              property.type === 'sale' ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}>
              For {property.type}
            </span>
            <h2 className="text-2xl font-sans font-bold text-white mb-1 leading-tight">
              {property.title}
            </h2>
            <div className="flex items-center gap-1.5 text-gray-300 text-sm">
              <MapPin size={14} className="text-rose-500" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Specifications & Contact Forms */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh] flex flex-col justify-between">
          <div>
            {/* Header / Dismiss */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Asking Price</span>
                <p className="text-3xl font-sans font-black text-slate-900 leading-none">
                  {formatPrice(property.price, property.type)}
                </p>
              </div>
              <button
                id="btn_close_details_modal"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl text-center mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bedrooms</span>
                <span className="text-lg font-bold text-slate-900">{property.beds} Bed</span>
              </div>
              <div className="flex flex-col border-x border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bathrooms</span>
                <span className="text-lg font-bold text-slate-900">{property.baths} Bath</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Size</span>
                <span className="text-lg font-bold text-slate-900">{property.area} <span className="text-xs text-gray-500">sqft</span></span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-2">
                Listing Overview
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Listing Agent Info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm uppercase">
                {property.agentName ? property.agentName[0] : 'A'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing Agent</span>
                <h5 className="text-sm font-bold text-slate-900 leading-tight">
                  {property.agentName || 'Independent Partner'}
                </h5>
              </div>
            </div>
          </div>

          {/* Contact / Inquiry Section */}
          <div className="border-t border-gray-100 pt-6 mt-4">
            {success ? (
              <div id="inquiry_success_banner" className="flex flex-col items-center text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                <CheckCircle size={32} className="text-emerald-600 mb-2" />
                <h4 className="font-sans font-bold text-sm">Inquiry Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  The listing agent has been notified and will get back to you shortly.
                </p>
              </div>
            ) : isMyProperty ? (
              <div id="inquiry_own_property_banner" className="flex items-center gap-2.5 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs">
                <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
                <span>You own this property listing. Buyers can submit inquiries, which will appear in your <strong>Workspace Dashboard</strong>.</span>
              </div>
            ) : (
              <form id="inquiry_form" onSubmit={handleInquirySubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-gray-500" />
                    Request More Information
                  </h4>
                  {!user && (
                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Registration Required
                    </span>
                  )}
                </div>

                <textarea
                  id="inquiry_textarea"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question, request a tour date, or inquire about property paperwork..."
                  disabled={submitting}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />

                {error && (
                  <p id="inquiry_error_message" className="text-xs text-rose-600 font-medium">
                    {error}
                  </p>
                )}

                {user ? (
                  <button
                    id="btn_submit_inquiry"
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer disabled:bg-slate-300"
                  >
                    <Send size={14} />
                    {submitting ? 'Submitting Inquiry...' : 'Send Message to Agent'}
                  </button>
                ) : (
                  <button
                    id="btn_prompt_signin_inquiry"
                    type="button"
                    onClick={onAuthRequired}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <span>Sign In to Contact Agent</span>
                  </button>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
