import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User, UserInfo } from 'firebase/auth';


// type UserSlice = {
//   uid: string;
//   email: string;
//   displayName: string | null;
//   phoneNumber: string | null;
//   photoURL: string | null;
//   providerId: string;
// }

type UserSlice = UserInfo | null;
const initialState : UserSlice = null as UserSlice;

export const user = createSlice({
  name: 'user',
  initialState,
  reducers:{
    changeUser: (state,action: PayloadAction<UserInfo|null>)=>({...action.payload} as UserSlice)
  }
})

export const {changeUser} = user.actions;
export default user.reducer