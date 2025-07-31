'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, CheckCircle, MessageCircle, ThumbsUp } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  title: string
  authorName: string
  authorAvatar?: string
  tags: string[]
  answersCount: number
  reactions: any[]
  createdAt: string
  isResolved: boolean
}

export function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch questions
  useEffect(() => {
    setLoading(true)
    setError(null)
    let url = `http://localhost:8080/api/qa/questions?limit=10&page=${page}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (tagFilter) url += `&tags=${encodeURIComponent(tagFilter)}`
    if (resolvedFilter === "resolved") url += `&resolved=true`
    if (resolvedFilter === "unresolved") url += `&resolved=false`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (page === 1) {
          setQuestions(data.questions)
        } else {
          setQuestions(prev => [...prev, ...data.questions])
        }
        setHasMore(data.pagination?.hasMore)
      })
      .catch(() => setError("Erro ao carregar perguntas"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line
  }, [search, tagFilter, resolvedFilter, page])

  // Unique tags for filter UI
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)))

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Input
          className="w-64"
          placeholder="Buscar por título, conteúdo ou tag..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={resolvedFilter === "all" ? "default" : "outline"}
            onClick={() => { setResolvedFilter("all"); setPage(1) }}
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={resolvedFilter === "resolved" ? "default" : "outline"}
            onClick={() => { setResolvedFilter("resolved"); setPage(1) }}
          >
            Resolvidas
          </Button>
          <Button
            size="sm"
            variant={resolvedFilter === "unresolved" ? "default" : "outline"}
            onClick={() => { setResolvedFilter("unresolved"); setPage(1) }}
          >
            Não resolvidas
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {allTags.map(tag => (
            <Badge
              key={tag}
              className={`cursor-pointer ${tagFilter === tag ? "bg-emerald-600 text-white" : ""}`}
              onClick={() => {
                setTagFilter(tagFilter === tag ? null : tag)
                setPage(1)
              }}
            >
              {tag}
            </Badge>
          ))}
          {tagFilter && (
            <Button size="sm" variant="ghost" onClick={() => { setTagFilter(null); setPage(1) }}>
              Limpar tag
            </Button>
          )}
        </div>
      </div>

      {/* Lista de perguntas */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-emerald-500" /></div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : questions.length === 0 ? (
        <div className="text-slate-500 text-center py-10">Nenhuma pergunta encontrada.</div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <Link key={q.id} href={`/questions/${q.id}`} className="block">
              <div className="border rounded-lg p-4 hover:shadow transition bg-white flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-slate-800">{q.title}</span>
                    {q.isResolved && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {q.tags.map(tag => (
                      <Badge key={tag} className="bg-emerald-100 text-emerald-700">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>por {q.authorName}</span>
                    <span>• {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[90px]">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>{q.answersCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span>{q.reactions?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Paginação */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-6">
          <Button onClick={() => setPage(page + 1)} variant="outline">
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  )
}