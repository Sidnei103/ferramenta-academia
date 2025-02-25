"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  PlayCircle,
  Save,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Check,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getAuth } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { app } from "@/lib/firebaseConfig"

// Importe as funções necessárias do Firebase
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore"

// Define the interview questions
const interviewQuestions = [
  { id: "q1", question: "Descreva uma situação em que você superou um desafio de vendas." },
  { id: "q2", question: "Como você abordaria um cliente potencial pela primeira vez?" },
  { id: "q3", question: "Conte sobre uma meta de vendas que você alcançou. Como você fez isso?" },
  { id: "q4", question: "Como você lida com objeções de clientes?" },
  { id: "q5", question: "Descreva sua estratégia para manter relacionamentos de longo prazo com clientes." },
]

// Define the role-play scenarios
const defaultScenario = {
  title: "Cenário Inicial: Primeiro Contato",
  description:
    "Você é um vendedor da sua última empresa. Um cliente potencial está interessado nos seus serviços, ele clicou para saber mais no site. Você recebeu o contato para fazer a primeira ligação, sua tarefa é realizar um diagnóstico.",
}

const dynamicScenarios = [
  {
    title: "1. Cliente indeciso sobre concorrência",
    description:
      "O cliente menciona que já usa um serviço similar e quer entender as vantagens do seu produto. Sua missão é destacar diferenciais sem desmerecer a concorrência.",
  },
  {
    title: "2. Objeção de preço",
    description:
      "O cliente acha que o preço do seu produto é alto demais. Demonstre o valor e justifique o investimento.",
  },
  {
    title: "3. Cliente com urgência",
    description:
      "O cliente precisa de uma solução imediata. Mostre como seu produto pode ser implementado rapidamente.",
  },
  {
    title: "4. Múltiplos decisores",
    description:
      "Você descobre que há vários decisores envolvidos. Elabore uma estratégia para lidar com diferentes stakeholders.",
  },
  {
    title: "5. Cliente insatisfeito com fornecedor atual",
    description:
      "O cliente está frustrado com seu fornecedor atual. Aborde a situação com tato e mostre como sua solução pode resolver os problemas atuais.",
  },
  {
    title: "6. Necessidade de customização",
    description:
      "O cliente precisa de uma solução personalizada. Explique como seu produto pode ser adaptado às necessidades específicas.",
  },
  {
    title: "7. Dúvidas sobre suporte pós-venda",
    description:
      "O cliente está preocupado com o suporte após a compra. Detalhe seu processo de atendimento ao cliente e resolução de problemas.",
  },
  {
    title: "8. Resistência à mudança",
    description:
      "A empresa do cliente é resistente a mudanças. Apresente estratégias para facilitar a transição e adoção do seu produto.",
  },
  {
    title: "9. Comparação com concorrente específico",
    description:
      "O cliente está comparando diretamente seu produto com um concorrente específico. Faça uma comparação justa destacando seus pontos fortes.",
  },
  {
    title: "10. Necessidade de ROI claro",
    description:
      "O cliente precisa de um cálculo claro de retorno sobre investimento (ROI). Apresente dados e casos de sucesso para justificar o investimento.",
  },
]

