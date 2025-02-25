"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebaseConfig"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error logging in:", error)
      setError(error.message || "Failed to log in. Please check your credentials.")
    }
  }

  return (
    <Card className="w-[400px] p-8 shadow-sm">
      <div className="flex flex-col items-center space-y-6 mb-8">
        <Image
          src="https://milpbjndlfca1za8.public.blob.vercel-storage.com/Logo%20academia/Black%20logo%20-%20no%20background-dQUtgGhRGXqu1TlXuOY2qeMLryWVSW.png"
          alt="Academia de Metas Logo"
          width={200}
          height={50}
          priority
        />
        <h1 className="text-2xl font-normal">Login</h1>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-md border border-gray-200"
          />

          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-md border border-gray-200"
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-[#FDB913] hover:bg-[#F5A700] text-black font-normal rounded-md transition-colors"
        >
          Entrar
        </button>

        <div className="text-center mt-4">
          <Link href="/signup" className="text-sm text-[#FDB913] hover:text-[#F5A700]">
            Não tem uma conta? Crie uma
          </Link>
        </div>
      </form>
    </Card>
  )
}

