import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rocket, MapPin, Save, UserCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    const fetchEntrepreneur = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/profile/user/${id}`, {
          headers: { 'x-auth-token': token || '' },
        });
        const data = await res.json();
        setEntrepreneur(data);
        setEditedBio(data.bio || '');
        setEditedLocation(data.location || '');
      } catch (error) {
        console.error('Failed to fetch entrepreneur:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEntrepreneur();
  }, [id]);

  const handleSave = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // 1. Direct fetch to your specific update route
    const res = await fetch(`http://localhost:5000/api/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
      },
      // 2. Matching your backend: userId, bio, and location
      body: JSON.stringify({ 
        userId: id, // This comes from useParams
        bio: editedBio,
        location: editedLocation || ( entrepreneur?.location)
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // 3. Update local state so UI changes immediately
      if (entrepreneur) setEntrepreneur(data);
      
      setIsEditing(false);
      alert("Successfully saved to MongoDB!");
    } else {
      // This will tell us exactly why the backend rejected it
      alert(`Backend Error: ${data.msg || 'Check console'}`);
      console.error("Server responded with:", data);
    }
  } catch (error) {
    console.error('Network error - check if backend is running:', error);
    alert("Could not connect to server.");
  }
};

  if (loading) return <div className="text-center py-12"><h2>Loading...</h2></div>;
  if (!entrepreneur) return <div className="text-center py-12"><h2>Startup not found</h2></div>;

  const isCurrentUser = true; // Kept as true for your Milestone demo

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="xl" />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.startupName || 'Startup Name'}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Rocket size={16} className="mr-1" />
                Founded by {entrepreneur.name}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{entrepreneur.industry || 'Technology'}</Badge>
                <Badge variant="secondary">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location || 'Global'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 flex gap-2">
            {isCurrentUser ? (
              !isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button leftIcon={<Save size={18} />} onClick={handleSave}>Save</Button>
                </>
              )
            ) : (
              <Link to={`/chat/${entrepreneur._id || entrepreneur.id}`}>
                <Button>Message</Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">About Startup</h2></CardHeader>
            <CardBody className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      className="w-full p-2 border border-gray-300 rounded-md mb-3"
                      value={editedLocation}
                      onChange={(e) => setEditedLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio/Description</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      rows={4} 
                      value={editedBio} 
                      onChange={(e) => setEditedBio(e.target.value)} 
                    />
                  </div>
                </>
              ) : (
                <p>{entrepreneur.bio || 'No description available.'}</p>
              )}
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardHeader><h2 className="text-lg font-medium text-gray-900">Funding Needed</h2></CardHeader>
          <CardBody>
            <p className="text-2xl font-bold text-primary-700">{entrepreneur.fundingNeeded || 'Undisclosed'}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};