export default function HiringInterview() {
  // Adicione estes estados no início do componente HiringInterview
  const [customQuestions, setCustomQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(null)

  const [candidateInfo, setCandidateInfo] = useState({ nome: "", email: "", telefone: "" })
  const [candidateNotes, setCandidateNotes] = useState("")
  const [rolePlayCompleted, setRolePlayCompleted] = useState(false)
  const [questionResponses, setQuestionResponses] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [originalData, setOriginalData] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  const [questionsExpanded, setQuestionsExpanded] = useState(false)

  const [interviewCompleted, setInterviewCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hiringInterviewCompleted")
      return saved ? JSON.parse(saved) : false
    }
    return {}
  })

  const [scenarioIndex, setScenarioIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hiringInterviewScenarioIndex")
      return saved ? JSON.parse(saved) : 0
    }
    return 0
  })

  const [currentScenario, setCurrentScenario] = useState(defaultScenario)
  const handleNewScenario = () => {
    const nextIndex = (scenarioIndex + 1) % (dynamicScenarios.length + 1)
    setScenarioIndex(nextIndex)
    if (nextIndex === 0) {
      setCurrentScenario(defaultScenario)
    } else {
      setCurrentScenario(dynamicScenarios[nextIndex - 1])
    }
  }

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuth(app)
  const editId = searchParams.get("edit")
  const [candidateStatus, setCandidateStatus] = useState("pending")

  // Adicione estas funções dentro do componente HiringInterview

  const loadCustomQuestions = useCallback(async () => {
    const user = auth.currentUser
    if (!user) return

    const db = getFirestore(app)
    const q = query(collection(db, "customQuestions"), where("userId", "==", user.uid))
    const querySnapshot = await getDocs(q)
    const loadedQuestions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setCustomQuestions(loadedQuestions)
  }, [auth.currentUser])

  useEffect(() => {
    loadCustomQuestions()
  }, [loadCustomQuestions])

  const addCustomQuestion = async () => {
    if (!newQuestion.trim()) return
    const user = auth.currentUser
    if (!user) return

    const db = getFirestore(app)
    const docRef = await addDoc(collection(db, "customQuestions"), {
      userId: user.uid,
      question: newQuestion,
    })

    setCustomQuestions([...customQuestions, { id: docRef.id, question: newQuestion }])
    setNewQuestion("")
  }

  const updateCustomQuestion = async (id, updatedQuestion) => {
    const db = getFirestore(app)
    await updateDoc(doc(db, "customQuestions", id), { question: updatedQuestion })
    setCustomQuestions(customQuestions.map((q) => (q.id === id ? { ...q, question: updatedQuestion } : q)))
    setEditingQuestion(null)
  }

  const deleteCustomQuestion = async (id) => {
    const db = getFirestore(app)
    await deleteDoc(doc(db, "customQuestions", id))
    setCustomQuestions(customQuestions.filter((q) => q.id !== id))
  }

  useEffect(() => {
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
      setCandidateInfo({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      })
      setCandidateNotes(data.candidato_anotacoes || "")
      setRolePlayCompleted(data.role_play_realizado === "Sim")
      setQuestionResponses(data.perguntas_anotacoes || {})
      setOriginalData(data)
    }
  }

  useEffect(() => {
    const isDataChanged =
      JSON.stringify(originalData) !==
      JSON.stringify({
        ...candidateInfo,
        candidato_anotacoes: candidateNotes,
        role_play_realizado: rolePlayCompleted ? "Sim" : "Não",
        perguntas_anotacoes: questionResponses,
      })
    setHasChanges(isDataChanged)
  }, [candidateInfo, candidateNotes, rolePlayCompleted, questionResponses, originalData])

  useEffect(() => {
    localStorage.setItem("hiringInterviewNotes", JSON.stringify(candidateNotes))
    localStorage.setItem("hiringInterviewRolePlay", JSON.stringify(rolePlayCompleted))
    localStorage.setItem("hiringInterviewResponses", JSON.stringify(questionResponses))
    localStorage.setItem("hiringInterviewCompleted", JSON.stringify(interviewCompleted))
    localStorage.setItem("hiringInterviewScenarioIndex", JSON.stringify(scenarioIndex))
    updateOverallProgress()
  }, [candidateNotes, rolePlayCompleted, questionResponses, interviewCompleted, scenarioIndex])

  const updateOverallProgress = () => {
    const isStageCompleted = interviewCompleted && rolePlayCompleted
    const hiringProgress = JSON.parse(localStorage.getItem("hiringProgress") || "[]")

    if (isStageCompleted && !hiringProgress.includes("interview")) {
      hiringProgress.push("interview")
    } else if (!isStageCompleted && hiringProgress.includes("interview")) {
      const index = hiringProgress.indexOf("interview")
      hiringProgress.splice(index, 1)
    }

    localStorage.setItem("hiringProgress", JSON.stringify(hiringProgress))
  }

  const handleRolePlayComplete = () => {
    setRolePlayCompleted(true)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCandidateNotes(e.target.value)
  }

  const handleResponseChange = (questionId: string, response: string) => {
    setQuestionResponses((prev) => ({ ...prev, [questionId]: response }))
  }

  // Modifique a função handleSaveResponses para incluir as perguntas personalizadas
  const handleSaveResponses = () => {
    const allResponses = {
      ...questionResponses,
      ...customQuestions.reduce((acc, q, index) => {
        acc[`custom_q${index + 1}`] = questionResponses[q.id] || ""
        return acc
      }, {}),
    }
    localStorage.setItem("hiringInterviewResponses", JSON.stringify(allResponses))
    setQuestionsExpanded(false)
    setInterviewCompleted(true)
    toast({
      title: "Anotações salvas com sucesso ✅",
      description: "Suas respostas foram armazenadas com segurança.",
    })
  }

  const handleCandidateInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCandidateInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Modifique a função handleSave para incluir as perguntas personalizadas ao salvar no Firestore
  const handleSave = () => {
    const allResponses = {
      ...questionResponses,
      ...customQuestions.reduce((acc, q, index) => {
        acc[`custom_q${index + 1}`] = questionResponses[q.id] || ""
        return acc
      }, {}),
    }

    localStorage.setItem(
      "tempCandidateData",
      JSON.stringify({
        ...candidateInfo,
        candidato_anotacoes: candidateNotes,
        role_play_realizado: rolePlayCompleted ? "Sim" : "Não",
        perguntas_anotacoes: allResponses,
      }),
    )

    if (isEditing) {
      router.push(`/hiring-closing?edit=${editId}`)
    } else {
      router.push("/hiring-closing")
    }
  }

  const isStageCompleted = interviewCompleted && rolePlayCompleted

  const getProgressPercentage = () => {
    let progress = 0
    if (interviewCompleted) progress += 50
    if (rolePlayCompleted) progress += 25
    if (candidateNotes.trim() !== "") progress += 25
    return progress
  }

  const handleStatusChange = (status: string) => {
    setCandidateStatus(status)
  }

  // ... (resto do componente)

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
                  <h1 className="text-2xl sm:text-3xl font-bold">Entrevistas e Avaliação</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Conduza entrevistas estruturadas e avalie os candidatos de forma eficiente
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
              <h2 className="text-xl font-semibold text-[#111111]">Progresso da Entrevista</h2>
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

          {/* Candidate Information Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <Users className="mr-2 text-primary" /> Informações do Candidato
            </h2>
            <div className="space-y-4">
              <Input
                type="text"
                name="nome"
                placeholder="Nome do candidato"
                value={candidateInfo.nome}
                onChange={handleCandidateInfoChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="E-mail do candidato"
                value={candidateInfo.email}
                onChange={handleCandidateInfoChange}
                required
              />
              <Input
                type="text"
                name="telefone"
                placeholder="Telefone do candidato"
                value={candidateInfo.telefone}
                onChange={handleCandidateInfoChange}
                required
              />
            </div>
          </section>

          {/* Interview Questions Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <Users className="mr-2 text-primary" /> Guia de Perguntas (Método STAR)
            </h2>
            <Button
              onClick={() => setQuestionsExpanded(!questionsExpanded)}
              className="mb-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white font-medium rounded-lg hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20 flex items-center justify-center gap-2"
            >
              {questionsExpanded ? (
                <>
                  <ChevronUp className="h-5 w-5" /> Fechar Perguntas
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" /> Iniciar Perguntas
                </>
              )}
            </Button>
            <div
              className={`space-y-4 transition-all duration-300 overflow-hidden ${
                questionsExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/* Default Questions */}
              <div className="space-y-6 mb-8">
                {interviewQuestions.map((q) => (
                  <div key={q.id} className="border-b pb-4">
                    <label htmlFor={q.id} className="text-gray-700 font-medium">
                      {q.question}
                    </label>
                    <Textarea
                      id={q.id}
                      value={questionResponses[q.id] || ""}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      placeholder="Digite a resposta do candidato aqui..."
                      rows={3}
                      className="w-full mt-2"
                    />
                  </div>
                ))}
              </div>

              {/* Custom Questions Section */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">Perguntas Personalizadas</h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
                  {customQuestions.map((q) => (
                    <div key={q.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      {editingQuestion === q.id ? (
                        <div className="space-y-4">
                          <Input
                            value={q.question}
                            onChange={(e) =>
                              setCustomQuestions(
                                customQuestions.map((cq) =>
                                  cq.id === q.id ? { ...cq, question: e.target.value } : cq,
                                ),
                              )
                            }
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => updateCustomQuestion(q.id, q.question)} className="flex-1">
                              Salvar
                            </Button>
                            <Button onClick={() => setEditingQuestion(null)} variant="outline" className="flex-1">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-700">{q.question}</p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingQuestion(q.id)}
                                variant="outline"
                                size="sm"
                                className="h-8"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => deleteCustomQuestion(q.id)}
                                variant="destructive"
                                size="sm"
                                className="h-8"
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={questionResponses[q.id] || ""}
                            onChange={(e) => handleResponseChange(q.id, e.target.value)}
                            placeholder="Digite a resposta do candidato aqui..."
                            rows={3}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Question Section */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Digite uma nova pergunta personalizada..."
                      className="flex-1"
                    />
                    <Button
                      onClick={addCustomQuestion}
                      className="bg-primary hover:bg-primary-dark text-white whitespace-nowrap"
                    >
                      Adicionar Pergunta
                    </Button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <Button
                  onClick={handleSaveResponses}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white font-medium rounded-lg hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Salvar Respostas
                </Button>
              </div>
            </div>
          </section>

          {/* Role Play Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <PlayCircle className="mr-2 text-primary" /> Teste Técnico (Role Play)
            </h2>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold text-lg mb-2 text-primary">{currentScenario.title}</h3>
              <p className="text-gray-700 transition-all duration-300 ease-in-out">{currentScenario.description}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handleNewScenario}
                className="px-6 py-3 bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white font-medium rounded-lg hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20 flex items-center justify-center gap-2"
              >
                <Shuffle className="h-5 w-5" /> Sortear Cenário
              </Button>
              <Button
                onClick={handleRolePlayComplete}
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2
                  ${
                    rolePlayCompleted
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      : "bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400]"
                  }`}
              >
                {rolePlayCompleted ? (
                  <>
                    <Check className="h-5 w-5" /> Role Play Concluído
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5" /> Marcar Role Play como Concluído
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Candidate Notes Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center text-[#111111] mb-4">
              <FileText className="mr-2 text-primary" /> Anotações sobre o Candidato
            </h2>
            <Textarea
              value={candidateNotes}
              onChange={handleNotesChange}
              placeholder="Registre suas impressões sobre o candidato aqui..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              rows={6}
            />
          </section>

          {/* Save and Finish Button */}
          <Button
            onClick={handleSave}
            className="w-full mt-4 font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
          bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white hover:from-[#cc9000] hover:to-[#ffb400] shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20"
          >
            {isEditing ? "Salvar e Avançar para Fechamento" : "Avançar para Fechamento"}
            <ChevronRight className="ml-2 transition-transform duration-300 translate-x-1" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

