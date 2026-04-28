import React, { useState, useRef } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Camera, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast'; // Optional: for success/error popups

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth() as any; // Assuming your AuthContext has updateProfile
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local states for the form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: "San Francisco, CA",
    bio: user?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!user) return null;

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Picture Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // The Actual Database Save Function
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Logic for Database Update
      // If using Firebase/MongoDB, you'd send formData + previewImage here
      await updateProfile({
        ...formData,
        avatarUrl: previewImage || user.avatarUrl
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium">Manage your account preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation - Same as before */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {['Profile', 'Security', 'Notifications', 'Language', 'Appearance', 'Billing'].map((item, idx) => (
                <button 
                  key={item}
                  className={`flex items-center w-full px-3 py-2 text-sm font-bold rounded-xl transition-colors ${idx === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {item === 'Profile' && <User size={18} className="mr-3" />}
                  {item === 'Security' && <Lock size={18} className="mr-3" />}
                  {item}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>
        
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card className="border-2 border-gray-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Profile Details</h2>
            </CardHeader>
            <CardBody className="space-y-8 p-8">
              
              {/* Profile Picture Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                <div className="relative group">
                  <Avatar
                    src={previewImage || user.avatarUrl}
                    alt={user.name}
                    size="xl"
                    className="ring-4 ring-white shadow-2xl"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white" size={24} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-gray-900">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mb-3">JPG or PNG. Max 800KB.</p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Upload New Image
                  </Button>
                </div>
              </div>
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="font-medium"
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="font-medium"
                />
                
                <Input
                  label="Current Role"
                  value={user.role}
                  disabled
                  className="bg-gray-50 cursor-not-allowed opacity-70"
                />
                
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
                  Bio / Business Summary
                </label>
                <textarea
                  name="bio"
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 transition-all"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your background..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="font-bold">Discard Changes</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};