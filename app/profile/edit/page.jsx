"use client";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setUser } from "@/lib/slices/authSlice";
import { Save, Camera, Loader2, ArrowLeft, Globe, MapPin, Briefcase, Info, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfileEditPage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    location: "",
    batch: "",
    department: "",
    website: "",
    education: [],
    experience: [],
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
        batch: user.batch || "",
        department: user.department || "",
        website: user.website || "",
        education: user.education || [],
        experience: user.experience || [],
      });
      hasInitialized.current = true;
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Education Handlers ──────────────────────────────────────────
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: "", degree: "", fieldOfStudy: "", from: "", to: "", current: false, description: "" }]
    });
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index, field, value) => {
    const nextEd = [...formData.education];
    nextEd[index] = { ...nextEd[index], [field]: value };
    setFormData({ ...formData, education: nextEd });
  };

  // ── Experience Handlers ─────────────────────────────────────────
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: "", company: "", location: "", from: "", to: "", current: false, description: "" }]
    });
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index, field, value) => {
    const nextEx = [...formData.experience];
    nextEx[index] = { ...nextEx[index], [field]: value };
    setFormData({ ...formData, experience: nextEx });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/users", formData);
      dispatch(setUser(data.data));
      localStorage.setItem("auth_user", JSON.stringify(data.data));
      toast.success("Profile updated successfully");
      router.push(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    const loadId = toast.loading(`Uploading ${type}...`);
    try {
      const { data } = await api.post(`/users/${type}`, fd);
      dispatch(setUser(data.data));
      localStorage.setItem("auth_user", JSON.stringify(data.data));
      toast.success(`${type} updated`, { id: loadId });
    } catch (err) {
      toast.error(`Failed to upload ${type}`, { id: loadId });
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-6 px-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Edit Profile</h1>
          <p className="text-slate-500 text-sm">Update your personal information and profile appearance</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Media Section */}
        <div className="card overflow-hidden border-primary/20 bg-primary/[0.02]">
          <div className="p-5 border-b flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Profile Media</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full ring-4 ring-primary/10 dark:ring-indigo-950 overflow-hidden group">
                {user?.avatar ? (
                  <Image src={user.avatar} fill alt="Avatar" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-4xl">
                    {user?.firstName?.[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, "avatar")} />
                </label>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo</p>
            </div>

            {/* Cover Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden group">
                {user?.coverImage ? (
                  <Image src={user.coverImage} fill alt="Cover" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg">Change Cover</div>
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, "cover")} />
                </label>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Image</p>
            </div>
          </div>
        </div>

        {/* Dynamic Experience & Education */}
        <div className="space-y-6">
          {/* Experience Section */}
          <div className="card">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="font-bold">Experience</h2>
              </div>
              <button onClick={addExperience} className="btn-secondary h-8 px-3 text-xs gap-1.5 rounded-lg">
                <span className="text-lg">+</span> Add Experience
              </button>
            </div>
            <div className="p-5 space-y-6">
              {formData.experience.length === 0 && (
                <p className="text-center py-4 text-slate-400 text-sm">No experience listed.</p>
              )}
              {formData.experience.map((ex, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 relative">
                  <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Title</label>
                      <input value={ex.title} onChange={e => updateExperience(i, "title", e.target.value)} className="input h-9 text-sm" placeholder="Job title" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Company</label>
                      <input value={ex.company} onChange={e => updateExperience(i, "company", e.target.value)} className="input h-9 text-sm" placeholder="Company name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">From</label>
                      <input value={ex.from} onChange={e => updateExperience(i, "from", e.target.value)} className="input h-9 text-sm" placeholder="MM/YYYY" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">To (or "Present")</label>
                      <input value={ex.to} onChange={e => updateExperience(i, "to", e.target.value)} className="input h-9 text-sm" placeholder="MM/YYYY" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="card">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="font-bold">Education</h2>
              </div>
              <button onClick={addEducation} className="btn-secondary h-8 px-3 text-xs gap-1.5 rounded-lg">
                <span className="text-lg">+</span> Add Education
              </button>
            </div>
            <div className="p-5 space-y-6">
              {formData.education.length === 0 && (
                <p className="text-center py-4 text-slate-400 text-sm">No education listed.</p>
              )}
              {formData.education.map((ed, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 relative">
                  <button onClick={() => removeEducation(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">School / University</label>
                      <input value={ed.school} onChange={e => updateEducation(i, "school", e.target.value)} className="input h-9 text-sm" placeholder="University name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Degree</label>
                      <input value={ed.degree} onChange={e => updateEducation(i, "degree", e.target.value)} className="input h-9 text-sm" placeholder="B.Tech, MBA etc." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Field of Study</label>
                      <input value={ed.fieldOfStudy} onChange={e => updateEducation(i, "fieldOfStudy", e.target.value)} className="input h-9 text-sm" placeholder="Computer Science" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">From</label>
                      <input value={ed.from} onChange={e => updateEducation(i, "from", e.target.value)} className="input h-9 text-sm" placeholder="YYYY" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">To</label>
                      <input value={ed.to} onChange={e => updateEducation(i, "to", e.target.value)} className="input h-9 text-sm" placeholder="YYYY" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Other Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Professional Headline</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Software Engineer at Google" className="input pl-10" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell us more about yourself..." className="input py-3 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="input pl-10" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Website / Portfolio</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourlink.com" className="input pl-10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Current Batch Year</label>
              <select name="batch" value={formData.batch} onChange={handleChange} className="input h-[50px]">
                <option value="">Select Year</option>
                {Array.from({ length: 31 }, (_, i) => 2000 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Current Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="input h-[50px]">
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
          </div>

          <div className="pt-4 sticky bottom-6 z-20">
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary/20 scale-105 transition-transform">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
