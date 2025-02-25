"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Save, Users } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuth } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { app } from "@/lib/firebaseConfig"
import type { ProfileTemplate } from "../types"
import { CargoSelection } from "@/components/CargoSelection"
import { PerfilIdeal } from "@/components/PerfilIdeal"
import { DescricaoVaga } from "@/components/DescricaoVaga"
import { DivulgacaoVaga } from "@/components/DivulgacaoVaga"

type Channel = {
  id: string
  name: string
  isActive: boolean
  content: string
}

const defaultChannels: Channel[] = [
  { id: "linkedin", name: "LinkedIn", isActive: false, content: "" },
  { id: "whatsapp", name: "WhatsApp", isActive: false, content: "" },
  { id: "email", name: "E-mail", isActive: false, content: "" },
  { id: "jobBoards", name: "Job Boards", isActive: false, content: "" },
]

export default function Preparacao() {
  const [cargoSelecionado, setCargoSelecionado] = useState("")
  const [perfilIdeal, setPerfilIdeal] = useState<ProfileTemplate>({
    habilidadesTecnicas: "",
    softSkills: "",
    perfilComportamental: "",
    diferencial: "",
  })
  const [descricaoVaga, setDescricaoVaga] = useState("")
  const [canaisDivulgacao, setCanaisDivulgacao] = useState<Channel[]>(defaultChannels)
  const [customChannels, setCustomChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [isTemplateLoading, setIsTemplateLoading] = useState(false)

  const router = useRouter()
  const auth = getAuth(app)
  const { toast } = useToast()

  const handleCargoChange = async (value: string) => {
    setCargoSelecionado(value)
    setIsTemplateLoading(true)

    try {
      let templateModule
      switch (value) {
        case "sdr":
          templateModule = await import("../templates/sdrTemplate")
          break
        case "bdr":
          templateModule = await import("../templates/bdrTemplate")
          break
        case "closer":
          templateModule = await import("../templates/closerTemplate")
          break
        case "coordenador":
          templateModule = await import("../templates/coordenadorTemplate")
          break
        case "gerente":
          templateModule = await import("../templates/gerenteTemplate")
          break
        default:
          throw new Error(`Template não encontrado para o cargo: ${value}`)
      }

      const template = templateModule.default

      setPerfilIdeal(template)
      setDescricaoVaga(template.descricaoVaga || "")

      if (template.divulgacaoVaga) {
        setCanaisDivulgacao(
          canaisDivulgacao.map((canal) => ({
            ...canal,
            content: template.divulgacaoVaga?.[canal.id] || "",
          })),
        )
      }
    } catch (error) {
      console.error("Erro ao carregar o template:", error)
      toast({
        title: "Erro",
        description: `Não foi possível carregar o template do cargo selecionado: ${(error as Error).message}`,
        variant: "destructive",
      })
      resetForm()
    } finally {
      setIsTemplateLoading(false)
      setActiveChannel(null)
    }
  }

  const resetForm = () => {
    setPerfilIdeal({
      habilidadesTecnicas: "",
      softSkills: "",
      perfilComportamental: "",
      diferencial: "",
    })
    setDescricaoVaga("")
    setCanaisDivulgacao(defaultChannels)
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) {
        router.push("/login")
        return
      }

      const db = getFirestore(app)
      const docRef = doc(db, "preparacao", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setCargoSelecionado(data.cargoSelecionado || "")
        setPerfilIdeal(data.perfilIdeal || perfilIdeal)
        setDescricaoVaga(data.descricaoVaga || "")
        setCanaisDivulgacao(data.canaisDivulgacao || defaultChannels)
        setCustomChannels(data.customChannels || [])
      }
    }

    fetchData()
  }, [router, auth, perfilIdeal])

  const handleSave = async () => {
    setIsLoading(true)
    const user = auth.currentUser
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!cargoSelecionado || !perfilIdeal.habilidadesTecnicas || !descricaoVaga.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const db = getFirestore(app)
      await setDoc(doc(db, "preparacao", user.uid), {
        cargoSelecionado,
        perfilIdeal,
        descricaoVaga,
        canaisDivulgacao,
        customChannels,
        updatedAt: new Date(),
      })

      toast({
        title: "Sucesso",
        description: "Dados salvos com sucesso!",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f6f6f6]">
        {/* Header */}
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Preparação do Processo Seletivo</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-300">
                    Defina o perfil ideal e prepare a estratégia de divulgação
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
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            {/* Cargo Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                  <Users className="mr-2 text-primary" />
                  Seleção do Cargo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CargoSelection cargoSelecionado={cargoSelecionado} handleCargoChange={handleCargoChange} />
              </CardContent>
            </Card>

            {/* Perfil Ideal */}
            <PerfilIdeal perfilIdeal={perfilIdeal} setPerfilIdeal={setPerfilIdeal} />

            {/* Descrição da Vaga */}
            <DescricaoVaga descricaoVaga={descricaoVaga} setDescricaoVaga={setDescricaoVaga} />

            {/* Divulgação da Vaga */}
            <DivulgacaoVaga
              canaisDivulgacao={canaisDivulgacao}
              setCanaisDivulgacao={setCanaisDivulgacao}
              customChannels={customChannels}
              setCustomChannels={setCustomChannels}
              activeChannel={activeChannel}
              setActiveChannel={setActiveChannel}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#ffb400] to-[#cc9000] text-white font-medium rounded-lg hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20 flex items-center justify-center gap-2"
                disabled={isLoading || isTemplateLoading}
              >
                {isLoading || isTemplateLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Salvar e Continuar
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  )
}

