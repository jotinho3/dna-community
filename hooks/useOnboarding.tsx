import { useState, useEffect } from 'react'
import { useAuth } from '../app/context/AuthContext'

interface OnboardingStep {
  id: number
  title: string
  completed: boolean
}

export const useOnboarding = () => {
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    role: '',
    experience: '',
    interests: [] as string[],
    languages: [] as string[],
    tools: [] as string[]
  })

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Welcome', completed: false },
    { id: 2, title: 'Your Role', completed: false },
    { id: 3, title: 'Experience', completed: false },
    { id: 4, title: 'Interests', completed: false },
    { id: 5, title: 'Tech Stack', completed: false }
  ]

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user?.uid) {
        try {
          const response = await fetch(`http://localhost:8080/api/users/onboarding-status/${user.uid}`)
          const data = await response.json()
          
          if (!data.hasCompletedOnboarding) {
            setShowOnboarding(true)
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error)
        }
      }
      setLoading(false)
    }

    checkOnboardingStatus()
  }, [user])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      steps[currentStep].completed = true
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const completeOnboarding = async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(`http://localhost:8080/api/users/complete-onboarding/${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData
        })
      })

      if (response.ok) {
        setShowOnboarding(false)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  return {
    showOnboarding,
    setShowOnboarding,
    loading,
    currentStep,
    steps,
    formData,
    nextStep,
    prevStep,
    updateFormData,
    completeOnboarding
  }
}