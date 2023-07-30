import {initializeApp} from 'firebase/app'
import {createContext} from 'react';
import{User} from 'firebase/auth'
import {Firestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCR6I388rems0vA5UYxe6_n-7moGuzgmrs",
  authDomain: "dream-log-dbac3.firebaseapp.com",
  projectId: "dream-log-dbac3",
  storageBucket: "dream-log-dbac3.appspot.com",
  messagingSenderId: "106650851008",
  appId: "1:106650851008:web:85b9cdbe13314da7273f25"
};

export const fb = initializeApp(firebaseConfig);



