import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface FinanceSummary {
    current_balance: number;
    breakdown: { name: string; value: number }[];
    safe_to_spend: number;
}

const SkillsView: React.FC = () => {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/finance/summary')
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error("Error fetching finance summary:", err));
    }, []);

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F'];

    return (
        <div className="chat-window">
            <header className="chat-header">
                <div className="header-status">
                    🛠️ Active Financial Skills & Analytics
                </div>
            </header>
            <div className="messages-area" style={{ padding: '30px', color: '#333', overflowY: 'auto' }}>

                {/* --- GRAPHICAL DASHBOARD --- */}
                {summary && (
                    <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>🧩 Financial Snapshot</h2>
                        <div style={{ display: 'flex', height: '250px', justifyContent: 'space-around', alignItems: 'center' }}>

                            {/* PIE CHART */}
                            <div style={{ width: '45%', height: '100%', textAlign: 'center' }}>
                                <h4 style={{ marginBottom: '10px', fontSize: '0.9em', color: '#64748b' }}>Projected Outlook</h4>
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={summary.breakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {summary.breakdown.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `Rs ${value}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* BAR CHART / GAUGE */}
                            <div style={{ width: '45%', height: '100%', textAlign: 'center' }}>
                                <h4 style={{ marginBottom: '10px', fontSize: '0.9em', color: '#64748b' }}>Solvency Meter</h4>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={[{ name: 'Safe Cash', amount: summary.safe_to_spend }]}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip cursor={false} />
                                        <Bar dataKey="amount" fill="#00C49F" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#00C49F', marginTop: '-10px' }}>
                                    Rs {summary.safe_to_spend.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#00ff9d' }}>1. Solvency Engine</h2>
                    <p>analyzes your bank balance vs. upcoming bills to determine <strong>Safe-to-Spend</strong> cash.</p>
                    <div style={{ background: 'rgba(0,255,157,0.1)', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                        Status: <strong>ACTIVE</strong><br />
                        Rule: Reject purchases {'>'} Free Cash
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#ff4d4d' }}>2. Subscription Detective</h2>
                    <p>Scans recurring transactions to identify unused "leaks".</p>
                    <div style={{ background: 'rgba(255,77,77,0.1)', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                        Status: <strong>ACTIVE</strong><br />
                        Targets: Netflix, Gym, Adobe
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#007aff' }}>3. Ethical Guardian</h2>
                    <p>Intercepts loan requests and suggests <strong>Scholarships & Grants</strong> first.</p>
                    <div style={{ background: 'rgba(0,122,255,0.1)', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                        Status: <strong>ACTIVE</strong><br />
                        Database: Local Scholarship DB (v1.0)
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#b19cd9' }}>4. Privacy Shield</h2>
                    <p>Hybrid PII Masking Engine (Regex + Tokenization).</p>
                    <div style={{ background: 'rgba(177,156,217,0.1)', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
                        Status: <strong>ENFORCED</strong><br />
                        Masking: Credit Cards, Names, Phones, Emails
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SkillsView;
