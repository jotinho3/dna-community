"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  Search,
  Filter,
  TrendingUp,
  UserPlus,
  UserMinus,
  Loader2,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  role:
    | "data_analyst"
    | "data_scientist"
    | "data_engineer"
    | "bi_analyst"
    | "other";
  languages: string[];
  softwares: string[];
  interests: string[];
  goals: string[];
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
}

interface DiscoveryUser {
  uid: string;
  name: string;
  email: string;
  profile: UserProfile;
  engagement_xp: number;
  created_at: any;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

const ROLE_OPTIONS = [
  { value: "all", label: "Todas as funções" },
  { value: "data_analyst", label: "Analista de Dados" },
  { value: "data_scientist", label: "Cientista de Dados" },
  { value: "data_engineer", label: "Engenheiro de Dados" },
  { value: "bi_analyst", label: "Analista de BI" },
  { value: "other", label: "Outro" },
];

export default function UsersDiscoveryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers(true);
  }, [roleFilter, locationFilter, skillsFilter]);

  const fetchUsers = async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "20",
        ...(user?.uid && { currentUserId: user.uid }),
        ...(roleFilter && { role: roleFilter }),
        ...(locationFilter && { location: locationFilter }),
        ...(skillsFilter && { skills: skillsFilter }),
      });

      const response = await fetch(
        `https://dna-community-back.onrender.com/api/users/profiles?${params}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      const data = await response.json();

      if (reset) {
        setUsers(data.users);
        setPage(2);
      } else {
        setUsers((prev) => [...prev, ...data.users]);
        setPage((prev) => prev + 1);
      }

      setHasMore(data.users.length === 20);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (
    targetUid: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para seguir usuários",
        variant: "destructive",
      });
      return;
    }

    const newFollowingState = new Set(followingUsers);

    try {
      const endpoint = isCurrentlyFollowing
        ? "https://dna-community-back.onrender.com/api/users/unfollow"
        : "https://dna-community-back.onrender.com/api/users/follow";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: user.uid,
          followingId: targetUid,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar seguimento");
      }

      // Atualizar estado local
      if (isCurrentlyFollowing) {
        newFollowingState.delete(targetUid);
      } else {
        newFollowingState.add(targetUid);
      }
      setFollowingUsers(newFollowingState);

      // Atualizar lista de usuários
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUid
            ? {
                ...u,
                isFollowing: !isCurrentlyFollowing,
                followersCount: isCurrentlyFollowing
                  ? u.followersCount - 1
                  : u.followersCount + 1,
              }
            : u
        )
      );

      toast({
        title: "Sucesso",
        description: isCurrentlyFollowing
          ? "Usuário deixou de ser seguido"
          : "Usuário seguido com sucesso",
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a ação",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      data_analyst: "Analista de Dados",
      data_scientist: "Cientista de Dados",
      data_engineer: "Engenheiro de Dados",
      bi_analyst: "Analista de BI",
      other: "Outro",
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Descobrir Profissionais
            </h1>
            <p className="text-lg text-slate-600">
              Conecte-se com outros profissionais de dados
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, bio ou habilidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={roleFilter}
                  onValueChange={(val) =>
                    setRoleFilter(val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Filtrar por localização"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />

                <Input
                  placeholder="Filtrar por habilidades"
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    setRoleFilter("");
                    setLocationFilter("");
                    setSkillsFilter("");
                    setSearchTerm("");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((discoveryUser) => (
                <Card
                  key={discoveryUser.uid}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {discoveryUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${discoveryUser.uid}`}>
                            <h3 className="font-semibold hover:text-emerald-600 cursor-pointer">
                              {discoveryUser.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-slate-600">
                            {getRoleLabel(discoveryUser.profile.role)}
                          </p>
                        </div>
                      </div>

                      {user && user.uid !== discoveryUser.uid && (
                        <Button
                          size="sm"
                          variant={
                            discoveryUser.isFollowing ? "outline" : "default"
                          }
                          onClick={() =>
                            handleFollow(
                              discoveryUser.uid,
                              discoveryUser.isFollowing
                            )
                          }
                        >
                          {discoveryUser.isFollowing ? (
                            <UserMinus className="w-4 h-4" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    {discoveryUser.profile.bio && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {discoveryUser.profile.bio}
                      </p>
                    )}

                    {discoveryUser.profile.location && (
                      <div className="flex items-center text-sm text-slate-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {discoveryUser.profile.location}
                      </div>
                    )}

                    {/* Skills */}
                    {discoveryUser.profile.skills &&
                      discoveryUser.profile.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {discoveryUser.profile.skills
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {discoveryUser.profile.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{discoveryUser.profile.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {discoveryUser.followersCount}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {discoveryUser.engagement_xp}
                        </div>
                      </div>
                      {discoveryUser.profile.skills &&
                        discoveryUser.profile.skills.length > 0 && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {discoveryUser.profile.skills.length}
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <Button onClick={() => fetchUsers(false)} variant="outline">
                  Carregar Mais
                </Button>
              </div>
            )}

            {loading && users.length > 0 && (
              <div className="flex justify-center mt-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-slate-500">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
