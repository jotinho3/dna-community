"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart3, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import PolicyModal from "../../components/PolicyModal"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToPolicyModeration, setAgreeToPolicyModeration] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const router = useRouter()

  const { register } = useAuth()

  // Function to validate email domain
  const isValidEmailDomain = (email: string) => {
    return email.toLowerCase().endsWith('@infosys.com')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    // Check email domain restriction
    if (!isValidEmailDomain(email)) {
      setError("Registration is restricted to @infosys.com email addresses only")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (!agreeToPolicyModeration) {
      setError("Please accept the moderation policy")
      return
    }

    setIsLoading(true)
    try {
      // register will handle saveSession and context update
      await register(name, email, password)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePolicyAccept = () => {
    setAgreeToPolicyModeration(true)
    setShowPolicyModal(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary-900">
                {process.env.NEXT_PUBLIC_COMMUNITY_NAME || "Community"}
              </span>
            </div>
            {/* <CardTitle className="text-2xl text-primary-900">
              Join {process.env.NEXT_PUBLIC_COMMUNITY_NAME || "Community"}
            </CardTitle> */}
            <CardDescription>
              <span className="text-primary-700">
                Create your account to start contributing
              </span>
              <br />
              <span className="text-xs text-primary-500 mt-1">
                Restricted to @infosys.com email addresses
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your @infosys.com email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={
                    email && !isValidEmailDomain(email)
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }
                />
                {email && !isValidEmailDomain(email) && (
                  <p className="text-xs text-red-600">
                    Please use your @infosys.com email address
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-primary-300" />
                    ) : (
                      <Eye className="h-4 w-4 text-primary-300" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-primary-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-primary-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* New Policy Moderation Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="policyModeration"
                  checked={agreeToPolicyModeration}
                  onCheckedChange={(checked) => setAgreeToPolicyModeration(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="policyModeration" className="text-sm text-primary-700">
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Community Moderation Policy
                  </button>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading || (email !== "" && !isValidEmailDomain(email))}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-primary-700">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Modal */}
      <PolicyModal
        open={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onAccept={handlePolicyAccept}
      />
    </>
  )
}