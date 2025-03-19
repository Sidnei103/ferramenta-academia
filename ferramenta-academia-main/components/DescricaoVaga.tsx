import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface DescricaoVagaProps {
  descricaoVaga: string
  setDescricaoVaga: (descricao: string) => void
}

export function DescricaoVaga({ descricaoVaga, setDescricaoVaga }: DescricaoVagaProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <FileText className="mr-2 text-primary" />
          Descrição da Vaga
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Descreva a vaga, incluindo responsabilidades, requisitos e benefícios..."
          value={descricaoVaga}
          onChange={(e) => setDescricaoVaga(e.target.value)}
          rows={6}
          className="w-full"
          required
        />
      </CardContent>
    </Card>
  )
}

