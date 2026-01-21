import React, { useEffect, useState } from 'react';
import '../styles/ChatWindow.css'; // Re-using chat styles for consistency

interface VaultItem {
    timestamp: string;
    role: string;
    content: string;
}

interface VaultViewProps {
    onExit: () => void;
}

const VaultView: React.FC<VaultViewProps> = ({ onExit }) => {
    const [history, setHistory] = useState<VaultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/vault/history')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setHistory(data);
                } else {
                    console.error("Vault data is not an array:", data);
                    setError("Invalid data format received.");
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Vault Error:", err);
                setError("Could not fetch vault history.");
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="chat-window">
            <header className="chat-header" style={{ background: '#1a1a1a', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '24px' }}></div>
                <div className="header-status" style={{ color: '#00ff9d' }}>
                    🔒 AES-256 ENCRYPTED VAULT (Decrypted View)
                </div>
                <button
                    onClick={onExit}
                    style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#666',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                    }}
                    title="Close Vault"
                >
                    ✕
                </button>
            </header>
            <div className="messages-area" style={{ padding: '20px', overflowY: 'auto', background: '#1a1a1a', height: '100%' }}>
                {isLoading && <div style={{ color: 'white' }}>Decrypting Vault...</div>}

                {error && (
                    <div style={{ color: '#ff4d4d', padding: '20px', border: '1px solid #ff4d4d', borderRadius: '8px' }}>
                        Error: {error}
                    </div>
                )}

                {!isLoading && !error && history.length === 0 && (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>
                        Vault is empty.<br />
                        <span style={{ fontSize: '0.8em' }}>Start chatting to generate history.</span>
                    </div>
                )}

                {history.map((item, idx) => (
                    <div key={idx} style={{
                        marginBottom: '15px',
                        padding: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${item.role === 'user' ? '#007aff' : '#00ff9d'}`
                    }}>
                        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '5px' }}>
                            {new Date(item.timestamp).toLocaleString()} - <strong>{item.role.toUpperCase()}</strong>
                        </div>
                        <div style={{ color: '#eee', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {item.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VaultView;
