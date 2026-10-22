import React, { useEffect, useState } from "react";
import { Search, Printer } from "lucide-react";

const API_URL = "https://rodiotradelink.com";

const ManualDocumentVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [search, setSearch] = useState("");

  // ======================================================
  // GET USERS + DOCUMENTS
  // ======================================================

  const fetchUsersDocuments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/documents/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
         throw new Error("Unable to fetch documents. Please try again.");
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error(
        "FETCH ADMIN DOCUMENTS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // VERIFY USER
  // ======================================================

  const handleVerifyUser = async (businessId) => {
    if (!businessId) {
      alert("Business ID missing");
      return;
    }

    try {
      setVerifyingId(businessId);

      const token = localStorage.getItem("token");

      console.log("VERIFY BUSINESS ID:", businessId);
      console.log("TOKEN EXISTS:", !!token);

      const response = await fetch(
        `${API_URL}/api/admin/business/${businessId}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("VERIFY RESPONSE:", result);

      if (!response.ok) {
        
  throw new Error("Verification failed. Please try again.");
      }

      // Local UI immediately update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.businessId === businessId
            ? {
                ...user,
                isVerified: true,
                verifiedAt:
                  result.data?.verifiedAt ||
                  new Date().toISOString(),
              }
            : user
        )
      );

      alert("User verified successfully");

    } catch (error) {
      console.error(
        "VERIFY USER ERROR:",
        error
      );

      alert("Unable to verify user. Please try again.");
    } finally {
      setVerifyingId(null);
    }
  };

  // ======================================================
  // REMOVE VERIFICATION
  // ======================================================

  const handleUnverifyUser = async (businessId) => {
    if (!businessId) {
      alert("Business ID missing");
      return;
    }

    try {
      setVerifyingId(businessId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/business/${businessId}/unverify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("UNVERIFY RESPONSE:", result);

      if (!response.ok) {
        throw new Error("Unable to remove verification. Please try again.");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.businessId === businessId
            ? {
                ...user,
                isVerified: false,
                verifiedAt: null,
              }
            : user
        )
      );

      alert("Verification removed");

    } catch (error) {
      console.error(
        "UNVERIFY USER ERROR:",
        error
      );

      alert("Unable to remove verification. Please try again.");
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    fetchUsersDocuments();
  }, []);
// ======================================================
// SEARCH / FILTER
// ======================================================

const filteredUsers = users.filter((user) => {
  const q = search.toLowerCase().trim();

  if (!q) return true;

  const documentNames = (user.documents || [])
    .map(
      (document) =>
        document.documentName ||
        document.documentType ||
        ""
    )
    .join(" ");

  return [
    user.name,
    user.firmName,
    user.email,
    user.mobile,
    documentNames,
    user.isVerified ? "verified" : "pending",
  ].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(q)
  );
});

// ======================================================
// PRINT SHEET
// ======================================================

const handlePrintDocuments = () => {
  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );

  if (!printWindow) {
    alert("Please allow pop-ups to print the sheet.");
    return;
  }

  const rows = filteredUsers
    .map(
      (user, index) => `
        <tr>
          <td>${index + 1}</td>

          <td>
            <strong>${user.name || "-"}</strong>
            ${
              user.firmName
                ? `<br/><span>${user.firmName}</span>`
                : ""
            }
          </td>

          <td>${user.email || "-"}</td>

          <td>${user.mobile || "-"}</td>

          <td>
            ${
              user.isVerified
                ? "Verified"
                : "Pending"
            }
          </td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Manual Document Verification</title>

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
            font-size: 22px;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 9px;
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

        <h1>Manual Document Verification</h1>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              `
                <tr>
                  <td colspan="5" style="text-align:center">
                    No users found
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
      <div className="p-6">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="p-6">




<h2 className="mb-6 text-2xl font-bold">
  Manual Document Verification
</h2>

{/* Search + Print */}
<div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

    <div className="relative w-full max-w-xl">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search User, Firm, Email, Mobile, Document..."
        className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      type="button"
      onClick={handlePrintDocuments}
      className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
    >
      <Printer size={18} />
      Print Sheet
    </button>

  </div>
</div>

<div className="overflow-x-auto rounded-xl border bg-white">

        <table className="w-full">

          {/* ==================================================
              TABLE HEADER
          ================================================== */}

          <thead>
            <tr className="border-b bg-gray-50">

              <th className="p-4 text-left">
                User
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Mobile
              </th>

              <th className="p-4 text-left">
                Document Name
              </th>

              <th className="p-4 text-left">
                View Document
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Action
              </th>

            </tr>
          </thead>

          {/* ==================================================
              TABLE BODY
          ================================================== */}

          <tbody>

            {filteredUsers.map((user) => (

              <tr
                key={user.businessId}
                className="border-b hover:bg-gray-50"
              >

                {/* USER */}

                <td className="p-4 align-top">

                  <div className="font-semibold text-gray-800">
                    {user.name || "N/A"}
                  </div>

                  {user.firmName && (
                    <div className="mt-1 text-xs text-gray-500">
                      {user.firmName}
                    </div>
                  )}

                </td>

                {/* EMAIL */}

                <td className="p-4 align-top">
                  {user.email || "-"}
                </td>

                {/* MOBILE */}

                <td className="p-4 align-top">
                  {user.mobile || "-"}
                </td>

                {/* DOCUMENT NAME */}

                <td className="p-4 align-top">

                  <div className="max-h-32 space-y-2 overflow-y-auto pr-2">

                    {user.documents?.length > 0 ? (

                      user.documents.map((document) => (

                        <div
                          key={document._id}
                          className="flex min-h-[36px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                        >

                          <span className="text-sm font-medium capitalize text-gray-700">
                            {document.documentName ||
                              document.documentType ||
                              "Unknown Document"}
                          </span>

                        </div>

                      ))

                    ) : (

                      <span className="text-xs text-gray-400">
                        No documents
                      </span>

                    )}

                  </div>

                </td>

                {/* VIEW DOCUMENT */}

                <td className="p-4 align-top">

                  <div className="max-h-32 space-y-2 overflow-y-auto pr-2">

                    {user.documents?.length > 0 ? (

                      user.documents.map((document) => (

                        <div
                          key={document._id}
                          className="flex min-h-[36px] items-center"
                        >

                          <button
                            onClick={() =>
                              window.open(
                                document.documentUrl,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            View
                          </button>

                        </div>

                      ))

                    ) : (

                      <span className="text-xs text-gray-400">
                        -
                      </span>

                    )}

                  </div>

                </td>

                {/* STATUS */}

                <td className="p-4 align-top">

                  {user.isVerified ? (

                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      ✓ Verified
                    </span>

                  ) : (

                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Pending
                    </span>

                  )}

                </td>

                {/* ACTION */}

                <td className="p-4 align-top">

                  {!user.isVerified ? (

                    <button
                      onClick={() =>
                        handleVerifyUser(
                          user.businessId
                        )
                      }
                      disabled={
                        verifyingId ===
                        user.businessId
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {verifyingId ===
                      user.businessId
                        ? "Verifying..."
                        : "Verify User"}

                    </button>

                  ) : (

                    <button
                      onClick={() =>
                        handleUnverifyUser(
                          user.businessId
                        )
                      }
                      disabled={
                        verifyingId ===
                        user.businessId
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {verifyingId ===
                      user.businessId
                        ? "Processing..."
                        : "Remove Verify"}

                    </button>

                  )}

                </td>

              </tr>

            ))}

            {/* NO USERS */}

            {filteredUsers.length === 0 && (
              <tr>

                <td
                  colSpan="7"
                  className="p-10 text-center text-gray-500"
                >
                  No users found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ManualDocumentVerification;
