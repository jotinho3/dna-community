import { ThumbsUp, Heart, Smile } from "lucide-react"
import { useAuth } from "../app/context/AuthContext"
import { useState } from "react"

const emojis = [
  { icon: <ThumbsUp />, value: "like" },
  { icon: <Heart />, value: "love" },
  { icon: <Smile />, value: "smile" }
]

export function Reactions({ targetId, targetType, reactions, onReacted }: {
  targetId: string,
  targetType: "question" | "answer",
  reactions: any[],
  onReacted?: (newReactions: any[]) => void
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleReact = async (reactionType: string) => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/${targetType === "question" ? "questions" : "answers"}/reaction/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType, reactionType }),
      })
      const data = await res.json()
      if (onReacted) onReacted(data.reactions)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {emojis.map(e => (
        <button
          key={e.value}
          className={`p-2 rounded-full border ${reactions?.some(r => r.userId === user?.uid && r.type === e.value) ? "bg-emerald-100" : ""}`}
          onClick={() => handleReact(e.value)}
          disabled={loading}
          type="button"
        >
          {e.icon} <span className="ml-1 text-xs">{reactions?.filter(r => r.type === e.value).length || 0}</span>
        </button>
      ))}
    </div>
  )
}