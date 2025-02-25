import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type React from "react"

interface CargoSelectionProps {
  cargoSelecionado: string
  handleCargoChange: (value: string) => void
}

export const CargoSelection: React.FC<CargoSelectionProps> = ({ cargoSelecionado, handleCargoChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
        Selecione o cargo
      </label>
      <Select value={cargoSelecionado} onValueChange={handleCargoChange}>
        <SelectTrigger id="cargo">
          <SelectValue placeholder="Selecione um cargo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sdr">SDR (Sales Development Representative)</SelectItem>
          <SelectItem value="bdr">BDR (Business Development Representative)</SelectItem>
          <SelectItem value="closer">Closer (Executivo de Vendas)</SelectItem>
          <SelectItem value="coordenador">Coordenador de Vendas)</SelectItem>
          <SelectItem value="gerente">Gerente de Vendas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

