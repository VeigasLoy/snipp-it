// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRUGecpDVGN6aDnDKso8RacEpuH_VMGUs",
  authDomain: "snipp-it-83436.firebaseapp.com",
  projectId: "snipp-it-83436",
  storageBucket: "snipp-it-83436.appspot.com",
  messagingSenderId: "433218765015",
  appId: "1:433218765015:web:0a76bf7ef5d948292af092",
  measurementId: "G-G2FNLXEN3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
