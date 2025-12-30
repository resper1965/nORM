"use client"

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export interface OnboardingStep {
  title: string
  description: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingTourProps {
  steps: OnboardingStep[]
  onComplete: () => void
  onSkip: () => void
  storageKey?: string // LocalStorage key to track completion
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  storageKey = 'onboarding-completed',
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    // Check if onboarding was already completed
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(storageKey)
      if (completed === 'true') {
        setIsVisible(false)
        return
      }
      setIsVisible(true)
    }
  }, [storageKey])

  useEffect(() => {
    // Calculate position based on target element
    if (!isVisible) return

    const step = steps[currentStep]
    if (!step.target) {
      // Center of screen for no target
      setPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 250,
      })
      return
    }

    const target = document.querySelector(step.target)
    if (!target) {
      setPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 250,
      })
      return
    }

    const rect = target.getBoundingClientRect()
    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top - 240
        left = rect.left
        break
      case 'bottom':
        top = rect.bottom + 20
        left = rect.left
        break
      case 'left':
        top = rect.top
        left = rect.left - 520
        break
      case 'right':
        top = rect.top
        left = rect.right + 20
        break
      default:
        top = rect.bottom + 20
        left = rect.left
    }

    setPosition({ top, left })

    // Highlight target element
    target.classList.add('onboarding-highlight')

    return () => {
      target.classList.remove('onboarding-highlight')
    }
  }, [currentStep, isVisible, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true')
    }
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true')
    }
    setIsVisible(false)
    onSkip()
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const step = steps[currentStep]

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[999]" />

      {/* Tour card */}
      <Card
        className="fixed z-[1000] w-[500px] shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{step.title}</CardTitle>
              <CardDescription className="mt-2">{step.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Passo {currentStep + 1} de {steps.length}
              </span>
              <Button variant="link" size="sm" onClick={handleSkip}>
                Pular tour
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {step.action ? (
            <Button onClick={step.action.onClick}>
              {step.action.label}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                'Concluir'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 1001;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 8px;
        }
      `}</style>
    </>
  )
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding(storageKey = 'onboarding-completed') {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(storageKey)
      setShouldShow(completed !== 'true')
    }
  }, [storageKey])

  const markComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true')
      setShouldShow(false)
    }
  }

  const resetOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
      setShouldShow(true)
    }
  }

  return {
    shouldShow,
    markComplete,
    resetOnboarding,
  }
}
