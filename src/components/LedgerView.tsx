import React, { useState, useEffect } from 'react';

interface Transaction {
    date: string;
    description: string;
    amount: number;
    type: 'IN' | 'OUT';
}

interface LedgerData {
    balance: number;
    history: Transaction[];
}

const LedgerView: React.FC = () => {
    const [balance, setBalance] = useState<number>(0);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [amount, setAmount] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchLedger = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/ledger');
            const data: LedgerData = await res.json();
            setBalance(data.balance);
            setHistory(data.history);
        } catch (error) {
            console.error("Error fetching ledger:", error);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleTransaction = async (type: 'IN' | 'OUT') => {
        if (!amount || isNaN(Number(amount)) || !desc) {
            alert("Please enter a valid amount and description.");
            return;
        }

        setLoading(true);
        try {
            await fetch('http://127.0.0.1:8000/ledger/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: desc,
                    amount: Number(amount),
                    type: type
                })
            });
            setAmount('');
            setDesc('');
            fetchLedger(); // Refresh data
        } catch (error) {
            console.error("Error adding transaction:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-window" style={{ background: '#f8fafc', overflowY: 'auto' }}>
            <header className="chat-header">
                <div className="header-status">
                    📒 Core Ledger (Cash Book)
                </div>
            </header>

            <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>

                {/* Total Balance Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '5px solid #6366f1'
                }}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Value</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1e293b' }}>
                            Rs {balance.toLocaleString()}
                        </div>
                    </div>
                    <div style={{
                        background: '#e0e7ff', color: '#4338ca', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold'
                    }}>
                        {balance >= 0 ? 'Surplus' : 'Deficit'}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#475569' }}>New Entry</h3>
                    <button
                        onClick={async () => {
                            if (confirm("Are you sure you want to clear the ledger history?")) {
                                try {
                                    // Optimistic update
                                    setBalance(0);
                                    setHistory([]);

                                    await fetch('http://127.0.0.1:8000/ledger/reset', { method: 'POST' });

                                    await fetchLedger();
                                    alert("Ledger has been completely reset to 0.");
                                } catch (e) {
                                    alert("Failed to reset ledger.");
                                    console.error(e);
                                }
                            }
                        }}
                        style={{
                            background: '#94a3b8', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em'
                        }}
                    >
                        ↻ Reset Helper
                    </button>
                </div>

                {/* Input Area */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <input
                        type="text"
                        placeholder="Description (e.g. Sales, Rent)"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1em' }}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1em' }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <button
                        onClick={() => handleTransaction('IN')}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1em',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <span>⬇️</span> CASH IN (+)
                    </button>
                    <button
                        onClick={() => handleTransaction('OUT')}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1em',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <span>⬆️</span> CASH OUT (-)
                    </button>
                </div>

                {/* History List */}
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#475569', marginBottom: '15px' }}>Recent Transactions</h3>
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No transactions recorded yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {history.map((tx, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    background: 'white',
                                    borderRadius: '10px',
                                    borderLeft: `5px solid ${tx.type === 'IN' ? '#10b981' : '#ef4444'}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{tx.description}</div>
                                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>{tx.date}</div>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: tx.type === 'IN' ? '#10b981' : '#ef4444',
                                        fontSize: '1.1em'
                                    }}>
                                        {tx.type === 'IN' ? '+' : '-'} Rs {tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LedgerView;
