import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { Investor } from '../../types';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const token = localStorage.getItem('token');
        let responseData: any = null;

        // 1. Try the new route we added to auth.js
        const res = await fetch('http://localhost:5000/api/auth/users', {
          headers: { 'x-auth-token': token || '' },
        });

        if (res.ok) {
          responseData = await res.json();
        } else {
          // 2. Backup: Try the profile route if auth/users isn't ready
          const backupRes = await fetch('http://localhost:5000/api/profile/all', {
            headers: { 'x-auth-token': token || '' },
          });
          if (backupRes.ok) {
            responseData = await backupRes.json();
          }
        }

        if (responseData) {
          console.log("Data loaded successfully:", responseData);
          // Standardize the list format
          const allData = Array.isArray(responseData) ? responseData : (responseData.users || responseData.profiles || []);
          // Filter by 'investor' role from your MongoDB screenshot
          const filtered = allData.filter((u: any) => u.role === 'investor');
          setInvestors(filtered);
        }

      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, []);

  const filteredInvestors = investors.filter((investor) =>
    (investor.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Syncing with Nexus Database...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with verified investors in the network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><h2 className="text-lg font-medium">Database Status</h2></CardHeader>
            <CardBody>
               <p className="text-sm text-green-600 font-bold">● Connected</p>
               <p className="text-xs text-gray-500 mt-1">Investors found: {investors.length}</p>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInvestors.length > 0 ? (
              filteredInvestors.map((investor) => (
                <InvestorCard key={investor._id || investor.id} investor={investor} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white border-2 border-dashed rounded-xl">
                <p className="text-gray-500 font-semibold">No Investors Found</p>
                <p className="text-sm text-gray-400">Check that "Testinvestor" has the role "investor" in MongoDB.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};