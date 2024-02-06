import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Log } from '../types';



const initialState: Log[] = [];

const logs = createSlice({
  name: 'logs',
  initialState,
  reducers:{
    //add the new logs to the existing logs
    updateLogs: (state, action: PayloadAction<Log[]>)=>[...state, ...action.payload],
    //replace the old logs with the new logs (refresh)
    resetLogs: (state, action: PayloadAction<Log[]>)=> action.payload,
    deleteLog: (state, action:PayloadAction<string>)=>state.filter((x)=>x.id!== action.payload),
    editLog: (state, action: PayloadAction<Log>) => state.map((x)=>{
      if(x.id === action.payload.id) return action.payload;
      return x
    })
  }
})

export const {updateLogs, resetLogs, deleteLog, editLog} = logs.actions;
export default logs.reducer;
