import React from 'react';
import { Bell, Video, DollarSign, ShieldCheck } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const notifications = [
  {
    id: 1,
    type: 'security',
    user: {
      name: 'Security Vault',
      icon: <ShieldCheck size={16} className="text-purple-600" />
    },
    content: 'Transaction authorized successfully via 6-digit OTP verification.',
    time: 'Just now',
    unread: true
  },
  {
    id: 2,
    type: 'meeting',
    user: {
      name: 'Meeting System',
      icon: <Video size={16} className="text-blue-600" />
    },
    content: 'Meeting status updated to "Accepted". Video room is now active.',
    time: '12 minutes ago',
    unread: true
  },
  {
    id: 3,
    type: 'wallet',
    user: {
      name: 'Finance Hub',
      icon: <DollarSign size={16} className="text-green-600" />
    },
    content: 'Wallet balance refreshed. Recent transaction has been logged in history.',
    time: '1 hour ago',
    unread: false
  }
];

export const NotificationsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
        </div>
        
        <Button variant="outline" size="sm" className="font-bold border-2">
          Clear All
        </Button>
      </div>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <Card
            key={notification.id}
            className={`border-l-4 transition-all ${
              notification.unread ? 'bg-blue-50 border-l-blue-600' : 'bg-white border-l-gray-200'
            }`}
          >
            <CardBody className="flex items-start p-5">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 border border-gray-100">
                {notification.user.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-800 uppercase text-xs tracking-widest">
                    {notification.user.name}
                  </span>
                  {notification.unread && (
                    <Badge className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5">New</Badge>
                  )}
                </div>
                
                <p className="text-gray-700 mt-1 font-medium">
                  {notification.content}
                </p>
                
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                  {notification.time}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};