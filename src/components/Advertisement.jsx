import React, { useState } from "react";
import {
  Search,
  UserRound,
  ImagePlus,
  Trash2,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

const API_BASE_URL = "https://rodio-tradelink.onrender.com/api";

export default function Advertisement() {
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const fetchProfile = async (event) => {
    event?.preventDefault();
    clearMessages();
    setProfile(null);
    setPreview("");
    setSelectedImage(null);

    const id = userId.trim();

    if (!/^[a-f\d]{24}$/i.test(id)) {
      setError("Valid 24-character MongoDB Register User OID enter karein.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/advertisement-management/${encodeURIComponent(id)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      const fetchedProfile = {
  ...(data.user || {}),
  ...(data.advertisement || {}),
  _id: data.user?._id || id,
};
      if (!fetchedProfile || typeof fetchedProfile !== "object") {
        throw new Error("Profile response nahi mila.");
      }

      setProfile(fetchedProfile);
     setPreview(fetchedProfile.adImage || "");
setMessage("Advertisement successfully fetch ho gaya.");
    } catch (err) {
      setError(err.message || "Profile fetch nahi ho paayi. Backend route check karein.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearMessages();

    if (!file.type.startsWith("image/")) {
      setError("Sirf image file select karein.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image ka size 5 MB se kam hona chahiye.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateImage = async () => {
    if (!profile || !selectedImage) {
      setError("Pehle nayi profile image select karein.");
      return;
    }

    clearMessages();
    setSaving(true);

    try {
      const formData = new FormData();
formData.append("adImage", selectedImage);

      const response = await fetch(
        `${API_BASE_URL}/advertisement-management/${encodeURIComponent(userId.trim())}/ad-image`,
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }
if (!response.ok) {
  throw new Error(data.message || `HTTP Error: ${response.status}`);
}

const updatedAdImage = data.advertisement?.adImage;

if (updatedAdImage) {
  setProfile((previous) => ({
    ...previous,
    adImage: updatedAdImage,
  }));
  setPreview(updatedAdImage);
} else {
  await fetchProfile();
}

setSelectedImage(null);
setMessage("Advertisement image successfully update ho gayi.");

      setSelectedImage(null);
      setMessage("Profile image update request successful.");
    } catch (err) {
      setError(err.message || "Image update nahi hui. Backend route aur upload configuration check karein.");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async () => {
    if (!profile) return;

    const confirmed = window.confirm(
      "Kya aap is user ki profile image delete karna chahte hain?"
    );
    if (!confirmed) return;

    clearMessages();
    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/profile-management/${encodeURIComponent(userId.trim())}/image`,
        { method: "DELETE" }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP Error: ${response.status}. Backend DELETE route add karna hoga.`
        );
      }

      const updated = data.profile ?? data.data;
      setProfile((previous) => ({
        ...previous,
        ...(updated || {}),
        profileImage: updated?.profileImage || "",
      }));
      setPreview("");
      setSelectedImage(null);
      setMessage("Profile image delete ho gayi.");
    } catch (err) {
      setError(err.message || "Image delete nahi hui. Backend DELETE route check karein.");
    } finally {
      setSaving(false);
    }
  };

  const resetSearch = () => {
    setUserId("");
    setProfile(null);
    setSelectedImage(null);
    setPreview("");
    clearMessages();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-3 text-violet-700">
            <UserRound size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
advertisement</h2>
            <p className="text-sm text-slate-500">
              Register User OID se profile search aur image manage karein
            </p>
          </div>
        </div>

        <form onSubmit={fetchProfile} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value.trimStart())}
            placeholder="MongoDB Register User ObjectId paste karein"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? "Searching..." : "Get Profile"}
          </button>

          <button
            type="button"
            onClick={resetSearch}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} /> Reset
          </button>
        </form>

        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      {profile && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Profile</h3>
              <p className="mt-1 break-all text-xs text-slate-500">Register User OID: {userId}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <ShieldCheck size={15} /> Profile Found
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {preview ? (
                  <img src={preview} alt="User profile" className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={76} className="text-slate-300" />
                )}
              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-violet-200 px-3 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50">
                <ImagePlus size={18} /> Choose New Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>

              {selectedImage && <p className="mt-2 break-all text-xs text-slate-500">Selected: {selectedImage.name}</p>}

              <button
                type="button"
                onClick={updateImage}
                disabled={!selectedImage || saving}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus size={17} /> {saving ? "Processing..." : "Update Image"}
              </button>

              <button
                type="button"
                onClick={deleteImage}
                disabled={saving || !profile.profileImage}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={17} /> Delete Image
              </button>
            </div>

            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Info label="Name" value={profile.name} icon={<UserRound size={17} />} />
              <Info label="Firm Name" value={profile.firmName} icon={<Building2 size={17} />} />
              <Info label="Role" value={profile.role} icon={<ShieldCheck size={17} />} />
              <Info label="Mobile Number" value={profile.phoneNumber || profile.mobile} icon={<Phone size={17} />} />
              <Info label="Email" value={profile.email} icon={<Mail size={17} />} />
              <Info label="Profile Record ID" value={profile._id} icon={<UserRound size={17} />} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-slate-900">{value || "Not available"}</p>
    </div>
  );
}
