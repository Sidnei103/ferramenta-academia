import { initializeApp, getApps } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBWxC2TQ6VlPyC4HbMbhC9P_pc8nK57Soo",
  authDomain: "contrata---academia-de-metas.firebaseapp.com",
  projectId: "contrata---academia-de-metas",
  storageBucket: "contrata---academia-de-metas.firebasestorage.app",
  messagingSenderId: "356860262372",
  appId: "1:356860262372:web:74a110f146a7b9df92b9f1",
  measurementId: "G-DWMRGCPCX7",
}

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence enabled")
  })
  .catch((error) => {
    console.error("Error enabling auth persistence:", error)
  })

// Enable offline persistence for Firestore
try {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence enabled")
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.log("Multiple tabs open, persistence enabled in another tab")
      } else if (err.code === "unimplemented") {
        // The current browser doesn't support persistence
        console.log("Browser doesn't support persistence")
      }
    })
} catch (err) {
  console.error("Error enabling Firestore persistence:", err)
}

export { app, auth, db }
