import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Phone,
  CalendarDays,
  FileText,
  UserCheck,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5001/api/admin-created-users/complaints";

const Complainstatus = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    customerId: "",
    customerName: "",
    category: "",
    description: "",
    status: "Pending",
    resolutionDetails: "",
  });

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please login again.");
    return token;
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/all`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch complaints");
      }
      setComplaints(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const id = String(complaint.complaintId || "").toLowerCase();
      const search = searchId.trim().toLowerCase();
      const matchesSearch = !search || id.includes(search);
      const matchesStatus =
        statusFilter === "All" ||
        String(complaint.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchId, statusFilter]);

  const pendingComplaints = complaints.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;
  const resolvedComplaints = complaints.filter(
    (item) => item.status?.toLowerCase() === "resolved"
  ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not available";
    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const openEdit = (complaint) => {
    setActionError("");
    setEditForm({
      customerId: complaint.customerId || "",
      customerName: complaint.customerName || "",
      category: complaint.category || "",
      description: complaint.description || "",
      status: complaint.status || "Pending",
      resolutionDetails: complaint.resolutionDetails || "",
    });
    setEditingComplaint(complaint);
    setSelectedComplaint(null);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingComplaint?.complaintId) return;

    try {
      setSaving(true);
      setActionError("");
      const response = await fetch(
        `${API_URL}/update/${encodeURIComponent(editingComplaint.complaintId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(editForm),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update complaint");
      }
      setEditingComplaint(null);
      await fetchComplaints();
    } catch (err) {
      setActionError(err.message || "Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingComplaint?.complaintId) return;

    try {
      setSaving(true);
      setActionError("");
      const response = await fetch(
        `${API_URL}/delete/${encodeURIComponent(deletingComplaint.complaintId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete complaint");
      }
      setDeletingComplaint(null);
      setSelectedComplaint(null);
      await fetchComplaints();
    } catch (err) {
      setActionError(err.message || "Failed to delete complaint");
    } finally {
      setSaving(false);
    }
  };

  const ComplaintDetails = ({ complaint }) => (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Complaint ID</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {complaint.complaintId || "Not available"}
          </h3>
        </div>
        <span className={`rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(complaint.status)}`}>
          {complaint.status || "Pending"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Detail icon={<UserRound size={18} />} label="Customer Name" value={complaint.customerName} />
        <Detail icon={<Phone size={18} />} label="Customer ID / Mobile" value={complaint.customerId} />
        <Detail icon={<FileText size={18} />} label="Complaint Category" value={complaint.category} />
        <Detail icon={<UserCheck size={18} />} label="Complaint Received By" value={complaint.registeredBy} />
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <h4 className="mb-2 font-bold text-slate-800">Complaint Description</h4>
        <p className="whitespace-pre-wrap break-words leading-7 text-slate-600">
          {complaint.description || "No description available"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Detail icon={<CalendarDays size={18} />} label="Created At" value={formatDate(complaint.createdAt)} />
        <Detail icon={<CheckCircle2 size={18} />} label="Resolved At" value={formatDate(complaint.resolvedAt)} />
        <Detail icon={<UserCheck size={18} />} label="Resolved By" value={complaint.resolvedBy || "Not resolved yet"} />
        <Detail icon={<FileText size={18} />} label="Resolution Details" value={complaint.resolutionDetails || "Not available"} />
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 p-3 sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Complaint Management</h1>
        <p className="mt-2 text-base text-slate-500">Track, search and manage customer complaints.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Complaints" value={complaints.length} icon={<FileText size={26} />} />
        <StatCard title="Pending Complaints" value={pendingComplaints} icon={<Clock size={26} />} />
        <StatCard title="Resolved Complaints" value={resolvedComplaints} icon={<CheckCircle2 size={26} />} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search by Complaint ID..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500"
          >
            <option value="All">All Complaints</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            type="button"
            onClick={() => { setSearchId(""); setStatusFilter("All"); }}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Complaint Records</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">{filteredComplaints.length} Records</span>
            <button
              type="button"
              onClick={fetchComplaints}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto text-red-500" size={36} />
            <p className="mt-3 font-semibold text-red-700">{error}</p>
            <button onClick={fetchComplaints} className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Try Again</button>
          </div>
        ) : loading ? (
          <div className="p-10 text-center">
            <RefreshCw className="mx-auto animate-spin text-blue-600" size={30} />
            <p className="mt-3 text-slate-500">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto text-slate-400" size={36} />
            <p className="mt-3 text-lg font-semibold text-slate-700">No complaints found</p>
            <p className="mt-1 text-sm text-slate-500">No complaint matches your search.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    <th className="px-5 py-4">Complaint ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Created At</th>
                    <th className="px-5 py-4">Received By</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id || complaint.complaintId} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <button onClick={() => setSelectedComplaint(complaint)} className="font-bold text-blue-700 hover:underline">
                          {complaint.complaintId || "N/A"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{complaint.customerName || "N/A"}</p>
                        <p className="mt-1 text-sm text-slate-500">{complaint.customerId || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">{complaint.category || "N/A"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(complaint.createdAt)}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{complaint.registeredBy || "N/A"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${getStatusStyle(complaint.status)}`}>
                          {complaint.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* <ActionButton title="View" onClick={() => setSelectedComplaint(complaint)} className="bg-blue-50 text-blue-700 hover:bg-blue-100"><FileText size={18} /></ActionButton> */}
                          <ActionButton title="Edit" onClick={() => openEdit(complaint)} className="bg-amber-50 text-amber-700 hover:bg-amber-100"><Pencil size={18} /></ActionButton>
                          <ActionButton title="Delete" onClick={() => { setActionError(""); setDeletingComplaint(complaint); }} className="bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={18} /></ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id || complaint.complaintId} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">Complaint ID</p>
                      <button onClick={() => setSelectedComplaint(complaint)} className="mt-1 break-all font-bold text-blue-700">{complaint.complaintId || "N/A"}</button>
                    </div>
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(complaint.status)}`}>{complaint.status || "Pending"}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-500">Customer: </span>{complaint.customerName || "N/A"}</p>
                    <p><span className="font-semibold text-slate-500">Customer ID: </span>{complaint.customerId || "N/A"}</p>
                    <p><span className="font-semibold text-slate-500">Category: </span>{complaint.category || "N/A"}</p>
                    <p><span className="font-semibold text-slate-500">Received By: </span>{complaint.registeredBy || "N/A"}</p>
                    <p><span className="font-semibold text-slate-500">Created: </span>{formatDate(complaint.createdAt)}</p>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button onClick={() => setSelectedComplaint(complaint)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm font-bold text-blue-700"><FileText size={17} /> View</button>
                    <button onClick={() => openEdit(complaint)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-3 text-sm font-bold text-amber-700"><Pencil size={17} /> Edit</button>
                    <button onClick={() => { setActionError(""); setDeletingComplaint(complaint); }} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm font-bold text-red-600"><Trash2 size={17} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedComplaint && (
        <Modal title="Complaint Details" onClose={() => setSelectedComplaint(null)}>
          <ComplaintDetails complaint={selectedComplaint} />
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button onClick={() => setSelectedComplaint(null)} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Close</button>
            <button onClick={() => openEdit(selectedComplaint)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"><Pencil size={17} /> Edit Complaint</button>
          </div>
        </Modal>
      )}

      {editingComplaint && (
        <Modal title={`Edit Complaint - ${editingComplaint.complaintId}`} onClose={() => !saving && setEditingComplaint(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            {actionError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer ID / Mobile">
                <input value={editForm.customerId} onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Customer Name">
                <input value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} required className={inputClass} />
              </FormField>
              <FormField label="Category">
                <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required className={inputClass} />
              </FormField>
             
            </div>
            <FormField label="Description">
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required rows={4} className={inputClass} />
            </FormField>
            <FormField label="Resolution Details">
              <textarea value={editForm.resolutionDetails} onChange={(e) => setEditForm({ ...editForm, resolutionDetails: e.target.value })} rows={3} className={inputClass} />
            </FormField>
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button type="button" disabled={saving} onClick={() => setEditingComplaint(null)} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Updating..." : "Save Changes"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deletingComplaint && (
        <Modal title="Delete Complaint?" onClose={() => !saving && setDeletingComplaint(null)}>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={26} /></div>
            <p className="mt-4 text-slate-600">Are you sure you want to delete complaint <strong>{deletingComplaint.complaintId}</strong>?</p>
            {actionError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-6 flex gap-3">
              <button disabled={saving} onClick={() => setDeletingComplaint(null)} className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
              <button disabled={saving} onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const inputClass = "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Detail({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-semibold">{label}</span></div>
      <p className="break-words text-base font-bold text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-base font-semibold text-slate-500">{title}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2></div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, title, className }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} className={`rounded-lg p-2.5 ${className}`}>{children}</button>;
}

function FormField({ label, children }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={23} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Complainstatus;
