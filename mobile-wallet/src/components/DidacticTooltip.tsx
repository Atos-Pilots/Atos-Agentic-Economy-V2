import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { didacticData } from '../didacticData';
import { HelpCircle, Shield, Cpu, BookOpen, Layers, Zap } from 'lucide-react';

export const DidacticTooltip: React.FC = () => {
  const { lang, didacticEnabled } = useSettings();
  const [state, setState] = useState<{
    show: boolean;
    key: string;
    rect: DOMRect | null;
  }>({
    show: false,
    key: '',
    rect: null,
  });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!didacticEnabled) {
      setState(prev => ({ ...prev, show: false }));
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-didactic-key]') as HTMLElement;
      if (target) {
        const key = target.getAttribute('data-didactic-key')!;
        const rect = target.getBoundingClientRect();
        
        // Add a subtle neon highlight border on the hovered target
        target.style.outline = '2px dashed var(--success-green, #10b981)';
        target.style.outlineOffset = '2px';
        target.style.transition = 'outline 0.15s ease';

        setState({ show: true, key, rect });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-didactic-key]') as HTMLElement;
      if (target) {
        // Remove the highlight border
        target.style.outline = 'none';
        setState(prev => ({ ...prev, show: false }));
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [didacticEnabled]);

  // Update positioning when show state changes or key changes
  useEffect(() => {
    if (!state.show || !state.rect) return;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = 360;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 380;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = state.rect.right + 12; // default: right of element
    let top = state.rect.top;

    // Boundary check right
    if (left + tooltipWidth > viewportWidth) {
      left = state.rect.left - tooltipWidth - 12; // place to the left
    }

    // Boundary check left
    if (left < 0) {
      left = Math.max(12, viewportWidth - tooltipWidth - 12); // center or force fit
    }

    // Boundary check bottom
    if (top + tooltipHeight > viewportHeight) {
      top = Math.max(12, viewportHeight - tooltipHeight - 12);
    }

    // Boundary check top
    if (top < 12) {
      top = 12;
    }

    setPosition({ top, left });
  }, [state.show, state.key, state.rect]);

  if (!state.show || !state.key) return null;

  const data = didacticData[lang][state.key];
  if (!data) return null;

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '360px',
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        background: 'rgba(11, 17, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '16px',
        zIndex: 999999,
        color: '#e2e8f0',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '12px',
        pointerEvents: 'none', // tooltip should not block hover target
        animation: 'didactic-fade-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <HelpCircle size={16} color="#10b981" />
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'white', letterSpacing: '0.01em' }}>
          {lang === 'fr' ? 'Aide Didactique / Guide' : 'Didactic Guide / Help'}
        </h4>
      </div>

      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
        {data.title}
      </div>

      {/* Grid of Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Rôle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Zap size={10} /> {lang === 'fr' ? 'Rôle dans le parcours' : 'Role in user journey'}
          </div>
          <div style={{ color: '#94a3b8', lineHeight: 1.4 }}>{data.role}</div>
        </div>

        {/* Importance */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Shield size={10} /> {lang === 'fr' ? "Pourquoi c'est important" : 'Why it matters'}
          </div>
          <div style={{ color: '#94a3b8', lineHeight: 1.4 }}>{data.importance}</div>
        </div>

        {/* Standards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Cpu size={10} /> {lang === 'fr' ? 'Standards & Technologies' : 'Standards & Tech'}
          </div>
          <div style={{ color: '#94a3b8', lineHeight: 1.4, fontFamily: 'monospace', fontSize: '10.5px' }}>{data.standards}</div>
        </div>

        {/* Blockchain */}
        {data.blockchain && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Layers size={10} /> {lang === 'fr' ? 'Lien Blockchain / Web3' : 'Blockchain / Web3 connection'}
            </div>
            <div style={{ color: '#94a3b8', lineHeight: 1.4 }}>{data.blockchain}</div>
          </div>
        )}

        {/* Potentialités */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <BookOpen size={10} /> {lang === 'fr' ? 'Futur & Potentialités' : 'Future & Potential'}
          </div>
          <div style={{ color: '#94a3b8', lineHeight: 1.4 }}>{data.potential}</div>
        </div>

      </div>
    </div>
  );
};
