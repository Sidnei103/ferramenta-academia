"use client"

import type React from "react"

import { useState } from "react"
import { signInWithGoogle, signInWithEmail } from "@/lib/firebaseAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmail(email, password)
      router.push("/dashboard")
    } catch (error) {
      setError("Falha no login. Verifique suas credenciais.")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (error) {
      setError("Falha no login com Google.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Entrar com Email
          </Button>
        </form>
        <div className="mt-4">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            Entrar com Google
          </Button>
        </div>
      </div>
    </div>
  )
}

