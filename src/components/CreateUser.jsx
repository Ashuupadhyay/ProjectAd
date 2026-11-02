import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
} from "lucide-react";

const API_URL = "/api/admin-created-users";

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  password: "",
};

export default function CreateUser() {
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [successUser, setSuccessUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/all`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessUser(null);
    setLoading(true);

    try {
      const isEditing = Boolean(editingUser);

      const payload = { ...form };

      if (isEditing && !payload.password.trim()) {
        delete payload.password;
      }

      const response = await fetch(
        isEditing
          ? `${API_URL}/update/${editingUser._id}`
          : `${API_URL}/create`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Request failed");
      }

      if (isEditing) {
        setSuccessUser(null);
        resetForm();
      } else {
        setSuccessUser(data.data);
        setForm(initialForm);
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setError("");
    setSuccessUser(null);
    setEditingUser(user);

    setForm({
      name: user.name || "",
      mobile: user.mobile || "",
      email: user.email || "",
      password: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    setDeletingId(user._id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/delete/${user._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "User deletion failed");
      }

      if (editingUser?._id === user._id) {
        resetForm();
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyCredentials = () => {
    if (!successUser) return;

    const text = `User ID: ${successUser.userId}
Name: ${successUser.name}
Email: ${successUser.email}
Mobile: ${successUser.mobile}
Password: ${successUser.password}`;

    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            {editingUser ? <Pencil size={24} /> : <UserPlus size={24} />}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingUser ? "Edit User" : "Create New User"}
            </h2>
            <p className="text-sm text-slate-500">
              {editingUser
                ? "Update user details"
                : "Create user credentials from Admin Panel"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {successUser && (
          <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <CheckCircle size={21} />
              <h3 className="font-bold">User Created Successfully</h3>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>User ID:</strong> {successUser.userId}</p>
              <p><strong>Name:</strong> {successUser.name}</p>
              <p><strong>Email:</strong> {successUser.email}</p>
              <p><strong>Mobile:</strong> {successUser.mobile}</p>
              <p><strong>Password:</strong> {successUser.password}</p>
            </div>

            <button
              type="button"
              onClick={copyCredentials}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Copy size={16} />
              Copy Credentials
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password {editingUser && "(Leave blank to keep current password)"}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editingUser ? "Enter new password (optional)" : "Create password"
                }
                required={!editingUser}
                minLength={6}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {editingUser ? "Updating..." : "Creating User..."}
                </>
              ) : (
                <>
                  {editingUser ? <Save size={18} /> : <UserPlus size={18} />}
                  {editingUser ? "Update User" : "Create User"}
                </>
              )}
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Created Users
            </h2>
            <p className="text-sm text-slate-500">
              Total Users: {users.length}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={fetching}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={fetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-10 text-blue-600">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-blue-700">
                      {user.userId}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-600">
                      {user.mobile}
                    </td>
                    <td className="p-4 text-slate-600">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="Edit User"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user._id}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                          title="Delete User"
                        >
                          {deletingId === user._id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}