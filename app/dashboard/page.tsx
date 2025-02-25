import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardContent } from "@/components/DashboardContent" // Assumindo que temos este componente

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

