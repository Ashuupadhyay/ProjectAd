
import HeroSlide from "./HeroSlide";
import Media from "./Media";
import Load from "./Load";
import Review from "./Review";
import React, { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import ManualPaymentControl from "./ManualPaymentControl";
import ManualDocumentVerification from "./ManualDocumentVerification";
import PasswordResetControl from "./PasswordResetControl";
import Register from "./Register";
import ProfileManagement from "./ProfileManagement";
import Advertisement from "./Advertisement";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  RefreshCw,
  User,
  UserPlus,
  Search,
  Star,
  ShieldCheck,
  CreditCard,
  PieChart as PieIcon,
  Database,
  CheckCircle,
  XCircle,
  Layers,
  Trash2,
  Building2,
  Edit,
  X,
  Save,
  Briefcase,
  ExternalLink,
  Lock,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  FileCheck,
  ShieldAlert,
  Printer,
  ImageIcon,
} from "lucide-react";


/* =========================================================
   CONSTANTS
========================================================= */

const modelsList = [
  "user",
  "business",
  "booking",
  "payment",
];

const DEFAULT_MODEL_KEYS = {
  user: [
    "_id",
    "name",
    "firmName",
    "mobile",
    "subscriptionStatus",
    "createdAt",
  ],

  business: [
    "_id",
    "businessName",
    "owner",
    "category",
    "isVerified",
    "createdAt",
  ],

  booking: [
    "_id",
    "user",
    "business",
    "bookingDate",
    "status",
    "createdAt",
  ],

  payment: [
    "_id",
    "user",
    "amount",
    "paymentId",
    "status",
    "createdAt",
  ],

  businessdocument: [
    "_id",
    "business",
    "user",
    "documentType",
    "documentUrl",
  ],

  comment: [
    "_id",
    "user",
    "text",
    "rating",
    "createdAt",
  ],

  subscription: [
    "_id",
    "user",
    "planName",
    "status",
    "startDate",
    "endDate",
  ],

  vehicle: [
    "_id",
    "user",
    "vehicleNumber",
    "modelName",
    "status",
  ],
};


const PALETTE = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  purple: "#a855f7",
  cyan: "#06b6d4",
  pink: "#ec4899",
  blue: "#3b82f6",
};

