import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react'; 
import axios from 'axios'; 
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 2. CONNECT TO BACKEND
      // We pass the token in the URL or the body, depending on your API design
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password`, {
        token,
        password
      });

      if (response.status === 200) {
        alert("Password reset successful! Redirecting to login...");
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to reset password. Link may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    // ... (Keep your "Invalid reset link" view)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Display Error Message if it exists */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              startAdornment={<Lock size={18} />}
            />
            
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              startAdornment={<Lock size={18} />}
              error={password !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : undefined}
            />
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};