import React, { useState } from 'react';
import { RefreshCcw, BellRing, Receipt, PieChart } from 'lucide-react';

const MerchantPanel = ({ user, users, setRequests, setAuth }) => {
  const students = users.filter(u => u.role === 'student');

  // --- SAFETY: Handle both flat balance and object balances ---
  // This calculates the TOTAL balance from all vaults (GENERAL, ANY_MERCHANT, etc.)
  const allBalances = user.balances || { GENERAL: user.balance || 0 };
  const totalBalance = Object.values(allBalances).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* 1. REVENUE OVERVIEW */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-yellow-500/20 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Revenue</p>
          <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-mono">
            {user.role.toUpperCase()}_NODE
          </span>
        </div>
        
        <h2 className="text-4xl font-black text-yellow-500 mb-6">{totalBalance} <span className="text-sm">CT</span></h2>
        
        {/* REVENUE BREAKDOWN (Shows exactly what type of tokens were collected) */}
        <div className="space-y-2 mb-6">
          <p className="text-[9px] text-slate-600 uppercase font-bold flex items-center gap-1">
            <PieChart size={10}/> Vault Breakdown
          </p>
          {Object.entries(allBalances).map(([vault, val]) => (
            val > 0 && (
              <div key={vault} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 font-mono">{vault}</span>
                <span className="text-[10px] font-bold text-white">{val}</span>
              </div>
            )
          ))}
        </div>

        <button 
          onClick={() => {
            if(totalBalance <= 0) return alert("NO FUNDS TO REDEEM");
            // Redeems the entire balance back to the treasury
            setAuth({ show: true, targetPin: user.pin, action: { type: 'BURN', amt: totalBalance } });
          }}
          className="w-full bg-white/5 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition text-[10px] font-bold"
        >
          <RefreshCcw size={14}/> REDEEM ALL TO TREASURY
        </button>
      </div>
      
      {/* 2. PAYMENT REQUEST (For both Merchant items and Club fees) */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xs font-bold flex items-center gap-2">
             <BellRing size={14} className="text-yellow-500"/> 
             {user.role === 'club' ? 'COLLECT_CLUB_FEES' : 'REQUEST_PAYMENT'}
           </h3>
           <Receipt size={14} className="text-slate-600"/>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[9px] text-slate-500 uppercase mb-1 ml-1">Target Student</p>
            <select id="r-target" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs text-white">
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
            </select>
          </div>

          <div>
            <p className="text-[9px] text-slate-500 uppercase mb-1 ml-1">Fee Amount</p>
            <input id="r-amt" type="number" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs text-white" placeholder="0" />
          </div>

          <button onClick={() => {
            const sid = document.getElementById('r-target').value;
            const amt = parseInt(document.getElementById('r-amt').value);
            
            if(!sid || !amt || amt <= 0) return alert("INVALID_REQUEST_PARAMETERS");
            
            // Sends the bill to the student's "Requests" array in App.jsx
            setRequests(prev => [...prev, { 
              id: Date.now(), 
              from: user.name, 
              fromId: user.id, 
              to: sid, 
              amt 
            }]);
            
            document.getElementById('r-amt').value = "";
            alert(`INVOICE ISSUED TO ${sid}`);
          }} className="w-full bg-yellow-600 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-yellow-900/20">
            {user.role === 'club' ? 'ISSUE CLUB BILL' : 'SEND MERCHANT BILL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantPanel;