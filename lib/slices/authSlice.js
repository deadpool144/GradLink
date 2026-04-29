import { createSlice } from "@reduxjs/toolkit";

const getInitialUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem("auth_user");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    isLoggedIn: !!initialUser,
    isCheckingAuth: true,
    onlineUsers: [],
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
