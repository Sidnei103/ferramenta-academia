import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyBWxC2TQ6VlPyC4HbMbhC9P_pc8nK57Soo",
  authDomain: "contrata---academia-de-metas.firebaseapp.com",
  projectId: "contrata---academia-de-metas",
  storageBucket: "contrata---academia-de-metas.firebasestorage.app",
  messagingSenderId: "356860262372",
  appId: "1:356860262372:web:74a110f146a7b9df92b9f1",
  measurementId: "G-DWMRGCPCX7",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Initialize Analytics only on client side
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

export { app, db, auth, analytics }

