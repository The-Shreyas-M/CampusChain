import React, { useState, useEffect } from 'react';
import { Wallet, Send, BellRing, ShieldCheck } from 'lucide-react';

const StudentPanel = ({ user, users, requests, setAuth }) => {
  const [p2pTarget, setP2pTarget] = useState("");
  const [selectedVault, setSelectedVault] = useState("GENERAL");

  // --- SAFETY: Ensure balances exists ---
  const balances = user.balances || { GENERAL: 0 };

  // --- SMART VALIDATOR LOGIC ---
  const getValidVaults = (targetId) => {
    if (!targetId) return ["GENERAL"];
    const targetNode = users.find(u => u.id === targetId);
    if (!targetNode) return ["GENERAL"];

    const valid = ["GENERAL"];
    const roleVault = `ANY_${targetNode.role.toUpperCase()}`;
    if (balances[roleVault] > 0) valid.push(roleVault);

    const specificNameVault = targetNode.name.toUpperCase().replace(/\s+/g, '_');
    if (balances[specificNameVault] > 0) valid.push(specificNameVault);

    return valid;
  };

  // Reset vault selection when recipient changes
  useEffect(() => {
    setSelectedVault("GENERAL");
  }, [p2pTarget]);

  const handlePay = () => {
    const amtInput = document.getElementById('p-amt');
    const amt = parseInt(amtInput.value);

    if (!p2pTarget) return alert("Select a recipient first.");
    if (isNaN(amt) || amt <= 0) return alert("Enter a valid amount.");
    if ((balances[selectedVault] || 0) < amt) {
      return alert(`INSUFFICIENT FUNDS: You only have ${balances[selectedVault] || 0} in ${selectedVault}`);
    }

    setAuth({ 
      show: true, 
      targetPin: user.pin, 
      action: { type: 'PAY', mid: p2pTarget, amt, cat: selectedVault } 
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. PORTFOLIO CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] mb-1">DIGITAL_WALLET</p>
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <p className="text-[9px] text-slate-500 font-mono mt-1">NODE_ID: {user.id}</p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <Wallet className="text-emerald-500" size={20}/>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(balances).map(([vault, val]) => (
            val > 0 && (
              <div key={vault} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{vault}</span>
                <span className="text-sm font-black text-white">{val} <span className="text-[9px] text-emerald-500">CT</span></span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* 2. SMART TRANSFER MODULE */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h3 className="text-white font-bold mb-5 text-xs flex items-center gap-2">
          <ShieldCheck size={14} className="text-blue-400"/> SECURE_TRANSFER
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-bold ml-1">Recipient</label>
            <select 
              value={p2pTarget}
              onChange={(e) => setP2pTarget(e.target.value)}
              className="w-full bg-black border border-slate-800 p-4 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition mt-1"
            >
              <option value="">-- SEARCH DIRECTORY --</option>
              {users.filter(u => u.id !== user.id && u.role !== 'admin').map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-bold ml-1">Fund Source</label>
              <select 
                value={selectedVault}
                onChange={(e) => setSelectedVault(e.target.value)}
                className="w-full bg-black border border-slate-800 p-4 rounded-xl text-xs text-emerald-400 font-bold mt-1"
              >
                {getValidVaults(p2pTarget).map(v => (
                  <option key={v} value={v}>{v} ({balances[v] || 0})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-bold ml-1">Amount</label>
              <input id="p-amt" type="number" className="w-full bg-black border border-slate-800 p-4 rounded-xl text-xs text-white mt-1" placeholder="0" />
            </div>
          </div>

          <button onClick={handlePay} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all border-b-4 border-blue-900 active:translate-y-1 active:border-b-0">
            EXECUTE SMART TRANSACTION
          </button>
        </div>
      </div>

      {/* 3. INVOICES / BILLS */}
      {requests.filter(r => r.to === user.id).length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <BellRing size={12}/> Incoming Invoices
          </p>
          
          {requests.filter(r => r.to === user.id).map(r => {
            const validOptions = getValidVaults(r.fromId);
            return (
              <div key={r.id} className="bg-white/5 border border-yellow-500/20 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-white uppercase">{r.from}</p>
                    <p className="text-xs text-yellow-500 font-black mt-1">{r.amt} <span className="text-[9px]">CT</span></p>
                  </div>
                  <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full font-bold uppercase">Pending</span>
                </div>

                <div className="flex gap-2">
                  <select 
                    id={`vault-select-${r.id}`}
                    className="flex-1 bg-black border border-white/10 p-3 rounded-xl text-[10px] text-emerald-400 font-bold outline-none"
                  >
                    {validOptions.map(v => (
                      <option key={v} value={v}>{v} ({balances[v] || 0})</option>
                    ))}
                  </select>

                  <button 
                    onClick={() => {
                       const chosenVault = document.getElementById(`vault-select-${r.id}`).value;
                       if ((balances[chosenVault] || 0) < r.amt) {
                         return alert(`Insufficient funds in ${chosenVault}`);
                       }
                       setAuth({ 
                         show: true, 
                         targetPin: user.pin, 
                         action: { type: 'PAY', mid: r.fromId, amt: r.amt, cat: chosenVault, reqId: r.id } 
                       });
                    }}
                    className="bg-yellow-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-900/20"
                  >
                    Pay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentPanel;