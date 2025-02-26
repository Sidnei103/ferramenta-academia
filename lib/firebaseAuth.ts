import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "./firebaseConfig"

// Add retry logic for auth operations
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const withRetry = async (operation: () => Promise<any>, retries = MAX_RETRIES) => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await wait(RETRY_DELAY)
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await withRetry(() => signInWithEmailAndPassword(auth, email, password))

    // Após login bem-sucedido, obter o token
    const token = await result.user.getIdToken()
    console.log("Token obtido com sucesso")

    // Configurar o cookie de sessão
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("Falha ao configurar sessão")
      }

      console.log("Cookie de sessão configurado com sucesso")
    } catch (error) {
      console.error("Erro ao configurar sessão:", error)
      throw error
    }

    return result
  } catch (error) {
    console.error("Erro no login:", error)
    throw error
  }
}

export const createUserWithEmail = async (email: string, password: string) => {
  return withRetry(() => createUserWithEmailAndPassword(auth, email, password))
}

export const logoutUser = async () => {
  return withRetry(() => signOut(auth))
}

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Enhanced auth state listener with error handling and reconnection logic
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  let unsubscribe: (() => void) | null = null
  let retryCount = 0
  const MAX_AUTH_RETRIES = 5

  const setupAuthListener = () => {
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          retryCount = 0 // Reset retry count on successful connection
          callback(user)
        },
        (error) => {
          console.error("Auth state change error:", error)
          retryAuthListener()
        },
      )
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      retryAuthListener()
    }
  }

  const retryAuthListener = async () => {
    if (retryCount < MAX_AUTH_RETRIES) {
      retryCount++
      console.log(`Retrying auth listener (attempt ${retryCount})...`)
      await wait(RETRY_DELAY * retryCount)
      if (unsubscribe) {
        unsubscribe()
      }
      setupAuthListener()
    } else {
      console.error("Max auth listener retries reached")
      callback(null) // Force logout after max retries
    }
  }

  setupAuthListener()

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe()
    }
  }
}

// Add periodic token refresh
const REFRESH_INTERVAL = 10 * 60 * 1000 // 10 minutes

export const startTokenRefresh = () => {
  const refreshToken = async () => {
    const user = auth.currentUser
    if (user) {
      try {
        await user.getIdToken(true)
        console.log("Token refreshed successfully")
      } catch (error) {
        console.error("Error refreshing token:", error)
      }
    }
  }

  // Initial refresh
  refreshToken()

  // Set up interval for periodic refresh
  const intervalId = setInterval(refreshToken, REFRESH_INTERVAL)

  // Return cleanup function
  return () => clearInterval(intervalId)
}

export { auth }

