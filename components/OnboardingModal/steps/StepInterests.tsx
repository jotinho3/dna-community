import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Brain, 
  Database, 
  ChartBar, 
  Cloud,
  LineChart,
  Network,
  Binary,
  Lightbulb
} from "lucide-react"

interface StepInterestsProps {
  values: string[]
  onChange: (values: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function StepInterests({ values, onChange, onNext, onBack }: StepInterestsProps) {
  const interests = [
    { id: 'machine_learning', label: 'Machine Learning', icon: Brain, color: 'bg-purple-50 text-purple-600' },
    { id: 'data_engineering', label: 'Data Engineering', icon: Database, color: 'bg-blue-50 text-blue-600' },
    { id: 'data_analytics', label: 'Data Analytics', icon: ChartBar, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'cloud_computing', label: 'Cloud Computing', icon: Cloud, color: 'bg-sky-50 text-sky-600' },
    { id: 'business_intelligence', label: 'Business Intelligence', icon: LineChart, color: 'bg-amber-50 text-amber-600' },
    { id: 'deep_learning', label: 'Deep Learning', icon: Network, color: 'bg-rose-50 text-rose-600' },
    { id: 'big_data', label: 'Big Data', icon: Binary, color: 'bg-teal-50 text-teal-600' },
    { id: 'data_science', label: 'Data Science', icon: Lightbulb, color: 'bg-indigo-50 text-indigo-600' }
  ]

  const toggleInterest = (id: string) => {
    const newValues = values.includes(id)
      ? values.filter(v => v !== id)
      : [...values, id]
    onChange(newValues)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-slate-900">
          What are your interests?
        </h3>
        <p className="text-sm text-slate-600">
          Select at least 3 topics you're interested in
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {interests.map(({ id, label, icon: Icon, color }) => (
          <motion.button
            key={id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            onClick={() => toggleInterest(id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              values.includes(id) 
                ? 'border-emerald-500 bg-emerald-50/50' 
                : 'border-slate-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-slate-900">{label}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={values.length < 3}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}