import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  X,
  Save,
  Loader2,
  Printer,
} from "lucide-react";
// Use Vite's local proxy so this file talks to the backend running on your PC.
const API_BASE_URL = "https://rodiotradelink.com/api";

const readApiResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.trim() || `Request failed (${response.status})` };
  }
};

// ======================================================
// CREATOR ROLES
// ======================================================

const creatorRoles = [
  "user",
  "broker",
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

// ======================================================
// SERVICE OPTIONS
// ======================================================

const serviceOptions = [
  "Full Load",
  "Part Load",
  "Transport",
  "Logistics",
  "Courier",
  "Packing & Moving",
  "Container Transport",
  "Trailer Transport",
  "Tanker Transport",
  "Car Carrier",
  "Goods Transport",
  "Other",
];

// ======================================================
// VEHICLE OPTIONS
// ======================================================

const vehicleTypeOptions = [
  "Truck",
  "LCV",
  "Tata 407",
  "Pickup",
  "Mini Truck",
  "Tempo",
  "Container",
  "Trailer",
  "Open Body",
  "Closed Body",
  "Tanker",
  "Car Carrier",
  "Other",
];

// ======================================================
// EMPTY FORM
// ======================================================

const emptyForm = {
  createdBy: "",
  creatorRole: "user",
  status: "Open",
  service: "",
  vehicleType: "",
  pickupLocation: "",
  loading_point: "",
  pickupDate: "",
  goodsType: "",
  weight: "",
  contactPerson: "",
  contactNumber: "",
  expectedBudget: "",
  remarks: "",
};

// ======================================================
// COMPONENT
// ======================================================

export default function Load() {
  const [form, setForm] = useState(emptyForm);

  const [loads, setLoads] = useState([]);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(true);

  // ====================================================
  // HANDLE INPUT
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // FETCH ALL LOADS
  // ====================================================

  const fetchLoads = async () => {
    try {
      setFetching(true);

     const response = await fetch(
  `${API_BASE_URL}/booking/all`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "ashu@rodio",
      
    },
  }
);

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch loads"
        );
      }

      setLoads(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "FETCH LOADS ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to fetch loads"
      );
    } finally {
      setFetching(false);
    }
  };

  // ====================================================
  // CREATE LOAD
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.createdBy.trim()) {
      alert("Please enter User Object ID.");
      return;
    }

    if (
      !/^[a-fA-F0-9]{24}$/.test(
        form.createdBy.trim()
      )
    ) {
      alert(
        "Invalid User Object ID."
      );
      return;
    }

    if (!form.service) {
      alert("Please select Service.");
      return;
    }

    if (!form.vehicleType) {
      alert(
        "Please select Vehicle Type."
      );
      return;
    }

    if (!form.pickupLocation.trim()) {
      alert(
        "Pickup Location is required."
      );
      return;
    }

    if (!form.loading_point.trim()) {
      alert(
        "Loading Point is required."
      );
      return;
    }

    if (!form.pickupDate) {
      alert(
        "Pickup Date is required."
      );
      return;
    }

    if (!form.contactPerson.trim()) {
      alert(
        "Contact Person is required."
      );
      return;
    }

    if (!form.contactNumber.trim()) {
      alert(
        "Contact Number is required."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/booking/admin-create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            createdBy:
              form.createdBy.trim(),

            creatorRole:
              form.creatorRole,

            status:
              form.status,

            service:
              form.service,

            vehicleType:
              form.vehicleType,

            pickupLocation:
              form.pickupLocation.trim(),

            loading_point:
              form.loading_point.trim(),

            pickupDate:
              form.pickupDate,

            goodsType:
              form.goodsType.trim(),

            weight:
              form.weight.trim(),

            contactPerson:
              form.contactPerson.trim(),

            contactNumber:
              form.contactNumber.trim(),

            expectedBudget:
              form.expectedBudget,

            remarks:
              form.remarks.trim(),
          }),
        }
      );

      const result =
        await readApiResponse(response);

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to create load"
        );
      }

      alert(
        "Load created successfully."
      );

      setForm(emptyForm);

      await fetchLoads();

    } catch (error) {
      console.error(
        "ADMIN CREATE LOAD ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to create load"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // DELETE LOAD
  // ====================================================

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this load?"
      );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/booking/${id}`,
        {
          method: "DELETE",

          headers: {

             "x-api-key": "ashu@rodio",
            
          },
        }
      );

      const result =
        await readApiResponse(response);

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete load"
        );
      }

      setLoads((prev) =>
        prev.filter(
          (load) =>
            load._id !== id
        )
      );

      alert(
        "Load deleted successfully."
      );

    } catch (error) {
      console.error(
        "DELETE LOAD ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete load"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredLoads = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    if (!query) {
      return loads;
    }

    return loads.filter((load) => {
      const createdBy =
        typeof load.createdBy ===
        "object"
          ? load.createdBy?._id
          : load.createdBy;

      return [
        load._id,
        createdBy,
        load.creatorRole,
        load.status,
        load.service,
        load.vehicleType,
        load.pickupLocation,
        load.loading_point,
        load.pickupDate,
        load.goodsType,
        load.weight,
        load.contactPerson,
        load.contactNumber,
        load.expectedBudget,
        load.remarks,
      ]
        .map((value) =>
          String(value || "")
            .toLowerCase()
        )
        .some((value) =>
          value.includes(query)
        );
    });
  }, [loads, search]);

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ====================================================
  // INITIAL FETCH
  // ====================================================

  useEffect(() => {
    fetchLoads();
  }, []);

  // ====================================================
  // PRINT
  // ====================================================

  const handlePrint = () => {
    window.print();
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Load Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage loads from the admin panel.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={fetchLoads}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw
              size={17}
              className={
                fetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setShowForm(
                (prev) => !prev
              )
            }
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            {showForm ? (
              <>
                <X size={17} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={17} />
                Add Load
              </>
            )}
          </button>

        </div>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      {showForm && (
        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Add New Load
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Paste the user's Object ID and enter the load details.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* ROW 1 */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  User Object ID *
                </label>

                <input
                  type="text"
                  name="createdBy"
                  value={form.createdBy}
                  onChange={handleChange}
                  placeholder="Paste User Object ID"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Creator Role *
                </label>

                <select
                  name="creatorRole"
                  value={form.creatorRole}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  {creatorRoles.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="Open">
                    Open
                  </option>

                  <option value="Assigned">
                    Assigned
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

            {/* ROW 2 */}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* SERVICE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Service *
                </label>

                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="">
                    Select Service
                  </option>

                  {serviceOptions.map(
                    (service) => (
                      <option
                        key={service}
                        value={service}
                      >
                        {service}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* VEHICLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Vehicle Type *
                </label>

                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="">
                    Select Vehicle Type
                  </option>

                  {vehicleTypeOptions.map(
                    (vehicle) => (
                      <option
                        key={vehicle}
                        value={vehicle}
                      >
                        {vehicle}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Pickup Date *
                </label>

                <input
                  type="date"
                  name="pickupDate"
                  value={form.pickupDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

            </div>

            {/* ROW 3 */}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Pickup Location *
                </label>

                <input
                  type="text"
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={handleChange}
                  placeholder="Pickup location"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Loading Point *
                </label>

                <input
                  type="text"
                  name="loading_point"
                  value={form.loading_point}
                  onChange={handleChange}
                  placeholder="Loading point"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

            </div>

            {/* ROW 4 */}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Goods Type
                </label>

                <input
                  type="text"
                  name="goodsType"
                  value={form.goodsType}
                  onChange={handleChange}
                  placeholder="Goods type"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Weight
                </label>

                <input
                  type="text"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="e.g. 16 MT"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Expected Budget
                </label>

                <input
                  type="number"
                  name="expectedBudget"
                  value={form.expectedBudget}
                  onChange={handleChange}
                  placeholder="₹ Budget"
                  min="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

            </div>

            {/* ROW 5 */}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Contact Person *
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Contact Number *
                </label>

                <input
                  type="text"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

            </div>

            {/* REMARKS */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Additional remarks..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* BUTTON */}

            <div className="mt-5 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Add Load
                  </>
                )}

              </button>

            </div>

          </form>
        </div>
      )}

      {/* ==================================================
          TABLE HEADER
      ================================================== */}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">

        <div>

          <h2 className="text-lg font-bold text-gray-900">
            All Loads
          </h2>

          <p className="text-sm text-gray-500">
            Total:{" "}
            {filteredLoads.length}
          </p>

        </div>

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search loads..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 md:w-80"
            />

          </div>

          {/* PRINT */}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-black"
          >
            <Printer size={17} />
            Print Sheet
          </button>

        </div>

      </div>

      {/* ==================================================
          PRINT AREA
      ================================================== */}

      <div
        id="load-print-area"
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-sm">

            <thead>

              <tr className="border-b border-gray-200 bg-gray-50 text-left">

                <th className="px-3 py-3 font-bold">
                  #
                </th>

                <th className="px-3 py-3 font-bold">
                  Load ID
                </th>

                <th className="px-3 py-3 font-bold">
                  User ID
                </th>

                <th className="px-3 py-3 font-bold">
                  Creator
                </th>

                <th className="px-3 py-3 font-bold">
                  Status
                </th>

                <th className="px-3 py-3 font-bold">
                  Service
                </th>

                <th className="px-3 py-3 font-bold">
                  Vehicle
                </th>

                <th className="px-3 py-3 font-bold">
                  Pickup
                </th>

                <th className="px-3 py-3 font-bold">
                  Loading
                </th>

                <th className="px-3 py-3 font-bold">
                  Pickup Date
                </th>

                <th className="px-3 py-3 font-bold">
                  Goods
                </th>

                <th className="px-3 py-3 font-bold">
                  Weight
                </th>

                <th className="px-3 py-3 font-bold">
                  Contact Person
                </th>

                <th className="px-3 py-3 font-bold">
                  Contact
                </th>

                <th className="px-3 py-3 font-bold">
                  Budget
                </th>

                <th className="px-3 py-3 font-bold">
                  Remarks
                </th>

                <th className="px-3 py-3 font-bold">
                  Created At
                </th>

                <th className="px-3 py-3 font-bold print:hidden">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {fetching ? (

                <tr>

                  <td
                    colSpan="18"
                    className="py-16 text-center text-gray-500"
                  >

                    <Loader2
                      size={25}
                      className="mx-auto mb-2 animate-spin"
                    />

                    Loading loads...

                  </td>

                </tr>

              ) : filteredLoads.length === 0 ? (

                <tr>

                  <td
                    colSpan="18"
                    className="py-16 text-center text-gray-500"
                  >
                    No loads found.
                  </td>

                </tr>

              ) : (

                filteredLoads.map(
                  (load, index) => {

                    const createdBy =
                      typeof load.createdBy ===
                      "object"
                        ? load.createdBy?._id
                        : load.createdBy;

                    return (

                      <tr
                        key={
                          load._id ||
                          index
                        }
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-3 py-3">
                          {index + 1}
                        </td>

                        <td className="px-3 py-3">
                          <span className="font-mono text-xs">
                            {load._id || "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span className="font-mono text-xs">
                            {createdBy || "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          {load.creatorRole || "-"}
                        </td>

                        <td className="px-3 py-3">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              load.status ===
                              "Open"
                                ? "bg-green-100 text-green-700"
                                : load.status ===
                                  "Assigned"
                                ? "bg-blue-100 text-blue-700"
                                : load.status ===
                                  "Completed"
                                ? "bg-purple-100 text-purple-700"
                                : load.status ===
                                  "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {load.status ||
                              "-"}
                          </span>

                        </td>

                        <td className="px-3 py-3 font-semibold">
                          {load.service ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.vehicleType ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.pickupLocation ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.loading_point ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {load.pickupDate ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.goodsType ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.weight ||
                            "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.contactPerson ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {load.contactNumber ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap font-semibold">
                          {load.expectedBudget !==
                            undefined &&
                          load.expectedBudget !==
                            null
                            ? `₹${load.expectedBudget}`
                            : "-"}
                        </td>

                        <td className="px-3 py-3">
                          {load.remarks ||
                            "-"}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {formatDate(
                            load.createdAt
                          )}
                        </td>

                        <td className="px-3 py-3 print:hidden">

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                load._id
                              )
                            }
                            disabled={
                              deletingId ===
                              load._id
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >

                            {deletingId ===
                            load._id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={14}
                              />
                            )}

                            Delete

                          </button>

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

      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>{`

        @media print {

          @page {
            size: landscape;
            margin: 5mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Hide everything first */
          body * {
            visibility: hidden !important;
          }

          /* Show only table */
          #load-print-area,
          #load-print-area * {
            visibility: visible !important;
          }

          #load-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;

            width: 100% !important;

            margin: 0 !important;
            padding: 0 !important;

            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;

            overflow: visible !important;

            background: white !important;
          }

          #load-print-area > div {
            overflow: visible !important;
          }

          /* Table */
          #load-print-area table {
            width: 100% !important;
            min-width: 0 !important;

            table-layout: fixed !important;

            border-collapse: collapse !important;

            font-size: 6.5px !important;
          }

          /* Cells */
          #load-print-area th,
          #load-print-area td {
            padding: 2.5px 3px !important;

            border: 1px solid #999 !important;

            color: #000 !important;

            background: white !important;

            vertical-align: middle !important;

            word-break: break-word !important;

            overflow-wrap: anywhere !important;
          }

          /* Header */
          #load-print-area thead {
            display: table-header-group !important;
          }

          #load-print-area thead tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #load-print-area th {
            font-weight: 700 !important;
            background: #eeeeee !important;
          }

          /* Rows */
          #load-print-area tbody {
            display: table-row-group !important;
          }

          #load-print-area tbody tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Hide delete/action */
          #load-print-area .print\\\\:hidden {
            display: none !important;
          }

          /* Status badges */
          #load-print-area span {
            color: #000 !important;
            background: transparent !important;
            padding: 0 !important;
          }

        }

      `}</style>

    </div>
  );
}
