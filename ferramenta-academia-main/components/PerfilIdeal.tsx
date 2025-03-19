import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import type { ProfileTemplate } from "@/app/types"

interface PerfilIdealProps {
  perfilIdeal: ProfileTemplate
  setPerfilIdeal: (perfil: ProfileTemplate) => void
}

export function PerfilIdeal({ perfilIdeal, setPerfilIdeal }: PerfilIdealProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <Users className="mr-2 text-primary" />
          Definição do Perfil Ideal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="habilidadesTecnicas">Habilidades Técnicas</Label>
            <Textarea
              id="habilidadesTecnicas"
              value={perfilIdeal.habilidadesTecnicas}
              onChange={(e) => setPerfilIdeal({ ...perfilIdeal, habilidadesTecnicas: e.target.value })}
              rows={6}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="softSkills">Soft Skills</Label>
            <Textarea
              id="softSkills"
              value={perfilIdeal.softSkills}
              onChange={(e) => setPerfilIdeal({ ...perfilIdeal, softSkills: e.target.value })}
              rows={6}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="perfilComportamental">Perfil Comportamental</Label>
            <Textarea
              id="perfilComportamental"
              value={perfilIdeal.perfilComportamental}
              onChange={(e) => setPerfilIdeal({ ...perfilIdeal, perfilComportamental: e.target.value })}
              rows={6}
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="diferencial">Diferencial</Label>
            <Textarea
              id="diferencial"
              value={perfilIdeal.diferencial}
              onChange={(e) => setPerfilIdeal({ ...perfilIdeal, diferencial: e.target.value })}
              rows={6}
              className="w-full mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

