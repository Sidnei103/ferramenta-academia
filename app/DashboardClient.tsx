"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Users,
  UserCheck,
  Briefcase,
  ChevronRight,
  LogOut,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAuth } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { app } from "@/lib/firebaseConfig"
import { logoutUser } from "@/lib/firebaseAuth"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient()

const stages = [
  {
    id: "preparacao",
    title: "Preparação",
    icon: FileText,
    link: "/preparacao",
    description: "Defina o perfil ideal e prepare a estratégia de divulgação",
  },
  {
    id: "interviews",
    title: "Entrevistas",
    icon: UserCheck,
    link: "/hiring-interview",
    description: "Conduza entrevistas e avalie os candidatos",
  },
  {
    id: "closing",
    title: "Fechamento",
    icon: Briefcase,
    link: "/hiring-closing",
    description: "Tome a decisão final e finalize o processo seletivo",
  },
  {
    id: "candidatos",
    title: "Candidatos",
    icon: Users,
    link: "/candidatos",
    description: "Gerencie e acompanhe os candidatos no processo seletivo",
  },
]

function Dashboard() {
  const [stageStatus, setStageStatus] = useState<{ [key: string]: "pending" | "in_progress" | "completed" }>({})
  const router = useRouter()
  const auth = getAuth(app)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: progress,
    isLoading,
    error,
  } = useQuery("hiringProgress", fetchProgress, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  async function fetchProgress() {
    const user = auth.currentUser
    if (!user) {
      router.push("/login")
      return null
    }

    const db = getFirestore(app)
    const progressDoc = await getDoc(doc(db, "hiringProgress", user.uid))
    return progressDoc.exists() ? progressDoc.data().stages : []
  }

  useEffect(() => {
    if (progress) {
      const newStatus: { [key: string]: "pending" | "in_progress" | "completed" } = {}

      stages.forEach((stage) => {
        if (progress.includes(stage.id)) {
          newStatus[stage.id] = "completed"
        } else if (Object.values(newStatus).some((status) => status === "completed")) {
          newStatus[stage.id] = "in_progress"
        } else {
          newStatus[stage.id] = "pending"
        }
      })

      setStageStatus(newStatus)
    }
  }, [progress])

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser()
      router.push("/login") // Changed from "/auth/login" to "/login"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar fazer logout. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  const getStageStatus = useCallback(
    (stageId: string) => {
      return stageStatus[stageId] || "pending"
    },
    [stageStatus],
  )

  const getStatusColor = useCallback((status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-[#cc9000] to-[#ffb400]"
      case "in_progress":
        return "bg-gradient-to-r from-[#ffb400] to-[#ffc333]"
      default:
        return "bg-gray-200"
    }
  }, [])

  const getStatusTextColor = useCallback((status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-[#cc9000] to-[#ffb400] text-white"
      case "in_progress":
        return "bg-gradient-to-r from-[#ffb400] to-[#ffc333] text-white"
      default:
        return "bg-gray-200 text-gray-600"
    }
  }, [])

  const getStatusText = useCallback((status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "in_progress":
        return "Em Andamento"
      default:
        return "Pendente"
    }
  }, [])

  const getStatusIcon = useCallback((status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" />
      case "in_progress":
        return <AlertCircle className="text-yellow-500" />
      default:
        return <XCircle className="text-gray-400" />
    }
  }, [])

  const memoizedStages = useMemo(() => stages, [])

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar dados</div>

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
                  <h1 className="text-2xl sm:text-3xl font-bold">Dashboard de Contratação</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Gerencie todo o processo de contratação de vendedores
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-white">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Process Flow */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#111111] mb-6">Fluxo do Processo</h2>
            <div className="flex flex-wrap justify-between items-center">
              {memoizedStages.map((stage, index) => (
                <Link key={stage.id} href={stage.link} className="group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 
                      ${getStatusColor(getStageStatus(stage.id))} 
                      transform group-hover:scale-105 group-hover:shadow-lg
                      group-hover:shadow-[#ffb400]/20`}
                    >
                      <stage.icon className="text-white drop-shadow-md" size={24} />
                    </div>
                    <span className="text-sm font-medium mt-2 text-center text-[#111111]">{stage.title}</span>
                  </div>
                  {index < memoizedStages.length - 1 && (
                    <div className="hidden md:block w-16 h-[2px] bg-gradient-to-r from-[#ffc33333] to-[#cc900033] mx-4"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {memoizedStages.map((stage) => (
              <Card
                key={stage.id}
                className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#ffb400]/10 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <stage.icon
                        className={`mr-3 ${
                          getStageStatus(stage.id) === "completed"
                            ? "text-[#cc9000]"
                            : getStageStatus(stage.id) === "in_progress"
                              ? "text-[#ffb400]"
                              : "text-gray-400"
                        }`}
                        size={24}
                      />
                      <h3 className="text-lg font-semibold text-[#111111]">{stage.title}</h3>
                    </div>
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusTextColor(
                        getStageStatus(stage.id),
                      )}`}
                    >
                      {getStatusText(getStageStatus(stage.id))}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4">{stage.description}</p>

                  <div className="flex items-center justify-between">
                    <Link
                      href={stage.link}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white rounded-lg 
                      hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg
                      hover:shadow-[#ffb400]/20 group-hover:scale-105"
                    >
                      Acessar
                      <ChevronRight className="ml-2" size={16} />
                    </Link>
                    {getStatusIcon(getStageStatus(stage.id))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default function DashboardWithQueryClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}