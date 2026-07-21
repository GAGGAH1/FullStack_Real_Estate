import React from 'react';
import { Bed, Bath, Maximize, MapPin, Tag, Edit, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function PropertyCard({ property, user, onViewDetails, onEdit, onDelete, onApprove }) {
  const isOwner = user && (user.id === property.agentId);
  const isAdmin = user && (user.role === 'admin');

  // Format price
  const formatPrice = (price, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);

    return type === 'rent' ? `${formatted} / mo` : formatted;
  };

  return (
    <div id={`property_card_${property.id}`} className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      
      {/* Property Image & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <img
          src={property.image}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg text-white shadow-sm flex items-center gap-1 ${
            property.type === 'sale' ? 'bg-emerald-600' : 'bg-indigo-600'
          }`}>
            <Tag size={12} />
            For {property.type}
          </span>
          
          {/* Status badge for agent dashboard views */}
          {user && (isOwner || isAdmin) && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg text-white shadow-sm flex items-center gap-1 ${
              property.status === 'approved' 
                ? 'bg-emerald-500' 
                : property.status === 'rejected'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
            }`}>
              {property.status === 'approved' && <CheckCircle size={12} />}
              {property.status === 'pending' && <Clock size={12} />}
              {property.status === 'rejected' && <AlertTriangle size={12} />}
              <span className="capitalize">{property.status}</span>
            </span>
          )}
        </div>

        {/* Location tag on bottom left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1">
          <MapPin size={12} />
          {property.location}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-2">
          <span className="text-xl font-bold font-sans tracking-tight text-slate-900">
            {formatPrice(property.price, property.type)}
          </span>
        </div>

        <h3 className="font-sans font-semibold text-gray-900 leading-snug line-clamp-1 mb-2 hover:text-slate-800 cursor-pointer" onClick={() => onViewDetails(property)}>
          {property.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-4">
          {property.description}
        </p>

        {/* Property Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 mb-4 mt-auto">
          <div className="flex flex-col items-center border-r border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Beds</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-900">
              <Bed size={13} className="text-gray-500" />
              {property.beds}
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Baths</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-900">
              <Bath size={13} className="text-gray-500" />
              {property.baths}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Area</span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-slate-900">
              <Maximize size={13} className="text-gray-500" />
              {property.area} <span className="text-[10px] text-gray-500">sqft</span>
            </span>
          </div>
        </div>

        {/* Address */}
        <p className="text-xs text-gray-400 truncate mb-4">
          {property.address}
        </p>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 border-t border-gray-50 pt-4 mt-auto">
          <button
            id={`btn_view_${property.id}`}
            onClick={() => onViewDetails(property)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-all cursor-pointer"
          >
            View Details
          </button>

          {/* Edit / Delete Buttons for Agent Owners / Admins */}
          {user && (isOwner || isAdmin) && (
            <div className="flex gap-1">
              <button
                id={`btn_edit_${property.id}`}
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 rounded-lg transition-all"
                title="Edit Listing"
              >
                <Edit size={14} />
              </button>
              <button
                id={`btn_delete_${property.id}`}
                onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-100 rounded-lg transition-all"
                title="Delete Listing"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Quick Admin Approvals (under layout if in Admin view) */}
        {isAdmin && property.status === 'pending' && (
          <div className="mt-3 flex gap-1.5 border-t border-gray-100 pt-3">
            <button
              id={`btn_approve_${property.id}`}
              onClick={() => onApprove(property.id, 'approved')}
              className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] uppercase py-1.5 rounded"
            >
              Approve
            </button>
            <button
              id={`btn_reject_${property.id}`}
              onClick={() => onApprove(property.id, 'rejected')}
              className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] uppercase py-1.5 rounded"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
