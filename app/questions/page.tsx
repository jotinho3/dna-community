import { QuestionsList } from "../../components/QuestionsComponent"

export default function QuestionsPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Perguntas da Comunidade</h1>
      <QuestionsList />
    </div>
  )
}