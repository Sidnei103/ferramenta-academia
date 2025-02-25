"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signInWithEmail, createUserWithEmail, onAuthStateChange } from "@/lib/firebaseAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        router.push("/")
      } else {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isSignUp) {
        await createUserWithEmail(email, password)
        toast({
          title: "Conta criada com sucesso",
          description: "Você foi registrado e logado automaticamente.",
        })
      } else {
        await signInWithEmail(email, password)
      }
      router.push("/")
    } catch (error) {
      console.error(error)
      toast({
        title: isSignUp ? "Erro ao criar conta" : "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="https://milpbjndlfca1za8.public.blob.vercel-storage.com/Logo%20academia/Black%20logo%20-%20no%20background-dQUtgGhRGXqu1TlXuOY2qeMLryWVSW.png"
              alt="Academia de Metas Logo"
              width={200}
              height={60}
              priority
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">{isSignUp ? "Criar Conta" : "Login"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium bg-gradient-to-r from-[#ffb400] to-[#cc9000] hover:from-[#cc9000] hover:to-[#ffb400] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ffb400]/20"
              disabled={isLoading}
            >
              {isSignUp ? "Criar Conta" : "Entrar"}
            </Button>
            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="text-[#ffb400] hover:text-[#cc9000] transition-colors duration-300"
              >
                {isSignUp ? "Já tem uma conta? Faça login" : "Não tem uma conta? Crie uma"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

