import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, Clock } from 'lucide-react';
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import API from '../../services/api';

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  // State for the specific meeting date/time
  const [selectedDate, setSelectedDate] = useState('');
  
  const handleViewProfile = () => {
    navigate(`/profile/investor/${investor._id || investor.id}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    navigate(`/chat/${investor._id || investor.id}`);
  };

  const handleRequestMeeting = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedDate) {
      alert("Please select a date and time for the meeting first.");
      return;
    }

    try {
      await API.post('/meetings/request', {
        recipientId: investor._id || investor.id,
        title: "Partnership Discussion",
        date: new Date(selectedDate).toISOString() // Sends the user-selected time
      });
      // FIXED: Using investor.name directly to avoid "undefined"
      alert(`Meeting request scheduled for ${new Date(selectedDate).toLocaleString()} sent to ${investor.name}!`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || "Failed to send request";
      alert(errorMsg);
    }
  };

  return (
    <Card 
      hoverable 
      className="transition-all duration-300 h-full"
      onClick={handleViewProfile}
    >
      <CardBody className="flex flex-col">
        <div className="flex items-start">
          <Avatar
            src={investor.avatarUrl}
            alt={investor.name}
            size="lg"
            status={investor.isOnline ? 'online' : 'offline'}
            className="mr-4"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
            <p className="text-sm text-gray-500 mb-2">Investor • {investor.totalInvestments || 0} investments</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {(investor.investmentStage || []).map((stage, index) => (
                <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scheduling UI Section */}
        {showActions && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-bold text-blue-700 uppercase mb-2 flex items-center">
              <Clock size={12} className="mr-1" /> Schedule Meeting
            </label>
            <input 
              type="datetime-local" 
              className="w-full text-sm p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)} // Prevents picking past dates
            />
          </div>
        )}

        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Investment Interests</h4>
          <div className="flex flex-wrap gap-2">
            {(investor.investmentInterests || []).map((interest, index) => (
              <Badge key={index} variant="primary" size="sm">{interest}</Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-2">{investor.bio || "No bio available."}</p>
        </div>
      </CardBody>
      
      {showActions && (
        <CardFooter className="border-t border-gray-100 bg-gray-50 flex flex-col gap-2 p-3">
          <div className="flex justify-between w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              leftIcon={<Calendar size={16} />}
              onClick={handleRequestMeeting}
            >
              Connect
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};