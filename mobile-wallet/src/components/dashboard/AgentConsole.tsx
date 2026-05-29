import React, { useState, useEffect, useRef } from 'react';
import type { Lang } from './i18n';
import { t } from './i18n';

interface AgentConsoleProps {
    lang: Lang;
    logs: string[];
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ lang, logs }) => {
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="dashboard-column agent-console glass-panel">
            <div className="column-header">
                <h2>{t[lang].console_title}</h2>
                <div className="status-indicator animate-pulse"></div>
            </div>
            
            <div className="terminal-window">
                <div className="terminal-header">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                    <span style={{ marginLeft: '10px', fontSize: '10px', opacity: 0.5 }}>agent_pid: 2404</span>
                </div>
                
                <div className="terminal-content">
                    {logs.length === 0 ? (
                        <p className="log-line opacity-50">&gt; {t[lang].status_idle}</p>
                    ) : (
                        logs.map((log, index) => (
                            <TypewriterLog key={index} text={log} />
                        ))
                    )}
                    <div ref={endOfLogsRef} />
                </div>
            </div>
        </div>
    );
};

// Component for the typewriter animation
const TypewriterLog: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const speed = 20; // ms per character
        
        const typeChar = () => {
             if (i < text.length) {
                 setDisplayedText(prev => prev + text.charAt(i));
                 i++;
                 setTimeout(typeChar, speed);
             }
        };
        
        typeChar();
        
        return () => { i = text.length; }; // Prevent leaks on unmount
    }, [text]);

    return (
        <p className="log-line typewriter-font">
            <span style={{ color: 'var(--accent-neon)', marginRight: '8px' }}>&gt;</span>
            {displayedText}
            {displayedText.length < text.length && <span className="cursor-blink">_</span>}
        </p>
    );
};
