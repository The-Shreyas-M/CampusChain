import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import StudentPanel from './components/StudentPanel';
import MerchantPanel from './components/MerchantPanel';
import Ledger from './components/Ledger';
import PinPad from './components/PinPad';

const App = () => {
  // --- CORE STATE ---
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('cc_users')) || [
    { id: 'admin', role: 'admin', name: 'University Admin', pin: '1234' },
    { id: '23104188', role: 'student', name: 'Shreyas', balances: { GENERAL: 700, CANTEEN: 100 }, pin: '1234' },
    { id: 'M-999', role: 'merchant', name: 'Campus Canteen', balance: 0, pin: '1234' },
    { id: 'C-777', role: 'club', name: 'Robotics Club', balances: { GENERAL: 0 }, pin: '1234' } // Added example club
  ]);
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('cc_active_id'));
  const [treasury, setTreasury] = useState(Number(localStorage.getItem('cc_treasury')) || 1000000);
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('cc_tx')) || []);
  const [requests, setRequests] = useState(JSON.parse(localStorage.getItem('cc_req')) || []);
  
  // --- AUTH STATE ---
  const [auth, setAuth] = useState({ show: false, action: null, targetPin: "" });

  useEffect(() => {
    localStorage.setItem('cc_users', JSON.stringify(users));
    localStorage.setItem('cc_treasury', treasury);
    localStorage.setItem('cc_tx', JSON.stringify(transactions));
    localStorage.setItem('cc_req', JSON.stringify(requests));
    if (activeUserId) localStorage.setItem('cc_active_id', activeUserId);
    else localStorage.removeItem('cc_active_id');
  }, [users, treasury, transactions, requests, activeUserId]);

  const currentUser = useMemo(() => users.find(u => u.id === activeUserId), [users, activeUserId]);

  // --- CORE LOGIC ---
  const addTx = (f, t, a, c, s) => setTransactions([{ id: Date.now(), f, t, a, c, s, time: new Date().toLocaleTimeString() }, ...transactions]);

  const executePayment = (data) => {
    const sender = users.find(u => u.id === activeUserId);
    const amt = data.amt;
    const cat = data.cat || 'GENERAL';
    const sBal = sender.balances?.[cat] || 0;
    const jBal = sender.balances?.GENERAL || 0;

    if (sBal >= amt || (sBal + jBal >= amt)) {
      setUsers(prev => prev.map(u => {
        if (u.id === sender.id) {
          const newBals = { ...u.balances };
          if (sBal < amt) { 
            const deficit = amt - sBal;
            newBals[cat] = 0;
            newBals.GENERAL -= deficit;
          } else {
            newBals[cat] -= amt;
          }
          return { ...u, balances: newBals };
        }
        // Find this part in your App.jsx:
if (u.id === data.mid) {
  // FIX: Ensure both styles of balance are updated for Merchants
  if (u.role === 'merchant') {
    return { 
      ...u, 
      balance: (u.balance || 0) + amt, // Updates the flat balance for your old panel
      balances: { 
        ...(u.balances || {}), 
        [cat]: (u.balances?.[cat] || 0) + amt // Also updates the specific vault
      }
    };
  }
  // For Clubs and others
  return { ...u, balances: { ...u.balances, [cat]: (u.balances?.[cat] || 0) + amt }};
}
        return u;
      }));
      addTx(sender.id, data.mid, amt, cat, 'SUCCESS');
      if (data.reqId) setRequests(prev => prev.filter(r => r.id !== data.reqId));
    } else {
      addTx(sender.id, data.mid, amt, cat, 'FAILED');
      alert("INSUFFICIENT FUNDS");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between border-b border-white/5 pb-4 mb-8">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-emerald-500" />
          <h1 className="font-black tracking-tighter text-xl">CAMPUS_CHAIN <span className="text-[10px] text-slate-600">v6.5_MODULAR</span></h1>
        </div>
        <div className="flex items-center gap-6 text-[10px]">
          <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-bold">TREASURY: {treasury.toLocaleString()} CT</span>
          {activeUserId && <button onClick={() => setActiveUserId(null)} className="hover:text-red-400 flex items-center gap-1"><LogOut size={12}/> DISCONNECT</button>}
        </div>
      </header>

      {!activeUserId ? (
  <div className="max-w-md mx-auto mt-24">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
      <Lock className="mx-auto mb-4 text-emerald-500" size={32}/>
      
      <input 
        id="login-id" 
        className="w-full bg-black border border-slate-800 p-4 rounded-xl mb-4 outline-none focus:border-emerald-500 text-white transition-all font-mono" 
        placeholder="ENTER NODE ID" 
      />
      
      <button 
        onClick={() => {
          const val = document.getElementById('login-id').value;
          const u = users.find(x => x.id === val);
          if(u) setAuth({ show: true, targetPin: u.pin, action: { type: 'LOGIN', id: u.id } });
          else alert("UNKNOWN NODE ID");
        }} 
        className="w-full bg-emerald-600 text-black font-black py-4 rounded-xl hover:bg-emerald-400 transition-all mb-8"
      >
        AUTH NODE
      </button>

      {/* --- TEST CREDENTIALS HINT BOX --- */}
      <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-widest text-center">Quick Access Nodes</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] hover:bg-white/5 p-1 px-2 rounded cursor-pointer group" onClick={() => document.getElementById('login-id').value = 'admin'}>
            <span className="text-slate-500 uppercase">Admin:</span>
            <span className="text-emerald-500 font-bold group-hover:underline">admin</span>
          </div>
          <div className="flex justify-between items-center text-[11px] hover:bg-white/5 p-1 px-2 rounded cursor-pointer group" onClick={() => document.getElementById('login-id').value = '23104188'}>
            <span className="text-slate-500 uppercase">Student:</span>
            <span className="text-emerald-500 font-bold group-hover:underline">23104188</span>
          </div>
          <div className="flex justify-between items-center text-[11px] hover:bg-white/5 p-1 px-2 rounded cursor-pointer group" onClick={() => document.getElementById('login-id').value = 'M-999'}>
            <span className="text-slate-500 uppercase">Merchant:</span>
            <span className="text-emerald-500 font-bold group-hover:underline">M-999</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          <p className="text-[9px] text-yellow-500/80 font-bold">
            🔑 TEST PIN: <span className="text-white bg-white/10 px-2 py-0.5 rounded">1234</span>
          </p>
        </div>
      </div>
    </div>
  </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            {currentUser.role === 'admin' && (
              <AdminPanel 
                users={users} setUsers={setUsers} 
                treasury={treasury} setTreasury={setTreasury} 
                addTx={addTx} 
              />
            )}
            {currentUser.role === 'student' && (
              <StudentPanel 
                user={currentUser} users={users} 
                requests={requests} setAuth={setAuth} 
              />
            )}
            {/* UPDATED: Now renders for both Merchant and Club roles */}
            {(currentUser.role === 'merchant' || currentUser.role === 'club') && (
              <MerchantPanel 
                user={currentUser} 
                users={users} 
                setUsers={setUsers} 
                setTreasury={setTreasury} 
                requests={requests} 
                setRequests={setRequests} 
                setAuth={setAuth}
                addTx={addTx}
              />
            )}
          </div>
          <div className="lg:col-span-8">
            <Ledger transactions={transactions} />
          </div>
        </div>
      )}

      <PinPad 
        auth={auth} 
        setAuth={setAuth} 
        onSuccess={(data) => {
          if (data.type === 'LOGIN') setActiveUserId(data.id);
          if (data.type === 'PAY') executePayment(data);
          if (data.type === 'BURN') {
            setUsers(prev => prev.map(u => 
              u.id === activeUserId 
                ? { ...u, balance: 0, balances: { GENERAL: 0 } } // Resetting both styles
                : u
            ));
            setTreasury(prev => prev + data.amt);
            addTx(activeUserId, 'TREASURY', data.amt, 'REDEEM', 'SUCCESS');
          }
        }}
      />
    </div>
  );
};

export default App;