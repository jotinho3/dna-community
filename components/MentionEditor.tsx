import React, { useState } from 'react';
import { X, Search, User } from 'lucide-react';
import { useMentions } from '../hooks/useMentions';

interface MentionEditorProps {
  value: string;
  userId?: string;
  onChange: (text: string) => void;
  onMentionsChange: (mentions: Array<{ userId: string; userName: string }>) => void;
  placeholder?: string;
  className?: string;
}

const MentionEditor: React.FC<MentionEditorProps> = ({
  value,
  userId,
  onChange,
  onMentionsChange,
  placeholder = 'Digite sua mensagem...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const {
    mentions,
    filteredUsers,
    isLoading,
    addMention,
    removeMention,
    filterUsers
  } = useMentions(userId);

  // Notify parent when mentions change
  React.useEffect(() => {
    onMentionsChange(mentions);
  }, [mentions, onMentionsChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterUsers(term);
    setShowDropdown(true);
  };

  const handleUserSelect = (user: any) => {
    addMention(user);
    setSearchTerm('');
    setShowDropdown(false);
    filterUsers(''); // Reset filter
  };

  const handleRemoveMention = (userId: string) => {
    removeMention(userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main textarea */}
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={6}
        />
      </div>

      {/* Mention input section */}
      <div className="border-t pt-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User size={16} />
            Mention Users
          </label>
          
          {/* Search input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search users to mention..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-gray-500">
                    Loading users...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="p-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.uid}
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.displayName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {user.displayName}
                          </div>
                          {user.role && (
                            <div className="text-sm text-gray-500 truncate">
                              {user.role}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {searchTerm ? 'No users found' : 'Type to search users'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Click outside to close dropdown */}
          {showDropdown && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>

        {/* Selected mentions */}
        {mentions.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Mentioned Users ({mentions.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {mentions.map((mention) => (
                <div
                  key={mention.userId}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>@{mention.userName}</span>
                  <button
                    onClick={() => handleRemoveMention(mention.userId)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    type="button"
                    aria-label={`Remove mention of ${mention.userName}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentionEditor;