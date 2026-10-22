
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Star,
  MessageSquare,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";


import axios from "axios";

const api = axios.create({
  baseURL: "https://rodiotradelink.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function AdminReviews() {
  // =========================================================
  // STATE
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editReview, setEditReview] = useState(null);

  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  });

  // =========================================================
  // FETCH ALL REVIEWS
  // =========================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await api.get("/reviews");

      console.log("Admin Reviews Response:", response.data);

      if (
        response.data?.success &&
        Array.isArray(response.data.reviews)
      ) {
        setReviews(response.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("GET Reviews Error:", error);

      setReviews([]);

      alert(
        error?.response?.data?.message ||
          "Failed to load reviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    fetchReviews();
  }, []);

  // =========================================================
  // SEARCH ALL FIELDS
  // =========================================================

  const filteredReviews = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return reviews;
    }

    return reviews.filter((review) => {
      const user = review?.user || {};

      return [
        review?._id,
        review?.rating,
        review?.comment,
        review?.createdAt,
        review?.updatedAt,

        user?.name,
        user?.mobile,
        user?.firmName,
        user?.role,
        user?._id,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [reviews, search]);

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEdit = (review) => {
    setEditReview(review);

    setEditForm({
      rating: Number(review?.rating || 5),
      comment: review?.comment || "",
    });
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {
    if (saving) return;

    setEditReview(null);

    setEditForm({
      rating: 5,
      comment: "",
    });
  };

  // =========================================================
  // EDIT INPUT CHANGE
  // =========================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // UPDATE REVIEW
  // =========================================================

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    if (!editReview?._id) {
      return;
    }

    if (
      editForm.rating === "" ||
      Number(editForm.rating) < 1 ||
      Number(editForm.rating) > 5
    ) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!editForm.comment.trim()) {
      alert("Please write a review comment.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/admin/reviews/${editReview._id}`,
        {
          rating: Number(editForm.rating),
          comment: editForm.comment.trim(),
        }
      );

      console.log("Update Review Response:", response.data);

      if (response.data?.success) {
        alert("Review updated successfully.");

        closeEditModal();

        await fetchReviews();
      } else {
        alert(
          response.data?.message ||
            "Failed to update review."
        );
      }
    } catch (error) {
      console.error("UPDATE Review Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to update review. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDeleteReview = async (review) => {
    if (!review?._id) {
      return;
    }

    const userName =
      review?.user?.name || "this user";

    const confirmed = window.confirm(
      `Are you sure you want to delete this review by ${userName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(review._id);

      const response = await api.delete(
        `/admin/reviews/${review._id}`
      );

      console.log("Delete Review Response:", response.data);

      if (response.data?.success) {
        alert("Review deleted successfully.");

        await fetchReviews();
      } else {
        alert(
          response.data?.message ||
            "Failed to delete review."
        );
      }
    } catch (error) {
      console.error("DELETE Review Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete review. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // RENDER STARS
  // =========================================================

  const renderStars = (rating) => {
    const value = Number(rating || 0);

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleString("en-IN");
    } catch {
      return "N/A";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* TITLE */}

            <div className="flex items-center gap-3">

              <div className="p-3 bg-indigo-50 rounded-xl">
                <MessageSquare
                  size={22}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  User Reviews
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Manage all user reviews
                </p>
              </div>

            </div>

            {/* SEARCH + REFRESH */}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              {/* SEARCH */}

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
                  placeholder="Search name, number, firm, comment..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

              </div>

              {/* TOTAL */}

              <div className="text-xs text-gray-500 whitespace-nowrap">
                Total:{" "}
                <span className="font-semibold text-gray-800">
                  {filteredReviews.length}
                </span>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={fetchReviews}
                disabled={loading}
                className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white transition flex items-center justify-center"
                title="Refresh reviews"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  User Name
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Mobile
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Firm Name
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Rating
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 min-w-[300px]">
                  Comment
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                  Date
                </th>

                <th className="px-4 py-3.5 font-semibold text-gray-600 whitespace-nowrap text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Loading reviews...
                    </div>
                  </td>

                </tr>

              ) : filteredReviews.length === 0 ? (

                /* NO RESULTS */

                <tr>

                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {search.trim()
                      ? "No reviews match your search."
                      : "No reviews found."}
                  </td>

                </tr>

              ) : (

                /* REVIEWS */

                filteredReviews.map((review) => {

                  const user = review?.user || {};

                  return (
                    <tr
                      key={review._id}
                      className="hover:bg-gray-50 transition"
                    >

                      {/* USER NAME */}

                      <td className="px-4 py-3.5">

                        <div className="flex items-center gap-3">

                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user?.name || "User"}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {(
                                user?.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-[130px]">

                            <div className="font-semibold text-gray-800">
                              {user?.name ||
                                "RODIO User"}
                            </div>

                            {user?.role && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {user.role}
                              </div>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* MOBILE */}

                      <td className="px-4 py-3.5 font-mono text-gray-700 whitespace-nowrap">
                        {user?.mobile || "N/A"}
                      </td>

                      {/* FIRM NAME */}

                      <td className="px-4 py-3.5">

                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg whitespace-nowrap">
                          {user?.firmName || "N/A"}
                        </span>

                      </td>

                      {/* RATING */}

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStars(review?.rating)}

                        <div className="text-[10px] text-gray-400 mt-1">
                          {review?.rating || 0}/5
                        </div>
                      </td>

                      {/* COMMENT */}

                      <td className="px-4 py-3.5">

                        <div className="max-w-[420px] text-gray-700 leading-relaxed">
                          {review?.comment || "N/A"}
                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDate(
                          review?.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-3.5">

                        <div className="flex items-center justify-center gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(review)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg transition font-semibold"
                            title="Edit review"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteReview(
                                review
                              )
                            }
                            disabled={
                              deletingId ===
                              review._id
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 border border-red-100 rounded-lg transition font-semibold"
                            title="Delete review"
                          >
                            {deletingId ===
                            review._id ? (
                              <>
                                <RefreshCw
                                  size={14}
                                  className="animate-spin"
                                />
                                Deleting
                              </>
                            ) : (
                              <>
                                <Trash2
                                  size={14}
                                />
                                Delete
                              </>
                            )}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editReview && (

        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

            {/* MODAL HEADER */}

            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

              <div>

                <h3 className="text-base font-bold text-gray-800">
                  Edit Review
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {editReview?.user?.name ||
                    "RODIO User"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
              >
                <X size={18} />
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={handleUpdateReview}
              className="p-5 space-y-5"
            >

              {/* USER INFO */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">

                  <div className="text-[10px] text-gray-400 uppercase font-semibold">
                    Mobile
                  </div>

                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {editReview?.user?.mobile ||
                      "N/A"}
                  </div>

                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">

                  <div className="text-[10px] text-gray-400 uppercase font-semibold">
                    Firm Name
                  </div>

                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {editReview?.user?.firmName ||
                      "N/A"}
                  </div>

                </div>

              </div>

              {/* RATING */}

              <div>

                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Rating
                </label>

                <div className="flex items-center gap-2">

                  <select
                    name="rating"
                    value={editForm.rating}
                    onChange={handleEditChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={5}>
                      5 - Excellent
                    </option>
                    <option value={4}>
                      4 - Very Good
                    </option>
                    <option value={3}>
                      3 - Good
                    </option>
                    <option value={2}>
                      2 - Average
                    </option>
                    <option value={1}>
                      1 - Poor
                    </option>
                  </select>

                  <div className="flex items-center gap-1 px-3">
                    {renderStars(
                      Number(editForm.rating)
                    )}
                  </div>

                </div>

              </div>

              {/* COMMENT */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-xs font-semibold text-gray-600">
                    Comment
                  </label>

                  <span className="text-[10px] text-gray-400">
                    {editForm.comment.length}/1000
                  </span>

                </div>

                <textarea
                  name="comment"
                  value={editForm.comment}
                  onChange={handleEditChange}
                  maxLength={1000}
                  rows={5}
                  placeholder="Write review comment..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm transition"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Update Review
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

