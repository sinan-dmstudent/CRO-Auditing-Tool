'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url) return;

        // Basic URL validation
        let validUrl = url;
        if (!url.startsWith('http')) {
            validUrl = `https://${url}`;
        }

        setLoading(true);
        router.push(`/report?url=${encodeURIComponent(validUrl)}`);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '400px',
                background: 'linear-gradient(180deg, #f0f7f5 0%, rgba(240, 247, 245, 0) 100%)',
                zIndex: -1
            }}></div>

            <div className="container" style={{ textAlign: 'center', zIndex: 1, paddingBottom: '5rem' }}>
                <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <span style={{
                        color: 'var(--accent)',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        letterSpacing: '0.05em',
                        background: 'var(--accent-light)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px'
                    }}>
                        BETA
                    </span>
                </div>

                <h1 className="animate-fade-in" style={{
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                }}>
                    Improve your store<br />
                    conversion rate
                </h1>

                <p className="animate-fade-in" style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    animationDelay: '0.1s'
                }}>
                    Instant, AI-powered CRO audit for your e-commerce store.
                    Detect issues and get actionable solutions in seconds.
                </p>

                <form onSubmit={handleSubmit} className="animate-fade-in" style={{ animationDelay: '0.2s', maxWidth: '600px', margin: '0 auto' }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="https://mystore.com/"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Analyzing...' : 'Audit Store'}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '4rem', opacity: 0.6, fontSize: '0.9rem' }} className="animate-fade-in">
                    <p>Powered by <strong>Gemini</strong> & <strong>Firecrawl</strong></p>
                </div>
            </div>
        </main>
    );
}
