import React, { useEffect, useState } from "react";
import {
  KeyRound,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle,
} from "lucide-react";


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

export default function PasswordResetControl() {
  // ==========================================
  // STATE
  // ==========================================

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================================
  // GET ALL USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/users");
      const data = res.data;

      console.log("Users API Response:", data);

      if (data?.success) {
        setUsers(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } else {
        setUsers([]);

        alert(
          data?.message ||
            "Users fetch nahi ho paaye"
        );
      }
    } catch (error) {
      console.error(
        "Fetch Users Error:",
        error
      );

      setUsers([]);

      alert(
        error?.response?.data?.message ||
          `Users API Error: ${
            error?.response?.status ||
            "Server error"
          }`
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (resetting) return;

    setSelectedUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!selectedUser?._id) {
      alert("Please select a user.");
      return;
    }

    if (!newPassword) {
     alert("Please enter a new password.");
      return;
    }

    if (newPassword.length < 4) {
      alert(
       "Password must be at least 4 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm the new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userDisplayName =
      selectedUser.name ||
      selectedUser.firmName ||
      selectedUser.mobile ||
      "User";

  const confirmed = window.confirm(
  `Are you sure you want to reset the password for ${userDisplayName}?`
);

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);

      const res = await API.put(
        `/admin/users/${selectedUser._id}/password`,
        {
          newPassword,
        }
      );

      const data = res.data;

      console.log(
        "Reset Password Response:",
        data
      );

      if (data?.success) {
       alert("Password has been successfully reset.");
        closeModal();

        await fetchUsers();
      } else {
        alert("Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error(
        "Password Reset Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          `Password reset failed ${
            error?.response?.status
              ? `(Status ${error.response.status})`
              : ""
          }`
      );
    } finally {
      setResetting(false);
    }
  };

  // ==========================================
  // SEARCH / FILTER
  // ==========================================

  const searchValue =
    search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!searchValue) {
      return true;
    }

    return [
      user?.name,
      user?.firmName,
      user?.email,
      user?.mobile,
      user?.role,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  // ==========================================
  // OPEN RESET MODAL
  // ==========================================

  const openResetModal = (user) => {
    setSelectedUser(user);

    setNewPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-5">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">

            <KeyRound
              className="text-indigo-600"
              size={22}
            />

            User Password Management

          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Admin user ka password securely reset
            kar sakta hai
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          title="Refresh Users"
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white transition"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
        </button>

      </div>

      {/* ======================================
          SECURITY WARNING
      ====================================== */}

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">

        <div className="flex gap-3">

          <LockKeyhole
            size={20}
            className="text-amber-600 shrink-0"
          />

          <div>

            <div className="text-sm font-bold text-amber-700">
              Password Security
            </div>

            <div className="text-xs text-amber-700 mt-1">
              Existing password display nahi kiya
              ja sakta. Password bcrypt hash me
              stored hai. Admin sirf naya password
              reset kar sakta hai.
            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

        <div className="relative w-full">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search name, firm name, email, mobile or role..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

        </div>

      </div>

      {/* ======================================
          USER TABLE
      ====================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-700">

              <tr>

                <th className="p-4 font-semibold">
                  USER
                </th>

                <th className="p-4 font-semibold">
                  MOBILE
                </th>

                <th className="p-4 font-semibold">
                  ROLE
                </th>

                <th className="p-4 font-semibold">
                  PASSWORD
                </th>

                <th className="p-4 text-center font-semibold">
                  ACTION
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {filteredUsers.map((user) => {

                const displayName =
                  user?.name ||
                  user?.firmName ||
                  "N/A";

                return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition"
                  >

                    {/* USER */}

                    <td className="p-4">

                      <div className="font-semibold text-gray-800">
                        {displayName}
                      </div>

                      {user?.firmName &&
                        user?.name &&
                        user.name !==
                          user.firmName && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.firmName}
                          </div>
                        )}

                    </td>

                    {/* MOBILE */}

                    <td className="p-4 font-medium text-gray-800">
                      {user?.mobile || "N/A"}
                    </td>

                    {/* ROLE */}

                    <td className="p-4 text-gray-700">
                      {user?.role || "N/A"}
                    </td>

                    {/* PASSWORD */}

                    <td className="p-4">

                      <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-500">

                        <LockKeyhole size={13} />

                        ********

                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="p-4 text-center">

                      <button
                        type="button"
                        onClick={() =>
                          openResetModal(user)
                        }
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >

                        <KeyRound size={15} />

                        Reset Password

                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* ======================================
            NO USERS
        ====================================== */}

        {filteredUsers.length === 0 &&
          !loading && (
            <div className="p-10 text-center text-gray-500">

              {users.length === 0
                ? "No users available"
                : "No users found"}

            </div>
          )}

        {/* ======================================
            LOADING
        ====================================== */}

        {loading && (
          <div className="p-10 text-center text-gray-500 flex items-center justify-center gap-2">

            <RefreshCw
              size={17}
              className="animate-spin"
            />

            Loading users...

          </div>
        )}

      </div>

      {/* ======================================
          RESET PASSWORD MODAL
      ====================================== */}

      {selectedUser && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">

            {/* MODAL HEADER */}

            <div className="p-5 border-b border-gray-200 flex justify-between">

              <div>

                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">

                  <KeyRound
                    className="text-indigo-600"
                    size={20}
                  />

                  Reset Password

                </h3>

                <p className="text-xs text-gray-500 mt-1">

                  {selectedUser.name ||
                    selectedUser.firmName ||
                    "User"}

                  {" — "}

                  {selectedUser.mobile ||
                    "No mobile"}

                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={resetting}
                className="text-gray-400 hover:text-gray-700 text-xl disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleResetPassword}
              className="p-5 space-y-4"
            >

              {/* NEW PASSWORD */}

              <div>

                <label className="text-xs font-medium text-gray-600">
                  New Password
                </label>

                <div className="relative mt-1">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="text-xs font-medium text-gray-600">
                  Confirm Password
                </label>

                <div className="relative mt-1">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* PASSWORD MATCH */}

              {confirmPassword && (
                <div
                  className={`text-xs font-medium ${
                    newPassword ===
                    confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {newPassword ===
                  confirmPassword
                    ? "✓ Password match ho raha hai"
                    : "✕ Password match nahi kar raha"}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={resetting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >

                {resetting ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={17} />

                    Reset Password
                  </>
                )}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
