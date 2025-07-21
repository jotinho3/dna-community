import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { GraduationCap, Briefcase, Code, Trophy, ChevronRight } from "lucide-react"

interface StepExperienceProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepExperience({ value, onChange, onNext, onBack }: StepExperienceProps) {
  const experienceLevels = [
    {
      id: 'student',
      label: 'Student',
      description: 'Learning and exploring the field',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'junior',
      label: 'Junior',
      description: '0-2 years of experience',
      icon: Code,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 'mid',
      label: 'Mid-Level',
      description: '2-5 years of experience',
      icon: Briefcase,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      id: 'senior',
      label: 'Senior',
      description: '5+ years of experience',
      icon: Trophy,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ]

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-slate-900">
          What's your experience level?
        </h3>
        <p className="text-sm text-slate-600">
          This helps us tailor content and connections to your needs
        </p>
      </div>

      <div className="space-y-3">
        {experienceLevels.map((level) => {
          const Icon = level.icon
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => onChange(level.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all
                  ${value === level.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-transparent hover:border-slate-200'}
                  flex items-center justify-between group`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${level.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-slate-900">{level.label}</h4>
                    <p className="text-sm text-slate-600">{level.description}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-all
                  ${value === level.id ? 'text-emerald-500' : 'text-slate-400'}
                  ${value === level.id ? 'translate-x-0' : '-translate-x-2'}
                  group-hover:translate-x-0`}
                />
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!value}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}