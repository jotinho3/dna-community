import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { useState } from "react"

interface StepTechStackProps {
  languages: string[]
  tools: string[]
  onChange: (field: 'languages' | 'tools', values: string[]) => void
  onBack: () => void
  onComplete: () => void
}

export function StepTechStack({ languages, tools, onChange, onBack, onComplete }: StepTechStackProps) {
  const [activeTab, setActiveTab] = useState<'languages' | 'tools'>('languages')
  const [searchQuery, setSearchQuery] = useState('')

  const techOptions = {
    languages: [
      'Python', 'R', 'SQL', 'Java', 'Scala', 'Julia',
      'JavaScript', 'TypeScript', 'C++', 'MATLAB'
    ],
    tools: [
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
      'Docker', 'Kubernetes', 'AWS', 'Azure',
      'Tableau', 'Power BI', 'Jupyter', 'VS Code',
      'Git', 'Apache Spark', 'Hadoop', 'MongoDB'
    ]
  }

  const filteredOptions = techOptions[activeTab].filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelection = (option: string) => {
    const currentValues = activeTab === 'languages' ? languages : tools
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option]
    onChange(activeTab, newValues)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-slate-900">
          Your Tech Stack
        </h3>
        <p className="text-sm text-slate-600">
          Select the technologies you use or want to learn
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          {(['languages', 'tools'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <motion.div 
          className="grid grid-cols-2 gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {filteredOptions.map((option) => (
            <motion.div
              key={option}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
            >
              <Badge
                variant="outline"
                className={`w-full py-2 text-sm cursor-pointer transition-all ${
                  (activeTab === 'languages' ? languages : tools).includes(option)
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'hover:border-emerald-200'
                }`}
                onClick={() => toggleSelection(option)}
              >
                {option}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onComplete}
          disabled={languages.length === 0 || tools.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  )
}