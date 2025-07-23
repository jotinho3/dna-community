"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface UserProfile {
  bio?: string
  experience: string
  title: string;
  interests: string[]
  languages: string[]
  location?: string
  role: string
  skills?: string[]
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
    portfolio?: string
  }
  tools: string[]
  website?: string
  createdAt?: string
  updatedAt?: string
}

interface User {
  uid: string
  name: string
  email: string
  password?: string
  engagement_xp: number
  hasCompletedOnboarding: boolean
  onboardingCompletedAt?: string
  created_at: string
  profile: UserProfile
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token")
    const storedUser = sessionStorage.getItem("user")
    const expires = sessionStorage.getItem("tokenExpires")

    if (storedToken && storedUser && expires && Date.now() < Number(expires)) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    } else {
      sessionStorage.clear()
    }
  }, [])

  const saveSession = (token: string, user: User, expiresIn: string) => {
    setToken(token)
    setUser(user)
    sessionStorage.setItem("token", token)
    sessionStorage.setItem("user", JSON.stringify(user))
    sessionStorage.setItem("tokenExpires", String(new Date(expiresIn).getTime()))
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) throw new Error("Registration failed")
    const data = await res.json()
    saveSession(data.token, data.user, data.expiresIn)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Login failed")
    const data = await res.json()
    saveSession(data.token, data.user, data.expiresIn)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    sessionStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
