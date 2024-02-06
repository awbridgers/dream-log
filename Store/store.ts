import { configureStore } from '@reduxjs/toolkit';
import  userSlice  from './user';
import logs from './logs';


export const store = configureStore({
  reducer: {
    user: userSlice,
    logs: logs
  }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch