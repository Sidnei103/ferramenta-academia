"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  MoreVertical,
  Edit2,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { app } from "@/lib/firebaseConfig"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StorageService } from "@/services/storage"
import { FixedSizeList } from 'react-window'

type Candidato = {
  id: string
  nome: string
  email: string
  telefone: string
  status: "Aprovado" | "Em Análise" | "Reprovado" | "pending"
  data_entrevista?: { seconds: number; nanoseconds: number } | string
  perguntas_anotacoes?: {
    q1?: string
    q2?: string
    q3?: string
    q4?: string
    q5?: string
    [key: string]: string | undefined
  }
  candidato_anotacoes?: string
  notas_internas?: string
  role_play_realizado?: string
  role_play_feedback?: string
  createdAt?: { seconds: number; nanoseconds: number }
  updatedAt?: { seconds: number; nanoseconds: number }
}

// Adicione esta função de utilidade no início do arquivo, fora do componente principal
function summarizeAnswers(perguntas_anotacoes: Record<string, string> | undefined): string {
  if (!perguntas_anotacoes) return "Nenhuma resposta registrada."

  const respostas = Object.entries(perguntas_anotacoes)
    .filter(
      ([key, value]) =>
        (key.startsWith("q") || key.startsWith("custom_") || key.length > 20) && value && value.trim() !== "",
    )
    .map(([_, value]) => value)

  if (respostas.length === 0) return "Nenhuma resposta registrada."

  const todasRespostas = respostas.join(" ")
  const resumo = todasRespostas.length > 200 ? todasRespostas.substring(0, 197) + "..." : todasRespostas

  return resumo
}

// Modifique a função formatTimestamp para usar o campo createdAt
const formatTimestamp = (timestamp: Candidato["createdAt"]) => {
  if (!timestamp) return "Não registrada"
  if ("seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  return "Não registrada"
}

export default function Candidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [busca, setBusca] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const router = useRouter()
  const auth = getAuth(app)
  const { toast } = useToast()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    setError(null)

    const db = getFirestore(app)

    // Query para buscar candidatos do recrutador atual
    const candidatosRef = collection(db, "candidatos")
    const q = query(candidatosRef, where("recrutadorEmail", "==", user.email))

    // Configurar listener em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newCandidatos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Candidato[]

        // Ordenar por data de atualização (mais recente primeiro)
        newCandidatos.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt.seconds * 1000) : new Date(0)
          const dateB = b.updatedAt ? new Date(b.updatedAt.seconds * 1000) : new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        setCandidatos(newCandidatos)
        setIsLoading(false)
      },
      (error) => {
        console.error("Erro ao carregar candidatos:", error)
        setError("Erro ao carregar candidatos. Por favor, tente novamente.")
        setIsLoading(false)
      },
    )

    // Limpar listener quando o componente for desmontado
    return () => unsubscribe()
  }, [router, auth])

  // Rest of the component remains the same...
  // (keeping all existing functions and JSX)

  const handleEditCandidate = (id: string) => {
    router.push(`/hiring-interview?edit=${id}`)
  }

  const candidatosFiltrados = candidatos.filter(
    (candidato) =>
      candidato.nome.toLowerCase().includes(busca.toLowerCase()) ||
      candidato.status.toLowerCase().includes(busca.toLowerCase()),
  )

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const getStatusIcon = (status: Candidato["status"]) => {
    switch (status) {
      case "Aprovado":
        return <CheckCircle className="text-green-500" />
      case "Reprovado":
        return <XCircle className="text-red-500" />
      default:
        return <AlertCircle className="text-yellow-500" />
    }
  }

  const formatData = (data: any) => {
    if (!data) return "Não disponível"
    if (typeof data === "string") return data
    if (Array.isArray(data)) return data.join(", ")
    if (typeof data === "object" && !Array.isArray(data)) {
      // Handle perguntas_anotacoes object format
      if (Object.keys(data).some((key) => key.startsWith("q"))) {
        return Object.entries(data)
          .filter(([key]) => key.startsWith("q"))
          .map(([key, value]) => value)
          .join(", ")
      }
      return Object.values(data).join(", ")
    }
    return "Formato inválido"
  }

  const handleDeleteCandidate = async (id: string) => {
    try {
      const db = getFirestore(app)
      await deleteDoc(doc(db, "candidatos", id))
      setCandidatos(candidatos.filter((candidato) => candidato.id !== id))
      toast({
        title: "Candidato excluído",
        description: "O candidato foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir candidato:", error)
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir o candidato.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Meus Candidatos</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Gerencie e acompanhe seus candidatos no processo seletivo
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
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar candidato por nome ou status..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Candidates List */}
          {candidatosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum candidato encontrado.</p>
          ) : (
            <FixedSizeList
              height={500}
              width="100%"
              itemCount={candidatosFiltrados.length}
              itemSize={80}
            >
              {({ index, style }) => (
                <div style={style}>
                  <Card key={candidatosFiltrados[index].id} className="hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center px-6 pt-6">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(candidatosFiltrados[index].id)}>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{candidatosFiltrados[index].nome}</span>
                          <Badge className="ml-2">{candidatosFiltrados[index].status}</Badge>
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                const confirmed = window.confirm("Tem certeza que deseja excluir este candidato?")
                                if (confirmed) {
                                  handleDeleteCandidate(candidatosFiltrados[index].id)
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir candidato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="cursor-pointer" onClick={() => toggleExpand(candidatosFiltrados[index].id)}>
                          {expandedCard === candidatosFiltrados[index].id ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          <span>{candidatosFiltrados[index].email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                          <span>{candidatosFiltrados[index].telefone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Data da Entrevista: {formatTimestamp(candidatosFiltrados[index].createdAt)}</span>
                        </div>
                      </div>

                      {expandedCard === candidatosFiltrados[index].id && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-2">📋 Anotações sobre o candidato:</h4>
                            <p className="text-gray-700">{formatData(candidatosFiltrados[index].candidato_anotacoes)}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg mb-2">❓ Resumo das respostas:</h4>
                            <p className="text-gray-700">{summarizeAnswers(candidatosFiltrados[index].perguntas_anotacoes)}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg mb-2">🔍 Detalhes das respostas:</h4>
                            {candidatosFiltrados[index].perguntas_anotacoes ? (
                              <div className="space-y-4">
                                {/* Perguntas padrão */}
                                {Object.entries(candidatosFiltrados[index].perguntas_anotacoes)
                                  .filter(([key]) => key.startsWith("q"))
                                  .map(([key, value], index) => (
                                    <div key={key} className="mb-2">
                                      <p className="font-medium">Pergunta padrão {key.replace("q", "")}</p>
                                      <p className="text-gray-700">{value}</p>
                                    </div>
                                  ))}

                                {/* Perguntas personalizadas */}
                                {Object.entries(candidatosFiltrados[index].perguntas_anotacoes)
                                  .filter(([key]) => key.startsWith("custom_") || key.length > 20)
                                  .map(([key, value], index) => (
                                    <div key={key} className="mb-2">
                                      <p className="font-medium">Pergunta personalizada {index + 1}</p>
                                      <p className="text-gray-700">{value}</p>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-gray-700">Nenhuma resposta registrada.</p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg mb-2">🔐 Notas Internas:</h4>
                            <p className="text-gray-700">{formatData(candidatosFiltrados[index].notas_internas)}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg mb-2">🎭 Role Play:</h4>
                            <p className="text-gray-700">
                              <strong>Realizado:</strong> {formatData(candidatosFiltrados[index].role_play_realizado)}
                            </p>
                            {candidatosFiltrados[index].role_play_feedback && (
                              <p className="text-gray-700">
                                <strong>Feedback:</strong> {formatData(candidatosFiltrados[index].role_play_feedback)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </FixedSizeList>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-700">{message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    </div>
  )
}

