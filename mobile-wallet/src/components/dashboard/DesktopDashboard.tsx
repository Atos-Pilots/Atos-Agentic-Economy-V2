import React, { useState, useEffect } from 'react';
import type { Lang } from './i18n';
import { AgentConsole } from './AgentConsole';
import { BlockchainLedger } from './BlockchainLedger';
import { translateEvent } from './i18n';
import { useSettings } from '../../context/SettingsContext';

export const DesktopDashboard: React.FC = () => {
    const { lang } = useSettings();
    // Store raw event types to allow real-time i18n translation without reload
    const [events, setEvents] = useState<string[]>([]);
    const [panicMode, setPanicMode] = useState(false);

    useEffect(() => {
        // SSE Telemetry listener for the Dashboard
        const evtSource = new EventSource('/v1/telemetry/stream');
        
        evtSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'mandate.revoked') {
                    setPanicMode(true);
                }

                // Add to raw events list natively
                setEvents(prev => [...prev, data.type]);

            } catch (e) {
                // Keep heartbeat ping silent
            }
        };

        return () => evtSource.close();
    }, []);

    // Compute logs on the fly based on current language
    const translatedLogs = events
        .map(evt => translateEvent(evt, lang as Lang))
        .filter((log): log is string => log !== null);

    return (
        <div className={`desktop-dashboard-container ${panicMode ? 'panic-mode-active' : ''}`}>
            
            {/* Header / i18n Selector */}
            <header className="dashboard-header glass-panel">
                <div className="logo">
                    <span className="atos-brand">Atos</span> Sovereign AI Control Room
                </div>
                {/* Global SettingsToggle handles the switch now */}
                <div className="i18n-selector" style={{display: 'none'}}>
                </div>
            </header>

            {/* Main Split Screen */}
            <div className="dashboard-split">
                <AgentConsole lang={lang} logs={translatedLogs} />
                <BlockchainLedger lang={lang} events={events} />
            </div>

            {/* Panic Mode Overlay Warning */}
            {panicMode && (
                <div className="panic-glitch-overlay">
                    <h1>{lang === 'fr' ? 'ACTION INTERROMPUE : MANDAT RÉVOQUÉ PAR LE CITOYEN' : 'ACTION INTERRUPTED: MANDATE REVOKED BY CITIZEN'}</h1>
                </div>
            )}
            
        </div>
    );
};
