import { Firestore } from 'firebase/firestore'
import {createContext} from 'react'

export const storeContext = createContext<Firestore | null >(null)