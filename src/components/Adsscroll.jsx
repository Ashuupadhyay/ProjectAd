import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Upload,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = "https://rodiotradelink.com/api/featured-ads";

const initialForm = {
  title: "",
  link: "",
  placement: "directory",
  sortOrder: 0,
  isActive: true,
};

const Adsscroll = () => {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // GET FEATURED ADS
  const fetchAds = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch advertisements");
      }

      setAds(data.ads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // IMAGE SELECTION
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // RESET FORM
  const resetForm = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setForm(initialForm);
    setImage(null);
    setPreview("");
    setEditingId(null);
    setShowForm(false);
  };

  // OPEN EDIT FORM
  const handleEdit = (ad) => {
    setEditingId(ad._id);

    setForm({
      title: ad.title || "",
      link: ad.link || "",
      placement: ad.placement || "directory",
      sortOrder: ad.sortOrder || 0,
      isActive: ad.isActive ?? true,
    });

    setImage(null);
    setPreview(ad.image || "");
    setShowForm(true);
  };

  // CREATE / UPDATE ADVERTISEMENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !image) {
      alert("Please select an advertisement image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("link", form.link);
      formData.append("placement", form.placement);
      formData.append("sortOrder", form.sortOrder);
      formData.append("isActive", form.isActive);

      if (image) {
        formData.append("image", image);
      }

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert(
        editingId
          ? "Advertisement updated successfully"
          : "Advertisement uploaded successfully"
      );

      resetForm();
      fetchAds();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE ADVERTISEMENT
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete advertisement");
      }

      setAds((prev) => prev.filter((ad) => ad._id !== id));

      alert("Advertisement deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Featured Advertisements
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage website advertisements and placements
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchAds}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Advertisement
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? "Update Advertisement" : "Upload Advertisement"}
            </h3>

            <button
              onClick={resetForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* TITLE */}
           

              {/* LINK */}
            

              {/* PLACEMENT */}
              

              {/* SORT ORDER */}
            
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Advertisement Image
              </label>

              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 hover:border-blue-500">
                {preview ? (
                  <img
                    src={preview}
                    alt="Advertisement preview"
                    className="max-h-52 max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload size={30} className="mb-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload image
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Image files only
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {editingId && (
                <p className="mt-2 text-xs text-gray-500">
                  Select a new image only if you want to replace the existing one.
                </p>
              )}
            </div>

            {/* ACTIVE STATUS */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4 accent-blue-600"
              />

              <span className="text-sm font-medium text-gray-700">
                Active Advertisement
              </span>
            </label>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Advertisement"
                    : "Upload Advertisement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADVERTISEMENTS LIST */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h3 className="font-bold text-gray-800">
            All Advertisements
          </h3>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
            {ads.length} Ads
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw size={28} className="animate-spin text-blue-600" />
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ImageIcon size={42} className="mb-3" />
            <p className="text-sm">No advertisements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="flex h-52 items-center justify-center bg-gray-50 p-3">
                  <img
                    src={ad.image}
                    alt={ad.title || "Advertisement"}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-800">
                      {ad.title || "Untitled Advertisement"}
                    </h4>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        ad.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ad.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 font-medium capitalize text-blue-700">
                      {ad.placement}
                    </span>

                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-600">
                      Order: {ad.sortOrder}
                    </span>
                  </div>

                  {ad.link && (
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 truncate text-sm text-blue-600 hover:underline"
                    >
                      Visit Link
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adsscroll;