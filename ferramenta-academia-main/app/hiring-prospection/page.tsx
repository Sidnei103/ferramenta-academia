"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Megaphone,
  Download,
  FileText,
  ChevronRight,
  ChevronLeft,
  Linkedin,
  MessageSquare,
  Building,
  Users,
  Copy,
  Check,
  Edit2,
  ExternalLink,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Define the channels for job posting
const channels = [
  {
    id: "linkedin",
    title: "LinkedIn",
    icon: Linkedin,
    tip: "Publique no feed e em grupos relevantes. Use hashtags como #vagas #oportunidade #vendas.",
    template:
      "Estamos em busca de um vendedor talentoso para se juntar à nossa equipe! Se você é apaixonado por vendas e busca crescimento profissional, confira esta oportunidade: [LINK_DA_VAGA] #vagas #vendas #oportunidade",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    icon: MessageSquare,
    tip: "Compartilhe em grupos de networking e com contatos relevantes. Mantenha a mensagem curta e direta.",
    template:
      "🚀 Oportunidade de Vendas! Estamos contratando um vendedor dinâmico. Interessado? Saiba mais: [LINK_DA_VAGA]",
  },
  {
    id: "jobPortals",
    title: "Portais de Emprego",
    icon: Building,
    tip: "Use palavras-chave relevantes na descrição da vaga. Destaque os benefícios e oportunidades de crescimento.",
    template:
      "Vendedor(a) - Oportunidade de Crescimento\n\nBuscamos um profissional de vendas para integrar nossa equipe. Oferecemos:\n- Salário competitivo\n- Comissões atrativas\n- Plano de carreira\n\nRequisitos:\n- Experiência em vendas\n- Boa comunicação\n- Proatividade\n\nInteressados, enviar currículo para: [EMAIL]",
  },
  {
    id: "internalReferrals",
    title: "Indicações Internas",
    icon: Users,
    tip: "Incentive os funcionários a indicarem candidatos qualificados. Considere oferecer uma bonificação por indicações bem-sucedidas.",
    template:
      "Caros colegas,\n\nEstamos em busca de um novo vendedor para nossa equipe. Se você conhece alguém qualificado, não hesite em indicar! Lembre-se, indicações bem-sucedidas serão recompensadas.\n\nPerfil desejado:\n- Experiência em vendas\n- Ótima comunicação\n- Proatividade e ambição\n\nPara indicar, envie o currículo do candidato para: [EMAIL_RH]",
  },
]

// Atualize a constante templates com os novos modelos padrão
const templates = [
  {
    id: "linkedinTemplate",
    title: "Template para LinkedIn",
    fileName: "linkedin_template.txt",
    defaultContent: `🚀 Estamos em busca de um Vendedor para se juntar ao nosso time!
🔹 Se você tem experiência em vendas e busca crescimento, essa vaga é para você!
✅ Oferecemos um ambiente dinâmico, treinamentos e um plano de carreira estruturado.
📍 Cadastre-se aqui: [INSERIR LINK DO FORMULÁRIO]
📩 Marque alguém que pode se interessar! #Vagas #Comercial #Vendas`,
  },
  {
    id: "whatsappTemplate",
    title: "Template para WhatsApp",
    fileName: "whatsapp_template.txt",
    defaultContent: `📢 Oportunidade para Vendedor(a)! 🚀
Estamos contratando um profissional de vendas para integrar nosso time!
🔹 Benefícios: Treinamentos, bonificações e crescimento acelerado.
💬 Para mais informações e candidatura, preencha o formulário: [INSERIR LINK]
Ficou interessado ou conhece alguém que pode se encaixar? Mande essa mensagem!`,
  },
  {
    id: "emailTemplate",
    title: "Template para E-mail",
    fileName: "email_template.html",
    defaultContent: `Assunto: 🚀 Vaga Aberta - Estamos Contratando um Vendedor!

Olá [NOME],

Estamos em busca de um vendedor dinâmico e motivado para integrar nossa equipe. Se você tem experiência na área comercial e deseja crescer profissionalmente, essa pode ser sua oportunidade!

✅ O que oferecemos:
• Treinamentos e suporte contínuo.
• Bonificações por desempenho.
• Ambiente de trabalho colaborativo.

📍 Para se candidatar, preencha o formulário: [INSERIR LINK]

Ficamos no aguardo do seu contato!

Atenciosamente,
[SEU NOME]`,
  },
]

