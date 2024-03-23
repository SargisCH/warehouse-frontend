import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Role, User } from "types";

const initialState = {
  email: "",
  id: null,
  companyName: "",
  tenantId: null,
  tenant: { id: null, name: "" },
  role: Role.USER,
} as User;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<User>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
