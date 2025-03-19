"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Mail, Check, X, AlertCircle, Copy } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection, onSnapshot } from "firebase/firestore"
import { app } from "@/lib/firebaseConfig"
import { getAuth } from "firebase/auth"

type CandidateStatus = "approved" | "rejected" | "pending"

export default function HiringClosing() {
  const [candidateStatus, setCandidateStatus] = useState<CandidateStatus>("pending")
  const [rejectionFeedback, setRejectionFeedback] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [offerLetter, setOfferLetter] = useState("")
  const [rejectionEmail, setRejectionEmail] = useState("")
  const [originalData, setOriginalData] = useState({})
  const [hasChanges, setHasChanges] = useState(false)
  const [tempData, setTempData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const editId = searchParams.get("edit")
  const auth = getAuth(app)

  useEffect(() => {
    const tempDataString = localStorage.getItem("tempCandidateData")
    if (tempDataString) {
      setTempData(JSON.parse(tempDataString))
    }

    if (editId) {
      setIsEditing(true)
      fetchCandidateData(editId)
    }
  }, [editId])

  const fetchCandidateData = async (id: string) => {
    const db = getFirestore(app)
    const candidateDoc = await getDoc(doc(db, "candidatos", id))
    if (candidateDoc.exists()) {
      const data = candidateDoc.data()
      setCandidateStatus(data.status as CandidateStatus)
      setRejectionFeedback(data.rejectionFeedback || "")
      setInternalNotes(data.internalNotes || "")
      setOfferLetter(data.offerLetter || "")
      setRejectionEmail(data.rejectionEmail || "")
      setOriginalData(data)
    }
  }

  useEffect(() => {
    const isDataChanged =
      JSON.stringify(originalData) !==
      JSON.stringify({
        status: candidateStatus,
        rejectionFeedback,
        internalNotes,
        offerLetter,
        rejectionEmail,
      })
    setHasChanges(isDataChanged)
  }, [candidateStatus, rejectionFeedback, internalNotes, offerLetter, rejectionEmail, originalData])

  const handleSave = async () => {
    const db = getFirestore(app)
    const user = auth.currentUser

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar um candidato.",
        variant: "destructive",
      })
      return
    }

    try {
      const candidateData = {
        ...tempData,
        status: candidateStatus,
        rejectionFeedback,
        internalNotes,
        offerLetter,
        rejectionEmail,
        updatedAt: new Date(),
        recrutadorEmail: user.email, // Importante: adicionar o email do recrutador
        createdAt: isEditing ? tempData.createdAt : new Date(), // Mantém a data original se estiver editando
      }

      let docRef
      if (isEditing && editId) {
        docRef = doc(db, "candidatos", editId)
        await updateDoc(docRef, candidateData)
      } else {
        docRef = await addDoc(collection(db, "candidatos"), candidateData)
      }

      // Limpar dados temporários
      localStorage.removeItem("tempCandidateData")

      toast({
        title: "✅ Candidato salvo com sucesso!",
        description: "Todas as informações foram atualizadas.",
      })

      // Configurar listener em tempo real para o documento específico
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          // Dados foram atualizados com sucesso
          router.push("/candidatos")
        }
      })

      // Limpar o listener após alguns segundos
      setTimeout(() => {
        unsubscribe()
      }, 5000)
    } catch (error) {
      console.error("Erro ao salvar candidato:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar as alterações.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = (status: CandidateStatus) => {
    setCandidateStatus(status)
    if (status === "approved") {
      generateOfferLetter()
    } else if (status === "rejected") {
      generateRejectionEmail()
    }
  }

  const generateOfferLetter = () => {
    const template = `Assunto: Parabéns! Sua Aprovação na [Nome da Empresa]

Olá [Nome do Candidato],

Temos o prazer de informar que você foi aprovado no nosso processo seletivo para a vaga de [Nome do Cargo]!

Segue anexo sua proposta formal com todas as condições detalhadas. Por favor, nos envie uma confirmação até [data].

Ficamos felizes em contar com você no time!

Atenciosamente,
[Seu Nome] | [Nome da Empresa]`

    setOfferLetter(template)
  }

  const generateRejectionEmail = () => {
    const template = `Assunto: Atualização sobre seu Processo Seletivo

Olá [Nome do Candidato],

Agradecemos muito o seu interesse em fazer parte da [Nome da Empresa]. Após avaliarmos cuidadosamente todos os candidatos, infelizmente, seguimos com um perfil mais alinhado para essa vaga no momento.

Gostamos muito da sua experiência e manteremos seu contato para futuras oportunidades!

Obrigado por seu tempo e dedicação.

Atenciosamente,
[Seu Nome] | [Nome da Empresa]`

    setRejectionEmail(template)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Conteúdo copiado!",
      description: "O texto foi copiado para a área de transferência.",
    })
  }

  const getStatusBadge = () => {
    switch (candidateStatus) {
      case "approved":
        return <Badge variant="success">Aprovado</Badge>
      case "rejected":
        return <Badge variant="destructive">Reprovado</Badge>
      case "pending":
        return <Badge variant="warning">Em Análise</Badge>
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f6f6f6]">
        {/* Header Section */}
        <div className="bg-[#111111] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <Image
                  src="https://milpbjndlfca1za8.public.blob.vercel-storage.com/Color%20logo%20-%20no%20background-W7t8Eqy88pEfPSuzo9fwAUzf7QvKCd.png"
                  alt="Academia de Metas Logo"
                  width={200}
                  height={50}
                  className="mr-4"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Fechamento</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Tome a decisão final sobre o candidato e finalize o processo seletivo
                  </p>
                </div>
              </div>
              <Link href="/" className="inline-flex items-center text-primary hover:text-primary-dark">
                <ChevronLeft size={20} />
                <span className="ml-2">Voltar ao Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Candidate Status Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              Status do Candidato {getStatusBadge()}
            </h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button
                onClick={() => handleStatusChange("approved")}
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2
      ${
        candidateStatus === "approved"
          ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
          : "bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400]"
      }`}
              >
                <Check className="h-5 w-5" /> Aprovado
              </Button>
              <Button
                onClick={() => handleStatusChange("rejected")}
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2
      ${
        candidateStatus === "rejected"
          ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
          : "bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400]"
      }`}
              >
                <X className="h-5 w-5" /> Reprovado
              </Button>
              <Button
                onClick={() => handleStatusChange("pending")}
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2
      ${
        candidateStatus === "pending"
          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
          : "bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400]"
      }`}
              >
                <AlertCircle className="h-5 w-5" /> Em Análise
              </Button>
            </div>

            {candidateStatus === "rejected" && (
              <div className="mb-4">
                <label htmlFor="rejectionFeedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Reprovação (Obrigatório)
                </label>
                <Textarea
                  id="rejectionFeedback"
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  placeholder="Digite o motivo da reprovação..."
                  rows={3}
                  className="w-full mt-1"
                  required
                />
              </div>
            )}

            {candidateStatus === "pending" && (
              <div className="mb-4">
                <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas (Opcional)
                </label>
                <Textarea
                  id="internalNotes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Digite notas internas sobre o candidato..."
                  rows={3}
                  className="w-full mt-1"
                />
              </div>
            )}
          </section>

          {/* Offer Letter Section */}
          {candidateStatus === "approved" && (
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
                <Mail className="mr-2 text-primary" /> Carta Oferta
              </h2>
              <Textarea
                value={offerLetter}
                onChange={(e) => setOfferLetter(e.target.value)}
                rows={10}
                className="w-full mb-4"
              />
              <Button
                onClick={() => copyToClipboard(offerLetter)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar Conteúdo
              </Button>
            </section>
          )}

          {/* Rejection Email Section */}
          {candidateStatus === "rejected" && (
            <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
                <Mail className="mr-2 text-primary" /> E-mail de Feedback
              </h2>
              <Textarea
                value={rejectionEmail}
                onChange={(e) => setRejectionEmail(e.target.value)}
                rows={10}
                className="w-full mb-4"
              />
              <Button
                onClick={() => copyToClipboard(rejectionEmail)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar Conteúdo
              </Button>
            </section>
          )}

          {/* Next Stage Button */}

          {/* Botão de Salvar */}
          <Button
            onClick={handleSave}
            className="w-full mt-4 font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
          bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400] shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20"
          >
            {isEditing ? "Salvar Alterações" : "Finalizar e Salvar Candidato"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

