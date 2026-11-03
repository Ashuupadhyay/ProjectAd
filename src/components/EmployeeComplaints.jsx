
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  UserRound,
  Mail,
  FileText,
  CalendarDays,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const API_BASE_URL =
  "http://localhost:5001/api/admin-created-users/complaints";

const EmployeeComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/all`, {
        method: "GET",
        headers: getAuthHeaders(),
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

  const updateComplaintStatus = async (complaint, status) => {
    const complaintKey = complaint._id || complaint.complaintId;

    try {
      setUpdatingId(complaintKey);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/update/${encodeURIComponent(
          complaint.complaintId
        )}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update complaint status"
        );
      }

      setSuccess(
        `Complaint ${complaint.complaintId} status updated to ${status}.`
      );

      await fetchComplaints();
    } catch (err) {
      setError(err.message || "Failed to update complaint status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !query ||
        [
          complaint.complaintId,
          complaint.customerName,
          complaint.customerId,
          complaint.registeredBy,
          complaint.updatedBy,
          complaint.resolvedBy,
          complaint.category,
          complaint.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesStatus =
        statusFilter === "All" ||
        String(complaint.status || "Pending").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  const employeeGroups = useMemo(() => {
    return filteredComplaints.reduce((groups, complaint) => {
      const email =
        complaint.registeredBy || "Employee email unavailable";

      if (!groups[email]) groups[email] = [];

      groups[email].push(complaint);

      return groups;
    }, {});
  }, [filteredComplaints]);

  const counts = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter(
        (item) => String(item.status).toLowerCase() === "pending"
      ).length,
      inProgress: complaints.filter(
        (item) => String(item.status).toLowerCase() === "in progress"
      ).length,
      resolved: complaints.filter(
        (item) => String(item.status).toLowerCase() === "resolved"
      ).length,
    }),
    [complaints]
  );

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusClass = (status) => {
    switch (String(status || "Pending").toLowerCase()) {
      case "resolved":
        return "border-green-200 bg-green-50 text-green-700";

      case "in progress":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  // DOWNLOAD EXCEL
  const downloadExcel = () => {
    if (!filteredComplaints.length) return;

    const excelData = filteredComplaints.map((complaint, index) => {
      const history = Array.isArray(complaint.updateHistory)
        ? [...complaint.updateHistory].sort(
            (a, b) =>
              new Date(b.updatedAt || 0) -
              new Date(a.updatedAt || 0)
          )
        : [];

      const latestUpdate = history[0] || null;

      return {
        "S.No.": index + 1,
        "Complaint ID": complaint.complaintId || "",
        "Customer Name": complaint.customerName || "",
        "Customer ID": complaint.customerId || "",
        Category: complaint.category || "",
        Description: complaint.description || "",

        "Registered By (Employee Email)": complaint.registeredBy || "",
        "Registered Date & Time": formatDate(complaint.createdAt),

        Status: complaint.status || "Pending",

        "Last Updated By (Employee Email)":
          latestUpdate?.employeeEmail || complaint.updatedBy || "",

        "Last Status Update Date & Time": formatDate(
          latestUpdate?.updatedAt || complaint.updatedAt
        ),

        "Resolved By (Employee Email)": complaint.resolvedBy || "",
        "Resolved Date & Time": formatDate(complaint.resolvedAt),

        "Resolution Details": complaint.resolutionDetails || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 16 },
      { wch: 22 },
      { wch: 16 },
      { wch: 22 },
      { wch: 40 },
      { wch: 32 },
      { wch: 24 },
      { wch: 16 },
      { wch: 32 },
      { wch: 26 },
      { wch: 30 },
      { wch: 24 },
      { wch: 40 },
    ];

    worksheet["!autofilter"] = {
      ref: worksheet["!ref"],
    };

    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
      topLeftCell: "A2",
      activePane: "bottomLeft",
      state: "frozen",
    };

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Employee Complaints"
    );

    XLSX.writeFile(
      workbook,
      `Rodio_Complaints_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Employee Complaints
        </h1>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Review complaints submitted by employees and update their status.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Complaints",
            value: counts.total,
            icon: FileText,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Pending",
            value: counts.pending,
            icon: Clock,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "In Progress",
            value: counts.inProgress,
            icon: RefreshCw,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Resolved",
            value: counts.resolved,
            icon: CheckCircle2,
            color: "text-green-600 bg-green-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${item.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH, FILTER AND ACTIONS */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto_auto]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee email, complaint ID, customer..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <button
            type="button"
            onClick={downloadExcel}
            disabled={loading || filteredComplaints.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            Download Excel
          </button>

          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* COMPLAINTS */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm">
            Loading employee complaints...
          </p>
        </div>
      ) : Object.keys(employeeGroups).length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <AlertCircle size={34} className="mx-auto text-slate-400" />

          <p className="mt-3 font-semibold text-slate-700">
            No complaints found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            No complaints match the selected search or status.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(employeeGroups).map(
            ([employeeEmail, employeeComplaints]) => (
              <section
                key={employeeEmail}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* EMPLOYEE HEADER */}
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                      <UserRound size={22} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        Employee Complaints
                      </h2>

                      <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                        <Mail size={15} className="shrink-0" />
                        {employeeEmail}
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                    {employeeComplaints.length} Complaints
                  </span>
                </div>

                {/* COMPLAINT LIST */}
                <div className="divide-y divide-slate-100">
                  {employeeComplaints.map((complaint) => {
                    const complaintKey =
                      complaint._id || complaint.complaintId;

                    const currentStatus =
                      complaint.status || "Pending";

                    const isUpdating = updatingId === complaintKey;

                    return (
                      <article
                        key={complaintKey}
                        className="space-y-4 p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-blue-700">
                                {complaint.complaintId ||
                                  "Complaint ID unavailable"}
                              </span>

                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                                  currentStatus
                                )}`}
                              >
                                {currentStatus}
                              </span>
                            </div>

                            <h3 className="mt-2 text-base font-bold text-slate-900">
                              {complaint.customerName ||
                                "Customer name unavailable"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Category: {complaint.category || "Not available"}
                            </p>

                            <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                              <Mail size={14} />
                              Registered By:{" "}
                              {complaint.registeredBy || "Email unavailable"}
                            </p>
                          </div>

                          {/* STATUS ACTIONS */}
                          <div className="flex flex-wrap gap-2">
                            {currentStatus !== "In Progress" &&
                              currentStatus !== "Resolved" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    updateComplaintStatus(
                                      complaint,
                                      "In Progress"
                                    )
                                  }
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  {isUpdating ? "Updating..." : "In Progress"}
                                </button>
                              )}

                            {currentStatus !== "Resolved" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateComplaintStatus(
                                    complaint,
                                    "Resolved"
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                <CheckCircle2 size={17} />

                                {isUpdating ? "Updating..." : "Mark Complete"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* COMPLAINT INFORMATION */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Customer ID
                            </p>

                            <p className="mt-1 break-words text-sm font-medium text-slate-700">
                              {complaint.customerId || "Not available"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Submitted On
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                              <CalendarDays size={15} />
                              {formatDate(complaint.createdAt)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2 xl:col-span-1">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Resolved By
                            </p>

                            <p className="mt-1 break-words text-sm font-medium text-slate-700">
                              {complaint.resolvedBy || "Not resolved"}
                            </p>
                          </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="rounded-lg border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-400">
                            Complaint Description
                          </p>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                            {complaint.description ||
                              "No description provided"}
                          </p>
                        </div>

                        {/* RESOLUTION DETAILS */}
                        {complaint.resolutionDetails && (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="text-xs font-semibold uppercase text-green-700">
                              Resolution Details
                            </p>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-green-800">
                              {complaint.resolutionDetails}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeComplaints;
