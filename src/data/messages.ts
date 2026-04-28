import { Message, ChatConversation } from '../types';

export const messages: Message[] = [
  {
    id: 'm1',
    senderId: 'e1',
    receiverId: 'i1',
    content: 'Thanks for connecting. I’d love to discuss the AI platform.',
    timestamp: '2023-08-15T10:15:00Z',
    isRead: true
  }
];

export const getMessagesBetweenUsers = (user1Id: string, user2Id: string): Message[] => {
  return messages.filter(
    m => (m.senderId === user1Id && m.receiverId === user2Id) || 
         (m.senderId === user2Id && m.receiverId === user1Id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getConversationsForUser = (userId: string): ChatConversation[] => {
  const partners = new Set<string>();
  messages.forEach(m => {
    if (m.senderId === userId) partners.add(m.receiverId);
    if (m.receiverId === userId) partners.add(m.senderId);
  });
  if (partners.size === 0) partners.add('i1'); 

  return Array.from(partners).map(pId => {
    const chatHistory = getMessagesBetweenUsers(userId, pId);
    const lastM = chatHistory[chatHistory.length - 1] || { content: 'No messages', timestamp: new Date().toISOString() };
    return {
      id: `conv-${userId}-${pId}`,
      participants: [userId, pId],
      lastMessage: lastM as Message,
      updatedAt: lastM.timestamp
    };
  });
};

export const sendMessage = (newMessage: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Message => {
  const message: Message = { ...newMessage, id: `m${Date.now()}`, timestamp: new Date().toISOString(), isRead: false };
  messages.push(message);
  return message;
};