import React, { useState } from 'react';
import { PlusCircle, Banknote, Users, Trash2 } from 'lucide-react';

const AdminPanel = ({ users, setUsers, treasury, setTreasury, addTx }) => {
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [vaultCategory, setVaultCategory] = useState("GENERAL");
  const [subCategoryNode, setSubCategoryNode] = useState("");

  const registerNode = () => {
    const id = document.getElementById('n-id').value.trim();
    const name = document.getElementById('n-name').value.trim();
    const role = document.getElementById('n-role').value;

    if (!id || !name) return alert("UID and Name are required.");
    if (users.some(u => u.id.toLowerCase() === id.toLowerCase())) return alert("UID EXISTS");

    setUsers([...users, { id, name, role, pin: '1234', balances: { GENERAL: 0 } }]);
    addTx('SYSTEM', id, 0, 'NODE_CREATED', 'SUCCESS');
    document.getElementById('n-id').value = "";
    document.getElementById('n-name').value = "";
  };

  const getSubCategoryNodes = () => {
    return users.filter(u => u.role === vaultCategory && u.id !== selectedRecipient);
  };

  return (
    <div className="space-y-6">
      {/* 1. DIRECTORY */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-white/5 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2"><Users size={14} className="text-blue-400"/> NODE_DIRECTORY</div>
        </div>
        <div className="max-h-32 overflow-y-auto">
          <table className="w-full text-[10px] text-left">
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 group">
                  <td className="p-2 font-mono text-blue-400">{u.id}</td>
                  <td className="p-2 font-bold uppercase">{u.name}</td>
                  <td className="p-2 text-slate-500 uppercase text-[8px]">{u.role}</td>
                  <td className="p-2 text-right opacity-0 group-hover:opacity-100">
                    {u.role !== 'admin' && (
                      <Trash2 
                        size={12} 
                        className="cursor-pointer text-red-500 inline" 
                        onClick={() => {
                          if(window.confirm(`Delete ${u.name}?`)) {
                            setUsers(users.filter(x => x.id !== u.id));
                            addTx('SYSTEM', 'VOID', 0, 'NODE_DELETED', 'SUCCESS');
                          }
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. REGISTRATION */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/20">
        <h3 className="text-emerald-400 font-bold mb-4 text-xs">ANCHOR_IDENTITY</h3>
        <div className="space-y-2">
          <input id="n-id" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs" placeholder="UID" />
          <input id="n-name" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs" placeholder="Name" />
          <select id="n-role" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs">
            <option value="student">student</option>
            <option value="merchant">merchant</option>
            <option value="club">club</option>
          </select>
          <button onClick={registerNode} className="w-full bg-emerald-600 text-black font-bold py-3 rounded-lg text-xs">COMMIT</button>
        </div>
      </div>

      {/* 3. MINTING ENGINE */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-blue-500/20">
        <h3 className="text-blue-400 font-bold mb-4 text-xs tracking-widest">ASSET_MINTING_MODULE</h3>
        <div className="space-y-4">
          
          <div>
            <p className="text-[9px] text-slate-500 uppercase mb-1 ml-1">1. Select Recipient Node</p>
            <select 
              value={selectedRecipient}
              onChange={(e) => {
                setSelectedRecipient(e.target.value);
                setSubCategoryNode(""); 
              }}
              className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs"
            >
              <option value="">-- TARGET RECIPIENT --</option>
              {users.filter(u => u.role !== 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.id})</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] text-slate-500 uppercase mb-1 ml-1">2. Vault Category</p>
              <select 
                value={vaultCategory}
                onChange={(e) => {
                    setVaultCategory(e.target.value);
                    setSubCategoryNode(""); 
                }}
                className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs uppercase"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="student">STUDENTS</option>
                <option value="merchant">MERCHANTS</option>
                <option value="club">CLUBS</option>
              </select>
            </div>

            {vaultCategory !== "GENERAL" && (
                <div>
                    <p className="text-[9px] text-yellow-500 uppercase mb-1 ml-1">3. Select Sub-Vault</p>
                    <select 
                        value={subCategoryNode}
                        onChange={(e) => setSubCategoryNode(e.target.value)}
                        className="w-full bg-black border border-yellow-500/30 p-3 rounded-lg text-xs uppercase"
                    >
                        <option value="">-- CHOOSE NODE --</option>
                        {/* THE NEW "ANY" OPTION GOES HERE */}
                        <option value={`ANY_${vaultCategory.toUpperCase()}`} className="font-bold text-yellow-500">
                          ANY {vaultCategory.toUpperCase()}
                        </option>
                        
                        {/* FOLLOWED BY SPECIFIC NODES */}
                        {getSubCategoryNodes().map(n => (
                            <option key={n.id} value={n.name.toUpperCase().replace(/\s+/g, '_')}>
                                {n.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
          </div>

          <div>
             <p className="text-[9px] text-slate-500 uppercase mb-1 ml-1">4. Token Amount</p>
             <input id="m-amt" type="number" className="w-full bg-black border border-slate-800 p-3 rounded-lg text-xs font-bold text-blue-400" placeholder="0" />
          </div>
          
          <button onClick={() => {
            const amt = parseInt(document.getElementById('m-amt').value);
            const finalVaultName = vaultCategory === "GENERAL" ? "GENERAL" : subCategoryNode;

            if(!selectedRecipient || isNaN(amt) || (vaultCategory !== "GENERAL" && !subCategoryNode)) {
                return alert("FAILURE: Incomplete Chain Parameters");
            }
            if(amt > treasury) return alert("TREASURY_LIMIT_EXCEEDED");
            
            setUsers(users.map(u => u.id === selectedRecipient ? {
              ...u, 
              balances: { ...u.balances, [finalVaultName]: (u.balances?.[finalVaultName] || 0) + amt }
            } : u));
            setTreasury(prev => prev - amt);
            addTx('TREASURY', selectedRecipient, amt, finalVaultName, 'SUCCESS');
            
            document.getElementById('m-amt').value = "";
            alert(`MINT SUCCESS: ${amt} [${finalVaultName}] -> ${selectedRecipient}`);
          }} className="w-full bg-blue-600 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
            INITIALIZE MINTING
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;