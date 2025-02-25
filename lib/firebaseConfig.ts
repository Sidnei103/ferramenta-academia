import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBWxC2TQ6VlPyC4HbMbhC9P_pc8nK57Soo",
  authDomain: "contrata---academia-de-metas.firebaseapp.com",
  projectId: "contrata---academia-de-metas",
  storageBucket: "contrata---academia-de-metas.firebasestorage.app",
  messagingSenderId: "356860262372",
  appId: "1:356860262372:web:74a110f146a7b9df92b9f1",
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }

