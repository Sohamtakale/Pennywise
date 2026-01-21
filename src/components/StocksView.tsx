import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Sidebar.css'; // Reusing for consistent fonts

interface Ticker {
    symbol: string;
    name: string;
    price: number;
    change: number;
    pct: number;
    color: string;
}

interface NewsItem {
    source: string;
    headline: string;
    time: string;
}

interface MarketData {
    tickers: Ticker[];
    news: NewsItem[];
}

interface TickerDetails {
    symbol: string;
    info: Ticker;
    chart: { time: string; price: number }[];
    about: string;
    key_stats: any;
}

const StocksView: React.FC = () => {
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [details, setDetails] = useState<TickerDetails | null>(null);

    const fetchMarket = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/market');
            const data = await res.json();
            setMarketData(data);
            if (!selectedTicker && data.tickers.length > 0) {
                setSelectedTicker(data.tickers[0].symbol);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDetails = async (symbol: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/market/${symbol}`);
            const data = await res.json();
            setDetails(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMarket();
        const interval = setInterval(fetchMarket, 3000); // Live poll every 3s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTicker) {
            fetchDetails(selectedTicker);
        }
    }, [selectedTicker, marketData]); // Refresh details when market data updates (for price sync)

    if (!marketData) return <div style={{ padding: 20 }}>Loading Market Data...</div>;

    return (
        <div style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
            {/* Left Sidebar List */}
            <div style={{
                width: '300px',
                background: '#1c1c1e',
                color: 'white',
                overflowY: 'auto',
                borderRight: '1px solid #333'
            }}>
                <div style={{ padding: '15px 20px', fontSize: '1.5em', fontWeight: 'bold' }}>Stocks</div>
                <div style={{ padding: '0 10px' }}>
                    <div style={{ background: '#2c2c2e', borderRadius: '10px', padding: '10px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8em', color: '#8e8e93', fontWeight: '600' }}>Business News</div>
                        <div style={{ fontSize: '0.9em', fontWeight: '500', marginTop: '5px' }}>Top Stories from Yahoo Finance</div>
                    </div>
                </div>

                {marketData.tickers.map(t => (
                    <div
                        key={t.symbol}
                        onClick={() => setSelectedTicker(t.symbol)}
                        style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid #2c2c2e',
                            cursor: 'pointer',
                            background: selectedTicker === t.symbol ? '#2c2c2e' : 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{t.symbol}</div>
                            <div style={{ fontSize: '0.9em', color: '#aeaeb2' }}>{t.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '500' }}>{t.price.toFixed(2)}</div>
                            <div style={{
                                background: t.color,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.85em',
                                fontWeight: '600',
                                marginTop: '4px',
                                minWidth: '70px',
                                textAlign: 'center'
                            }}>
                                {t.change > 0 ? '+' : ''}{t.change.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Main Panel */}
            <div style={{ flex: 1, background: '#000', color: 'white', overflowY: 'auto', padding: '30px' }}>
                {details && (
                    <>
                        {/* Header */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{details.symbol}</div>
                            <div style={{ fontSize: '1.2em', color: '#8e8e93' }}>{details.info.name}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginTop: '10px' }}>
                                <div style={{ fontSize: '2em', fontWeight: '600' }}>{details.info.price.toFixed(2)}</div>
                                <div style={{
                                    fontSize: '1.2em',
                                    color: details.info.color,
                                    fontWeight: '500'
                                }}>
                                    {details.info.change > 0 ? '+' : ''}{details.info.change.toFixed(2)} ({details.info.pct}%)
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div style={{ height: '300px', marginBottom: '40px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={details.chart}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={details.info.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={details.info.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Tooltip
                                        contentStyle={{ background: '#1c1c1e', border: 'none', borderRadius: '8px' }}
                                        labelStyle={{ color: '#8e8e93' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={details.info.color}
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            {Object.entries(details.key_stats).map(([k, v]) => (
                                <div key={k} style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                    <div style={{ color: '#8e8e93', fontSize: '0.9em', marginBottom: '5px' }}>{k}</div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1em' }}>{v as string}</div>
                                </div>
                            ))}
                        </div>

                        {/* News Feed */}
                        <div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>News</div>
                            {marketData.news.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{item.source}</span>
                                        <span style={{ color: '#8e8e93', fontSize: '0.9em' }}>{item.time}</span>
                                    </div>
                                    <div style={{ fontSize: '1em', lineHeight: '1.4' }}>{item.headline}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StocksView;
