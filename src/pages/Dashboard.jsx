import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAgentWorkload, 
  getSLAViolations, 
  getTickets 
} from '../services/api';
import MetricCard from '../components/MetricCard';
import DataManager from '../components/DataManager';
import { AlertTriangle, Clock, Users, Ticket, RefreshCw, BarChart2, Calendar, CreditCard, Building, PhoneCall } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats Data
  const [slaTickets, setSlaTickets] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collections Data (Mock / Backend linked)
  const [bookings, setBookings] = useState([
    { _id: '1', bookingId: 'BK-101', serviceName: 'AC Repair', status: 'Confirmed', amount: '₹1200' },
    { _id: '2', bookingId: 'BK-102', serviceName: 'Plumbing', status: 'Pending', amount: '₹800' }
  ]);
  const [payments, setPayments] = useState([
    { _id: '1', txnId: 'TXN-9981', user: 'Rahul Sharma', amount: '₹1200', status: 'Success' },
    { _id: '2', txnId: 'TXN-9982', user: 'Priya Singh', amount: '₹500', status: 'Failed' }
  ]);
  const [businesses, setBusinesses] = useState([
    { _id: '1', name: 'Urban Solutions', category: 'Services', status: 'Verified' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slaRes, workloadRes, ticketsRes] = await Promise.all([
        getSLAViolations().catch(() => ({ data: { data: [] } })),
        getAgentWorkload().catch(() => ({ data: { data: [] } })),
        getTickets().catch(() => ({ data: { data: [] } })),
      ]);

      setSlaTickets(slaRes.data?.data || []);
      setWorkload(workloadRes.data?.data || []);
      setAllTickets(ticketsRes.data?.data || []);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support & Operations GUI</h1>
          <p className="text-sm text-slate-500">Manage all zip database collections, CRUD operations & analytics</p>
        </div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Sync Data
        </button>
      </header>

      {/* Navigation Tabs for All Modules */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Analytics & Overview', icon: BarChart2 },
          { id: 'bookings', label: 'Bookings', icon: Calendar },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'businesses', label: 'Businesses', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 border-b-2 font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MetricCard 
              title="SLA Breaches (>24h)" 
              value={slaTickets.length} 
              icon={AlertTriangle} 
              colorClass="bg-red-100 text-red-600" 
              borderClass="border-red-200"
            />
            <MetricCard 
              title="Avg Response Time" 
              value="12 mins" 
              icon={Clock} 
              colorClass="bg-blue-100 text-blue-600" 
            />
            <MetricCard 
              title="Active Agents" 
              value={workload.length} 
              icon={Users} 
              colorClass="bg-emerald-100 text-emerald-600" 
            />
          </div>

          {/* Graphical Analytics Bar Chart Visualization */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Status & Queue Distribution Graph
            </h2>
            <div className="space-y-2 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Open Tickets</span>
                  <span>{allTickets.filter(t => t.status === 'open').length || 1}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>In Progress</span>
                  <span>{allTickets.filter(t => t.status === 'in_progress').length || 1}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Resolved</span>
                  <span>0</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Queue View */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-600" /> Recent Ticket Queue
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTickets.map((ticket) => (
                <div 
                  key={ticket._id} 
                  onClick={() => navigate(`/ticket/${ticket._id}`)}
                  className="p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer flex justify-between items-center transition text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-indigo-600">{ticket.ticketId}</span>
                    <p className="font-semibold text-slate-800">{ticket.subject}</p>
                  </div>
                  <span className="font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS DATA CRUD */}
      {activeTab === 'bookings' && (
        <DataManager 
          title="Bookings"
          items={bookings}
          columns={[
            { key: 'bookingId', label: 'Booking ID' },
            { key: 'serviceName', label: 'Service' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Amount' },
          ]}
          onCreate={(newItem) => setBookings([...bookings, { ...newItem, _id: Date.now().toString() }])}
          onDelete={(id) => setBookings(bookings.filter(b => b._id !== id))}
        />
      )}

      {/* TAB 3: PAYMENTS DATA CRUD */}
      {activeTab === 'payments' && (
        <DataManager 
          title="Payments"
          items={payments}
          columns={[
            { key: 'txnId', label: 'Transaction ID' },
            { key: 'user', label: 'Customer' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          onCreate={(newItem) => setPayments([...payments, { ...newItem, _id: Date.now().toString() }])}
          onDelete={(id) => setPayments(payments.filter(p => p._id !== id))}
        />
      )}

      {/* TAB 4: BUSINESSES DATA CRUD */}
      {activeTab === 'businesses' && (
        <DataManager 
          title="Businesses"
          items={businesses}
          columns={[
            { key: 'name', label: 'Business Name' },
            { key: 'category', label: 'Category' },
            { key: 'status', label: 'Verification Status' },
          ]}
          onCreate={(newItem) => setBusinesses([...businesses, { ...newItem, _id: Date.now().toString() }])}
          onDelete={(id) => setBusinesses(businesses.filter(b => b._id !== id))}
        />
      )}
    </div>
  );
}