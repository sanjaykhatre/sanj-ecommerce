// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// @ts-ignore
const firebaseConfig = {
  appId: import.meta.env.VITE_APP_APP_ID,
  apiKey: import.meta.env.VITE_APP_API_KEY,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
