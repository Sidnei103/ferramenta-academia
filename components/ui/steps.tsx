import React from "react"
import { cn } from "@/lib/utils"

interface StepProps {
  label: string
  isActive?: boolean
  isCompleted?: boolean
}

export const Step: React.FC<StepProps> = ({ label, isActive, isCompleted }) => {
  return (
    <div className="flex items-center">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          isActive && "bg-primary text-white",
          isCompleted && "bg-green-500 text-white",
          !isActive && !isCompleted && "bg-gray-200 text-gray-500",
        )}
      >
        {isCompleted ? "✓" : label}
      </div>
      <div className="ml-2 text-sm">{label}</div>
    </div>
  )
}

interface StepsProps {
  activeStep: number
  children: React.ReactNode
  className?: string
}

export const Steps: React.FC<StepsProps> = ({ activeStep, children, className }) => {
  const steps = React.Children.toArray(children)

  return (
    <div className={cn("flex justify-between", className)}>
      {steps.map((step, index) => {
        if (React.isValidElement(step)) {
          return React.cloneElement(step, {
            isActive: index === activeStep,
            isCompleted: index < activeStep,
          })
        }
        return step
      })}
    </div>
  )
}

