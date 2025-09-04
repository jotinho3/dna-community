import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Waves, Sparkles, Users, Brain } from "lucide-react"

interface StepWelcomeProps {
  onNext: () => void
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-4 rounded-full bg-emerald-100 opacity-50"
            />
            <Waves className="w-16 h-16 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome to {process.env.NEXT_PUBLIC_COMMUNITY_NAME}
          </h1>
          <p className="text-slate-600 max-w-sm mx-auto">
            Let's personalize your experience by getting to know you better
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Connect with peers</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg text-center">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Share knowledge</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <Brain className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Grow together</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button 
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          Let's Get Started
        </Button>
      </motion.div>
    </div>
  )
}