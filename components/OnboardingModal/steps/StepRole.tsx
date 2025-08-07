"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { 
  Database, 
  BarChart3, 
  Workflow, 
  Brain, 
  TrendingUp, 
  User 
} from "lucide-react"

interface StepRoleProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepRole({ value, onChange, onNext, onBack }: StepRoleProps) {
  const roles = [
    { 
      id: 'data_scientist', 
      label: 'Data Scientist',
      icon: Brain,
      description: 'Extract insights from data'
    },
    { 
      id: 'data_analyst', 
      label: 'Data Analyst',
      icon: BarChart3,
      description: 'Analyze, visualize and report data'
    },
    { 
      id: 'data_engineer', 
      label: 'Data Engineer',
      icon: Database,
      description: 'Build data infrastructure'
    },
    { 
      id: 'ml_engineer', 
      label: 'ML Engineer',
      icon: Workflow,
      description: 'Deploy ML models'
    },
    { 
      id: 'bi_analyst', 
      label: 'BI Analyst',
      icon: TrendingUp,
      description: 'Business intelligence'
    },
    { 
      id: 'other', 
      label: 'Other',
      icon: User,
      description: 'Something else'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-slate-800">What's your role?</h2>
        <p className="text-slate-600">Choose the option that best describes you</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {roles.map((role) => {
          const IconComponent = role.icon
          const isSelected = value === role.id
          
          return (
            <motion.div
              key={role.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={role.id}
                className={`
                  cursor-pointer block p-6 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }
                `}
              >
                <input
                  type="radio"
                  id={role.id}
                  value={role.id}
                  checked={isSelected}
                  onChange={() => onChange(role.id)}
                  className="sr-only"
                />
                
                <div className="flex items-start space-x-4">
                  <div className={`
                    p-3 rounded-lg transition-colors duration-200
                    ${isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                    }
                  `}>
                    <IconComponent size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold text-lg transition-colors duration-200
                      ${isSelected ? 'text-blue-900' : 'text-slate-800'}
                    `}>
                      {role.label}
                    </h3>
                    <p className={`
                      text-sm mt-1 transition-colors duration-200
                      ${isSelected ? 'text-blue-700' : 'text-slate-500'}
                    `}>
                      {role.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    </motion.div>
                  )}
                </div>
              </Label>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-between pt-4"
      >
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-8 py-2 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value}
          className={`
            px-8 py-2 transition-all duration-200
            ${!value 
              ? 'opacity-50 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
          `}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}