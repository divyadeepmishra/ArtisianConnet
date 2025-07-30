import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBQUQIhXLpdgWtFY8_xPtxS5rEFXnqOoSw",
  authDomain: "artisianconnet.firebaseapp.com",
  projectId: "artisianconnet",
  storageBucket: "artisianconnet.firebasestorage.app",
  messagingSenderId: "454441780451",
  appId: "1:454441780451:web:1ce5a981f8d74ef55bb1d6",
  measurementId: "G-FXB0SEJJFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication to be used in other files
// Initialize auth with persistence, telling it to use the storage we installed
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});