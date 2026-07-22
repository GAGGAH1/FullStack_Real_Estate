import { useState } from 'react';
import axios from 'axios';
import { Mail, MessageSquare, Send, CornerDownRight, CheckCircle, Clock } from 'lucide-react';

export default function InquiryList({ inquiries, user, onReplied }) {
  const [replyMessage, setReplyMessage] = useState('');
  const [activeInquiryId, setActiveInquiryId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReplySubmit = async (e, inquiryId) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await axios.post(`/api/inquiries/${inquiryId}/reply`, 
        { replyMessage },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = res.data;
      setReplyMessage('');
      setActiveInquiryId(null);
      if (onReplied) onReplied(data.inquiry);
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to reply.');
    } finally {
      setSubmitting(false);
    }
  };

  if (inquiries.length === 0) {
    return (
      <div id="no_inquiries_container" className="text-center py-12 px-4 bg-white border border-gray-100 rounded-2xl">
        <Mail size={36} className="mx-auto text-gray-300 mb-2.5" />
        <h4 className="font-sans font-bold text-sm text-slate-800">No Inquiries Found</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          {user.role === 'buyer' 
            ? "You haven't contacted any property agents yet. Browse properties and send an inquiry to see them here." 
            : "No clients have submitted inquiries on your properties yet."}
        </p>
      </div>
    );
  }

  return (
    <div id="inquiry_list_container" className="space-y-4">
      {inquiries.map(inq => {
        const isUnread = inq.status === 'unread';
        const isReplied = inq.status === 'replied';

        return (
          <div
            key={inq.id}
            id={`inquiry_card_${inq.id}`}
            className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
              isUnread && user.role !== 'buyer' ? 'border-indigo-100 ring-2 ring-indigo-50/20' : 'border-gray-100'
            }`}
          >
            {/* Header: User / Contact Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3.5 mb-3.5">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Property Inquiry</span>
                <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5 leading-snug">
                  {inq.propertyName}
                </h4>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 ${
                  isReplied 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {isReplied ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {inq.status}
                </span>
                
                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Inquiry Content Message */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {inq.buyerName ? inq.buyerName[0] : 'B'}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-none">{inq.buyerName}</h5>
                  <span className="text-[9px] text-gray-400">{inq.buyerEmail}</span>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed pl-8 italic">
                "{inq.message}"
              </p>
            </div>

            {/* Replies section */}
            {isReplied ? (
              <div className="pl-6 border-l-2 border-emerald-500 space-y-2 mt-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CornerDownRight size={13} />
                  <span>Agent Response</span>
                </div>
                <p className="text-xs text-emerald-900 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 leading-relaxed italic">
                  "{inq.replyMessage}"
                </p>
              </div>
            ) : (
              user.role !== 'buyer' && (
                <div className="mt-3">
                  {activeInquiryId === inq.id ? (
                    <form onSubmit={(e) => handleReplySubmit(e, inq.id)} className="space-y-3 pl-2">
                      {error && <p className="text-xs text-rose-600">{error}</p>}
                      <textarea
                        rows={3}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder={`Write your professional response to ${inq.buyerName}...`}
                        required
                        disabled={submitting}
                        className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setActiveInquiryId(null); setReplyMessage(''); }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyMessage.trim()}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Send size={11} />
                          {submitting ? 'Replying...' : 'Send Response'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      id={`btn_reply_trigger_${inq.id}`}
                      onClick={() => setActiveInquiryId(inq.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      Reply to Client
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
