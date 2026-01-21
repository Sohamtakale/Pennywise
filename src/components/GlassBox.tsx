import React from 'react';
import '../styles/GlassBox.css';

interface GlassBoxProps {
    logs: string[];
    lastPayload: string;
}

const GlassBox: React.FC<GlassBoxProps> = ({ logs, lastPayload }) => {
    const handleDownload = () => {
        const fileContent = logs.join('\n') + "\n\n--- LAST PAYLOAD ---\n" + lastPayload;
        const element = document.createElement("a");
        const file = new Blob([fileContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `pennywise_audit_${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopy = () => {
        const fileContent = logs.join('\n') + "\n\n--- LAST PAYLOAD ---\n" + lastPayload;
        navigator.clipboard.writeText(fileContent).then(() => {
            alert("Audit Log copied to clipboard! 📋");
        });
    };

    return (
        <div className="glass-box">
            <div className="glass-header">
                <h3>Glass Box</h3>
                <button className="close-btn">×</button>
            </div>

            <div className="glass-section">
                <div className="section-label">[LOCAL] Processing Log</div>
                <div className="terminal-view">
                    {logs.map((log, i) => (
                        <div key={i} className="log-line">{`> ${log}`}</div>
                    ))}
                    <div className="cursor-blink">_</div>
                </div>
            </div>

            <div className="glass-section">
                <div className="section-label">Network Payload Preview</div>
                <div className="payload-view">
                    <pre>{lastPayload || "Waiting for request..."}</pre>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="audit-btn" onClick={handleDownload} style={{ flex: 1 }}>Download Log ⬇️</button>
                <button className="audit-btn" onClick={handleCopy} style={{ flex: 1, background: '#4b5563' }}>Copy Log 📋</button>
            </div>
        </div>
    );
};

export default GlassBox;