interface Question {
  id: number
  question: string
  type: string
  options?: string[]
}

const defaultQuestions: Question[] = [
  { id: 1, question: "Qual é a sua experiência em vendas?", type: "Paragraph" },
  { id: 2, question: "Por que você está interessado nesta posição?", type: "Paragraph" },
  { id: 3, question: "Qual foi sua maior conquista em vendas?", type: "Paragraph" },
]

const questionTypes = ["Short answer", "Paragraph", "Multiple choice", "Checkboxes", "Dropdown"]

export default function HiringProspection() {
  const [selectedChannels, setSelectedChannels] = useState(() => {
    if (typeof window !== "undefined") {
      const savedChannels = localStorage.getItem("hiringProspectionChannels")
      return savedChannels ? JSON.parse(savedChannels) : {}
    }
    return {}
  })

  const [formLink, setFormLink] = useState(() => {
    return ""
  })

  const [isFormLinkValid, setIsFormLinkValid] = useState(false)

  const [isFormGenerated, setIsFormGenerated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hiringProspectionFormGenerated") === "true"
    }
    return false
  })

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editedTemplates, setEditedTemplates] = useState<{ [key: string]: string }>(() => {
    if (typeof window !== "undefined") {
      const savedTemplates = localStorage.getItem("hiringProspectionEditedTemplates")
      return savedTemplates ? JSON.parse(savedTemplates) : {}
    }
    return {}
  })

  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const [editingTemplates, setEditingTemplates] = useState<{ [key: string]: boolean }>({})

  const { toast } = useToast()

  const [formQuestions, setFormQuestions] = useState<Question[]>(defaultQuestions)
  const [newQuestion, setNewQuestion] = useState("")
  const [newQuestionType, setNewQuestionType] = useState("Paragraph")
  const [newQuestionOptions, setNewQuestionOptions] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("hiringProspectionChannels", JSON.stringify(selectedChannels))
    localStorage.setItem("hiringProspectionFormLink", formLink)
    localStorage.setItem("hiringProspectionFormGenerated", isFormGenerated.toString())
    localStorage.setItem("hiringProspectionEditedTemplates", JSON.stringify(editedTemplates))
    updateOverallProgress()
  }, [selectedChannels, formLink, isFormGenerated, editedTemplates])

  useEffect(() => {
    setIsFormLinkValid(validateFormLink(formLink))
  }, [formLink])

  useEffect(() => {
    // Load job description from previous step
    const jobDescription = localStorage.getItem("jobDescription")
    if (jobDescription && Object.keys(editedTemplates).length === 0) {
      generateTemplates(jobDescription)
    }
  }, [editedTemplates])

  // Dentro do componente HiringProspection, atualize o useEffect para carregar os templates padrão
  useEffect(() => {
    // Load job description from previous step
    const jobDescription = localStorage.getItem("jobDescription")
    if (jobDescription && Object.keys(editedTemplates).length === 0) {
      generateTemplates(jobDescription)
    }

    // Carregar templates padrão se não houver templates editados
    if (Object.keys(editedTemplates).length === 0) {
      const defaultTemplates = templates.reduce((acc, template) => {
        acc[template.id] = template.defaultContent
        return acc
      }, {})
      setEditedTemplates(defaultTemplates)
    }
  }, [editedTemplates])

  const updateOverallProgress = () => {
    const isStageCompleted = Object.values(selectedChannels).some(Boolean) && isFormGenerated
    const hiringProgress = JSON.parse(localStorage.getItem("hiringProgress") || "[]")

    if (isStageCompleted && !hiringProgress.includes("prospection")) {
      hiringProgress.push("prospection")
    } else if (!isStageCompleted && hiringProgress.includes("prospection")) {
      const index = hiringProgress.indexOf("prospection")
      hiringProgress.splice(index, 1)
    }

    localStorage.setItem("hiringProgress", JSON.stringify(hiringProgress))
  }

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) => ({ ...prev, [channelId]: !prev[channelId] }))
  }

  const handleCopyTemplate = (templateId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedStates((prev) => ({ ...prev, [templateId]: true }))
    toast({
      title: "Template copiado!",
      description: "O conteúdo foi copiado para a área de transferência.",
    })
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [templateId]: false }))
    }, 3000)
  }

  const handleDownloadTemplate = (fileName: string, content: string) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleGenerateForm = () => {
    const mockFormLink = `https://forms.gle/${Math.random().toString(36).substring(7)}`
    setFormLink(mockFormLink)
    setIsFormGenerated(true)
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim() !== "") {
      const options = newQuestionOptions
        .split(",")
        .map((option) => option.trim())
        .filter((option) => option !== "")
      const newQuestionObj: Question = {
        id: Date.now(),
        question: newQuestion,
        type: newQuestionType,
        options: ["Multiple choice", "Checkboxes", "Dropdown"].includes(newQuestionType) ? options : undefined,
      }
      setFormQuestions([...formQuestions, newQuestionObj])
      setNewQuestion("")
      setNewQuestionType("Paragraph")
      setNewQuestionOptions("")
    }
  }

  const handleRemoveQuestion = (id: number) => {
    setFormQuestions(formQuestions.filter((q) => q.id !== id))
  }

  const handleEditQuestion = (id: number, newQuestion: string) => {
    setFormQuestions(formQuestions.map((q) => (q.id === id ? { ...q, question: newQuestion } : q)))
  }

  const handleEditQuestionType = (id: number, newType: string) => {
    setFormQuestions(
      formQuestions.map((q) => {
        if (q.id === id) {
          const updatedQuestion = { ...q, type: newType }
          if (!["Multiple choice", "Checkboxes", "Dropdown"].includes(newType)) {
            delete updatedQuestion.options
          }
          return updatedQuestion
        }
        return q
      }),
    )
  }

  const handleEditQuestionOptions = (id: number, newOptions: string) => {
    setFormQuestions(
      formQuestions.map((q) => {
        if (q.id === id && ["Multiple choice", "Checkboxes", "Dropdown"].includes(q.type)) {
          return {
            ...q,
            options: newOptions
              .split(",")
              .map((option) => option.trim())
              .filter((option) => option !== ""),
          }
        }
        return q
      }),
    )
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Question", "Type", "Options"],
      ...formQuestions.map((q) => [q.question, q.type, q.options ? q.options.join("|") : ""]),
    ]
      .map((e) => e.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "formulario_triagem.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const generateTemplates = (jobDescription: string) => {
    // Simple template generation logic (you can make this more sophisticated)
    const newTemplates = {
      linkedinTemplate: `Estamos contratando! 🚀\n\n${jobDescription.slice(0, 200)}...\n\nInteressado? Saiba mais: [LINK_DA_VAGA] #vagas #oportunidade`,
      whatsappTemplate: `Nova oportunidade de emprego! 📣\n\n${jobDescription.slice(0, 100)}...\n\nMais detalhes: [LINK_DA_VAGA]`,
      emailTemplate: `<h2>Nova Oportunidade de Emprego</h2><p>${jobDescription}</p><p>Para se candidatar, acesse: [LINK_DA_VAGA]</p>`,
    }
    setEditedTemplates(newTemplates)
  }

  const handleFormLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormLink(e.target.value)
  }

  const handleSaveFormLink = () => {
    if (isFormLinkValid) {
      localStorage.setItem("hiringProspectionFormLink", formLink)
      toast({
        title: "Link salvo com sucesso!",
        description: "O link do formulário foi armazenado.",
      })
      setIsFormGenerated(true)
    } else {
      toast({
        title: "Link inválido",
        description: "Por favor, insira um link válido do Google Forms.",
        variant: "destructive",
      })
    }
  }

  const validateFormLink = (link: string) => {
    // Basic validation: check if it's a Google Forms URL
    return link.startsWith("https://docs.google.com/forms/") || link.startsWith("https://forms.gle/")
  }

  const isStageCompleted = Object.values(selectedChannels).some(Boolean)

  const getProgressPercentage = () => {
    let progress = 0
    if (Object.values(selectedChannels).some(Boolean)) progress += 50
    if (isFormGenerated) progress += 50
    return progress
  }

  const toggleEditTemplate = (templateId: string) => {
    setEditingTemplates((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }))
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Prospecção e Triagem</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Divulgue a vaga e prepare o processo de triagem dos candidatos
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
          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#111111]">Progresso da Prospecção</h2>
              <span className="text-lg font-semibold text-primary">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden p-1">
              <div
                className="h-full rounded-full transition-all duration-500 relative flex items-center justify-center bg-gradient-to-r from-[#ffb400] via-[#ffc333] to-[#cc9000] shadow-inner"
                style={{
                  width: `${getProgressPercentage()}%`,
                }}
              >
                <span className="text-white text-sm font-medium drop-shadow-md">{getProgressPercentage()}%</span>
              </div>
            </div>
          </div>

          {/* Channels Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <Megaphone className="mr-2 text-primary" /> Canais de Divulgação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={channel.id}
                      checked={selectedChannels[channel.id] || false}
                      onChange={() => handleChannelToggle(channel.id)}
                      className="mr-2 form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor={channel.id} className="flex items-center text-gray-700">
                      <channel.icon className="mr-2 text-primary" size={20} />
                      {channel.title}
                    </label>
                  </div>
                  {selectedChannels[channel.id] && (
                    <div className="ml-7 mt-2">
                      <p className="text-sm text-gray-600 mb-2">{channel.tip}</p>
                      <Button
                        onClick={() => handleCopyTemplate(channel.id, channel.template)}
                        className="text-sm"
                        variant="outline"
                      >
                        {copiedStates[channel.id] ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" /> Copiar Postagem
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Templates Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <Download className="mr-2 text-primary" /> Templates de Divulgação
            </h2>
            {templates.map((template) => (
              <div key={template.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{template.title}</span>
                  <div>
                    <Button onClick={() => toggleEditTemplate(template.id)} className="mr-2" variant="outline">
                      <Edit2 className="mr-2 h-4 w-4" />
                      {editingTemplates[template.id] ? "Fechar" : "Editar"}
                    </Button>
                    <Button
                      onClick={() =>
                        handleCopyTemplate(template.id, editedTemplates[template.id] || template.defaultContent)
                      }
                      className="mr-2"
                      variant="outline"
                    >
                      {copiedStates[template.id] ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" /> Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownloadTemplate(
                          template.fileName,
                          editedTemplates[template.id] || template.defaultContent,
                        )
                      }
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" /> Baixar
                    </Button>
                  </div>
                </div>
                {editingTemplates[template.id] && (
                  <Textarea
                    value={editedTemplates[template.id] || template.defaultContent}
                    onChange={(e) => setEditedTemplates((prev) => ({ ...prev, [template.id]: e.target.value }))}
                    rows={10}
                    className="w-full mt-2"
                  />
                )}
              </div>
            ))}
          </section>

          {/* Form Generation Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <FileText className="mr-2 text-primary" /> Formulário de Triagem
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Crie um formulário de triagem para avaliar os candidatos inicialmente.
              </p>
              <Button
                onClick={() => window.open("https://docs.google.com/forms", "_blank")}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Criar Formulário de Triagem
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Clique para abrir o Google Forms e criar seu formulário de triagem.
              </p>
            </div>
          </section>

          {/* Next Stage Button */}
          <Link
            href="/hiring-interview"
            className="w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
          bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400] shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20"
          >
            Avançar para Próxima Etapa
            <ChevronRight className="ml-2 transition-transform duration-300 translate-x-1" />
          </Link>
        </div>
      </div>
    </TooltipProvider>
  )
}

