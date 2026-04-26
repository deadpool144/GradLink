"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Calendar, MapPin, Users, Plus, ExternalLink, Clock, MoreVertical, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useSelector } from "react-redux";

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
    Promise.resolve().then(() => fetchEvents());
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Events</h1>
          <p className="text-slate-500 text-sm mt-1">Networking, webinars, and reunions</p>
        </div>
        
        {user?.role === "admin" && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const isAttending = event.attendees?.includes(user?._id);
            const date = new Date(event.date);

            return (
              <div key={event._id} className="card group overflow-hidden">
                <div className="h-40 bg-slate-200 relative">
                  {event.coverImage ? (
                    <Image src={event.coverImage} fill alt="Event" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-white opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 rounded-xl p-2 text-center shadow-lg min-w-[50px]">
                    <span className="block text-xs font-bold text-primary uppercase">{format(date, "MMM")}</span>
                    <span className="block text-xl font-black">{format(date, "dd")}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <button className="btn-ghost p-1">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{format(date, "eeee, h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location || "Online"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {/* Mock attendee avatars */}
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">+{event.attendees?.length || 0} attending</span>
                    </div>

                    <div className="flex gap-2">
                      {event.virtualLink && (
                        <a href={event.virtualLink} target="_blank" className="btn-ghost p-2 rounded-xl">
                          <ExternalLink className="w-5 h-5 text-primary" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleAttend(event._id)}
                        className={`btn-primary py-2 px-6 shadow-sm ${isAttending ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary"}`}
                      >
                        {isAttending ? "Attending" : "RSVP"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-20 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold">No upcoming events</p>
          <p className="text-sm">Stay tuned for webinars and reunions.</p>
        </div>
      )}
    </div>
  );
}
