import type React from "react"
import './globals.css'
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Dashboard de Contratação - Academia de Metas",
  description: "Gerencie todo o processo de contratação de vendedores",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Remove header from login page */}
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'