const MODEL_COLORS = [
  PALETTE.indigo,
  PALETTE.emerald,
  PALETTE.amber,
  PALETTE.rose,
  PALETTE.purple,
  PALETTE.cyan,
  PALETTE.pink,
  PALETTE.blue,
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminDashboard() {

  const handlePrintSubscription = () => {
    const rows = filteredSubscriptionUsers
      .map((user) => {
        const subscription = user.subscription;

        const active =
          subscription &&
          (
            subscription.isActive === true ||
            subscription.status === "active"
          );

        return `
        <tr>
          <td>${user.name || user.firmName || "User"}</td>
          <td>${user.firmName || "-"}</td>
          <td>${user.mobile || "-"}</td>
          <td>${active ? "Active" : "No Subscription"}</td>
        </tr>
      `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=1000,height=700");

    if (!printWindow) {
      alert("Please allow popups for printing.");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Subscription Sheet</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 30px;
            font-family: Arial, sans-serif;
            background: white;
            color: #111;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 10px 12px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
            font-weight: 700;
          }

          tr {
            page-break-inside: avoid;
          }

          @media print {
            body {
              margin: 10mm;
            }

            table {
              width: 100%;
            }
          }
        </style>
      </head>

      <body>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Firm Name</th>
              <th>Mobile Number</th>
              <th>Subscription</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
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

  /* =========================================================
     ADMIN AUTH STATE
  ========================================================= */
  const [referralSearch, setReferralSearch] = useState("");
  
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [inputPassword, setInputPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);

  const [isLocked, setIsLocked] = useState(false);

  const [lockTimeLeft, setLockTimeLeft] = useState("");

  const [loginError, setLoginError] = useState("");

  const [isLoadingLogin, setIsLoadingLogin] = useState(false);


  /* =========================================================
     DASHBOARD STATE
  ========================================================= */

  const [activeTab, setActiveTab] = useState("analytics_hub");

  const [selectedModel, setSelectedModel] = useState("user");

  const [tableData, setTableData] = useState([]);

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [editingRecord, setEditingRecord] = useState(null);

  const [editFormData, setEditFormData] = useState({});

  const [isUpdating, setIsUpdating] = useState(false);


  /* =========================================================
     ALL DATA
  ========================================================= */

  const [allUsersList, setAllUsersList] = useState([]);

  const [paymentsList, setPaymentsList] = useState([]);

  const [allModelsData, setAllModelsData] = useState({
    user: [],
    business: [],
    booking: [],
    payment: [],
    businessdocument: [],
    comment: [],
    subscription: [],
    vehicle: [],
  });


  /* =========================================================
     OLD DUMMY IDS
  ========================================================= */

  const [oldDummyBusinessIds, setOldDummyBusinessIds] = useState([]);


  /* =========================================================
     SECURITY LOCK
  ========================================================= */

  useEffect(() => {

    const attempts =
      Number(localStorage.getItem("admin_login_attempts") || 0);

    const lockUntil =
      Number(localStorage.getItem("admin_lock_until") || 0);

    setFailedAttempts(attempts);

    if (lockUntil && Date.now() < lockUntil) {

      setIsLocked(true);

      calculateTimeLeft(lockUntil);

    } else {

      localStorage.removeItem("admin_lock_until");

      setIsLocked(false);
      setLockTimeLeft("");
    }

  }, []);


  /* =========================================================
     CALCULATE LOCK TIME
  ========================================================= */

  const calculateTimeLeft = (lockUntil) => {

    const update = () => {

      const difference = lockUntil - Date.now();

      if (difference <= 0) {

        setIsLocked(false);

        setLockTimeLeft("");

        localStorage.removeItem("admin_lock_until");

        localStorage.removeItem("admin_login_attempts");

        setFailedAttempts(0);

        return;
      }

      const hours = Math.floor(
        difference / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) /
        (1000 * 60)
      );

      const seconds = Math.floor(
        (difference % (1000 * 60)) /
        1000
      );

      setLockTimeLeft(
        `${hours}h ${minutes}m ${seconds}s`
      );
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  };


  /* =========================================================
     WRONG PASSWORD
  ========================================================= */

  const handleWrongPassword = () => {

    const newAttempts = failedAttempts + 1;

    setFailedAttempts(newAttempts);

    localStorage.setItem(
      "admin_login_attempts",
      String(newAttempts)
    );

    if (newAttempts >= 5) {

      const lockUntil =
        Date.now() + 24 * 60 * 60 * 1000;

      localStorage.setItem(
        "admin_lock_until",
        String(lockUntil)
      );

      setIsLocked(true);

      calculateTimeLeft(lockUntil);

      setLoginError(
        "5 wrong attempts. Admin login 24 hours ke liye locked hai."
      );

    } else {

      setLoginError(
        `Wrong password. ${5 - newAttempts} attempts remaining.`
      );
    }
  };


  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  const handleLoginSubmit = async (e) => {

    e.preventDefault();

    if (isLocked) return;

    if (!inputPassword.trim()) {

      setLoginError("Password enter karo.");

      return;
    }

    setIsLoadingLogin(true);

    setLoginError("");

    try {

      const response = await fetch(
        "/api/admin/verify-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            password: inputPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {

        handleWrongPassword();

        setInputPassword("");

        return;
      }


      /* LOGIN SUCCESS */

      setIsAuthenticated(true);

      setInputPassword("");

      setFailedAttempts(0);

      localStorage.removeItem(
        "admin_login_attempts"
      );

      localStorage.removeItem(
        "admin_lock_until"
      );

    } catch (error) {

      console.error("Admin Login Error:", error);

      setLoginError(
        "Server se connection nahi ho pa raha."
      );

    } finally {

      setIsLoadingLogin(false);
    }
  };


  /* =========================================================
     USER NAME FINDER
  ========================================================= */

  const getUserNameById = (userIdOrObj) => {

    if (!userIdOrObj) return "-";

    let id = userIdOrObj;

    if (typeof userIdOrObj === "object") {

      id =
        userIdOrObj._id ||
        userIdOrObj.id ||
        "";
    }

    const user = allUsersList.find(
      (u) =>
        String(u._id) === String(id)
    );

    if (!user) {

      return String(id);
    }

    return (
      user.name ||
      user.firmName ||
      user.mobile ||
      String(user._id)
    );
  };


  /* =========================================================
     FETCH ANALYTICS
  ========================================================= */


const fetchAnalytics = async () => {
  return;
};
  


  /* =========================================================
     FETCH SELECTED MODEL
  ========================================================= */

  const fetchModelData = async () => {

    setLoading(true);

    try {

      const url =
        `/api/admin/crud/${selectedModel}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Data fetch failed"
        );
      }
      const records =
        data.data ||
        data.records ||
        data.users ||
        data ||
        [];

      const allRecords = Array.isArray(records)
        ? records
        : [];

      const query = search.trim().toLowerCase();

      if (!query) {
        setTableData(allRecords);
      } else {
        const filtered = allRecords.filter((record) => {
          return Object.values(record).some((value) => {
            if (value === null || value === undefined) {
              return false;
            }

            // Object / array ko bhi searchable banao
            if (typeof value === "object") {
              return JSON.stringify(value)
                .toLowerCase()
                .includes(query);
            }

            return String(value)
              .toLowerCase()
              .includes(query);
          });
        });

        setTableData(filtered);
      }

    } catch (error) {

      console.error(
        "Model Data Error:",
        error
      );

      setTableData([]);

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     FETCH ALL MODELS
  ========================================================= */

  const fetchAllModelsOverview = async () => {

    try {

      const results = await Promise.all(

        modelsList.map(async (model) => {

          try {

            const response = await fetch(
              `/api/admin/crud/${model}`,
              {
                credentials: "include",
              }
            );

            const data =
              await response.json();

            const records =
              data.data ||
              data.records ||
              data.users ||
              data ||
              [];

            return {
              model,
              records:
                Array.isArray(records)
                  ? records
                  : [],
            };

          } catch (error) {

            console.error(
              `Error fetching ${model}:`,
              error
            );

            return {
              model,
              records: [],
            };
          }
        })
      );


      const aggregated = {
        user: [],
        business: [],
        booking: [],
        payment: [],
        businessdocument: [],
        comment: [],
        subscription: [],
        vehicle: [],
      };


      results.forEach(
        ({ model, records }) => {

          aggregated[model] = records;
        }
      );


      setAllModelsData(aggregated);

      setAllUsersList(
        aggregated.user || []
      );

      setPaymentsList(
        aggregated.payment || []
      );

    } catch (error) {

      console.error(
        "All Models Fetch Error:",
        error
      );
    }
  };
  const filteredSubscriptionUsers = allUsersList.filter((user) => {
    const query = subscriptionSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      String(user.name || "").toLowerCase().includes(query) ||
      String(user.firmName || "").toLowerCase().includes(query) ||
      String(user.mobile || "").toLowerCase().includes(query) ||
      String(user._id || "").toLowerCase().includes(query)
    );
  });

  /* =========================================================
     DELETE RECORD
  ========================================================= */

  const handleDeleteRecord = async (
    targetModel,
    recordId
  ) => {

    if (!recordId) return;

    const confirmed =
      window.confirm(
        `Kya aap ${targetModel} ka ye record delete karna chahte ho?`
      );

    if (!confirmed) return;

    setDeletingId(recordId);

    try {

      const response = await fetch(
        `/api/admin/crud/${targetModel}/${recordId}`,
        {
          method: "DELETE",

          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Delete failed"
        );
      }


      setTableData((prev) =>
        prev.filter(
          (item) =>
            String(item._id) !==
            String(recordId)
        )
      );


      setAllModelsData((prev) => ({

        ...prev,

        [targetModel]:
          (prev[targetModel] || []).filter(
            (item) =>
              String(item._id) !==
              String(recordId)
          ),
      }));


      if (targetModel === "user") {

        setAllUsersList((prev) =>
          prev.filter(
            (item) =>
              String(item._id) !==
              String(recordId)
          )
        );
      }


      alert(
        data.message ||
        "Record deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete Error:",
        error
      );

      alert(
        error.message ||
        "Delete failed."
      );

    } finally {

      setDeletingId(null);
    }
  };


  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const handleOpenEditModal = (
    modelName,
    record
  ) => {

    setSelectedModel(modelName);

    setEditingRecord(record);


    const cleanedData = {
      ...record,
    };


    delete cleanedData.__v;

    delete cleanedData.createdAt;

    delete cleanedData.updatedAt;


    setEditFormData(cleanedData);
  };


  /* =========================================================
     EDIT INPUT CHANGE
  ========================================================= */

  const handleEditChange = (
    key,
    value
  ) => {

    setEditFormData((prev) => ({

      ...prev,

      [key]: value,
    }));
  };


  /* =========================================================
     UPDATE RECORD
  ========================================================= */

  const handleUpdateRecord = async () => {

    if (!editingRecord?._id) return;

    setIsUpdating(true);

    try {

      const response = await fetch(
        `/api/admin/crud/${selectedModel}/${editingRecord._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(
            editFormData
          ),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
        
          "Update failed"
        );
      }


      const updatedRecord =
        data.data ||
        data.record ||
        data;


      setTableData((prev) =>
        prev.map((item) =>
          String(item._id) ===
            String(editingRecord._id)
            ? updatedRecord
            : item
        )
      );


      setAllModelsData((prev) => ({

        ...prev,

        [selectedModel]:
          (prev[selectedModel] || []).map(
            (item) =>
              String(item._id) ===
                String(editingRecord._id)
                ? updatedRecord
                : item
          ),
      }));


      if (selectedModel === "user") {

        setAllUsersList((prev) =>
          prev.map((item) =>
            String(item._id) ===
              String(editingRecord._id)
              ? updatedRecord
              : item
          )
        );
      }



      /* =========================
   BUSINESS PRINT
========================= */

      else if (selectedModel === "business") {

        headers = [
          "Firm Name",
          "Name",
          "Category",
          "Phone Number",
          "Alternate Phone",
          "WhatsApp Number",
          "Email",
          "Address",
        ];

        rows = tableData.map((business) => {

          const formatValue = (value) => {

            if (
              value === null ||
              value === undefined ||
              value === ""
            ) {
              return "-";
            }

            if (Array.isArray(value)) {
              return value.length
                ? value.join(", ")
                : "-";
            }

            if (typeof value === "object") {
              return Object.values(value)
                .filter(
                  (v) =>
                    v !== null &&
                    v !== undefined &&
                    v !== ""
                )
                .join(", ") || "-";
            }

            return String(value);
          };

          return `
      <tr>
        <td>${formatValue(business.firmName)}</td>
        <td>${formatValue(business.name)}</td>
        <td>${formatValue(business.category)}</td>
        <td>${formatValue(business.phoneNumber)}</td>
        <td>${formatValue(business.alternatePhoneNumbers)}</td>
        <td>${formatValue(business.whatsappNumber)}</td>
        <td>${formatValue(business.email)}</td>
        <td>${formatValue(business.address)}</td>
      </tr>
    `;
        });
      }
      setEditingRecord(null);

      setEditFormData({});

      alert(
    
        "Record updated successfully."
      );

    } catch (error) {

      console.error(
        "Update Error:",
        error
      );

      alert(
    
        "Update failed."
      );

    } finally {

      setIsUpdating(false);
    }
  };


  /* =========================================================
     FETCH ON LOGIN / SEARCH / MODEL
  ========================================================= */

  useEffect(() => {

    if (!isAuthenticated) return;

   fetchModelData();
fetchAllModelsOverview();

  }, [
    isAuthenticated,
    selectedModel,
    search,
  ]);


  /* =========================================================
     FORMAT CELL VALUE
  ========================================================= */
  const formatCellValue = (value, key = "") => {
    // Empty value
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-gray-400 italic">
          N/A
        </span>
      );
    }

    const lowerKey = key.toLowerCase();

    // ==========================================
    // PASSWORD - NEVER SHOW HASH
    // ==========================================
    if (
      lowerKey === "password" ||
      lowerKey.includes("password")
    ) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
          🔒 Hidden
        </span>
      );
    }

    // ==========================================
    // SUBSCRIPTION OBJECT
    // ==========================================
    if (
      lowerKey === "subscription" &&
      typeof value === "object"
    ) {
      const status = value.status || "inactive";
      const plan = value.planName || value.plan || "No Plan";

      const isActive =
        value.isActive === true ||
        status.toLowerCase() === "active";

      const formatDate = (date) => {
        if (!date) return "N/A";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
          return "N/A";
        }

        return d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      return (
        <div className="w-[220px] rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Status
            </span>

            <span
              className={`px-2 py-1 rounded-full text-[11px] font-bold ${isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          {/* Plan */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gray-500">
              Plan
            </span>

            <span className="text-xs font-bold text-slate-800 break-words text-right">
              {plan}
            </span>
          </div>

          {/* Start Date */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gray-500">
              Start
            </span>

            <span className="text-xs text-slate-700 text-right">
              {formatDate(value.startDate)}
            </span>
          </div>

          {/* End Date */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gray-500">
              End
            </span>

            <span className="text-xs text-slate-700 text-right">
              {formatDate(value.endDate)}
            </span>
          </div>

        </div>
      );
    }

    // ==========================================
    // URL
    // ==========================================
    if (
      typeof value === "string" &&
      (value.startsWith("http://") ||
        value.startsWith("https://"))
    ) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg"
        >
          View
          <ExternalLink size={13} />
        </a>
      );
    }

    // ==========================================
    // OBJECT
    // ==========================================
    if (
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      // If populated object
      const displayName =
        value.name ||
        value.firmName ||
        value.title ||
        value.businessName;

      if (displayName) {
        return (
          <div className="max-w-[220px] rounded-lg bg-slate-50 border border-slate-200 p-2">
            <div className="font-semibold text-sm text-slate-800 break-words">
              {displayName}
            </div>

            {value._id && (
              <div className="text-[10px] text-gray-400 font-mono mt-1 break-all">
                ID: ...{String(value._id).slice(-8)}
              </div>
            )}

            {(value.mobile || value.phoneNumber) && (
              <div className="text-[11px] text-gray-500 mt-1">
                📱 {value.mobile || value.phoneNumber}
              </div>
            )}
          </div>
        );
      }

      // Other object - readable key/value
      return (
        <div className="max-w-[240px] rounded-lg bg-slate-50 border border-slate-200 p-2 space-y-1">
          {Object.entries(value).map(([objKey, objValue]) => (
            <div
              key={objKey}
              className="flex justify-between gap-2 text-xs"
            >
              <span className="font-semibold text-gray-500">
                {objKey}
              </span>

              <span className="text-slate-800 text-right break-all">
                {String(objValue ?? "N/A")}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // ==========================================
    // BOOLEAN
    // ==========================================
    if (typeof value === "boolean") {
      return value ? (
        <span className="text-green-600 font-semibold">
          ✓ Yes
        </span>
      ) : (
        <span className="text-red-500 font-semibold">
          ✕ No
        </span>
      );
    }

    // ==========================================
    // DATE
    // ==========================================
    if (
      lowerKey.includes("date") ||
      lowerKey === "createdat" ||
      lowerKey === "updatedat"
    ) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return (
          <span className="text-sm text-slate-700 whitespace-nowrap">
            {date.toLocaleString("en-IN")}
          </span>
        );
      }
    }

    // ==========================================
    // MONGODB OBJECT ID
    // ==========================================
    if (
      typeof value === "string" &&
      /^[0-9a-fA-F]{24}$/.test(value)
    ) {
      return (
        <span className="font-mono text-xs text-indigo-600 break-all">
          ...{value.slice(-8)}
        </span>
      );
    }

    // ==========================================
    // NORMAL VALUE
    // ==========================================
    return (
      <span className="text-sm text-slate-700 break-words">
        {String(value)}
      </span>
    );
  };
  /* =========================================================
     DYNAMIC KEYS
  ========================================================= */

  const getDynamicKeys = () => {

    if (
      tableData &&
      tableData.length > 0
    ) {

      const allKeys =
        new Set();

      tableData.forEach(
        (item) => {

          Object.keys(item).forEach(
            (key) => {

              if (
                key !== "__v"
              ) {

                allKeys.add(key);
              }
            }
          );
        }
      );

      return Array.from(allKeys);
    }


    return (
      DEFAULT_MODEL_KEYS[
      selectedModel
      ] || ["_id"]
    );
  };
  /* =========================================================
     PRINT DATABASE SHEET
  ========================================================= */







/* =========================================================
   PRINT DATABASE SHEET
========================================================= */

const handlePrintDatabase = () => {

  let headers = [];
  let rows = [];

  // Clean value for printing
  const cleanValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    // Array
    if (Array.isArray(value)) {

      const cleanArray = value
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            item !== ""
        )
        .map((item) => {

          if (typeof item === "object") {
            return Object.values(item)
              .filter(
                (v) =>
                  v !== null &&
                  v !== undefined &&
                  v !== ""
              )
              .join(" ");
          }

          return String(item);
        });

      return cleanArray.length
        ? cleanArray.join(", ")
        : "-";
    }

    // Object
    if (typeof value === "object") {

      const values = Object.values(value)
        .filter(
          (v) =>
            v !== null &&
            v !== undefined &&
            v !== ""
        )
        .map((v) => {

          if (Array.isArray(v)) {
            return v.join(", ");
          }

          if (typeof v === "object") {
            return Object.values(v).join(" ");
          }

          return String(v);
        });

      return values.length
        ? values.join(", ")
        : "-";
    }

    return String(value);
  };


  /* =====================================================
     USER
  ===================================================== */

  if (selectedModel === "user") {

    headers = [
      "Name",
      "Firm Name",
      "Mobile",
      "Role",
      "Subscription",
      "Plan",
      "Start Date",
      "End Date",
    ];

    rows = tableData.map((user) => {

      const sub =
        user.subscription &&
        typeof user.subscription === "object"
          ? user.subscription
          : {};

      const status =
        sub.status ||
        user.subscriptionStatus ||
        "No Subscription";

      const plan =
        sub.planName ||
        sub.plan ||
        "-";

      const startDate =
        sub.startDate
          ? new Date(
              sub.startDate
            ).toLocaleDateString("en-IN")
          : "-";

      const endDate =
        sub.endDate
          ? new Date(
              sub.endDate
            ).toLocaleDateString("en-IN")
          : "-";

      return `
        <tr>
          <td>${cleanValue(user.name)}</td>
          <td>${cleanValue(user.firmName)}</td>
          <td>${cleanValue(user.mobile)}</td>
          <td>${cleanValue(user.role)}</td>
          <td>${cleanValue(status)}</td>
          <td>${cleanValue(plan)}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
        </tr>
      `;
    });
  }


  /* =====================================================
     BUSINESS
  ===================================================== */

  else if (selectedModel === "business") {

    headers = [
      "Firm Name",
      "Name",
      "Category",
      "Phone",
      "Alternate Phone",
      "WhatsApp",
      "Email",
      "Address",
    ];

    rows = tableData.map((business) => {

      return `
        <tr>

          <td>
            ${cleanValue(
              business.firmName ||
              business.businessName
            )}
          </td>

          <td>
            ${cleanValue(
              business.name ||
              business.ownerName
            )}
          </td>

          <td>
            ${cleanValue(
              business.category
            )}
          </td>

          <td>
            ${cleanValue(
              business.phoneNumber ||
              business.mobile
            )}
          </td>

          <td>
            ${cleanValue(
              business.alternatePhoneNumbers
            )}
          </td>

          <td>
            ${cleanValue(
              business.whatsappNumber
            )}
          </td>

          <td>
            ${cleanValue(
              business.email
            )}
          </td>

          <td>
            ${cleanValue(
              business.address
            )}
          </td>

        </tr>
      `;
    });
  }


  /* =====================================================
     BOOKING
  ===================================================== */
else if (selectedModel === "booking") {

  headers = [
    "Status",
    "Service",
    "Vehicle Type",
    "Pickup Location",
    "Loading Point",
    "Pickup Date",
    "Goods Type",
    "Weight",
    "Contact Person",
    "Contact Number",
    "Expected Budget",
    "Remarks",
  ];

  rows = tableData.map((booking) => {

    return `
      <tr>

        <td>
          ${cleanValue(booking.status)}
        </td>

        <td>
          ${cleanValue(booking.service)}
        </td>

        <td>
          ${cleanValue(booking.vehicleType)}
        </td>

        <td>
          ${cleanValue(booking.pickupLocation)}
        </td>

        <td>
          ${cleanValue(booking.loading_point)}
        </td>

        <td>
          ${cleanValue(booking.pickupDate)}
        </td>

        <td>
          ${cleanValue(booking.goodsType)}
        </td>

        <td>
          ${cleanValue(booking.weight)}
        </td>

        <td>
          ${cleanValue(booking.contactPerson)}
        </td>

        <td>
          ${cleanValue(booking.contactNumber)}
        </td>

        <td>
          ${cleanValue(booking.expectedBudget)}
        </td>

        <td>
          ${cleanValue(booking.remarks)}
        </td>

      </tr>
    `;
  });
}
  /* =====================================================
     PAYMENT
  ===================================================== */
else if (selectedModel === "payment") {

  headers = [
    "User",
    "Mobile",
    "Order ID",
    "Payment ID",
    "Amount",
    "Plan",
    "Status",
    "Method",
    "Subscription Start",
    "Subscription End",
    "Receipt Number",
  ];

  rows = tableData.map((payment) => {

    // Payment ke user ID se actual user find karo
    const paymentUserId =
      payment.user?._id ||
      payment.user;

    const user = allUsersList.find(
      (u) =>
        String(u._id) ===
        String(paymentUserId)
    );

    const userName =
      user?.name ||
      user?.firmName ||
      payment.user?.name ||
      "-";

    const mobile =
      user?.mobile ||
      user?.phoneNumber ||
      "-";

    return `
      <tr>

        <td>
          ${cleanValue(userName)}
        </td>

        <td>
          ${cleanValue(mobile)}
        </td>

        <td>
          ${cleanValue(payment.orderId)}
        </td>

        <td>
          ${cleanValue(payment.paymentId)}
        </td>

        <td>
          ₹${cleanValue(payment.amount)}
        </td>

        <td>
          ${cleanValue(payment.planSelected)}
        </td>

        <td>
          ${cleanValue(payment.status)}
        </td>

        <td>
          ${cleanValue(payment.method)}
        </td>

        <td>
          ${cleanValue(
            payment.subscriptionStart
              ? new Date(
                  payment.subscriptionStart
                ).toLocaleDateString("en-IN")
              : "-"
          )}
        </td>

        <td>
          ${cleanValue(
            payment.subscriptionEnded
              ? new Date(
                  payment.subscriptionEnded
                ).toLocaleDateString("en-IN")
              : "-"
          )}
        </td>

        <td>
          ${cleanValue(payment.receiptNumber)}
        </td>

      </tr>
    `;
  });
}


  /* =====================================================
     TABLE HTML
  ===================================================== */

  const headerHTML = headers
    .map(
      (header) =>
        `<th>${header}</th>`
    )
    .join("");

  const rowHTML = rows.join("");


  const printWindow = window.open(
    "",
    "_blank",
    "width=1200,height=800"
  );


  if (!printWindow) {

    alert(
      "Please allow popups for printing."
    );

    return;
  }


  printWindow.document.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <title>
          ${selectedModel} Sheet
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 15px;
            font-family: Arial, sans-serif;
            background: white;
            color: #111;
          }

          h2 {
            font-size: 20px;
            margin-bottom: 15px;
            text-transform: capitalize;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
            font-size: 12px;
          }

          th {
            background: #f1f5f9;
            font-weight: 700;
            text-align: left;
            white-space: nowrap;
          }

          th,
          td {
            border: 1px solid #cbd5e1;
            padding: 8px 9px;
            vertical-align: top;
            text-align: left;
          }

          td {
            word-break: break-word;
            white-space: normal;
            line-height: 1.35;
          }

          tr {
            page-break-inside: avoid;
          }

          @media print {

            body {
              margin: 8mm;
            }

            table {
              width: 100%;
            }

            th {
              background: #eeeeee !important;
              print-color-adjust: exact;
            }

          }

        </style>

      </head>


      <body>

        <h2>
          ${selectedModel} Sheet
        </h2>

        <table>

          <thead>

            <tr>
              ${headerHTML}
            </tr>

          </thead>

          <tbody>
            ${rowHTML}
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
















  /* =========================================================
     PIE DATA
  ========================================================= */

  const totalUsers =
    allUsersList.length;


  const subscribedUsersCount =
    allUsersList.filter((user) => {

      const subscription =
        user.subscription;

      if (!subscription) return false;

      if (
        typeof subscription ===
        "object"
      ) {

        return (
          subscription.isActive === true ||
          subscription.status ===
          "active"
        );
      }

      return true;

    }).length;


  const nonSubscribedUsersCount =
    Math.max(
      0,
      totalUsers -
      subscribedUsersCount
    );


  const subscriptionPieData = [
    {
      name: "Subscribed",
      value: subscribedUsersCount,
    },

    {
      name: "No Subscription",
      value: nonSubscribedUsersCount,
    },
  ];


  const overallModelsPieData =
  modelsList
    .filter((model) => model !== "business")
    .map(
      (model) => ({
        name:
          model === "user"
            ? "Total Users"
            : model === "booking"
            ? "Loads"
            : model === "payment"
            ? "Payments"
            : model,
        value:
          allModelsData[model]?.length ||
          0,
      })
    );


  const businessList =
    allModelsData.business || [];


  const verifiedBusinesses =
    businessList.filter(
      (item) =>
        item.isVerified === true
    ).length;


  const unverifiedBusinesses =
    Math.max(
      0,
      businessList.length -
      verifiedBusinesses
    );


  const businessPieData = [
    {
      name: "Verified",
      value: verifiedBusinesses,
    },

    {
      name: "Unverified",
      value: unverifiedBusinesses,
    },
  ];


  const payments =
    paymentsList || [];


  const successfulPayments =
    payments.filter(
      (p) =>
        String(
          p.status || ""
        ).toLowerCase() ===
        "success"
    ).length;


  const failedPayments =
    payments.filter(
      (p) =>
        String(
          p.status || ""
        ).toLowerCase() ===
        "failed"
    ).length;


  const pendingPayments =
    Math.max(
      0,
      payments.length -
      successfulPayments -
      failedPayments
    );


  const paymentPieData = [
    {
      name: "Success",
      value: successfulPayments,
    },

    {
      name: "Failed",
      value: failedPayments,
    },

    {
      name: "Pending",
      value: pendingPayments,
    },
  ];


  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {

    setLoading(true);

    await Promise.all([
  fetchModelData(),
  fetchAllModelsOverview(),
]);

    setLoading(false);
  };


  const handleSectionClick = (tab) => {
    setActiveTab(tab);

    // On phones and laptops, move the selected section's content into view.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const navigation = document.getElementById("admin-section-navigation");
        if (!navigation) return;

        const navigationBottom =
          navigation.getBoundingClientRect().bottom + window.scrollY;
        const stickyHeader = document.querySelector("header");
        const headerHeight = stickyHeader?.getBoundingClientRect().height || 0;

        window.scrollTo({
          top: Math.max(0, navigationBottom - headerHeight - 12),
          behavior: "smooth",
        });
      });
    });
  };

  /* =========================================================
     LOGOUT / LOCK
  ========================================================= */

  const handleLockDashboard = () => {

    setIsAuthenticated(false);

    setActiveTab("analytics_hub");

    setInputPassword("");

    setLoginError("");
  };


  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!isAuthenticated) {

    return (
     <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
       <div className="absolute inset-0 pointer-events-none overflow-hidden">

  <div
    className="absolute inset-0 opacity-10"
    style={{
      backgroundImage: `
        linear-gradient(rgba(59,130,246,.35) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,.35) 1px, transparent 1px)
      `,
      backgroundSize: "45px 45px"
    }}
  />

  <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_25px_#3b82f6] animate-ping" />

  <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_25px_#f59e0b] animate-ping" />

  <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_20px_#06b6d4] animate-ping" />

  <div className="absolute bottom-20 right-1/4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_20px_#3b82f6] animate-ping" />

  <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-pulse" />

  <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] animate-pulse" />

</div>
       
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-8 text-white text-center">

              <h1 className="text-3xl font-extrabold tracking-tight">
  <span className="text-black">RODIO</span>{" "}
  <span className="text-orange-600">Tradelink</span>
</h1>

<p className="text-blue-100 mt-1">
  Admin Control Panel
</p>
            </div>


            {/* FORM */}

            <div className="p-8">

              {isLocked ? (

                <div className="text-center">

                  <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">

                    <Lock size={30} />

                  </div>

                  <h2 className="text-xl font-bold text-gray-800">
                    Admin Locked
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Too many wrong password attempts.
                  </p>

                  <div className="mt-5 bg-red-50 rounded-xl p-4">

                    <p className="text-sm text-red-600">
                      Try again after
                    </p>

                    <p className="text-2xl font-bold text-red-700 mt-1">
                      {lockTimeLeft}
                    </p>

                  </div>

                </div>

              ) : (

                <form
                  onSubmit={
                    handleLoginSubmit
                  }
                  className="space-y-5"
                >

                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Admin Password
                    </label>

                    <div className="relative">

                      <KeyRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          inputPassword
                        }
                        onChange={(e) =>
                          setInputPassword(
                            e.target.value
                          )
                        }
                        placeholder="Enter admin password"
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >

                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}

                      </button>

                    </div>

                  </div>


                  {loginError && (

                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex gap-2">

                      <AlertTriangle
                        size={18}
                        className="shrink-0"
                      />

                      <span>
                        {loginError}
                      </span>

                    </div>

                  )}


                  <button
                    type="submit"
                    disabled={
                      isLoadingLogin
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >

                    {isLoadingLogin ? (

                      <>
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />

                        Checking...
                      </>

                    ) : (

                      <>
                        <ShieldCheck
                          size={18}
                        />

                        Login to Admin
                      </>

                    )}

                  </button>


                  <p className="text-center text-xs text-red-400">
                    Failed attempts:{" "}
                    {failedAttempts}/5
                  </p>

                </form>

              )}

            </div>

          </div>

        </div>

      </div>
    );
  }


  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (

    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-lg">

        <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            
            <div className="flex items-center">
  <div>
    <h1 className="text-xl font-extrabold tracking-tight">
      <span className="text-white">RODIO</span>{" "}
      <span className="text-orange-500">Tradelink</span>
    </h1>

    <p className="text-xs text-slate-400 mt-0.5">
      Admin Dashboard
    </p>
  </div>
</div>


            <div className="flex items-center gap-2">

              <button
                onClick={
                  handleRefresh
                }
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 text-sm"
              >

                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>


              <button
                onClick={
                  handleLockDashboard
                }
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 text-sm"
              >

                <Lock size={16} />

                Lock

              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-[1800px] mx-auto px-4 lg:px-6 py-6">


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div id="admin-section-navigation" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3 mb-6">


          {/* ANALYTICS */}

          <button
            onClick={() =>
              handleSectionClick("analytics_hub")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "analytics_hub"
              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
          >

            <PieIcon size={21} />

            <p className="font-semibold mt-2">
              Analytics
            </p>

            <p className="text-xs opacity-70 mt-1">
              Overview & Charts
            </p>

          </button>


          {/* SUBSCRIPTION */}

          <button
            onClick={() =>
              handleSectionClick("subscription_tracker")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "subscription_tracker"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
              }`}
          >

            <User size={21} />

            <p className="font-semibold mt-2">
              Subscription
            </p>

            <p className="text-xs opacity-70 mt-1">
              User Plans
            </p>

          </button>


          {/* PAYMENT */}



          {/* DATABASE */}

          <button
            onClick={() =>
              handleSectionClick("main_table")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "main_table"
              ? "bg-purple-600 text-white border-purple-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              }`}
          >

            <Database size={21} />

            <p className="font-semibold mt-2">
              Database
            </p>

            <p className="text-xs opacity-70 mt-1">
              MongoDB Explorer
            </p>

          </button>


          {/* MANUAL PAYMENT */}

          <button
            onClick={() =>
              handleSectionClick("manual_payment")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "manual_payment"
              ? "bg-amber-500 text-white border-amber-500 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
              }`}
          >

            <CreditCard size={21} />

            <p className="font-semibold mt-2">
              Manual Payment
            </p>

            <p className="text-xs opacity-70 mt-1">
              Payment Control
            </p>

          </button>


          {/* DOCUMENT */}

          <button
            onClick={() =>
              handleSectionClick("manual_document")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "manual_document"
              ? "bg-cyan-600 text-white border-cyan-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-cyan-300"
              }`}
          >

            <FileCheck size={21} />

            <p className="font-semibold mt-2">
              Documents
            </p>

            <p className="text-xs opacity-70 mt-1">
              Verification
            </p>

          </button>


          {/* PASSWORD RESET */}

          <button
            onClick={() =>
              handleSectionClick("password_reset")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "password_reset"
              ? "bg-rose-600 text-white border-rose-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-rose-300"
              }`}
          >

            <KeyRound size={21} />

            <p className="font-semibold mt-2">
              Password Reset
            </p>

            <p className="text-xs opacity-70 mt-1">
              User Password
            </p>

          </button>


          {/* REGISTER USER */}

          <button
            onClick={() =>
              handleSectionClick("register_user")
            }
            className={`p-4 rounded-xl border transition text-left ${activeTab ===
              "register_user"
              ? "bg-green-600 text-white border-green-600 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
              }`}
          >

            <UserPlus size={21} />

            <p className="font-semibold mt-2">
              Register User
            </p>

            <p className="text-xs opacity-70 mt-1">
              Create New User
            </p>

          </button>


          {/* LOAD MANAGEMENT */}
          <button
            onClick={() =>
              handleSectionClick("load_management")
            }
            className={`p-4 rounded-xl border transition text-left ${
              activeTab === "load_management"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
            }`}
          >
            <Briefcase size={21} />

            <p className="font-semibold mt-2">
              Loads
            </p>

            <p className="text-xs opacity-70 mt-1">
              Search User Loads
            </p>
          </button>
{/* REVIEWS */}
<button
  onClick={() =>
    handleSectionClick("reviews")
  }
  className={`p-4 rounded-xl border transition text-left ${
    activeTab === "reviews"
      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
  }`}
>
  <Star size={21} />

  <p className="font-semibold mt-2">
    Reviews
  </p>

  <p className="text-xs opacity-70 mt-1">
    User Reviews
  </p>
</button>



{/* HERO SLIDES */}
<button
  onClick={() =>
    handleSectionClick("hero_slides")
  }
  className={`p-4 rounded-xl border transition text-left ${
    activeTab === "hero_slides"
      ? "bg-purple-600 text-white border-purple-600 shadow-lg"
      : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
  }`}
>
  <Layers size={21} />

  <p className="font-semibold mt-2">
    Hero Slides
  </p>

  <p className="text-xs opacity-70 mt-1">
    Manage Homepage Slides
  </p>
</button>



{/* MEDIA POSTS */}
<button
  onClick={() =>
    handleSectionClick("media_posts")
  }
  className={`p-4 rounded-xl border transition text-left ${
    activeTab === "media_posts"
      ? "bg-pink-600 text-white border-pink-600 shadow-lg"
      : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
  }`}
>
  <ImageIcon size={21} />

  <p className="font-semibold mt-2">
    Media Posts
  </p>

  <p className="text-xs opacity-70 mt-1">
    Upload Images & Videos
  </p>
</button>




{/* PROFILE MANAGEMENT */}
<button
  onClick={() => handleSectionClick("profile_management")}
  className={`p-4 rounded-xl border transition text-left ${
    activeTab === "profile_management"
      ? "bg-violet-600 text-white border-violet-600 shadow-lg"
      : "bg-white text-gray-700 border-gray-200 hover:border-violet-300"
  }`}
>
  <UserRound size={21} />

  <p className="font-semibold mt-2">
    Profile Management
  </p>

  <p className="text-xs opacity-70 mt-1">
    Search User Profiles
  </p>
</button>




<button
  onClick={() => handleSectionClick("Ads_management")}
  className={`p-4 rounded-xl border transition text-left ${
    activeTab === "Ads_management"
      ? "bg-violet-600 text-white border-violet-600 shadow-lg"
      : "bg-white text-gray-700 border-gray-200 hover:border-violet-300"
  }`}
>
  <UserRound size={21} />

  <p className="font-semibold mt-2">
    advertisement Management
  </p>

  <p className="text-xs opacity-70 mt-1">
    Search User Profiles
  </p>
</button>

{/* GOOGLE ANALYTICS */}
<button
  type="button"
  onClick={() => {
    window.open(
      "https://analytics.google.com/analytics/web/#/a405503597p550971747/reports/intelligenthome"
    );
  }}
  className="p-4 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:shadow-lg transition text-left"
>

  <p className="font-semibold mt-2">
    Google Analytics
  </p>

  <p className="text-xs opacity-70 mt-1">
    Website Traffic & Reports
  </p>
</button>
        </div>


        {/* ===================================================
            TAB 1 - ANALYTICS
        =================================================== */}

        {activeTab ===
          "analytics_hub" && (

            <div className="space-y-6">


              {/* STATS */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


                <div className="bg-white rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Users
                      </p>

                      <p className="text-3xl font-bold text-gray-800 mt-1">
                        {totalUsers}
                      </p>

                    </div>

                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                      <User size={25} />

                    </div>

                  </div>

                </div>


                <div className="bg-white rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Subscribed Users
                      </p>

                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {subscribedUsersCount}
                      </p>

                    </div>

                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">

                      <CheckCircle
                        size={25}
                      />

                    </div>

                  </div>

                </div>


                <div className="bg-white rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        No Subscription
                      </p>

                      <p className="text-3xl font-bold text-amber-500 mt-1">
                        {nonSubscribedUsersCount}
                      </p>

                    </div>

                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">

                      <AlertTriangle
                        size={25}
                      />

                    </div>

                  </div>

                </div>


                <div className="bg-white rounded-2xl border p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Payments
                      </p>

                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {payments.length}
                      </p>

                    </div>

                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">

                      <CreditCard
                        size={25}
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* PIE CHARTS */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                {/* USER SUBSCRIPTION */}

                <div className="bg-white rounded-2xl border p-6">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <h2 className="text-lg font-bold text-gray-800">
                        User Subscription Overview
                      </h2>

                      <p className="text-sm text-gray-500">
                        Subscription distribution
                      </p>

                    </div>

                    <Layers
                      size={21}
                      className="text-blue-600"
                    />

                  </div>


                  <div className="h-80">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={
                            subscriptionPieData
                          }
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >

                          {subscriptionPieData.map(
                            (_, index) => (

                              <Cell
                                key={
                                  index
                                }
                                fill={
                                  [
                                    PALETTE.emerald,
                                    PALETTE.amber,
                                  ][index]
                                }
                              />

                            )
                          )}

                        </Pie>

                        <Tooltip />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                </div>


               

                {/* BUSINESS */}

                <div className="bg-white rounded-2xl border p-6">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <h2 className="text-lg font-bold text-gray-800">
                        Business Documents Verification
                      </h2>

                      <p className="text-sm text-gray-500">
                        Verified vs unverified
                      </p>

                    </div>

                    <Building2
                      size={21}
                      className="text-green-600"
                    />

                  </div>


                  <div className="h-80">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={
                            businessPieData
                          }
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >

                          {businessPieData.map(
                            (_, index) => (

                              <Cell
                                key={
                                  index
                                }
                                fill={
                                  [
                                    PALETTE.emerald,
                                    PALETTE.rose,
                                  ][index]
                                }
                              />

                            )
                          )}

                        </Pie>

                        <Tooltip />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                </div>


                {/* PAYMENTS */}

             

              </div>

            </div>

          )}


        {/* ===================================================
            TAB 2 - SUBSCRIPTION TRACKER
        =================================================== */}

        {activeTab ===
          "subscription_tracker" && (

            <div className="bg-white rounded-2xl border overflow-hidden">



              <div className="p-6 border-b">

                <h2 className="text-xl font-bold">
                  Subscription Tracker
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  All registered users and subscription information
                </p>

                {/* SUBSCRIPTION SEARCH */}
                <div className="mt-5 flex items-center gap-3">

                  {/* SEARCH */}


                  <div className="relative max-w-lg flex-1">

                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={subscriptionSearch}
                      onChange={(e) =>
                        setSubscriptionSearch(e.target.value)
                      }
                      placeholder="Search Name, Firm Name, Mobile or ID..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl
                 outline-none focus:ring-2 focus:ring-indigo-500
                 focus:border-indigo-500 text-sm"
                    />

                  </div>

                  {/* PRINT BUTTON */}
                  <button
                    type="button"
                    onClick={handlePrintSubscription}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700
               text-white rounded-xl flex items-center gap-2
               font-semibold text-sm"
                  >
                    <Printer size={18} />
                    Print Sheet
                  </button>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="text-left p-4">
                        User Name & ID
                      </th>

                      <th className="text-left p-4">
                        Firm Name
                      </th>

                      <th className="text-left p-4">
                        Mobile
                      </th>

                      <th className="text-left p-4">
                        Subscription
                      </th>

                      <th className="text-left p-4">
                        Plan
                      </th>

                      <th className="text-right p-4">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredSubscriptionUsers.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center p-10 text-gray-500"
                        >
                          No users found.
                        </td>

                      </tr>

                    ) : (

                      filteredSubscriptionUsers.map(
                        (user) => {

                          const subscription =
                            user.subscription;

                          const active =
                            subscription &&
                            (
                              subscription.isActive ===
                              true ||
                              subscription.status ===
                              "active"
                            );

                          return (

                            <tr
                              key={
                                user._id
                              }
                              className="border-t hover:bg-slate-50"
                            >

                              <td className="p-4">

                                <div className="font-semibold">
                                  {user.name ||
                                    user.firmName ||
                                    "User"}
                                </div>

                                <div className="text-xs text-gray-400 font-mono">
                                  {user._id}
                                </div>

                              </td>


                              <td className="p-4">
                                {user.firmName ||
                                  "-"}
                              </td>


                              <td className="p-4">
                                {user.mobile ||
                                  "-"}
                              </td>


                              <td className="p-4">

                                {active ? (

                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

                                    <CheckCircle
                                      size={13}
                                    />

                                    Active

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">

                                    <XCircle
                                      size={13}
                                    />

                                    No Subscription

                                  </span>

                                )}

                              </td>


                              <td className="p-4">
                                {active
                                  ? (
                                    subscription?.planName ||
                                    subscription?.plan ||
                                    "-"
                                  )
                                  : "-"}
                              </td>

                              <td className="p-4">

                                <div className="flex justify-end gap-2">

                                  <button
                                    onClick={() =>
                                      handleOpenEditModal(
                                        "user",
                                        user
                                      )
                                    }
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  >

                                    <Edit
                                      size={16}
                                    />

                                  </button>


                                  <button
                                    onClick={() =>
                                      handleDeleteRecord(
                                        "user",
                                        user._id
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      user._id
                                    }
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                  >

                                    <Trash2
                                      size={16}
                                    />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}


        {/* ===================================================
            TAB 3 - PAYMENT LEDGER
        =================================================== */}

        {activeTab ===
          "payment_ledger" && (

            <div className="bg-white rounded-2xl border overflow-hidden">

              <div className="p-6 border-b">

                <h2 className="text-xl font-bold">
                  Payment Ledger
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  All payment transactions
                </p>

              </div>


              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="text-left p-4">
                        User
                      </th>

                      <th className="text-left p-4">
                        Mobile
                      </th>

                      <th className="text-left p-4">
                        Payment ID
                      </th>

                      <th className="text-left p-4">
                        Amount
                      </th>

                      <th className="text-left p-4">
                        Status
                      </th>

                      <th className="text-right p-4">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {payments.length ===
                      0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="p-10 text-center text-gray-500"
                        >
                          No payments found.
                        </td>

                      </tr>

                    ) : (

                      payments.map(
                        (payment) => {

                          const userId =
                            payment.user;

                          const user =
                            allUsersList.find(
                              (u) =>
                                String(
                                  u._id
                                ) ===
                                String(
                                  userId?._id ||
                                  userId
                                )
                            );

                          return (

                            <tr
                              key={
                                payment._id
                              }
                              className="border-t hover:bg-slate-50"
                            >

                              <td className="p-4">

                                <div className="font-semibold">
                                  {getUserNameById(
                                    userId
                                  )}
                                </div>

                                <div className="text-xs text-gray-400 font-mono">
                                  {payment._id}
                                </div>

                              </td>


                              <td className="p-4">
                                {user?.mobile ||
                                  "-"}
                              </td>


                              <td className="p-4 font-mono text-xs">
                                {payment.paymentId ||
                                  payment.transactionId ||
                                  "-"}
                              </td>


                              <td className="p-4 font-semibold">
                                ₹
                                {payment.amount ??
                                  0}
                              </td>


                              <td className="p-4">

                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${String(
                                    payment.status ||
                                    ""
                                  ).toLowerCase() ===
                                    "success"
                                    ? "bg-green-100 text-green-700"
                                    : String(
                                      payment.status ||
                                      ""
                                    ).toLowerCase() ===
                                      "failed"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                  {payment.status ||
                                    "Pending"}
                                </span>

                              </td>


                              <td className="p-4">

                                <div className="flex justify-end gap-2">

                                  <button
                                    onClick={() =>
                                      handleOpenEditModal(
                                        "payment",
                                        payment
                                      )
                                    }
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  >

                                    <Edit
                                      size={16}
                                    />

                                  </button>


                                  <button
                                    onClick={() =>
                                      handleDeleteRecord(
                                        "payment",
                                        payment._id
                                      )
                                    }
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                  >

                                    <Trash2
                                      size={16}
                                    />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}


        {/* ===================================================
            TAB 4 - DATABASE EXPLORER
        =================================================== */}

        {activeTab ===
          "main_table" && (

            <div className="bg-white rounded-2xl border overflow-hidden">


              {/* HEADER */}

              <div className="p-6 border-b">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-bold">
                      Database Explorer
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      MongoDB collections manage karo
                    </p>

                  </div>


                  <div className="flex flex-col sm:flex-row gap-3">

                    {/* MODEL */}

                    <select
                      value={
                        selectedModel
                      }
                      onChange={(e) =>
                        setSelectedModel(
                          e.target.value
                        )
                      }
                      className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      {modelsList.map(
                        (model) => (

                          <option
                            key={model}
                            value={model}
                          >
                            {model}
                          </option>

                        )
                      )}

                    </select>


                    {/* SEARCH */}

                    <div className="relative">

                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        placeholder="Search..."
                        className="border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>
                    <button
                      type="button"
                      onClick={handlePrintDatabase}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-2 font-semibold whitespace-nowrap"
                    >
                      <Printer size={18} />
                      Print Sheet
                    </button>

                  </div>

                </div>

              </div>


              {/* TABLE */}

              <div className="overflow-x-auto">

                {loading ? (

                  <div className="p-16 flex justify-center">

                    <RefreshCw
                      className="animate-spin text-blue-600"
                      size={30}
                    />

                  </div>

                ) : (

                  <table className="w-full text-sm">

                    <thead className="bg-slate-50">

                      <tr>

                        {getDynamicKeys().map(
                          (key) => (

                            <th
                              key={key}
                              className="text-left p-4 whitespace-nowrap bg-slate-50 text-xs font-bold uppercase tracking-wide"
                            >
                              {key}
                            </th>

                          )
                        )}

                        <th className="text-right p-4">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {tableData.length ===
                        0 ? (

                        <tr>

                          <td
                            colSpan={
                              getDynamicKeys()
                                .length + 1
                            }
                            className="p-12 text-center text-gray-500"
                          >
                            No records found.
                          </td>

                        </tr>

                      ) : (

                        tableData.map(
                          (record) => (

                            <tr
                              key={
                                record._id
                              }
                              className="border-t hover:bg-slate-50"
                            >

                              {getDynamicKeys().map(
                                (key) => (

                                  <td
                                    key={key}
                                    className="p-4 align-top min-w-[150px] max-w-[280px] whitespace-normal break-words"
                                  >
                                    {formatCellValue(record[key], key)}
                                  </td>

                                )
                              )}


                              <td className="p-4">

                                <div className="flex justify-end gap-2">

                                  <button
                                    onClick={() =>
                                      handleOpenEditModal(
                                        selectedModel,
                                        record
                                      )
                                    }
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  >

                                    <Edit
                                      size={16}
                                    />

                                  </button>


                                  <button
                                    onClick={() =>
                                      handleDeleteRecord(
                                        selectedModel,
                                        record._id
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      record._id
                                    }
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                  >

                                    <Trash2
                                      size={16}
                                    />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          )}


        {/* ===================================================
            TAB 5 - MANUAL PAYMENT
        =================================================== */}

        {activeTab ===
          "manual_payment" && (

            <ManualPaymentControl />

          )}


        {/* ===================================================
            TAB 6 - DOCUMENT VERIFICATION
        =================================================== */}

        {activeTab ===
          "manual_document" && (

            <ManualDocumentVerification />

          )}


        {/* ===================================================
            TAB 7 - PASSWORD RESET
        =================================================== */}

        {activeTab ===
          "password_reset" && (

            <PasswordResetControl />

          )}


        {/* ===================================================
            TAB 8 - REGISTER USER
        =================================================== */}

        {activeTab ===
          "register_user" && (

            <Register />

          )}

          {activeTab === "load_management" && (
  <Load />
)}
{/* ===================================================
    TAB 9 - REVIEWS
=================================================== */}

{activeTab ===
  "reviews" && (
    <Review />
  )}


  {activeTab ===
  "hero_slides" && (
    <HeroSlide />
  )}
{activeTab === "media_posts" && (
  <Media />
)}




{/* PROFILE MANAGEMENT */}
{activeTab === "profile_management" && (
  <ProfileManagement />
)}

{activeTab === "Ads_management" && (
  <Advertisement/>
)}

      </main>


      {/* =====================================================
          EDIT DRAWER / MODAL
      ===================================================== */}

      {editingRecord && (

        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">

          <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold">
                  Edit Record
                </h2>

                <p className="text-xs text-gray-500">
                  {selectedModel}
                </p>

              </div>


              <button
                onClick={() => {

                  setEditingRecord(
                    null
                  );

                  setEditFormData(
                    {}
                  );

                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <div className="p-6 space-y-5">

              {Object.entries(
                editFormData
              ).map(
                ([key, value]) => {

                  if (
                    key === "_id" ||
                    key === "__v"
                  ) {
                    return null;
                  }


                  if (
                    key === "createdAt" ||
                    key === "updatedAt"
                  ) {
                    return null;
                  }


                  const isObject =
                    typeof value ===
                    "object" &&
                    value !== null;


                  return (

                    <div
                      key={key}
                    >

                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {key}
                      </label>


                      {isObject ? (

                        <textarea
                          value={JSON.stringify(
                            value,
                            null,
                            2
                          )}
                          onChange={(e) => {

                            try {

                              const parsed =
                                JSON.parse(
                                  e.target.value
                                );

                              handleEditChange(
                                key,
                                parsed
                              );

                            } catch {

                              handleEditChange(
                                key,
                                e.target.value
                              );

                            }

                          }}
                          rows={5}
                          className="w-full border rounded-xl p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      ) : (

                        <input
                          value={
                            value ??
                            ""
                          }
                          onChange={(e) =>
                            handleEditChange(
                              key,
                              e.target.value
                            )
                          }
                          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      )}

                    </div>

                  );

                }
              )}


              {/* BUTTONS */}

              <div className="flex gap-3 pt-4">

                <button
                  onClick={() => {

                    setEditingRecord(
                      null
                    );

                    setEditFormData(
                      {}
                    );

                  }}
                  className="flex-1 border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>


                <button
                  onClick={
                    handleUpdateRecord
                  }
                  disabled={
                    isUpdating
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >

                  {isUpdating ? (

                    <>

                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Updating...

                    </>

                  ) : (

                    <>

                      <Save size={17} />

                      Save Changes

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
