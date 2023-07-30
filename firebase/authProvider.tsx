import {createContext, ReactNode, useEffect, useRef, useState} from 'react'
import {Auth, getAuth, onAuthStateChanged, User} from 'firebase/auth'
import fb from '../firebaseConfig'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

// type Props = {
//   children: ReactNode

// }
// export const AuthContext = createContext<User | null>(null)

// const AuthProvider = ({children}:Props)=>{
//   const [user, setUser] = useState<User | null>(null)
//   const auth = useRef<Auth>(getAuth(fb))
//   useEffect(()=>{
//     const unsub = onAuthStateChanged(auth.current, (loggedUser)=>{
//       if(loggedUser){
//         //a user has been singed in!
//         setUser(loggedUser)
//       }
//       else{
//         //the user has been singed out!
//         setUser(null);
//       }
//     })
//   })
//   return (
//     <AuthContext.Provider value = {user}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
