import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getConversationsForUser } from '../../data/messages';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { MessageSquare } from 'lucide-react';
import { ChatConversation } from '../../types';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  
  useEffect(() => {
    if (user) {
      setConversations(getConversationsForUser(user.id));
    }
  }, [user]);

  if (!user) return null;
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-black">Messages</h1>
      <div className="bg-white rounded-2xl border min-h-[400px]">
        {conversations.length > 0 ? (
          <ChatUserList conversations={conversations} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <MessageSquare size={48} className="text-gray-300 mb-2" />
            <p className="text-gray-500">No conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};