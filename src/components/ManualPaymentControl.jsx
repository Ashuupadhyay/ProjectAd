import React, { useEffect, useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://rodiotradelink.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
import { Search, Printer } from "lucide-react";
const AdminReferralPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/referral-payouts");

      if (res.data.success) {
        setPayouts(res.data.data);
      }
    } catch (error) {
      console.error("Fetch payout error:", error);
     alert("Failed to load referral payouts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const markAsPaid = async (referralId, amount, upiId) => {
    const confirmPayment = window.confirm(
  `Have you manually made the ₹${amount} payment to ${upiId}?\n\nClick OK to mark this referral as Paid.`
);

    if (!confirmPayment) return;

    try {
      setPayingId(referralId);
      const res = await API.post("/admin/mark-paid", {
        referralId,
      });

      if (res.data.success) alert(
  `₹${res.data.amountPaid} has been successfully marked as Paid.`
);
    } catch (error) {
      console.error("Mark paid error:", error);
      alert("Payment status update failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  // Statistics Calculations
  const totalReferrals = payouts.length;
  const pendingReferrals = payouts.filter(p => p.status === "pending" || p.status === "available").length;
  const paidReferrals = payouts.filter(p => p.status === "withdrawn" || p.status === "completed").length;
  const revokedReferrals = payouts.filter(p => p.status === "revoked").length;
const filteredPayouts = payouts.filter((item) => {
  const q = search.toLowerCase().trim();

  if (!q) return true;

  const referrer = item.referrerDetails || {};
  const referred = item.referredUserDetails || {};

  return [
    referrer.name,
    referrer.mobile,
    referrer.referralCode,
    referrer.upiId,
    referred.name,
    referred.mobile,
    item.planPurchased,
    item.status,
    item.rewardAmount,
  ].some((value) =>
    String(value ?? "").toLowerCase().includes(q)
  );
});

const handlePrintReferral = () => {
  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );

  if (!printWindow) {
    alert("Please allow pop-ups to print the sheet.");
    return;
  }

  const rows = filteredPayouts
    .map((item, index) => {
      const referrer = item.referrerDetails || {};
      const referred = item.referredUserDetails || {};

      const status =
        item.status === "withdrawn" ||
        item.status === "completed"
          ? "Paid"
          : item.status === "revoked"
          ? "Revoked"
          : "Pending";

      return `
        <tr>
          <td>${index + 1}</td>

          <td>
            <strong>${referrer.name || "-"}</strong><br/>
            ${referrer.mobile || "-"}
          </td>

          <td>${referrer.referralCode || "-"}</td>

          <td>
            ${
              referrer.upiId &&
              referrer.upiId !== "UPI ID Not Updated"
                ? referrer.upiId
                : "UPI Not Added"
            }
          </td>

          <td>
            <strong>${referred.name || "-"}</strong><br/>
            ${referred.mobile || "-"}
          </td>

          <td>${item.planPurchased || "-"}</td>

          <td>₹${item.rewardAmount ?? 0}</td>

          <td>${status}</td>
        </tr>
      `;
    })
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Referral Payouts</title>

        <style>
          @page {
            size: landscape;
            margin: 12mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #111;
            margin: 0;
          }

          h1 {
            margin-bottom: 20px;
            font-size: 22px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #1f2937;
            color: white;
          }

          tr {
            page-break-inside: avoid;
          }
        </style>
      </head>

      <body>

        <h1>Referral Payouts</h1>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Referrer</th>
              <th>Referral Code</th>
              <th>UPI ID</th>
              <th>Referred User</th>
              <th>Plan</th>
              <th>Reward</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              `
                <tr>
                  <td colspan="8" style="text-align:center">
                    No records found.
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};
  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading referral payouts...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Referral Payouts
          </h1>
          <p className="text-gray-500">
            Total Referrals: {totalReferrals}
          </p>
        </div>
        <button
          onClick={fetchPayouts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Referrals</h3>
          <p className="text-2xl font-bold text-blue-600">{totalReferrals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingReferrals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Paid</h3>
          <p className="text-2xl font-bold text-green-600">{paidReferrals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Revoked</h3>
          <p className="text-2xl font-bold text-red-600">{revokedReferrals}</p>
        </div>
      </div>
{/* Search + Print */}
<div className="bg-white rounded-xl shadow p-4 mb-4">
  <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

    {/* Search */}
    <div className="relative flex-1 max-w-xl">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Referrer, Mobile, Referral Code, UPI, User..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Print Button */}
    <button
      type="button"
      onClick={handlePrintReferral}
      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-2 font-semibold"
    >
      <Printer size={18} />
      Print Sheet
    </button>

  </div>
</div>

{/* Table showing All Referrals */}
<div className="bg-white rounded-xl shadow overflow-x-auto"></div>
      {/* Table showing All Referrals */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Referrer</th>
              <th className="p-4 text-left">Referral Code</th>
              <th className="p-4 text-left">UPI ID</th>
              <th className="p-4 text-left">Referred User</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Reward</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  No referral payouts found.
                </td>
              </tr>
            ) : (
             filteredPayouts.map((item, index) => (
                <tr
                  key={item.referralId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  
                  {/* Referrer Details */}
                  <td className="p-4">
                    <div className="font-semibold">
                      {item.referrerDetails.name}
                    </div>
                    <div className="text-gray-500">
                      {item.referrerDetails.mobile}
                    </div>
                  </td>

                  {/* Referral Code */}
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                      {item.referrerDetails.referralCode || "N/A"}
                    </span>
                  </td>

                  {/* UPI */}
                  <td className="p-4">
                    {item.referrerDetails.upiId &&
                    item.referrerDetails.upiId !== "UPI ID Not Updated" ? (
                      <span className="font-medium text-green-700">
                        {item.referrerDetails.upiId}
                      </span>
                    ) : (
                      <span className="text-red-500">UPI Not Added</span>
                    )}
                  </td>

                  {/* Referred User */}
                  <td className="p-4">
                    <div className="font-medium">
                      {item.referredUserDetails.name}
                    </div>
                    <div className="text-gray-500">
                      {item.referredUserDetails.mobile}
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="p-4">{item.planPurchased}</td>

                  {/* Reward */}
                  <td className="p-4">
                    <span className="font-bold text-green-600">
                      ₹{item.rewardAmount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {item.status === "withdrawn" || item.status === "completed" ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                        Paid
                      </span>
                    ) : item.status === "revoked" ? (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-4">
                    {item.status === "withdrawn" || item.status === "completed" ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Paid
                      </span>
                    ) : item.status === "revoked" ? (
                      <span className="text-red-500">Cannot Pay</span>
                    ) : !item.referrerDetails.upiId ||
                      item.referrerDetails.upiId === "UPI ID Not Updated" ? (
                      <button
                        disabled
                        className="px-3 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        Add UPI First
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          markAsPaid(
                            item.referralId,
                            item.rewardAmount,
                            item.referrerDetails.upiId
                          )
                        }
                        disabled={payingId === item.referralId}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {payingId === item.referralId
                          ? "Updating..."
                          : `Pay ₹${item.rewardAmount}`}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReferralPayouts;
