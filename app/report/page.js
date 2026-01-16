'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';

function ReportContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const [activeTab, setActiveTab] = useState('Homepage');




    useEffect(() => {
        if (!url) return;

        const fetchData = async () => {
            setStatus('Preparing report...');
            try {
                const res = await fetch('/api/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.details || err.error || 'Failed to audit');
                }

                setStatus('Analyzing with Gemini...');
                const result = await res.json();
                setData(result);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchData();
    }, [url]);

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <h2 style={{ color: '#d82c0d' }}>Audit Failed</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Try Again</Link>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e1e3e5',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{status}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>This may take up to a minute.</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>CRO Audit Report</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{url}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: 'var(--accent-light)',
                            color: 'var(--accent-dark)',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            {data.niche}
                        </span>
                        <Link href="/" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Audit New Store
                        </Link>
                    </div>
                </div>

                {data.store_summary && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                    }}>
                        <strong>Store Summary:</strong> {data.store_summary}
                    </div>
                )}
            </header>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '2rem',
                background: 'white',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: '1rem',
                zIndex: 100
            }}>
                {['Homepage', 'Collection Page', 'Product Page', 'Cart Page'].map((type) => {
                    const label = type.replace(' Page', '');
                    const isActive = activeTab === type;
                    return (
                        <button
                            key={type}
                            onClick={() => {
                                setActiveTab(type);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                border: 'none',
                                borderRight: '1px solid var(--border)',
                                background: isActive ? 'var(--accent)' : 'var(--accent-light)',
                                color: isActive ? 'white' : 'var(--accent-dark)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                fontSize: '1rem',
                                letterSpacing: '0.5px',
                                padding: '1.25rem'
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gap: '3rem' }}>
                {data.results.filter(page => page.type === activeTab).map((page, idx) => (
                    <section key={idx}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            marginBottom: '1rem'
                        }}>
                            {page.type}
                        </h2>

                        {page.error ? (
                            <div className="card" style={{ color: '#d82c0d', background: '#fff4f4', borderColor: '#fedcd5' }}>
                                Could not analyze this page: {page.error}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {page.findings.length === 0 && (
                                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No specific issues found for this page.
                                    </div>
                                )}
                                {page.findings.map((item, i) => (
                                    <div key={i} className="card" style={{ padding: '0', overflow: 'hidden', display: 'block' }}>
                                        {/* Header Row: Section Name & Badges */}
                                        <div style={{
                                            background: '#f9fafb',
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)',
                                                margin: 0
                                            }}>
                                                {item.section_name || 'General Observation'}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(item.severity || 'Medium').toLowerCase().includes('high') && (
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', background: '#fff4f4', color: '#d82c0d', border: '1px solid #fedcd5' }}>
                                                        High Severity
                                                    </span>
                                                )}
                                                {!(item.severity || '').toLowerCase().includes('high') && (
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', background: '#fff9db', color: '#e67700', border: '1px solid #ffec99' }}>
                                                        {item.severity || 'Medium'} Severity
                                                    </span>
                                                )}

                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', background: '#ebfbee', color: '#2b8a3e', border: '1px solid #d3f9d8' }}>
                                                    {item.effort || 'Low'} Effort
                                                </span>
                                            </div>
                                        </div>

                                        {/* Insights Row */}
                                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '1rem' }}>
                                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Insights</strong>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                                {Array.isArray(item.insights) ? (
                                                    item.insights.map((pt, idx) => <li key={idx} style={{ marginBottom: '0.5rem' }}>{pt}</li>)
                                                ) : (
                                                    <li style={{ marginBottom: '0.5rem' }}>{item.insight || item.insights}</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Solutions Row */}
                                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'minmax(100px, 150px) 1fr', gap: '1rem' }}>
                                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Solutions</strong>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                                {Array.isArray(item.solutions) ? (
                                                    item.solutions.map((sol, idx) => {
                                                        const text = typeof sol === 'object' && sol.text ? sol.text : sol;
                                                        const svgContent = typeof sol === 'object' ? sol.reference_image_svg : null;

                                                        return (
                                                            <li key={idx} style={{ marginBottom: '1rem' }}>
                                                                <div style={{ marginBottom: '0.25rem' }}>{String(text)}</div>
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    <li style={{ marginBottom: '0.5rem' }}>
                                                        {typeof (item.solution || item.solutions) === 'object' ? (item.solution || item.solutions).text : (item.solution || item.solutions)}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>


                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>


        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '4rem' }}>Loading...</div>}>
            <ReportContent />
        </Suspense>
    );
}
