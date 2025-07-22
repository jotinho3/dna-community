"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  uid: string
  name: string
  email: string
  avatar?: string
  bio?: string
  title?: string
  location?: string
  website?: string
  joinedDate?: string
  reputation?: number
  questionsAsked?: number
  answersGiven?: number
  badges?: string[]
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
    // Load from sessionStorage
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
    const res = await fetch("https://render.com/docs/web-services#port-binding/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) throw new Error("Registration failed")
    const data = await res.json()
    // Assume backend returns { token, user, expiresIn }
    saveSession(data.token, data.user, data.expiresIn)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch("https://render.com/docs/web-services#port-binding/api/auth/login", {
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
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}