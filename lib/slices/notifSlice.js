import { createSlice } from "@reduxjs/toolkit";

const notifSlice = createSlice({
  name: "notif",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifs;
      state.unreadCount   = action.payload.unread;
    },
    prependNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    },
  },
});

export const { setNotifications, prependNotification, clearUnread } = notifSlice.actions;
export default notifSlice.reducer;
