import { useState, useEffect } from 'react';

interface User {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  role?: string;
}

interface Mention {
  userId: string;
  userName: string;
}

interface FollowingUser {
  uid: string;
  name: string;
  profile: {
    role: string;
    experience: string;
    interests: string[];
    languages: string[];
    tools: string[];
  };
  followedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export const useMentions = (userId?: string) => {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch following users on mount
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/${userId}/following`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.following && Array.isArray(data.following)) {
            const users = data.following.map((user: FollowingUser) => ({
              uid: user.uid,
              displayName: user.name,
              role: user.profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              photoURL: null
            }));
            setAvailableUsers(users);
            setFilteredUsers(users);
          }
        }
      } catch (error) {
        console.error('Error fetching following users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [userId]);

  const addMention = (user: User) => {
    const isAlreadyMentioned = mentions.some(m => m.userId === user.uid);
    if (isAlreadyMentioned) return;

    const newMention: Mention = {
      userId: user.uid,
      userName: user.displayName
    };
    
    setMentions(prev => [...prev, newMention]);
  };

  const removeMention = (userId: string) => {
    setMentions(prev => prev.filter(mention => mention.userId !== userId));
  };

  const filterUsers = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredUsers(availableUsers);
      return;
    }

    const filtered = availableUsers.filter(user => 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !mentions.some(m => m.userId === user.uid)
    );
    setFilteredUsers(filtered);
  };

  const clearMentions = () => {
    setMentions([]);
  };

  return {
    mentions,
    availableUsers,
    filteredUsers,
    isLoading,
    addMention,
    removeMention,
    filterUsers,
    clearMentions
  };
};