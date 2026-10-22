import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  UserPlus,
  RefreshCw,
  Search,
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

export default function Register() {
  const [formData, setFormData] = useState({
    role: "",
    firmName: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  const roles = [
    "user",
    "transporter",
    "fleet_owner",
    "cha_agent",
    "courier",
    "bus_service",
    "travel_taxi",
    "truck_body_builder",
    "rto_agent",
    "finance_company",
    "finance_agent",
    "packers_movers",
    "insurance_company",
    "car_carrier",
    "miningvehicle_supplier",
    "partstypesbettry_supplier",
    "mechanic and service center",
    "biketexiauto",
    "candfagent",
  ];

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // GET REGISTERED USERS
  // =========================================================

  const fetchRegisteredUsers = async () => {
    try {
      setFetchingUsers(true);

      const response = await API.get("/auth/newly-registered");

      console.log("Newly Registered Users:", response.data);

      if (response.data?.success) {
        const users = (response.data.users || []).map((user) => ({
          objectId: user._id,
          role: user.role || "N/A",
          firmName: user.firmName || "N/A",
          mobile: user.mobile || "N/A",
          createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleString("en-IN")
            : "N/A",
        }));

        setRegisteredUsers(users);
      } else {
        setRegisteredUsers([]);
      }
    } catch (error) {
      console.error("GET Registered Users Error:", error);

      setRegisteredUsers([]);

      alert("Failed to load registered users. Please try again.");
    } finally {
      setFetchingUsers(false);
    }
  };

  // =========================================================
  // FETCH USERS ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  // =========================================================
  // FILTER REGISTERED USERS
  // =========================================================

  const filteredUsers = registeredUsers.filter((user) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return [
      user.objectId,
      user.role,
      user.firmName,
      user.mobile,
      user.createdAt,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query)
    );
  });

  // =========================================================
  // REGISTER USER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    // Role validation
    if (!formData.role) {
      alert("Please select a role.");
      return;
    }

    // Firm name validation
    if (!formData.firmName.trim()) {
      alert("Please enter the firm name.");
      return;
    }

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Password validation
    if (formData.password.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      alert("Password and confirm password must match.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        role: formData.role,
        firmName: formData.firmName.trim(),
        mobile: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const data = response.data;

      console.log("Register Response:", data);

      if (!data.success) {
        alert("Registration failed. Please try again.");
        return;
      }

      // =====================================================
      // MONGODB OBJECT ID
      // =====================================================

      const objectId = data?.user?.id;

      if (!objectId) {
        console.error("Object ID missing:", data);

        alert(
          "User may have been created, but the Object ID was not returned."
        );

        await fetchRegisteredUsers();

        return;
      }

      // =====================================================
      // GET FRESH USERS FROM DATABASE
      // =====================================================

      await fetchRegisteredUsers();

      // =====================================================
      // RESET FORM
      // =====================================================

      setFormData({
        role: "",
        firmName: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });

      alert("User registered successfully.");
    } catch (error) {
      console.error("Register Error:", error);

      if (error.response) {
        console.error(
          "Backend Response:",
          error.response.data
        );

        alert(
          "Registration failed on the server. Please try again."
        );
      } else if (error.request) {
        alert(
          "Unable to connect to the server. Please check the server and API URL."
        );
      } else {
        alert("Registration error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COPY OBJECT ID
  // =========================================================

  const copyObjectId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error("Copy Error:", error);

      alert("Unable to copy the Object ID.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-5">

      {/* =====================================================
          REGISTER USER
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* HEADER */}

        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="p-3 bg-indigo-50 rounded-xl">
                <UserPlus
                  size={22}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Register New User
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Create a new user using the registration API
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={fetchRegisteredUsers}
              disabled={fetchingUsers}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white transition"
              title="Refresh registered users"
            >
              <RefreshCw
                size={17}
                className={
                  fetchingUsers
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleRegister}
          className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >

          {/* ROLE */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">
                Select Role
              </option>

              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* FIRM NAME */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Firm Name
            </label>

            <input
              type="text"
              name="firmName"
              value={formData.firmName}
              onChange={handleChange}
              placeholder="Enter firm name"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* MOBILE */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Mobile
            </label>

            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10 digit mobile"
              maxLength={10}
              inputMode="numeric"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* REGISTER BUTTON */}

          <div className="flex items-end">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <UserPlus size={17} />

              {loading
                ? "Registering..."
                : "Register User"}
            </button>

          </div>

        </form>
      </div>


      {/* =====================================================
          REGISTERED USERS
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* HEADER + SEARCH */}

        <div className="p-5 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="text-base font-bold text-gray-800">
                Registered Users
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Newly registered users and their MongoDB Object IDs
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              {/* SEARCH BAR */}

              <div className="relative w-full sm:w-80">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

              </div>

              {/* TOTAL */}

              <div className="text-xs text-gray-500 whitespace-nowrap">
                Total:{" "}
                <span className="font-semibold text-gray-800">
                  {filteredUsers.length}
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Object ID
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Role
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Firm Name
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Mobile
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Created At
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-200">

              {/* LOADING */}

              {fetchingUsers ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading registered users...
                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                /* NO RESULTS */

                <tr>

                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {search.trim()
                      ? "No users match your search."
                      : "No registered users found."}
                  </td>

                </tr>

              ) : (

                /* USERS */

                filteredUsers.map((user) => (

                  <tr
                    key={user.objectId}
                    className="hover:bg-gray-50 transition"
                  >

                    {/* OBJECT ID */}

                    <td className="px-4 py-3.5">

                      <div className="flex items-center gap-2">

                        <span className="font-mono text-[11px] text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg whitespace-nowrap">
                          {user.objectId}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            copyObjectId(user.objectId)
                          }
                          className="flex items-center gap-1 px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition whitespace-nowrap"
                          title="Copy Object ID"
                        >

                          {copiedId === user.objectId ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}

                        </button>

                      </div>

                    </td>


                    {/* ROLE */}

                    <td className="px-4 py-3.5">

                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg whitespace-nowrap">
                        {user.role}
                      </span>

                    </td>


                    {/* FIRM NAME */}

                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      {user.firmName || "N/A"}
                    </td>


                    {/* MOBILE */}

                    <td className="px-4 py-3.5 font-mono text-gray-700 whitespace-nowrap">
                      {user.mobile || "N/A"}
                    </td>


                    {/* CREATED AT */}

                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {user.createdAt}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
