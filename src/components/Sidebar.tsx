import React from 'react';
import '../styles/Sidebar.css';

import logo from '../assets/logo.svg';

interface SidebarProps {
    activeView: 'chat' | 'vault' | 'skills' | 'ledger' | 'stocks';
    setActiveView: (view: 'chat' | 'vault' | 'skills' | 'ledger' | 'stocks') => void;
    roastMode: boolean;
    setRoastMode: (mode: boolean) => void;
    onFileDrop: (file: File) => void;
    onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, roastMode, setRoastMode, onFileDrop, onUploadClick }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-active');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('drag-active');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileDrop(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="sidebar">
            <div className="logo-area">
                <img src={logo} alt="PennyWise Logo" className="logo-image" style={{ width: '40px', height: '40px' }} />
                <div className="logo-text" style={{ color: '#1f2937', fontWeight: 'bold' }}>PennyWise</div>
            </div>

            <nav className="nav-menu">
                <div
                    className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}
                    onClick={() => { console.log('Nav: Chat'); setActiveView('chat'); }}
                >
                    <span className="icon">💬</span> Chat
                </div>
                <div
                    className={`nav-item ${activeView === 'vault' ? 'active' : ''}`}
                    onClick={() => { console.log('Nav: Vault'); setActiveView('vault'); }}
                >
                    <span className="icon">🔒</span> The Vault
                </div>
                <div
                    className={`nav-item ${activeView === 'skills' ? 'active' : ''}`}
                    onClick={() => { console.log('Nav: Skills'); setActiveView('skills'); }}
                >
                    <span className="icon">🛠️</span> Skills
                </div>
                <div
                    className={`nav-item ${activeView === 'ledger' ? 'active' : ''}`}
                    onClick={() => { console.log('Nav: Ledger'); setActiveView('ledger'); }}
                >
                    <span className="icon">📒</span> Ledger
                </div>
                <div
                    className={`nav-item ${activeView === 'stocks' ? 'active' : ''}`}
                    onClick={() => { console.log('Nav: Stocks'); setActiveView('stocks'); }}
                >
                    <span className="icon">📈</span> Stocks
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="roast-toggle-container">
                    <div className="roast-label">Roast Mode</div>
                    <div
                        className={`toggle-switch ${roastMode ? 'on' : 'off'}`}
                        onClick={() => setRoastMode(!roastMode)}
                    >
                        <div className="toggle-knob"></div>
                    </div>
                    <div className="mode-status">{roastMode ? 'On (Roast)' : 'Off (Coach)'}</div>
                </div>

                <div
                    className="ingestion-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={onUploadClick}
                    style={{ cursor: 'pointer' }}
                    title="Click to upload PDF"
                >
                    <div className="upload-icon">⬇️</div>
                    <div className="upload-text">
                        <strong>Ingestion Zone:</strong><br />
                        Drop or Click to Upload
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
