export interface ProfileTemplate {
  habilidadesTecnicas: string
  softSkills: string
  perfilComportamental: string
  diferencial: string
  descricaoVaga: string
  divulgacaoVaga: {
    linkedin: string
    whatsapp: string
    email: string
    jobBoards: string
  }
}

export interface Channel {
  id: string
  name: string
  isActive: boolean
  content: string
}

