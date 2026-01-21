import { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import GlassBox from './components/GlassBox';
import VaultView from './components/VaultView';
import SkillsView from './components/SkillsView';
import LedgerView from './components/LedgerView';
import StocksView from './components/StocksView';
import './App.css';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    chartData?: any;
}

function App() {
    const [activeView, setActiveView] = useState<'chat' | 'vault' | 'skills' | 'ledger' | 'stocks'>('chat');
    const [roastMode, setRoastMode] = useState(false);
    const [logs, setLogs] = useState<string[]>(["[LOCAL] System Ready."]);
    const [lastPayload, setLastPayload] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: "Hello! I am PennyWise. Your privacy is my priority." }
    ]);

    const addLog = (log: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
    };

    const handleFileDrop = async (file: File) => {
        addLog(`Processing file: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.logs) data.logs.forEach((log: string) => addLog(log));

            // Clean up the message (remove the JSON block string if visible)
            let cleanText = data.message ? data.message.replace(/\[\[JSON:.*?\]\]/s, '').trim() : "Analysis complete.";

            // Add system message about file
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: `📄 Analyzed ${data.filename}.\n\n${cleanText}`,
                chartData: data.chart_data // Pass the structured data
            }]);

            // Switch to chat if file uploaded
            setActiveView('chat');

        } catch (error) {
            console.error(error);
            addLog(`Error uploading file: ${error}`);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileDrop(e.target.files[0]);
        }
    };

    return (
        <div className="app-container">
            <input
                type="file"
                ref={fileInputRef}
                style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0 }}
                onChange={handleFileInputChange}
                accept="application/pdf"
            />
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                roastMode={roastMode}
                setRoastMode={setRoastMode}
                onFileDrop={handleFileDrop}
                onUploadClick={triggerFileUpload}
            />
            <div className="main-content">
                {activeView === 'chat' && (
                    <ChatWindow
                        roastMode={roastMode}
                        addLog={addLog}
                        setLastPayload={setLastPayload}
                        messages={messages}
                        setMessages={setMessages}
                        onUploadClick={triggerFileUpload}
                    />
                )}
                {activeView === 'vault' && (
                    <VaultView onExit={() => setActiveView('chat')} />
                )}
                {activeView === 'skills' && <SkillsView />}
                {activeView === 'ledger' && <LedgerView />}
                {activeView === 'stocks' && <StocksView />}
            </div>
            <GlassBox logs={logs} lastPayload={lastPayload} />
        </div>
    );
}

export default App;
