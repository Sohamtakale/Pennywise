import React, { useState, useEffect } from 'react';
import '../styles/ChatWindow.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    chartData?: any;
}

interface ChatWindowProps {
    roastMode: boolean;
    addLog: (log: string) => void;
    setLastPayload: (payload: string) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onUploadClick: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roastMode, addLog, setLastPayload, messages, setMessages, onUploadClick }) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reset or greet when mode changes
    useEffect(() => {
        const greeting = roastMode
            ? "FINANCIAL CRIME DETECTED. Wallet ready for a beating?"
            : "Financial Coach Active. How can I help you save?";

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: greeting }]);
    }, [roastMode, setMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // API CALL
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    mode: roastMode ? 'roast' : 'coach'
                })
            });

            const data = await response.json();

            // AI Response
            const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: data.response };
            setMessages(prev => [...prev, botMsg]);

            // Update Glass Box Logs
            if (data.logs) {
                data.logs.forEach((log: string) => addLog(log));
            }

            // Update Payload View
            setLastPayload(JSON.stringify({
                user_token: "USER_" + Math.floor(Math.random() * 100),
                masked_prompt: data.masked_prompt,
                mode: data.mode
            }, null, 2));

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Error: Could not connect to PennyWise Brain." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

    const renderChart = (data: any) => {
        if (!data || !data.breakdown) return null;

        return (
            <div className="chat-chart-container" style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.9)', borderRadius: '10px', width: '100%', minWidth: '300px' }}>
                <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Spending Breakdown</h4>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.breakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.breakdown.map((_entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => `Rs ${value}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
                    <strong>Safe-to-Spend:</strong> Rs {data.safe_to_spend?.toLocaleString()}
                </div>
            </div>
        );
    };

    return (
        <div className="chat-window">
            <header className="chat-header">
                <div className="header-status">
                    Financial Coach Active. Your data is encrypted locally.
                </div>
            </header>

            <div className="messages-area">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
                        <div className="bubble">
                            <div className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                            {msg.chartData && renderChart(msg.chartData)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot-message">
                        <div className="bubble">Processing...</div>
                    </div>
                )}
            </div>

            <div className="omnibar-container">
                <div className="omnibar-wrapper">
                    <input
                        type="text"
                        placeholder="Ask anything or drop files..."
                        className="omnibar-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="omnibar-actions">
                        <button className="icon-btn" onClick={handleSend}>➤</button>
                        <button className="icon-btn" onClick={onUploadClick}>📎</button>
                        <button className="icon-btn">📷</button>
                        <button className="icon-btn">🎤</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
