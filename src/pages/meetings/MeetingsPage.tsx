import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Clock, User, Calendar as CalendarIcon, CheckCircle, Video } from 'lucide-react'; // Added Video icon
import { useNavigate } from 'react-router-dom'; // Added for navigation
import API from '../../services/api';
import './CalendarCustom.css';
import { Button } from '../../components/ui/Button'; // Import your Button component

interface Meeting {
  _id: string;
  title: string;
  date: string;
  status: string;
  requester: { name: string; _id: string };
  recipient: { name: string; _id: string };
}

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await API.get('/meetings/me');
        setMeetings(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const meetingsOnSelectedDate = meetings.filter(m => 
    new Date(m.date).toDateString() === selectedDate.toDateString()
  );

  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const hasMeeting = meetings.some(m => new Date(m.date).toDateString() === date.toDateString());
      return hasMeeting ? <div className="dot"></div> : null;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meeting Schedule</h1>
        <Badge variant="success">{acceptedMeetings.length} Confirmed</Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-4 shadow-sm">
          <Calendar 
            onChange={(val) => setSelectedDate(val as Date)} 
            value={selectedDate}
            tileContent={tileContent}
            className="border-none w-full"
          />
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <CalendarIcon size={18} className="text-primary-600" />
             <h3 className="font-semibold text-gray-700">
               Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </h3>
          </div>
          
          {meetingsOnSelectedDate.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
              No meetings scheduled for this specific day.
            </div>
          ) : (
            meetingsOnSelectedDate.map(meeting => (
              <Card key={meeting._id} className="border-l-4 border-l-primary-500">
                <CardBody className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">{meeting.title}</h4>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center"><User size={14} className="mr-1"/> {meeting.requester.name}</span>
                      <span className="flex items-center"><Clock size={14} className="mr-1"/> {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Add Join button even in day view if accepted */}
                    {meeting.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        variant="primary"
                        leftIcon={<Video size={14} />}
                        onClick={() => navigate(`/video-call/${meeting._id}`)}
                      >
                        Join
                      </Button>
                    )}
                    <Badge variant={meeting.status === 'accepted' ? 'success' : 'warning'}>
                      {meeting.status}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          Confirmed Collaborations
        </h2>
        
        {acceptedMeetings.length === 0 ? (
          <p className="text-gray-500">No confirmed meetings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedMeetings.map(meeting => (
              <Card key={meeting._id} className="bg-green-50/50 border-green-100">
                <CardBody>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{meeting.title}</h4>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Collaboration with <strong>{meeting.requester.name}</strong>
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center text-sm font-medium text-primary-700 bg-white p-2 rounded border border-primary-100">
                      <CalendarIcon size={16} className="mr-2" />
                      {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>

                    {/* MILESTONE 4: THE VIDEO CALL TRIGGER */}
                    <Button 
                      fullWidth 
                      variant="primary"
                      leftIcon={<Video size={18} />}
                      onClick={() => navigate(`/video-call/${meeting._id}`)}
                    >
                      Enter Video Chamber
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};