import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw,
  ZoomIn,
} from "lucide-react";

// ==========================================
// API BASE URL
// ==========================================

const API_URL = "https://rodiotradelink.com";

const AdminMediaPosts = () => {
  const [posts, setPosts] = useState([]);
  const [files, setFiles] = useState([]);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Selected media for zoom
  const [selectedMedia, setSelectedMedia] = useState(null);

  const fileInputRef = useRef(null);

  // ==========================================
  // GET ALL POSTS
  // ==========================================

  const fetchPosts = async () => {
    try {
      setFetching(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/media-posts/admin/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch media posts"
        );
      }

      setPosts(result.posts || []);
    } catch (error) {
      console.error("FETCH MEDIA POSTS ERROR:", error);
      alert(error.message || "Unable to fetch posts");
    } finally {
      setFetching(false);
    }
  };

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 20) {
      alert("You can upload maximum 20 files at once.");
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > 50 * 1024 * 1024
    );

    if (oversizedFile) {
      alert(`${oversizedFile.name} is larger than 50MB.`);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
    );

    if (invalidFile) {
      alert(`${invalidFile.name} is not an image or video.`);
      return;
    }

    setFiles(selectedFiles);
  };

  // ==========================================
  // REMOVE SELECTED FILE
  // ==========================================

  const removeSelectedFile = (index) => {
    setFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  // ==========================================
  // CREATE POST
  // ==========================================

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select at least one image or video.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("title", title);
      formData.append("caption", caption);

      files.forEach((file) => {
        formData.append("media", file);
      });

      const response = await fetch(
        `${API_URL}/api/media-posts/admin/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create post"
        );
      }

      alert("Post uploaded successfully!");

      setTitle("");
      setCaption("");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchPosts();
    } catch (error) {
      console.error("CREATE MEDIA POST ERROR:", error);
      alert(error.message || "Unable to upload post");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE POST
  // ==========================================

  const handleDeletePost = async (postId) => {
    if (!postId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?\n\nAll images/videos of this post will also be deleted from Cloudinary."
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(postId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/media-posts/admin/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete post"
        );
      }

      alert("Post deleted successfully!");

      setPosts((prev) =>
        prev.filter((post) => post._id !== postId)
      );

      // Agar deleted post modal me open tha
      setSelectedMedia(null);
    } catch (error) {
      console.error("DELETE MEDIA POST ERROR:", error);
      alert(error.message || "Unable to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // OPEN MEDIA
  // ==========================================

  const openMedia = (item, post) => {
    setSelectedMedia({
      ...item,
      title: post.title || "",
      caption: post.caption || "",
    });
  };

  // ==========================================
  // CLOSE MEDIA
  // ==========================================

  const closeMedia = () => {
    setSelectedMedia(null);
  };

  // ==========================================
  // ESC KEY TO CLOSE
  // ==========================================

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedMedia(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ==========================================
  // LOAD POSTS
  // ==========================================

  useEffect(() => {
    fetchPosts();
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Media Posts
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload images and videos for the website story scrollbar.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPosts}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* ======================================
          CREATE POST
      ====================================== */}

      <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">

        <h2 className="mb-5 text-lg font-bold text-gray-900">
          Create New Post
        </h2>

        <form onSubmit={handleCreatePost}>

          {/* TITLE */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          {/* CAPTION */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Caption
            </label>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something about this post..."
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          {/* FILE UPLOAD */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Images / Videos
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50"
            >
              <Upload
                size={32}
                className="mb-3 text-blue-600"
              />

              <span className="font-semibold text-gray-800">
                Select Images / Videos
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Maximum 20 files • Maximum 50MB per file
              </span>
            </button>

          </div>

          {/* ======================================
              SELECTED FILES
          ====================================== */}

          {files.length > 0 && (

            <div className="mb-5">

              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-800">
                  Selected Files ({files.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

                {files.map((file, index) => {

                  const previewUrl =
                    URL.createObjectURL(file);

                  const isVideo =
                    file.type.startsWith("video/");

                  return (

                    <div
                      key={`${file.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border bg-gray-100"
                    >

                      {isVideo ? (

                        <video
                          src={previewUrl}
                          className="h-32 w-full object-cover"
                          muted
                        />

                      ) : (

                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="h-32 w-full object-cover"
                        />

                      )}

                      <div className="absolute left-2 top-2 rounded-full bg-black/70 p-1.5 text-white">
                        {isVideo ? (
                          <Video size={14} />
                        ) : (
                          <ImageIcon size={14} />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedFile(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>

                      <div className="truncate px-2 py-2 text-xs text-gray-600">
                        {file.name}
                      </div>

                    </div>

                  );
                })}

              </div>

            </div>

          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              loading || files.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Upload size={18} />

            {loading
              ? "Uploading..."
              : "Upload Post"}

          </button>

        </form>

      </div>

      {/* ======================================
          ALL POSTS
      ====================================== */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Uploaded Posts
            </h2>

            <p className="text-sm text-gray-500">
              Total Posts: {posts.length}
            </p>

          </div>

        </div>

        {fetching ? (

          <div className="py-12 text-center text-gray-500">
            Loading posts...
          </div>

        ) : posts.length === 0 ? (

          <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
            No media posts uploaded yet.
          </div>

        ) : (

          <div className="space-y-5">

            {posts.map((post) => (

              <div
                key={post._id}
                className="overflow-hidden rounded-2xl border bg-gray-50"
              >

                {/* POST HEADER */}

                <div className="flex flex-col gap-3 border-b bg-white p-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      {post.title || "Untitled Post"}
                    </h3>

                    {post.caption && (
                      <p className="mt-1 text-sm text-gray-500">
                        {post.caption}
                      </p>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeletePost(post._id)
                    }
                    disabled={
                      deletingId === post._id
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >

                    <Trash2 size={16} />

                    {deletingId === post._id
                      ? "Deleting..."
                      : "Delete Post"}

                  </button>

                </div>

                {/* ==================================
                    MEDIA SCROLLER
                ================================== */}

                <div className="overflow-x-auto p-4">

                  <div className="flex min-w-max gap-4">

                    {(post.media || []).map(
                      (item, index) => {

                        const isVideo =
                          item.resourceType ===
                          "video";

                        return (

                          <div
                            key={
                              item._id ||
                              `${post._id}-${index}`
                            }
                            className="group relative w-64 shrink-0 overflow-hidden rounded-xl border bg-black"
                          >

                            {/* MEDIA */}

                            <div
                              onClick={() =>
                                openMedia(
                                  item,
                                  post
                                )
                              }
                              className="relative cursor-zoom-in"
                            >

                              {isVideo ? (

                                <video
                                  src={item.url}
                                  className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  controls
                                  preload="metadata"
                                  playsInline
                                />

                              ) : (

                                <img
                                  src={item.url}
                                  alt={
                                    post.title ||
                                    "Media"
                                  }
                                  className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                              )}

                              {/* ZOOM ICON */}

                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">

                                <div className="rounded-full bg-black/70 p-3 text-white backdrop-blur-sm">
                                  <ZoomIn size={24} />
                                </div>

                              </div>

                              {/* TYPE */}

                              <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">

                                {isVideo
                                  ? "VIDEO"
                                  : "IMAGE"}

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ======================================
          FULL SCREEN MEDIA MODAL
      ====================================== */}

      {selectedMedia && (

        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeMedia}
        >

          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={closeMedia}
            className="absolute right-5 top-5 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
            aria-label="Close"
          >
            <X size={26} />
          </button>

          {/* MEDIA CONTAINER */}

          <div
            className="relative flex max-h-[92vh] max-w-[95vw] items-center justify-center"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {selectedMedia.resourceType ===
            "video" ? (

              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />

            ) : (

              <img
                src={selectedMedia.url}
                alt={
                  selectedMedia.title ||
                  "Media Preview"
                }
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />

            )}

          </div>

          {/* TITLE / CAPTION */}

          {(selectedMedia.title ||
            selectedMedia.caption) && (

            <div className="absolute bottom-5 left-1/2 w-[90%] max-w-3xl -translate-x-1/2 rounded-xl bg-black/70 px-5 py-3 text-center text-white backdrop-blur-sm">

              {selectedMedia.title && (
                <h3 className="font-bold">
                  {selectedMedia.title}
                </h3>
              )}

              {selectedMedia.caption && (
                <p className="mt-1 text-sm text-white/80">
                  {selectedMedia.caption}
                </p>
              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
};

export default AdminMediaPosts;
