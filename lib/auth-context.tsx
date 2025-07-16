"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  title?: string
  location?: string
  website?: string
  joinedDate: string
  reputation: number
  questionsAsked: number
  answersGiven: number
  badges: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem("datahub-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email,
      avatar: "JD",
      bio: "Data Scientist passionate about machine learning and analytics",
      title: "Senior Data Scientist",
      location: "San Francisco, CA",
      website: "https://johndoe.dev",
      joinedDate: "2023-01-15",
      reputation: 1250,
      questionsAsked: 23,
      answersGiven: 87,
      badges: ["Top Contributor", "ML Expert", "Python Guru"],
    }

    setUser(mockUser)
    localStorage.setItem("datahub-user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      bio: "",
      title: "",
      location: "",
      website: "",
      joinedDate: new Date().toISOString().split("T")[0],
      reputation: 0,
      questionsAsked: 0,
      answersGiven: 0,
      badges: [],
    }

    setUser(newUser)
    localStorage.setItem("datahub-user", JSON.stringify(newUser))
    setIsLoading(false)
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("datahub-user")
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("datahub-user", JSON.stringify(updatedUser))
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
