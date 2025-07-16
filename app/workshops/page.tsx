"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Calendar,
  TrendingUp,
  Brain,
  Database,
  Code,
  BarChart3,
  Zap,
} from "lucide-react"

export default function WorkshopsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen },
    { id: "machine-learning", name: "Machine Learning", icon: Brain },
    { id: "data-science", name: "Data Science", icon: BarChart3 },
    { id: "databases", name: "Databases", icon: Database },
    { id: "programming", name: "Programming", icon: Code },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
    { id: "ai", name: "AI & Deep Learning", icon: Zap },
  ]

  const workshops = [
    {
      id: 1,
      title: "Complete Machine Learning Bootcamp",
      description:
        "Master machine learning from basics to advanced topics including supervised, unsupervised learning, and neural networks.",
      instructor: "Dr. Sarah Chen",
      instructorAvatar: "SC",
      category: "machine-learning",
      level: "intermediate",
      duration: "8 weeks",
      students: 1247,
      rating: 4.9,
      price: 299,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Python", "Scikit-learn", "TensorFlow", "Pandas"],
      startDate: "2024-02-15",
      isLive: true,
      featured: true,
    },
    {
      id: 2,
      title: "SQL for Data Analysis Masterclass",
      description:
        "Learn advanced SQL techniques for data analysis, including window functions, CTEs, and performance optimization.",
      instructor: "Mike Rodriguez",
      instructorAvatar: "MR",
      category: "databases",
      level: "intermediate",
      duration: "4 weeks",
      students: 892,
      rating: 4.8,
      price: 199,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["SQL", "PostgreSQL", "Data Analysis", "Optimization"],
      startDate: "2024-02-20",
      isLive: false,
      featured: false,
    },
    {
      id: 3,
      title: "Python for Data Science Fundamentals",
      description:
        "Start your data science journey with Python. Learn pandas, numpy, matplotlib, and basic statistics.",
      instructor: "Alex Kumar",
      instructorAvatar: "AK",
      category: "programming",
      level: "beginner",
      duration: "6 weeks",
      students: 2156,
      rating: 4.7,
      price: 149,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Python", "Pandas", "NumPy", "Matplotlib"],
      startDate: "2024-02-10",
      isLive: true,
      featured: true,
    },
    {
      id: 4,
      title: "Deep Learning with TensorFlow",
      description:
        "Build and deploy deep learning models using TensorFlow. Cover CNNs, RNNs, and transformer architectures.",
      instructor: "Dr. Emily Zhang",
      instructorAvatar: "EZ",
      category: "ai",
      level: "advanced",
      duration: "10 weeks",
      students: 634,
      rating: 4.9,
      price: 399,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["TensorFlow", "Deep Learning", "Neural Networks", "Computer Vision"],
      startDate: "2024-03-01",
      isLive: false,
      featured: false,
    },
    {
      id: 5,
      title: "Data Visualization with D3.js",
      description: "Create stunning interactive data visualizations using D3.js and modern web technologies.",
      instructor: "Jordan Smith",
      instructorAvatar: "JS",
      category: "analytics",
      level: "intermediate",
      duration: "5 weeks",
      students: 445,
      rating: 4.6,
      price: 249,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["D3.js", "JavaScript", "Visualization", "Web Development"],
      startDate: "2024-02-25",
      isLive: true,
      featured: false,
    },
    {
      id: 6,
      title: "Statistics for Data Science",
      description:
        "Master statistical concepts essential for data science including hypothesis testing, regression, and Bayesian methods.",
      instructor: "Prof. Lisa Wang",
      instructorAvatar: "LW",
      category: "data-science",
      level: "intermediate",
      duration: "7 weeks",
      students: 789,
      rating: 4.8,
      price: 229,
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Statistics", "R", "Hypothesis Testing", "Regression"],
      startDate: "2024-03-05",
      isLive: false,
      featured: true,
    },
  ]

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || workshop.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || workshop.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const featuredWorkshops = workshops.filter((w) => w.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Data Science Workshops</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Level up your data skills with hands-on workshops taught by industry experts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search workshops, topics, or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="all">All Workshops</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={workshop.image || "/placeholder.svg"}
                      alt={workshop.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {workshop.isLive && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        <Play className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                    {workshop.featured && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{workshop.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">{workshop.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {workshop.instructorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        {workshop.instructor}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {workshop.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workshop.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{workshop.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {workshop.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {workshop.students.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-amber-500" />
                        {workshop.rating}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Starts {new Date(workshop.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          workshop.level === "beginner"
                            ? "border-green-200 text-green-700"
                            : workshop.level === "intermediate"
                              ? "border-amber-200 text-amber-700"
                              : "border-red-200 text-red-700"
                        }`}
                      >
                        {workshop.level}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
          
                      <Button className="bg-emerald-600 hover:bg-emerald-700">Enroll Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow border-emerald-200">
                  <div className="relative">
                    <img
                      src={workshop.image || "/placeholder.svg"}
                      alt={workshop.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    {workshop.isLive && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        <Play className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg mb-2">{workshop.title}</CardTitle>
                    <CardDescription className="text-sm">{workshop.description}</CardDescription>

                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {workshop.instructorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        {workshop.instructor}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {workshop.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {workshop.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {workshop.students.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-amber-500" />
                        {workshop.rating}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                     
                      <Button className="bg-emerald-600 hover:bg-emerald-700">Enroll Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredWorkshops.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No workshops found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or browse all workshops.</p>
          </div>
        )}
      </div>
    </div>
  )
}
