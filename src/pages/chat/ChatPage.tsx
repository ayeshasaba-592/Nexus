import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Video, Phone, MoreVertical, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { getMessagesBetweenUsers, sendMessage } from '../../data/messages';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Message } from '../../types';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatPartner = userId ? findUserById(userId) : null;

  // 1. Sync messages when user or recipient changes
  useEffect(() => {
    if (currentUser && userId) {
      const history = getMessagesBetweenUsers(currentUser.id, userId);
      setMessages(history);
    }
  }, [currentUser, userId]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !userId) return;

    const newMsg = sendMessage({
      senderId: currentUser.id,
      receiverId: userId,
      content: input
    });

    setMessages([...messages, newMsg]);
    setInput('');
  };

  if (!currentUser || !chatPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>User not found.</p>
        <Button onClick={() => navigate('/messages')} variant="ghost">Back to Messages</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <Avatar src={chatPartner.avatarUrl} alt={chatPartner.name} size="md" status={chatPartner.isOnline ? 'online' : 'offline'} />
          <div>
            <h2 className="font-bold text-gray-900 leading-none">{chatPartner.name}</h2>
            <span className="text-xs text-green-500 font-medium">{chatPartner.isOnline ? 'Active Now' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="rounded-full text-gray-500"><Phone size={18} /></Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full text-blue-600 hover:bg-blue-50"
            onClick={() => window.open(`https://meet.jit.si/Nexus-Meeting-${userId}`, '_blank')}
          >
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-gray-500"><MoreVertical size={18} /></Button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
        {messages.map((m) => (
          <ChatMessage 
            key={m.id} 
            message={m} 
            isCurrentUser={m.senderId === currentUser.id} 
          />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Footer */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={onSend} className="flex gap-2">
          <input
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};