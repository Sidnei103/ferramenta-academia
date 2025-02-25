import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "./firebaseConfig"

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log("Usuário logado:", result.user)
    return result.user
  } catch (error) {
    console.error("Erro no login com Google:", error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error("Erro ao fazer login com e-mail e senha:", error)
    throw error
  }
}

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error("Erro ao criar usuário com e-mail e senha:", error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
    throw error
  }
}

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Função para observar mudanças no estado de autenticação
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export { auth }

