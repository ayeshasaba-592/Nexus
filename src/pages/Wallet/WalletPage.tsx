import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, History, Landmark, ArrowRightLeft } from 'lucide-react';
import API from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const WalletPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper for professional currency formatting
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get('/transactions/history');
      setHistory(res.data);
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleAction = async (type: 'deposit' | 'withdraw' | 'transfer') => {
    if (!amount || isNaN(Number(amount))) return alert("Enter valid amount");

    let recipient = '';
    
    if (type === 'transfer') {
      recipient = prompt("Enter Recipient Email or Wallet ID:") || '';
      if (!recipient) return;

      const userOTP = prompt("SECURITY CHECK: Enter the 6-digit OTP sent to your email (Demo Code: 123456)");
      
      if (userOTP !== "123456") {
        return alert("Invalid OTP. Transfer cancelled for security.");
      }
    }

    setLoading(true);
    try {
      const res = await API.post(`/transactions/${type}`, { 
        amount: Number(amount), 
        recipient 
      });
      
      setAmount('');
      await fetchHistory(); 
      alert(`${type.toUpperCase()} Successful!`);
    } catch (err) {
      console.error(err);
      alert("Transaction Failed: Please check your balance or connection.");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = history.reduce((acc, tx) => 
    tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount, 0
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Vault</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Available Balance</p>
          <h2 className="text-4xl font-black text-blue-600">{formatCurrency(totalBalance)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-50 shadow-sm">
          <CardBody className="p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Landmark size={20}/> Quick Actions</h3>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full p-3 border rounded-xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => handleAction('deposit')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-xs px-2 transition-all">
                {loading ? "..." : <><ArrowUpCircle className="mr-1" size={14}/> Deposit</>}
              </Button>
              <Button onClick={() => handleAction('withdraw')} variant="outline" disabled={loading} className="text-xs px-2 transition-all">
                {loading ? "..." : <><ArrowDownCircle className="mr-1" size={14}/> Withdraw</>}
              </Button>
              <Button onClick={() => handleAction('transfer')} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 transition-all">
                {loading ? "Wait" : <><ArrowRightLeft className="mr-1" size={14}/> Transfer</>}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><History size={20}/> Recent Activity</h3>
            <div className="space-y-3 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-center text-gray-400 mt-10">No transactions yet.</p>
              ) : (
                history.map((tx) => (
                  <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-bold capitalize flex items-center gap-2 text-sm">
                        {tx.type} 
                        {tx.recipient && <span className="text-[10px] font-normal text-blue-600 bg-blue-50 px-1 rounded">to: {tx.recipient}</span>}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Completed</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};