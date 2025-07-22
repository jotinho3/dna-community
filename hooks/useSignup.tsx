import { useState } from "react"

interface RegisterResult {
  isLoading: boolean
  error: string
  register: (name: string, email: string, password: string) => Promise<void>
}

export function useSignup(): RegisterResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("https://dna-community-back.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Registration failed")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, register }
}