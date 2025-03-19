"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  BarChart2,
  Layout,
  CloudLightningIcon as Lightning,
  MousePointer2,
  Navigation,
  Palette,
} from "lucide-react"

const improvements = [
  {
    category: "Quick Stats Overview",
    icon: <BarChart2 className="w-5 h-5" />,
    description: "Add key metrics cards showing total candidates, interviews, and success rates",
    complexity: "Low",
    impact: "High",
    timeEstimate: "2-3 hours",
  },
  {
    category: "Visual Enhancements",
    icon: <Palette className="w-5 h-5" />,
    description: "Implement micro-animations, gradient progress bars, and enhanced hover effects",
    complexity: "Medium",
    impact: "Medium",
    timeEstimate: "3-4 hours",
  },
  {
    category: "Navigation & Accessibility",
    icon: <Navigation className="w-5 h-5" />,
    description: "Add keyboard shortcuts, quick actions menu, and helpful tooltips",
    complexity: "Medium",
    impact: "High",
    timeEstimate: "4-5 hours",
  },
  {
    category: "Information Architecture",
    icon: <Layout className="w-5 h-5" />,
    description: "Add timeline view, mini-calendar, and quick search features",
    complexity: "Medium",
    impact: "High",
    timeEstimate: "4-6 hours",
  },
  {
    category: "Engagement Features",
    icon: <Activity className="w-5 h-5" />,
    description: "Implement notification badges, continue session, and activity feed",
    complexity: "Medium",
    impact: "Medium",
    timeEstimate: "3-4 hours",
  },
  {
    category: "Productivity Improvements",
    icon: <Lightning className="w-5 h-5" />,
    description: "Add quick-add buttons, completion checklists, and drag-and-drop",
    complexity: "High",
    impact: "High",
    timeEstimate: "5-6 hours",
  },
  {
    category: "Data Visualization",
    icon: <BarChart2 className="w-5 h-5" />,
    description: "Implement hiring funnel metrics, heat maps, and trend lines",
    complexity: "Medium",
    impact: "High",
    timeEstimate: "4-5 hours",
  },
  {
    category: "Personalization",
    icon: <MousePointer2 className="w-5 h-5" />,
    description: "Add customizable layouts, favorites section, and theme options",
    complexity: "High",
    impact: "Medium",
    timeEstimate: "5-6 hours",
  },
]

export default function DashboardImprovements() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sugestões de Melhorias para o Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {improvements.map((improvement) => (
          <Card key={improvement.category} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {improvement.icon}
                  <CardTitle className="text-lg">{improvement.category}</CardTitle>
                </div>
                <Badge variant={improvement.complexity === "Low" ? "default" : "secondary"} className="capitalize">
                  {improvement.complexity}
                </Badge>
              </div>
              <CardDescription>{improvement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <Badge variant="outline" className="capitalize">
                  Impacto: {improvement.impact}
                </Badge>
                <span className="text-muted-foreground">⏱️ {improvement.timeEstimate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

