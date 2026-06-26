import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, Trash2, CheckCircle2, XCircle,
  Zap, Clock, DollarSign, Tag, ToggleLeft, ToggleRight,
  ScanFace, EyeOff, Bot, UserCheck, Calendar, Info,
  AlertTriangle, Banknote
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

interface Mandate {
  mandate_id: string;
  subject_ref: string;
  scope: string;
  status: string;
  max_amount: number;
  currency: string;
  authorized_rails: string;
  auto_execute: boolean;
  expires_at?: string | null;
  sca_timestamp?: string | null;
  createdAt: string;
}

interface NewMandateForm {
  max_amount: number;
  category: string;
  rail: string;
  duration_days: number;
  auto_execute: boolean;
}

const RAIL_COLORS: Record<string, string> = {
  SEPA: '#4ade80', // Lighter green for DSP3 / SEPA
  STABLECOIN_EURC: '#00d26a',
  L402: '#ff9d00',
  BITCOIN: '#f7931a',
};

const RAIL_LABELS: Record<string, string> = {
  SEPA: 'SEPA',
  STABLECOIN_EURC: 'EURC',
  L402: 'L402',
  BITCOIN: 'BTC',
};

const DEFAULT_FORM: NewMandateForm = {
  max_amount: 200,
  category: 'urn:atos:pilot:retail:age_restricted',
  rail: 'SEPA',
  duration_days: 30,
  auto_execute: true,
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isExpired = (expires_at?: string | null) => {
  if (!expires_at) return false;
  return new Date(expires_at) < new Date();
};

const daysRemaining = (expires_at?: string | null) => {
  if (!expires_at) return null;
  const diff = Math.ceil((new Date(expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const MandateManager = () => {
  const { lang, theme } = useSettings();
  const t = translations[lang];

  const SCOPE_LABELS: Record<string, { label: string; emoji: string }> = {
    'urn:atos:pilot:retail:age_restricted': { label: t.mandates.scopes.retail, emoji: '🔞' },
    'urn:atos:pilot:travel:hotel': { label: t.mandates.scopes.hotel, emoji: '🏨' },
    'urn:atos:pilot:mobility:rental': { label: t.mandates.scopes.rental, emoji: '🚗' },
    'urn:atos:pilot:tech:it': { label: t.mandates.scopes.it, emoji: '💻' },
    'urn:atos:pilot:tech:infrastructure': { label: t.mandates.scopes.infrastructure, emoji: '☁️' },
    'urn:atos:pilot:entertainment:tickets': { label: t.mandates.scopes.tickets, emoji: '🎫' },
    'urn:atos:pilot:retail:perfume': { label: t.mandates.scopes.perfume, emoji: '🛍️' },
    'urn:atos:pilot:all': { label: t.mandates.scopes.all, emoji: '🌐' },
  };

  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('hiddenMandates') || '[]')); }
    catch { return new Set(); }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewMandateForm>(DEFAULT_FORM);
  const [scanning, setScanning] = useState(false);
  const [showRevoked, setShowRevoked] = useState(false);

  const fetchMandates = useCallback(async () => {
    try {
      const res = await fetch('/v1/wallet/mandates');
      const data = await res.json();
      if (data.success && data.mandates) setMandates(data.mandates);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchMandates();
    const evtSource = new EventSource('/v1/telemetry/stream');
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (['mandate.generated', 'mandate.revoked', 'purchase.completed'].includes(data.type)) {
          fetchMandates();
        }
      } catch (e) {}
    };
    return () => evtSource.close();
  }, [fetchMandates]);

  const handleSubmitForm = () => {
    setScanning(true);
    setTimeout(async () => {
      setScanning(false);
      try {
        const res = await fetch('/v1/wallet/mandates/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject_ref: 'C_VON_N',
            scope: form.category,
            max_amount: form.max_amount,
            currency: 'EUR',
            authorized_rails: [form.rail],
            duration_days: form.duration_days,
            auto_execute: form.auto_execute,
            sca_timestamp: new Date().toISOString()
          })
        });
        const data = await res.json();
        if (data.success) {
          setShowForm(false);
          setForm(DEFAULT_FORM);
          fetchMandates();
        }
      } catch (e) { console.error(e); }
    }, 1800);
  };

  const handleRevoke = async (mandateId: string) => {
    await fetch(`/v1/wallet/mandates/${mandateId}/revoke`, { method: 'POST' });
    fetchMandates();
  };

  const handleHide = (mandateId: string) => {
    const next = new Set(hiddenIds);
    next.add(mandateId);
    setHiddenIds(next);
    localStorage.setItem('hiddenMandates', JSON.stringify([...next]));
  };

  const activeMandates = mandates.filter(m => m.status === 'ACTIVE' && !hiddenIds.has(m.mandate_id));
  const revokedMandates = mandates.filter(m => m.status !== 'ACTIVE' && !hiddenIds.has(m.mandate_id));
  const activeCount = activeMandates.length;

  const MandateCard = ({ m }: { m: Mandate }) => {
    const scopeInfo = SCOPE_LABELS[m.scope] || { label: m.scope, emoji: '📄' };
    const isActive = m.status === 'ACTIVE';
    const expired = isExpired(m.expires_at);
    const remaining = daysRemaining(m.expires_at);
    const rails = m.authorized_rails.split(',').map(r => r.trim());

    const getMandateDidacticKey = (scope: string) => {
      if (scope.includes('infrastructure')) return 'mandate_atos';
      if (scope.includes('it')) return 'mandate_atos';
      return 'mandate_netflix';
    };

    return (
      <div
        className="glass-panel animate-enter"
        data-didactic-key={getMandateDidacticKey(m.scope)}
        style={{
          marginBottom: '16px',
          borderColor: isActive && !expired
            ? 'rgba(16, 185, 129, 0.35)'
            : 'rgba(239, 68, 68, 0.25)',
          background: 'none',
          opacity: isActive ? 1 : 0.8,
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isActive && !expired
              ? <CheckCircle2 size={16} color="var(--success-green)" />
              : <XCircle size={16} color="var(--danger-red)" />
            }
            <div>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: isActive && !expired ? 'var(--success-green)' : 'var(--danger-red)',
                letterSpacing: '0.08em', textTransform: 'uppercase'
              }}>
                {expired && isActive ? t.mandates.expired : m.status}
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                {m.mandate_id.slice(0, 18)}…
              </p>
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {isActive && !expired && (
              <button
                onClick={() => handleRevoke(m.mandate_id)}
                title={t.mandates.btnRevoke}
                style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '6px 10px', color: 'var(--danger-red)', cursor: 'pointer' }}
              >
                <Trash2 size={14} />
              </button>
            )}
            {!isActive && (
              <button
                onClick={() => handleHide(m.mandate_id)}
                title={t.mandates.btnHide}
                style={{ background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <EyeOff size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Scope / Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '10px', background: 'var(--bg-panel-hover)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '20px' }}>{scopeInfo.emoji}</span>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)' }}>{t.mandates.coveredCategory}</p>
            <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{scopeInfo.label}</p>
          </div>
        </div>

        {/* Key metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          {/* Amount */}
          <div style={{ background: 'var(--bg-panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Banknote size={10} color="var(--text-dim)" />
              <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.mandates.limit}</p>
            </div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              {m.max_amount}<span style={{ fontSize: '11px', marginLeft: '2px', color: 'var(--text-dim)' }}>€</span>
            </p>
          </div>
          {/* Rails */}
          <div style={{ background: 'var(--bg-panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Zap size={10} color="var(--text-dim)" />
              <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.mandates.rails}</p>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {rails.map(r => (
                <span key={r} style={{ fontSize: '10px', fontWeight: 700, color: RAIL_COLORS[r] || 'var(--text-main)', background: `${RAIL_COLORS[r] || '#666'}22`, padding: '2px 6px', borderRadius: '4px' }}>
                  {RAIL_LABELS[r] || r}
                </span>
              ))}
            </div>
          </div>
          {/* Expiry */}
          <div style={{ background: 'var(--bg-panel)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Calendar size={10} color="var(--text-dim)" />
              <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.mandates.expiry}</p>
            </div>
            {m.expires_at ? (
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: remaining !== null && remaining < 5 ? '#ff9d00' : 'var(--text-main)' }}>
                {remaining !== null && remaining > 0 ? t.mandates.daysLeft.replace('{days}', String(remaining)) : formatDate(m.expires_at)}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>{t.mandates.noLimit}</p>
            )}
          </div>
        </div>

        {/* Execution mode — regulatory clarity */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
          background: m.auto_execute ? 'rgba(16, 185, 129, 0.07)' : 'rgba(245, 158, 11, 0.07)',
          border: `1px solid ${m.auto_execute ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          borderRadius: '8px', marginBottom: '10px'
        }}>
          {m.auto_execute
            ? <Bot size={16} color="var(--success-green)" style={{ flexShrink: 0 }} />
            : <UserCheck size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          }
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: m.auto_execute ? 'var(--success-green)' : '#f59e0b' }}>
              {m.auto_execute ? t.mandates.autoExecute : t.mandates.approvalRequired}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--text-dim)' }}>
              {m.auto_execute ? t.mandates.autoExecuteDesc : t.mandates.approvalRequiredDesc}
            </p>
          </div>
        </div>

        {/* Regulatory footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            <Info size={10} style={{ display: 'inline', marginRight: '4px' }} />
            {t.mandates.signedOn.replace('{date}', formatDate(m.sca_timestamp || m.createdAt))}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{m.currency}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-enter" style={{ color: 'var(--text-main)' }}>
      {/* Title + action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)' }}>{t.mandates.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
            {activeCount} {activeCount > 1 ? t.mandates.actives : t.mandates.active}
          </p>
        </div>
        <button
          className="primary-button"
          style={{ padding: '10px 16px', fontSize: '13px', gap: '8px' }}
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={16} />
          <span>{t.mandates.btnDelegate}</span>
        </button>
      </div>

      {/* Regulatory explainer */}
      <div className="glass-panel" data-didactic-key="mandate_atos" style={{ marginBottom: '20px', padding: '14px', background: 'rgba(112,0,255,0.06)', borderColor: 'rgba(112,0,255,0.3)' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent-neon)' }}>{t.mandates.delegationNotice} {t.mandates.delegationNoticeBold}</strong> {t.mandates.delegationNoticeDesc}
        </p>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-panel animate-enter" style={{ marginBottom: '24px', borderColor: 'var(--accent-neon)', background: 'var(--bg-panel)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--accent-neon)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} />
            {t.mandates.newMandate}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                <DollarSign size={11} style={{ display: 'inline', marginRight: '4px' }} />{t.mandates.maxLimit}
              </label>
              <input type="number" value={form.max_amount}
                onChange={e => setForm({ ...form, max_amount: +e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />{t.mandates.durationDays}
              </label>
              <input type="number" value={form.duration_days}
                onChange={e => setForm({ ...form, duration_days: +e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              <Tag size={11} style={{ display: 'inline', marginRight: '4px' }} />{t.mandates.merchantCategory}
            </label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '10px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '14px' }}>
              {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              <Zap size={11} style={{ display: 'inline', marginRight: '4px' }} />{t.mandates.paymentRail}
            </label>
            <select value={form.rail} onChange={e => setForm({ ...form, rail: e.target.value })}
              style={{ width: '100%', padding: '10px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '14px' }}>
              <option value="SEPA" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}>{t.mandates.railsOptions.sepa}</option>
              <option value="STABLECOIN_EURC" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}>{t.mandates.railsOptions.eurc}</option>
              <option value="L402" style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}>{t.mandates.railsOptions.l402}</option>
            </select>
          </div>

          {/* Execution mode toggle */}
          <div
            onClick={() => setForm({ ...form, auto_execute: !form.auto_execute })}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-panel)', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', border: `1px solid ${form.auto_execute ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}
          >
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {form.auto_execute
                  ? <Bot size={14} color="var(--success-green)" />
                  : <UserCheck size={14} color="#f59e0b" />
                }
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {form.auto_execute ? t.mandates.fullAuto : t.mandates.humanInTheLoop}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>
                {form.auto_execute ? t.mandates.fullAutoDesc : t.mandates.humanInTheLoopDesc}
              </p>
            </div>
            {form.auto_execute
              ? <ToggleRight size={32} color="var(--success-green)" style={{ flexShrink: 0 }} />
              : <ToggleLeft size={32} color="#f59e0b" style={{ flexShrink: 0 }} />
            }
          </div>

          {/* Regulatory warning for auto */}
          {form.auto_execute && (
            <div style={{ display: 'flex', gap: '8px', padding: '10px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#f59e0b', lineHeight: 1.5 }}>
                {t.mandates.warningAuto}
              </p>
            </div>
          )}

          {scanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
              <ScanFace size={48} className="animate-spin" color="var(--accent-neon)" />
              <p style={{ color: 'var(--accent-neon)', fontSize: '14px' }}>{t.mandates.biometricValidation}</p>
            </div>
          ) : (
            <button className="primary-button" onClick={handleSubmitForm}>
              <ScanFace size={20} />
              <span>{t.mandates.btnSign}</span>
            </button>
          )}
        </div>
      )}

      {/* Active mandates */}
      {activeMandates.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '20px' }}>
          <ShieldCheck size={32} color="var(--text-dim)" style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-dim)', marginBottom: '8px' }}>{t.mandates.emptyState}</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{t.mandates.emptyStateDesc}</p>
        </div>
      ) : (
        activeMandates.map(m => <MandateCard key={m.mandate_id} m={m} />)
      )}

      {/* Revoked history toggle */}
      {revokedMandates.length > 0 && (
        <>
          <button
            onClick={() => setShowRevoked(v => !v)}
            style={{
              width: '100%', padding: '12px', background: 'transparent',
              border: '1px solid var(--border-light)', borderRadius: '10px',
              color: 'var(--text-dim)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginBottom: showRevoked ? '16px' : '0', fontFamily: 'inherit', fontSize: '13px'
            }}
          >
            <EyeOff size={14} />
            {showRevoked ? t.mandates.hideHistory : t.mandates.showHistory.replace('{count}', String(revokedMandates.length))}
          </button>
          {showRevoked && revokedMandates.map(m => <MandateCard key={m.mandate_id} m={m} />)}
        </>
      )}
    </div>
  );
};
