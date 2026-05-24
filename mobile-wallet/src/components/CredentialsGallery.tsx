import React, { useState, useEffect } from 'react';
import { UserCircle, BadgeCheck, FileText, Loader2, Car, Lock, GraduationCap, Ticket } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

export const CredentialsGallery = () => {
    const { lang } = useSettings();
    const t = translations[lang];

    const [attributes, setAttributes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/v1/wallet/attributes')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    let attrs = [...data.attributes];
                    if (!attrs.find((a: any) => a.type === 'StudentCard')) {
                        attrs.push({
                            id: 'stub-student-card',
                            type: 'StudentCard',
                            issuer: 'did:web:universite-paris-saclay.fr',
                            status: 'ACTIVE',
                            zkp_capable: false,
                            payload: JSON.stringify({
                                student_id: '2023-A-87391',
                                faculty: 'Computer Science',
                                status: 'is_student',
                                valid_until: '2027-08-31'
                            })
                        });
                    }
                    if (!attrs.find((a: any) => a.type === 'CinemaTicket')) {
                        attrs.push({
                            id: 'stub-cinema-ticket',
                            type: 'CinemaTicket',
                            issuer: 'did:web:ugc.fr',
                            status: 'ACTIVE',
                            zkp_capable: false,
                            payload: JSON.stringify({
                                ticket_id: 'TKT-991A-2026',
                                movie: 'Dune: Part Three',
                                date: '2026-04-22T21:00:00Z',
                                seat: 'G-12',
                                ticket_ref_cinema: true
                            })
                        });
                    }
                    setAttributes(attrs);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="#0EA5E9" size={32} /></div>;
    }

    if (attributes.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                <UserCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p>{t.vault.emptyState}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
            {attributes.map(attr => {
                const payload = JSON.parse(attr.payload || '{}');
                const isZkp = attr.zkp_capable;

                if (attr.type === 'IdentityCredential') {
                    return (
                        <div key={attr.id} style={{
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 50%, #fee2e2 100%)',
                            borderRadius: '16px', padding: '20px', border: '1px solid #CBD5E1', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
                            fontFamily: 'system-ui, sans-serif'
                        }}>
                            <img src="https://france-identite.gouv.fr/images/logo_france_identite_3.svg" alt="FI" style={{ position: 'absolute', top: 16, right: 16, height: '24px', opacity: 0.8 }} />
                            
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                {t.vault.rf}<br/>
                                <span style={{ fontSize: '14px', color: '#0F172A' }}>{t.vault.identityCard}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '80px', height: '100px', background: '#F1F5F9', borderRadius: '8px', border: '2px solid white', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <UserCircle size={64} color="#CBD5E1" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>{t.vault.surname}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{payload.family_name?.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>{t.vault.givenName}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{payload.given_name}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>{t.vault.birthDate}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{payload.birthdate}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase' }}>{t.vault.nationality}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{payload.nationality}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (attr.type === 'DrivingLicense') {
                    return (
                        <div key={attr.id} style={{
                            background: 'linear-gradient(135deg, #fce7f3 0%, #ffffff 50%, #fbcfe8 100%)', // Pink gradient for FR driving license
                            borderRadius: '16px', padding: '20px', border: '1px solid #F9A8D4', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
                            fontFamily: 'system-ui, sans-serif'
                        }}>
                            <img src="https://france-identite.gouv.fr/images/logo_france_identite_3.svg" alt="FI" style={{ position: 'absolute', top: 16, right: 16, height: '24px', opacity: 0.8 }} />
                            <Car size={40} color="#F472B6" style={{ position: 'absolute', bottom: -10, right: 16, opacity: 0.15 }} />
                            
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#BE185D', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                {t.vault.rf}<br/>
                                <span style={{ fontSize: '14px', color: '#831843' }}>{t.vault.drivingLicense}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '80px', height: '100px', background: '#FDF2F8', borderRadius: '8px', border: '2px solid white', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <UserCircle size={64} color="#FBCFE8" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#9D174D', textTransform: 'uppercase' }}>{t.vault.categories}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#831843', letterSpacing: '2px' }}>
                                            {payload.categories?.join(' / ')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#9D174D', textTransform: 'uppercase' }}>{t.vault.docNumber}</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#831843', fontFamily: 'monospace' }}>{payload.document_number}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                                        <Lock size={12} color="#059669" />
                                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>{t.vault.sdJwt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (attr.type === 'StudentCard') {
                    return (
                        <div key={attr.id} style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #fef3c7 100%)',
                            borderRadius: '16px', padding: '20px', border: '1px solid #FCD34D', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
                            fontFamily: 'system-ui, sans-serif'
                        }}>
                            <GraduationCap size={40} color="#F59E0B" style={{ position: 'absolute', bottom: -5, right: 16, opacity: 0.15 }} />
                            
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                {lang === 'fr' ? 'Éducation Nationale' : 'National Education'}<br/>
                                <span style={{ fontSize: '14px', color: '#78350F' }}>{lang === 'fr' ? 'Carte Étudiant' : 'Student Card'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '80px', height: '100px', background: '#FFFBEB', borderRadius: '8px', border: '2px solid white', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <UserCircle size={64} color="#FDE68A" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#B45309', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Filière' : 'Field of Study'}</div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#78350F' }}>{payload.faculty}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#B45309', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Numéro Étudiant' : 'Student ID'}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350F', fontFamily: 'monospace' }}>{payload.student_id}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#B45309' }}>
                                        {lang === 'fr' ? 'Valide jusqu’au' : 'Valid until'} {payload.valid_until}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (attr.type === 'CinemaTicket') {
                    return (
                        <div key={attr.id} style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '16px', padding: '20px', border: '1px solid #334155', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden',
                            fontFamily: 'system-ui, sans-serif'
                        }}>
                            <Ticket size={40} color="#3b82f6" style={{ position: 'absolute', bottom: 10, right: 16, opacity: 0.2 }} />
                            
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                {attr.issuer.split(':')[2]?.toUpperCase()}<br/>
                                <span style={{ fontSize: '14px', color: 'white' }}>{lang === 'fr' ? 'Billet de Cinéma' : 'Movie Ticket'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ background: '#3b82f6', color: 'white', fontWeight: 800, fontSize: '18px', textAlign: 'center', padding: '12px', borderRadius: '8px' }}>
                                        {payload.seat}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>{lang === 'fr' ? 'Siège' : 'Seat'}</div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Séance' : 'Screening'}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{payload.movie}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{lang === 'fr' ? 'Référence' : 'Ticket Ref.'}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 400, color: '#cbd5e1', fontFamily: 'monospace' }}>{payload.ticket_id}</div>
                                    </div>
                                    {payload.date && (
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                            {new Date(payload.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }

                // Default Fallback / Age Proof
                return (
                    <div key={attr.id} style={{ background: 'var(--bg-panel)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', color: 'var(--text-main)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isZkp ? '#10B981' : '#0EA5E9' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                                {attr.type === 'AgeProof' ? <BadgeCheck size={20} color="#10B981" /> : <UserCircle size={20} color="#0EA5E9" />}
                                {attr.type === 'AgeProof' ? t.vault.ageProof : attr.type}
                            </div>
                            {isZkp && <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ZKP Capable</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{t.vault.issuer} {attr.issuer}</div>
                            
                            <div style={{ background: 'var(--bg-panel-hover)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                {Object.entries(payload).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                                        <strong>{String(v)}</strong>
                                    </div>
                                ))}
                            </div>
                            
                            {attr.format === 'sd_jwt' && (
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FileText size={12} /> {t.vault.format}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
