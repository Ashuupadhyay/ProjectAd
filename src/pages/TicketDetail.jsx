import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react';
import { getTicketById, getTicketMessages, sendMessage, updateTicket } from '../services/api';
import { Send, Lock, ArrowLeft, Shield } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(true);

  // Demo user agent ID (Replace with real logged-in ID)
  const currentUserId = "60f723b12345678901234567";

  useEffect(() => {
    loadTicketDetails();
  }, [id]);

  const loadTicketDetails = async () => {
    try {
      const [ticketRes, messagesRes] = await Promise.all([
        getTicketById(id),
        getTicketMessages(id, true)
      ]);
      setTicket(ticketRes.data.data);
      setMessages(messagesRes.data.data);
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        ticketId: id,
        senderId: currentUserId,
        senderType: 'agent',
        message: newMessage,
        isInternalNote
      });
      setNewMessage('');
      loadTicketDetails();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await updateTicket(id, { status });
      loadTicketDetails();
    } catch (err) {
      console.error("Failed status update:", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading conversation...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen max-w-4xl mx-auto space-y-5">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Ticket Details Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {ticket.ticketId}
          </span>
          <h1 className="text-xl font-bold text-slate-800 mt-1">{ticket.subject}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Customer: <strong className="text-slate-700">{ticket.customerId?.name}</strong> ({ticket.customerId?.email})
          </p>
        </div>

        <select
          value={ticket.status}
          onChange={(e) => handleStatusUpdate(e.target.value)}
          className="bg-slate-100 border border-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 text-slate-700"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Messages Thread */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 pb-2 border-b">Conversation & Activity Log</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto p-1">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`p-3.5 rounded-lg max-w-xl text-sm ${
                m.isInternalNote
                  ? 'bg-amber-50 border border-amber-200 ml-auto'
                  : m.senderType === 'agent'
                  ? 'bg-indigo-50 border border-indigo-100 ml-auto'
                  : 'bg-slate-100 border border-slate-200 mr-auto'
              }`}
            >
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1 text-slate-700">
                  {m.isInternalNote && <Lock className="w-3 h-3 text-amber-600" />}
                  {m.senderId?.name || 'System'} ({m.senderType})
                </span>
                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-slate-800 text-xs whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="pt-3 border-t space-y-3">
          <textarea
            rows="3"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type response to customer or agent internal note..."
            className="w-full p-3 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>

          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2 text-xs text-amber-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Post as Private Internal Note</span>
            </label>

            <button
              type="submit"
              className={`px-4 py-2 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
                isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {isInternalNote ? 'Save Note' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}