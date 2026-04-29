"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import { 
  Calendar, MapPin, Users, Plus, ExternalLink, Clock, 
  MoreVertical, Loader2, X, Image as ImageIcon, Globe, Building
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

// ── Create Event Modal ───────────────────────────────────────────────────────

function CreateEventModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    virtualLink: "",
    isOnline: false,
    category: "networking",
    capacity: 0
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date) {
      return toast.error("Please fill in all required fields.");
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (image) data.append("file", image);

      await api.post("/events", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Event created successfully!");
      onCreated();
      onClose();
      // Reset form
      setFormData({
        title: "", description: "", date: "", location: "",
        virtualLink: "", isOnline: false, category: "networking", capacity: 0
      });
      setImage(null);
      setPreview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--surface)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-[var(--border)]"
      >
        <div className="sticky top-0 bg-[var(--surface)]/80 backdrop-blur-md z-10 px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-black text-[var(--text-1)] uppercase tracking-tight">Create New Event</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-all"
          >
            {preview ? (
              <Image src={preview} fill alt="Preview" className="object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ImageIcon className="w-10 h-10 mb-2 opacity-50 group-hover:text-primary group-hover:scale-110 transition-all" />
                <p className="text-xs font-bold uppercase tracking-widest">Click to upload cover image</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Event Title *</label>
              <input 
                type="text" 
                className="input w-full bg-slate-50 dark:bg-slate-800"
                placeholder="e.g. Annual Alumni Meetup 2026"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Date & Time *</label>
                <input 
                  type="datetime-local" 
                  className="input w-full bg-slate-50 dark:bg-slate-800"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Category</label>
                <select 
                  className="input w-full bg-slate-50 dark:bg-slate-800"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="networking">Networking</option>
                  <option value="tech">Tech</option>
                  <option value="career">Career</option>
                  <option value="social">Social</option>
                  <option value="alumni">Alumni</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                  checked={formData.isOnline}
                  onChange={e => setFormData({ ...formData, isOnline: e.target.checked })}
                />
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${formData.isOnline ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold text-[var(--text-2)]">Virtual Event</span>
                </div>
              </label>
            </div>

            {!formData.isOnline ? (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    className="input w-full pl-10 bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Grand Hall, Mumbai"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Virtual Meeting Link</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="url" 
                    className="input w-full pl-10 bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Zoom or Google Meet link"
                    value={formData.virtualLink}
                    onChange={e => setFormData({ ...formData, virtualLink: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Description *</label>
              <textarea 
                className="input w-full min-h-[120px] py-3 bg-slate-50 dark:bg-slate-800"
                placeholder="What is this event about?"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Plus className="w-5 h-5" /> Create Event</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function EventsPage() {
  const { user } = useSelector((s) => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data.data.data);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAttend = async (eventId) => {
    try {
      const { data } = await api.post(`/events/${eventId}/attend`);
      setEvents(events.map(e => e._id === eventId ? { ...e, attendees: data.data.attending ? [...e.attendees, user._id] : e.attendees.filter(id => id !== user._id) } : e));
      toast.success(data.data.attending ? "You're attending!" : "RSVP removed");
    } catch (err) {
      toast.error("Failed to RSVP");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 md:p-8 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Events</h1>
          <p className="text-slate-500 text-sm mt-1">Networking, webinars, and reunions</p>
        </div>
        
        {(user?.role === "admin" || user?.role === "sub-admin") && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 py-2.5 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      <CreateEventModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreated={fetchEvents}
      />

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const isAttending = event.attendees?.includes(user?._id);
            const date = new Date(event.date);

            return (
              <motion.div 
                layout
                key={event._id} 
                className="card group overflow-hidden bg-[var(--surface)] border-[var(--border)]"
              >
                <div className="h-44 bg-slate-200 dark:bg-slate-800 relative">
                  {event.coverImage ? (
                    <Image src={event.coverImage} fill alt="Event" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-primary opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 rounded-2xl p-2.5 text-center shadow-xl min-w-[55px] border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-primary uppercase tracking-tighter">{format(date, "MMM")}</span>
                    <span className="block text-2xl font-black text-[var(--text-1)]">{format(date, "dd")}</span>
                  </div>
                  {event.isOnline && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> Virtual
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span>{format(date, "eeee, h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <span className="truncate">{event.isOnline ? "Online Meeting" : (event.location || "Location TBD")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {event.attendees?.slice(0, 3).map((atId, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface)] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                             {/* Simple colored circle for mock UI or real avatars if available */}
                             <div className={`w-full h-full flex items-center justify-center text-[8px] font-bold ${['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500'][i]} text-white`}>
                               {i + 1}
                             </div>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {event.attendees?.length || 0} Attending
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {event.virtualLink && (
                        <a href={event.virtualLink} target="_blank" className="btn-ghost p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <ExternalLink className="w-5 h-5 text-primary" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleAttend(event._id)}
                        className={`py-2 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${
                          isAttending 
                            ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                            : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                        }`}
                      >
                        {isAttending ? "Going" : "RSVP"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card p-24 text-center border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No events found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Check back later for networking webinars, reunions, and meetups.</p>
        </div>
      )}
    </div>
  );
}
