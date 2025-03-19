import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from "firebase/firestore"
import { db } from "./firebaseConfig"

const candidatosCollection = collection(db, "candidatos")

// Função para adicionar um candidato
export const adicionarCandidato = async (candidato: any) => {
  try {
    const docRef = await addDoc(candidatosCollection, candidato)
    return docRef.id
  } catch (error) {
    console.error("Erro ao adicionar candidato:", error)
    throw error
  }
}

// Função para obter todos os candidatos
export const obterCandidatos = async () => {
  try {
    const querySnapshot = await getDocs(candidatosCollection)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error)
    throw error
  }
}

// Função para atualizar um candidato
export const atualizarCandidato = async (id: string, dadosAtualizados: any) => {
  try {
    const candidatoRef = doc(db, "candidatos", id)
    await updateDoc(candidatoRef, dadosAtualizados)
  } catch (error) {
    console.error("Erro ao atualizar candidato:", error)
    throw error
  }
}

// Função para deletar um candidato
export const deletarCandidato = async (id: string) => {
  try {
    const candidatoRef = doc(db, "candidatos", id)
    await deleteDoc(candidatoRef)
  } catch (error) {
    console.error("Erro ao deletar candidato:", error)
    throw error
  }
}

// Função para obter um candidato específico
export const obterCandidato = async (id: string) => {
  try {
    const candidatoRef = doc(db, "candidatos", id)
    const docSnap = await getDoc(candidatoRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error("Erro ao obter candidato:", error)
    throw error
  }
}

// Função para obter candidatos por recrutador
export const obterCandidatosPorRecrutador = async (recrutadorEmail: string) => {
  try {
    const q = query(candidatosCollection, where("recrutadorEmail", "==", recrutadorEmail))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Erro ao buscar candidatos do recrutador:", error)
    throw error
  }
}

