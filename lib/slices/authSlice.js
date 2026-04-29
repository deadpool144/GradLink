import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,        // { _id, firstName, lastName, email, avatar, role }
    isLoggedIn: false,
    isCheckingAuth: true,
    onlineUsers: [],   // list of online user IDs from socket
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isCheckingAuth = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isCheckingAuth = false;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setUser, clearUser, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
