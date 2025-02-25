"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { DashboardContent } from "@/components/DashboardContent"
import { getAuth } from "firebase/auth"
import { logoutUser } from "@/lib/firebaseAuth"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const auth = getAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar fazer logout. Por favor, tente novamente.",
        variant: "destructive",
      })
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

        <DashboardContent />
      </div>
    </TooltipProvider>
  )
}

