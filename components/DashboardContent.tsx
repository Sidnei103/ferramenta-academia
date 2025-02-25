"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, UserCheck, Briefcase, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { app } from "@/lib/firebaseConfig"

const stages = [
  {
    id: "preparacao",
    title: "Preparação",
    icon: Users,
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

export function DashboardContent() {
  const [stageStatus, setStageStatus] = useState<{ [key: string]: "pending" | "in_progress" | "completed" }>({})
  const auth = getAuth(app)

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser
      if (!user) return

      const db = getFirestore(app)
      const progressDoc = await getDoc(doc(db, "hiringProgress", user.uid))
      if (progressDoc.exists()) {
        const progress = progressDoc.data().stages || []
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
    }

    fetchProgress()
  }, [auth.currentUser])

  const getStageStatus = (stageId: string) => {
    return stageStatus[stageId] || "pending"
  }

  const getStatusColor = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-[#cc9000] to-[#ffb400]"
      case "in_progress":
        return "bg-gradient-to-r from-[#ffb400] to-[#ffc333]"
      default:
        return "bg-gray-200"
    }
  }

  const getStatusText = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "in_progress":
        return "Em Andamento"
      default:
        return "Pendente"
    }
  }

  const getStatusIcon = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" />
      case "in_progress":
        return <AlertCircle className="text-yellow-500" />
      default:
        return <XCircle className="text-gray-400" />
    }
  }

  const getProgressPercentage = () => {
    const completedStages = Object.values(stageStatus).filter((status) => status === "completed").length
    return (completedStages / stages.length) * 100
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#111111]">Progresso Geral</h2>
          <span className="text-lg font-semibold text-primary">{getProgressPercentage().toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden p-1">
          <div
            className="h-full rounded-full transition-all duration-500 relative flex items-center justify-center bg-gradient-to-r from-[#ffb400] via-[#ffc333] to-[#cc9000] shadow-inner"
            style={{
              width: `${getProgressPercentage()}%`,
            }}
          >
            <span className="text-white text-sm font-medium drop-shadow-md">{getProgressPercentage().toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#111111] mb-6">Fluxo do Processo</h2>
        <div className="flex flex-wrap justify-between items-center">
          {stages.map((stage, index) => (
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
              {index < stages.length - 1 && (
                <div className="hidden md:block w-16 h-[2px] bg-gradient-to-r from-[#ffc33333] to-[#cc900033] mx-4"></div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#ffb400]/10 transition-all duration-300"
          >
            <div className="p-6">
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getStageStatus(stage.id) === "completed"
                      ? "bg-gradient-to-r from-[#cc9000] to-[#ffb400] text-white"
                      : getStageStatus(stage.id) === "in_progress"
                        ? "bg-gradient-to-r from-[#ffb400] to-[#ffc333] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

