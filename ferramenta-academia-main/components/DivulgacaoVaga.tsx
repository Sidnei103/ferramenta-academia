import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone } from "lucide-react"
import type { Channel } from "@/app/types"

interface DivulgacaoVagaProps {
  canaisDivulgacao: Channel[]
  setCanaisDivulgacao: (canais: Channel[]) => void
  customChannels: Channel[]
  setCustomChannels: (canais: Channel[]) => void
  activeChannel: string | null
  setActiveChannel: (id: string | null) => void
}

export function DivulgacaoVaga({
  canaisDivulgacao,
  setCanaisDivulgacao,
  customChannels, // Keeping the prop even though we won't use it
  setCustomChannels, // Keeping the prop even though we won't use it
  activeChannel,
  setActiveChannel,
}: DivulgacaoVagaProps) {
  const toggleChannel = (id: string) => {
    if (activeChannel === id) {
      setActiveChannel(null)
    } else {
      setActiveChannel(id)
    }
  }

  const updateChannelContent = (id: string, content: string) => {
    setCanaisDivulgacao(canaisDivulgacao.map((channel) => (channel.id === id ? { ...channel, content } : channel)))
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <Megaphone className="mr-2 text-primary" />
          Divulgação da Vaga
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {canaisDivulgacao.map((channel) => (
            <div key={channel.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor={channel.id} className="text-lg font-semibold">
                  {channel.name}
                </Label>
                <Switch
                  id={channel.id}
                  checked={activeChannel === channel.id}
                  onCheckedChange={() => toggleChannel(channel.id)}
                />
              </div>
              {activeChannel === channel.id && (
                <Textarea
                  placeholder={`Conteúdo para ${channel.name}...`}
                  value={channel.content}
                  onChange={(e) => updateChannelContent(channel.id, e.target.value)}
                  rows={6}
                  className="w-full mt-2"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

