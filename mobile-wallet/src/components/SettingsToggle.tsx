import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Sun, Moon, Globe, HelpCircle } from 'lucide-react';

export const SettingsToggle = () => {
    const { lang, setLang, theme, setTheme, didacticEnabled, setDidacticEnabled } = useSettings();

    return (
        <div style={{ position: 'fixed', top: 44, right: 8, zIndex: 9999, background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '20px', display: 'flex', gap: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', alignItems: 'center' }}>
            {/* Toggle Didactic Help Mode */}
            <button 
                onClick={() => setDidacticEnabled(!didacticEnabled)}
                title={lang === 'fr' ? "Activer/Désactiver l'aide didactique (survol)" : "Toggle didactic help (hover)"}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: didacticEnabled ? '#10B981' : '#64748B', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    transition: 'color 0.2s ease',
                    padding: 0
                }}
            >
                <HelpCircle size={15} />
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'fr' ? 'Aide' : 'Help'}
                </span>
            </button>

            {/* Separator */}
            <div style={{ width: '1px', height: '14px', background: '#334155' }} />

            <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button 
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
            >
                <Globe size={14} /> {lang.toUpperCase()}
            </button>
        </div>
    );
};
