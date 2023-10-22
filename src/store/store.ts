import { configureStore } from "@reduxjs/toolkit";
import { inventoryApi } from "api/inventory";

// Action creators are generated for each case reducer function
export const store = configureStore({
  reducer: { [inventoryApi.reducerPath]: inventoryApi.reducer },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(inventoryApi.middleware);
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
