import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Sun, Moon, Globe } from 'lucide-react';

export const SettingsToggle = () => {
    const { lang, setLang, theme, setTheme } = useSettings();

    return (
        <div style={{ position: 'fixed', top: 44, right: 8, zIndex: 9999, background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '20px', display: 'flex', gap: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
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
