import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,        // { _id, firstName, lastName, email, avatar, role }
    isLoggedIn: false,
    onlineUsers: [],   // list of online user IDs from socket
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setUser, clearUser, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
