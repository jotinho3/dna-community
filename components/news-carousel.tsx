"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  readTime: string;
  publishedAt: string;
  trending: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "OpenAI Releases GPT-5: Revolutionary Breakthrough in AI Reasoning",
    summary:
      "The latest language model shows unprecedented capabilities in mathematical reasoning and code generation, setting new benchmarks across multiple domains.",
    category: "AI & Machine Learning",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "5 min read",
    publishedAt: "2 hours ago",
    trending: true,
  },
  {
    id: "2",
    title: "Google's New Quantum Computer Achieves 1000-Qubit Milestone",
    summary:
      "Breakthrough in quantum computing could revolutionize data processing and machine learning algorithms within the next decade.",
    category: "Quantum Computing",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "7 min read",
    publishedAt: "4 hours ago",
    trending: true,
  },
  {
    id: "3",
    title: "Python 3.13 Released with Major Performance Improvements",
    summary:
      "New version includes significant speed enhancements, better memory management, and improved data science libraries integration.",
    category: "Programming",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "4 min read",
    publishedAt: "6 hours ago",
    trending: false,
  },
  {
    id: "4",
    title: "Meta's New Data Center Uses 100% Renewable Energy for AI Training",
    summary:
      "Sustainable AI infrastructure becomes reality as tech giants invest heavily in green computing solutions for large-scale model training.",
    category: "Sustainability",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "6 min read",
    publishedAt: "8 hours ago",
    trending: false,
  },
  {
    id: "5",
    title: "Real-Time Analytics Market Expected to Reach $15B by 2025",
    summary:
      "Growing demand for instant data insights drives massive investment in streaming analytics and edge computing technologies.",
    category: "Industry Report",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "8 min read",
    publishedAt: "12 hours ago",
    trending: true,
  },
];

export function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentNews = newsItems[currentIndex];

  return (
    <div className="relative w-full mx-auto">
      <Card className="overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-0">
          <div className="relative h-96 lg:h-[500px]">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentNews.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="w-full px-8 lg:px-12">
                <div className="max-w-3xl mx-20">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {currentNews.category}
                    </Badge>
                    {currentNews.trending && (
                      <Badge
                        variant="secondary"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                    {currentNews.title}
                  </h2>

                  <p className="text-lg lg:text-xl text-slate-200 mb-6 leading-relaxed">
                    {currentNews.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-slate-300">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {currentNews.readTime}
                      </div>
                      <span>{currentNews.publishedAt}</span>
                    </div>

                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link href={`/news/${currentNews.id}`}>
                        Read Full Article
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-20"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-20"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 py-4 bg-slate-800">
            {newsItems.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-emerald-500"
                    : "bg-slate-500 hover:bg-slate-400"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-2 py-2">
        {newsItems.slice(0, 5).map((news, index) => (
          <Card
            key={news.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              index === currentIndex ? "ring-2 ring-emerald-500" : ""
            }`}
            onClick={() => goToSlide(index)}
          >
            <CardContent className="p-4">
              <Badge variant="secondary" className="text-xs mb-2">
                {news.category}
              </Badge>
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {news.title}
              </h3>
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="w-3 h-3 mr-1" />
                {news.readTime}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
