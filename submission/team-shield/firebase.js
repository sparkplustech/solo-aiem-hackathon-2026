import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwZoz54EBaml7wvX3dSKIktvtYUfb_I5I",
  authDomain: "mental-45586.firebaseapp.com",
  projectId: "mental-45586",
  storageBucket: "mental-45586.firebasestorage.app",
  messagingSenderId: "781879177122",
  appId: "1:781879177122:web:5b23cfe887790d0d34ccfb"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const firestore = getFirestore(app);

export { app, auth, firestore };
