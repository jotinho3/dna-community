"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";

interface ReactionsProps {
  targetId: string;
  targetType: "question" | "answer";
  reactions: any[];
  onReacted: (newReactions: any[]) => void;
}

export function Reactions({ targetId, targetType, reactions, onReacted }: ReactionsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Calculate vote counts
  const upvotes = reactions?.filter(r => r.type === 'upvote').length || 0;
  const downvotes = reactions?.filter(r => r.type === 'downvote').length || 0;
  const score = upvotes - downvotes;

  // Check current user's vote
  const userReaction = reactions?.find(r => r.userId === user?.uid);
  const hasUpvoted = userReaction?.type === 'upvote';
  const hasDownvoted = userReaction?.type === 'downvote';

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user?.uid || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/qa/${user.uid}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetId,
            targetType,
            type: voteType,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onReacted(data.reactions || []);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!user?.uid || !userReaction || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/qa/${user.uid}/reactions/${userReaction.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const data = await response.json();
        onReacted(data.reactions || []);
      }
    } catch (error) {
      console.error('Failed to remove vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      handleRemoveVote();
    } else {
      handleVote('upvote');
    }
  };

  const handleDownvote = () => {
    if (hasDownvoted) {
      handleRemoveVote();
    } else {
      handleVote('downvote');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="flex flex-col items-center bg-slate-50 rounded-lg p-2">
          <ChevronUp className="w-6 h-6 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{score}</span>
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
        <span className="text-xs text-slate-500">Login to vote</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="flex flex-col items-center bg-slate-50 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUpvote}
          disabled={loading}
          className={`p-1 h-auto hover:bg-emerald-100 ${
            hasUpvoted 
              ? 'text-emerald-600 bg-emerald-50' 
              : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
        
        <span className={`text-sm font-medium px-2 ${
          score > 0 ? 'text-emerald-600' : 
          score < 0 ? 'text-red-500' : 
          'text-slate-600'
        }`}>
          {score}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownvote}
          disabled={loading}
          className={`p-1 h-auto hover:bg-red-100 ${
            hasDownvoted 
              ? 'text-red-600 bg-red-50' 
              : 'text-slate-600 hover:text-red-600'
          }`}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
      </div>
      
      {loading && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600"></div>
      )}
    </div>
  );
}