import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConvId: null,
    messages: {},       // { [convId]: Message[] }
    unread: {},         // { [convId]: count }
    typingUsers: {},    // { [convId]: userId[] }
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConv: (state, action) => {
      state.activeConvId = action.payload;
      // Clear unread when opening
      if (action.payload) state.unread[action.payload] = 0;
    },
    setMessages: (state, action) => {
      const { convId, messages } = action.payload;
      state.messages[convId] = messages;
    },
    appendMessage: (state, action) => {
      const msg = action.payload;
      const convId = msg.conversation?._id || msg.conversation;
      
      // 1. Append message to state.messages
      if (!state.messages[convId]) state.messages[convId] = [];
      // Avoid duplicates
      if (!state.messages[convId].some(m => m._id === msg._id)) {
        state.messages[convId].push(msg);
      }

      // 2. Update conversation in state.conversations
      const convIndex = state.conversations.findIndex((c) => c._id === convId);
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];
        conv.lastMessage = msg;
        
        // Move to top
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }

      // 3. Increment unread if not the active conv
      if (state.activeConvId !== convId) {
        state.unread[convId] = (state.unread[convId] || 0) + 1;
      }
    },
    setTyping: (state, action) => {
      const { convId, userId } = action.payload;
      if (!state.typingUsers[convId]) state.typingUsers[convId] = [];
      if (!state.typingUsers[convId].includes(userId)) state.typingUsers[convId].push(userId);
    },
    clearTyping: (state, action) => {
      const { convId, userId } = action.payload;
      if (state.typingUsers[convId]) {
        state.typingUsers[convId] = state.typingUsers[convId].filter((id) => id !== userId);
      }
    },
    prependConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
  },
});

export const {
  setConversations, setActiveConv, setMessages, appendMessage,
  setTyping, clearTyping, prependConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
