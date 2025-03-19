"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clipboard, Users, Megaphone, FileText, ChevronRight, ChevronLeft, Copy, Info, Check } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

// Define the tasks for the planning stage
const planningTasks = [
  {
    id: "defineProfile",
    title: "Definir características do vendedor ideal",
    icon: Users,
    tooltip:
      "Liste as principais competências e habilidades que o vendedor precisa ter, como experiência em vendas, comunicação persuasiva e organização.",
    example: `Procuramos um vendedor com:

• Ótima comunicação e capacidade de persuasão.
• Experiência mínima de 1 ano em vendas consultivas.
• Habilidade de lidar com metas e pressão.
• Organização e disciplina para gerenciar pipeline de vendas.`,
  },
  {
    id: "createPitch",
    title: "Elaborar pitch atrativo para candidatos",
    icon: Megaphone,
    tooltip:
      "O pitch é a apresentação inicial da vaga. Ele deve ser curto, impactante e despertar interesse no candidato.",
    example: `🚀 Junte-se ao nosso time! Se você gosta de desafios, tem experiência em vendas e quer crescer profissionalmente, temos uma oportunidade incrível para você. Oferecemos um ambiente dinâmico, incentivos agressivos e um time pronto para te ajudar a alcançar o sucesso!`,
  },
  {
    id: "describeJob",
    title: "Redigir descrição detalhada da vaga",
    icon: FileText,
    tooltip:
      "A descrição da vaga deve conter responsabilidades, requisitos, benefícios e diferenciais para atrair os candidatos certos.",
    example: `Estamos contratando um vendedor para nossa equipe! Responsabilidades incluem:

• Prospecção de novos clientes e fechamento de vendas.
• Gestão do pipeline no CRM e follow-up de oportunidades.
• Alcançar metas mensais e contribuir para o crescimento da empresa.`,
  },
  {
    id: "chooseChannels",
    title: "Selecionar canais para divulgação da vaga",
    icon: Clipboard,
    tooltip:
      "Escolha os melhores canais para divulgar a vaga, como LinkedIn, WhatsApp, sites de emprego ou indicações internas.",
    example: `Os melhores canais para divulgar essa vaga são:

• LinkedIn (Postagem e grupos de networking).
• WhatsApp (Divulgação em comunidades e contatos diretos).
• Portais de vagas (Infojobs, Gupy, Indeed).
• Indicações internas (Bônus para funcionários que trouxerem candidatos qualificados).`,
  },
]

export default function HiringPlanning() {
  const [tasks, setTasks] = useState(() => Object.fromEntries(planningTasks.map((task) => [task.id, false])))
  const [jobDescription, setJobDescription] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    const savedData = localStorage.getItem('hiringPlanning')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setTasks(parsedData.tasks)
      setJobDescription(parsedData.jobDescription)
    } else {
      localStorage.setItem('hiringPlanning', JSON.stringify({ tasks, jobDescription }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hiringPlanning', JSON.stringify({ tasks, jobDescription }))
    updateOverallProgress()
  }, [tasks, jobDescription])

  const updateOverallProgress = () => {
    const completedTasks = Object.values(tasks).filter(Boolean).length
    const isStageCompleted = completedTasks === planningTasks.length
    
    const savedProgress = localStorage.getItem('hiringProgress')
    let stages = []
    
    if (savedProgress) {
      stages = JSON.parse(savedProgress).stages || []
    }
    
    if (isStageCompleted && !stages.includes("planning")) {
      stages.push("planning")
    } else if (!isStageCompleted && stages.includes("planning")) {
      stages = stages.filter(stage => stage !== "planning")
    }
    
    localStorage.setItem('hiringProgress', JSON.stringify({ stages }))
  }

  const [copiedExamples, setCopiedExamples] = useState<{ [key: string]: boolean }>({})

  const handleTaskToggle = (taskId: string) => {
    setTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const isAllTasksCompleted = Object.values(tasks).every(Boolean)

  const getProgressPercentage = () => {
    const completedTasks = Object.values(tasks).filter(Boolean).length
    return (completedTasks / planningTasks.length) * 100
  }

  const handleCopyJobDescription = () => {
    navigator.clipboard.writeText(jobDescription)
    toast({
      title: "Descrição copiada!",
      description: "A descrição da vaga foi copiada para a área de transferência.",
    })
  }

  const handleCopyExample = (taskId: string, example: string) => {
    navigator.clipboard.writeText(example)
    setCopiedExamples((prev) => ({ ...prev, [taskId]: true }))
    toast({
      title: "Exemplo copiado!",
      description: "O texto foi copiado para a área de transferência.",
    })

    // Reset the button state after 3 seconds
    setTimeout(() => {
      setCopiedExamples((prev) => ({ ...prev, [taskId]: false }))
    }, 3000)
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Planejamento da Contratação</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Prepare-se para encontrar o vendedor ideal para sua equipe
                  </p>
                </div>
              </div>
              <Link href="/" className="inline-flex items-center text-[#ffb400] hover:text-[#cc9000] mb-6">
                <ChevronLeft size={20} />
                <span className="ml-2">Voltar ao Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#111111]">Progresso do Planejamento</h2>
              <span className="text-lg font-semibold text-primary">{getProgressPercentage().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden p-1">
              <div
                className="h-full rounded-full transition-all duration-500 relative flex items-center justify-center bg-gradient-to-r from-[#ffb400] via-[#ffc333] to-[#cc9000] shadow-inner"
                style={{
                  width: `${getProgressPercentage()}%`,
                }}
              >
                <span className="text-white text-sm font-medium drop-shadow-md">
                  {getProgressPercentage().toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {planningTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:shadow-[#ffb400]/10 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
                  <task.icon className="mr-2 text-primary" /> {task.title}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={16} className="ml-2 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{task.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </h2>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={task.id}
                      checked={tasks[task.id]}
                      onChange={() => handleTaskToggle(task.id)}
                      className="mr-2 form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                    />
                    <label
                      htmlFor={task.id}
                      className={`text-gray-700 ${tasks[task.id] ? "text-primary font-medium" : ""}`}
                    >
                      {task.title}
                    </label>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="px-3 py-1 text-sm bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white rounded-lg hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20">
                        Ver Exemplo
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{task.title}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 whitespace-pre-wrap">{task.example}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => handleCopyExample(task.id, task.example)}
                          className={`transition-all duration-300 ${
                            copiedExamples[task.id]
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-primary hover:bg-primary-dark"
                          } text-white`}
                          disabled={copiedExamples[task.id]}
                        >
                          {copiedExamples[task.id] ? (
                            <>
                              <Check className="mr-2 h-4 w-4" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" /> Copiar Exemplo
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <FileText className="mr-2 text-primary" /> Descrição da Vaga
              <Tooltip>
                <TooltipTrigger>
                  <Info size={16} className="ml-2 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Aqui está um modelo inicial de descrição. Edite conforme necessário para atender à realidade da sua
                    empresa.
                  </p>
                </TooltipContent>
              </Tooltip>
            </h2>
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary pr-10"
                rows={4}
              />
              <button
                onClick={handleCopyJobDescription}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-primary transition duration-300"
                title="Copiar Modelo"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          {/* Botão de Finalizar */}
          <button
            onClick={() => {
              localStorage.setItem('hiringPlanning', JSON.stringify({ tasks, jobDescription }))
              toast({
                title: "Planejamento finalizado!",
                description: "Seus dados foram salvos localmente."
              })
            }}
            className="w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
            bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400] shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20"
          >
            Finalizar
            <Check className="ml-2" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  )
}

