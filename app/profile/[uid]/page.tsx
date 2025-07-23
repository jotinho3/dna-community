"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Globe,
  Calendar,
  Award,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Edit,
  Star,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Zap,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  role: string;
  languages: string[];
  experience: string;
  tools: string[];
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

interface ProfileUser {
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

const toDate = (timestamp: any) => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp._seconds)
    return new Date(timestamp._seconds * 1000);
  return null;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uid } = React.use(params);

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("about");

  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    fetchUserProfile();
  }, [uid, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${uid}/profile?currentUserId=${user?.uid}`
      );

      if (!response.ok) {
        throw new Error("Usuário não encontrado");
      }

      const data = await response.json();
      setProfileUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/users/${uid}/followers`);
      const data = await response.json();
      setFollowers(data.followers || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/users/${uid}/following`);
      const data = await response.json();
      setFollowing(data.following || []);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para seguir usuários",
        variant: "destructive",
      });
      return;
    }

    setFollowLoading(true);
    try {
      const endpoint = profileUser?.isFollowing
        ? "/api/users/unfollow"
        : "/api/users/follow";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerId: user.uid,
          followingId: uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar seguimento");
      }

      // Atualizar estado local
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
              followersCount: prev.isFollowing
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }
          : null
      );

      toast({
        title: "Sucesso",
        description: profileUser?.isFollowing
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
    } finally {
      setFollowLoading(false);
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

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <Github className="w-4 h-4" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Usuário não encontrado
          </h2>
          <p className="text-slate-600">
            Este perfil não existe ou não está disponível.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                {profileUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    {profileUser.name}
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    {getRoleLabel(profileUser.profile.role)}
                  </p>
                </div>

                <div className="flex gap-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Button asChild>
                      <Link href="/profile/edit">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={profileUser.isFollowing ? "outline" : "default"}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : profileUser.isFollowing ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {profileUser.isFollowing ? "Deixar de seguir" : "Seguir"}
                    </Button>
                  )}
                </div>
              </div>

              {profileUser.profile.bio && (
                <p className="text-slate-700 mt-4 max-w-2xl">
                  {profileUser.profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                {profileUser.profile.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profileUser.profile.location}
                  </div>
                )}
                {profileUser.profile.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a
                      href={profileUser.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      {profileUser.profile.website.replace(/https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since &nbsp;
                  <p>{toDate(profileUser.created_at)?.toLocaleDateString()}</p>


                </div>
              </div>

              {/* Social Links */}
              {profileUser.profile.socialLinks &&
                Object.keys(profileUser.profile.socialLinks).length > 0 && (
                  <div className="flex gap-3 mt-4">
                    {Object.entries(profileUser.profile.socialLinks).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-emerald-600 transition-colors"
                          >
                            {getSocialIcon(platform)}
                          </a>
                        )
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <Zap className="w-5 h-5 mr-2 text-purple-600" />
      Engagement Level
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between mb-2">
      <div className="text-2xl font-bold text-purple-600">
        Level {Math.floor((profileUser.engagement_xp || 0) / 100)}
      </div>
      <span className="text-sm text-slate-500">
        {profileUser.engagement_xp % 100}/100 XP
      </span>
    </div>
    <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{
          width: `${(profileUser.engagement_xp % 100)}%`
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full bg-purple-500"
      />
    </div>
  </CardContent>
</Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Seguidores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Seguidores</span>
                  <span className="font-semibold">
                    {profileUser.followersCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Seguindo</span>
                  <span className="font-semibold">
                    {profileUser.followingCount}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {profileUser.profile.skills &&
              profileUser.profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-amber-500" />
                      Habilidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.profile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-amber-100 text-amber-700"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="followers">Seguidores</TabsTrigger>
                <TabsTrigger value="following">Seguindo</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil Técnico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                          Linguagens
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.profile.languages?.map((lang, index) => (
                            <Badge key={index} variant="outline">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                          Ferramentas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.profile.tools?.map((tool, index) => (
                            <Badge key={index} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                          Interesses
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.profile.interests?.map(
                            (interest, index) => (
                              <Badge key={index} variant="outline">
                                {interest.replace(/_/g, " ")}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                          Experiência
                        </h4>
                        <Badge
                          variant="secondary"
                          className="bg-sky-100 text-sky-700 capitalize"
                        >
                          {profileUser.profile.experience || "Não informado"}
                        </Badge>
                      </div>

                      {isOwnProfile && (
                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">
                            E-mail
                          </h4>
                          <p className="text-slate-700 text-sm">
                            {profileUser.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {profileUser.profile.bio && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">
                          Biografia
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {profileUser.profile.bio}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="followers" className="space-y-4">
                <Button
                  onClick={fetchFollowers}
                  className="mb-4"
                  disabled={followers.length > 0}
                >
                  {followers.length > 0
                    ? "Seguidores carregados"
                    : "Carregar Seguidores"}
                </Button>

                {followers.map((follower, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {follower.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/profile/${follower.uid}`}>
                          <h3 className="font-semibold hover:text-emerald-600 cursor-pointer">
                            {follower.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-600">
                          {getRoleLabel(follower.profile?.role)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="following" className="space-y-4">
                <Button
                  onClick={fetchFollowing}
                  className="mb-4"
                  disabled={following.length > 0}
                >
                  {following.length > 0
                    ? "Seguindo carregados"
                    : "Carregar Seguindo"}
                </Button>

                {following.map((followedUser, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {followedUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/profile/${followedUser.uid}`}>
                          <h3 className="font-semibold hover:text-emerald-600 cursor-pointer">
                            {followedUser.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-600">
                          {getRoleLabel(followedUser.profile?.role)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
