'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Cpu, FileText, Globe, BrainCircuit, Zap, ArrowUpRight, ArrowDownRight, Info, Bookmark, RotateCcw, Sparkles, ExternalLink, ChevronRight, Users, Terminal, Clock, Coins, Scale, Search, Fingerprint } from 'lucide-react';

interface Stats {
  onchain: { sharesA: number; sharesB: number; poolSize: number; priceA: number; priceB: number; resolved: boolean };
  portfolio: { totalTrades: number; wins: number; losses: number; pnl: number; bankroll: number; winRate: number };
  markets: any[];
  decisions: any[];
  history: { timestamp: string; bankroll: number; pnl: number; totalTrades: number }[];
  news: any[];
  contract: string;
  agent: string;
  model: string;
  timestamp: string;
}

const CATEGORY_MAP: Record<string, string> = {
  'btc-100k-july': 'Finance',
  'fed-rate-cut-june': 'Finance',
  'usdc-supply-2b': 'Finance',
};

function addr(a: string) { return a ? a.slice(0, 6) + '...' + a.slice(-4) : '—'; }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error('fetch error', e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const o = stats?.onchain || { sharesA: 0, sharesB: 0, poolSize: 0, priceA: 0, priceB: 0, resolved: false };
  const p = stats?.portfolio || { totalTrades: 0, wins: 0, losses: 0, pnl: 0, bankroll: 1000, winRate: 0 };
  const markets = stats?.markets || [];
  const decisions = stats?.decisions || [];
  const history = stats?.history || [];
  const news = stats?.news || [];

  const pnl = Number(p.pnl || 0);
  const wr = Number(p.winRate || 0);
  const latestHistory = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#1A1A1A] font-sans selection:bg-black/10 antialiased duration-150">
      
      {/* Header */}
      <div className="border-b border-[#F0F0F0] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-full text-white shadow-sm flex items-center justify-center">
              <Fingerprint className="h-5 w-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#999]">INTELLIGENCE MODULE</span>
                <span className="inline-flex items-center rounded-full bg-[#F5F5F5] px-1.5 py-0.5 text-[9px] font-bold text-[#1A1A1A]">PRO</span>
              </div>
              <h1 className="text-xl font-bold tracking-tighter uppercase text-black leading-none mt-0.5">
                Vantage<span className="font-extralight text-[#707070]">.Intel</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#707070] font-mono">
            <div className="flex items-center gap-1.5 py-1.5 px-3 bg-[#F5F5F5] rounded-full">
              <Clock className="h-3.5 w-3.5 text-[#999]" />
              <span>{stats ? new Date(stats.timestamp).toUTCString() : 'Loading...'}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 py-1.5 px-3 bg-[#F5F5F5] rounded-full">
              <Coins className="h-3.5 w-3.5 text-[#999]" />
              <span>${p.bankroll.toFixed(0)} USDC</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 bg-[#F5F5F5] rounded-full">
              <Scale className="h-3.5 w-3.5 text-[#999]" />
              <span>{p.totalTrades} Trades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 md:py-20 border-b border-[#F0F0F0] bg-[#FCFCFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-black bg-[#F5F5F5] font-semibold mb-6">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>{stats ? `Agent ${addr(stats.agent)}` : 'Loading...'} &middot; {stats?.model || 'GPT-4o'}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-black max-w-4xl mx-auto leading-tight">
            Autonomous prediction market intelligence with <span className="font-serif italic text-black tracking-normal">Arc execution</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#707070] max-w-2xl mx-auto font-light leading-relaxed">
            Scanning on-chain consensus thresholds, executing Kelly-optimized trades via Circle Agent Stack, and reporting real-time portfolio analytics.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Portfolio + Analysis */}
          <div className="col-span-1 lg:col-span-7 space-y-8">
            
            {/* Portfolio Stats */}
            <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <BrainCircuit className="h-5 w-5 text-black" />
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Portfolio Intelligence</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0]">
                  <p className="text-[10px] uppercase font-mono text-[#999] mb-1">Bankroll</p>
                  <p className="text-2xl font-bold font-mono text-black">${p.bankroll.toFixed(2)}</p>
                  <p className="text-[10px] text-[#707070] font-mono mt-1">USDC</p>
                </div>
                <div className="p-4 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0]">
                  <p className="text-[10px] uppercase font-mono text-[#999] mb-1">PnL</p>
                  <p className={`text-2xl font-bold font-mono ${pnl >= 0 ? 'text-black' : 'text-[#707070]'}`}>
                    {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-[#707070] font-mono mt-1">{(wr * 100).toFixed(1)}% Win Rate</p>
                </div>
                <div className="p-4 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0]">
                  <p className="text-[10px] uppercase font-mono text-[#999] mb-1">Shares</p>
                  <p className="text-2xl font-bold font-mono text-black">{o.sharesA.toFixed(1)}</p>
                  <p className="text-[10px] text-[#707070] font-mono mt-1">Outcome A</p>
                </div>
                <div className="p-4 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0]">
                  <p className="text-[10px] uppercase font-mono text-[#999] mb-1">Trades</p>
                  <p className="text-2xl font-bold font-mono text-black">{p.totalTrades}</p>
                  <p className="text-[10px] text-[#707070] font-mono mt-1">{p.wins}W / {p.losses}L</p>
                </div>
              </div>
              {/* Mini price gauge */}
              <div className="mt-6 p-4 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#999] mb-2">
                  <span>Market Price A: {(o.priceA * 100).toFixed(1)}%</span>
                  <span>Pool: {o.poolSize.toFixed(1)} USDC</span>
                  <span className={o.resolved ? 'text-amber-500' : o.poolSize > 0 ? 'text-green-600' : 'text-blue-500'}>
                    {o.resolved ? 'Resolved' : o.poolSize > 0 ? 'Active' : 'Open'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${o.priceA * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Agent Intelligence Brief */}
            <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm overflow-hidden">
              <div className="border-b border-[#F0F0F0] p-6 sm:p-8 bg-white flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-black font-bold bg-[#F5F5F5] px-2.5 py-1 rounded-full">
                      AGENT INTELLIGENCE
                    </span>
                    <span className="text-xs text-[#707070] font-mono">{stats?.model || 'GPT-4o'}</span>
                  </div>
                  <h3 className="text-2xl font-light tracking-tight text-[#1A1A1A] max-w-xl leading-tight mt-2">
                    Agent Decisions & Reasoning
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {decisions.length === 0 ? (
                  <div className="py-12 border border-dashed border-[#F0F0F0] rounded-2xl text-center text-[#999] text-xs font-mono">
                    <BrainCircuit className="h-5 w-5 mx-auto mb-2" />
                    <p>No agent decisions yet. Agent will analyze markets on next loop.</p>
                  </div>
                ) : (
                  decisions.filter(d => d.action === 'BUY').map((dec, i) => {
                    const market = markets.find(m => m.marketId === dec.marketId);
                    const odds = dec.outcome === 'A' ? market?.oddsA : market?.oddsB;
                    const edge = odds ? ((dec.probability - odds) * 100).toFixed(1) : '—';
                    const diff = dec.probability * 100 - (odds || 0) * 100;
                    return (
                      <div key={i} className="p-5 bg-[#FCFCFC] rounded-2xl border border-[#F0F0F0] space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-medium text-black">{market?.title || dec.marketId}</h4>
                            <p className="text-[10px] text-[#707070] font-mono mt-1">Outcome {dec.outcome} &middot; Kelly {((dec.kellyFraction || 0) * 100).toFixed(1)}% &middot; ${parseInt(dec.amount || '0') / 1e6}</p>
                          </div>
                          <span className="shrink-0 inline-flex items-center rounded-full bg-black text-white text-[10px] font-bold font-mono px-3 py-1">
                            {dec.action}
                          </span>
                        </div>

                        {/* Probability gauge */}
                        <div className="relative w-full h-2 bg-[#F0F0F0] rounded-full">
                          <div className="absolute h-3 w-3 rounded-full bg-black border-2 border-white -translate-x-1/2 -translate-y-[2px]" style={{ left: `${dec.probability * 100}%`, top: '-2px' }} />
                          <div className="absolute h-2.5 w-2.5 rounded-full bg-[#999] border-2 border-white -translate-x-1/2 -translate-y-[1px]" style={{ left: `${(odds || 0) * 100}%`, top: '-1px' }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[#999]">
                          <span>Agent: {(dec.probability * 100).toFixed(0)}%</span>
                          <span className="text-black font-bold">{diff > 0 ? '+' : ''}{diff.toFixed(1)}% Edge</span>
                          <span>Market: {((odds || 0) * 100).toFixed(0)}%</span>
                        </div>

                        {/* Reasoning */}
                        <div className="p-4 bg-white rounded-xl border border-[#F0F0F0] text-xs text-[#707070] leading-relaxed italic">
                          &ldquo;{dec.reasoning}&rdquo;
                        </div>

                        {/* Variance tag */}
                        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${diff > 5 ? 'bg-[#F5F5F5] border-[#F0F0F0]' : diff < -5 ? 'bg-[#F5F5F5] border-[#F0F0F0]' : 'bg-[#FCFCFC] border-[#F0F0F0]'}`}>
                          <Info className="h-3.5 w-3.5 text-[#999]" />
                          {diff > 5 ? 'BULLISH DIVERGENCE (UNDERPRICED)' : diff < -5 ? 'BEARISH DIVERGENCE (OVERPRICED)' : 'EFFICIENT SENTIMENT'}
                        </div>
                      </div>
                    );
                  })
                )}

                {decisions.filter(d => d.action === 'SKIP').length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Skipped Markets</h4>
                    {decisions.filter(d => d.action === 'SKIP').map((dec, i) => (
                      <div key={i} className="p-3 bg-[#FCFCFC] rounded-xl border border-[#F0F0F0] flex items-center justify-between">
                        <span className="text-xs text-[#707070]">{dec.marketId}</span>
                        <span className="text-[10px] text-[#999] font-mono">{dec.reasoning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio History Chart */}
            {history.length > 1 && (
              <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-black" />
                    <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Portfolio History</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#707070]">{history.length} data points</span>
                </div>
                <div className="flex flex-col gap-2">
                  {history.slice(-10).reverse().map((h, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs font-mono p-2 border-b border-[#F0F0F0] last:border-0">
                      <span className="w-20 text-[#999]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                      <span className="w-28 text-black font-bold">${h.bankroll.toFixed(2)}</span>
                      <span className={`${h.pnl >= 0 ? 'text-black' : 'text-[#707070]'}`}>{h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}</span>
                      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${(h.bankroll / (history[history.length - 1]?.bankroll || 1000)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Markets + News */}
          <div className="col-span-1 lg:col-span-12 xl:col-span-5 space-y-8">
            
            {/* Markets */}
            <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-black" />
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Monitored Markets</h3>
              </div>

              {markets.length === 0 ? (
                <div className="py-8 border border-dashed border-[#F0F0F0] rounded-2xl text-center text-[#999] text-xs font-mono">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2" />
                  <p>No markets loaded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {markets.map((market: any) => {
                    const dec = decisions.find(d => d.marketId === market.marketId);
                    return (
                      <div key={market.marketId} className="group p-4 bg-[#FCFCFC] hover:bg-white rounded-2xl border border-[#F0F0F0] hover:border-black/10 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-3.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded bg-[#F5F5F5] px-2 py-0.5 text-[9px] font-mono font-bold">
                                {CATEGORY_MAP[market.marketId] || 'Finance'}
                              </span>
                              <span className="text-[10px] text-[#999] font-mono">Arc Testnet</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-medium text-black leading-normal">{market.title}</h4>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base sm:text-lg font-bold font-mono text-black leading-none">
                              {((dec?.outcome === 'A' ? market.oddsA : market.oddsB) * 100).toFixed(0)}%
                            </div>
                            <span className="text-[9px] text-[#999] uppercase tracking-wider font-mono">Odds {dec?.outcome || 'A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#F0F0F0] pt-3 mt-3">
                          <div className="flex items-center gap-3.5 text-[10px] font-mono text-[#999]">
                            <div>
                              <span className="text-[#999] mr-1 uppercase text-[9px]">A:</span>
                              <span className="text-black">{(market.oddsA * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-[#999] mr-1 uppercase text-[9px]">B:</span>
                              <span className="text-black">{(market.oddsB * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-[#999] mr-1 uppercase text-[9px]">DECISION:</span>
                              <span className={`font-semibold ${dec?.action === 'BUY' ? 'text-black' : 'text-[#707070]'}`}>
                                {dec?.action || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* News Feed */}
            <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-black" />
                  <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Signal Feed</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#F5F5F5] py-0.5 px-2.5 rounded-full">{news.length} signals</span>
              </div>

              {news.length === 0 ? (
                <div className="py-8 border border-dashed border-[#F0F0F0] rounded-2xl text-center text-[#999] text-xs font-mono">
                  <Globe className="h-5 w-5 mx-auto mb-2" />
                  <p>No news signals yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {news.map((n: any, i: number) => (
                    <div key={i} className="p-4 bg-[#FCFCFC]/65 rounded-2xl border border-[#F0F0F0]">
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-mono font-bold ${
                          (n.sentiment || '').toLowerCase() === 'positive' ? 'bg-green-50 text-green-700' :
                          (n.sentiment || '').toLowerCase() === 'negative' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {(n.sentiment || 'NEUTRAL').toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#707070] font-mono">{n.source || '—'}</span>
                      </div>
                      <h4 className="text-xs font-medium text-black leading-normal">{n.headline}</h4>
                      {n.timestamp && <p className="text-[10px] text-[#999] font-mono mt-1">{new Date(n.timestamp).toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trade History */}
            <TradeHistory />
          </div>
        </div>
      </div>

      <footer className="border-t border-[#F0F0F0] bg-[#FCFCFC] py-16 mt-16 text-center text-[#999] font-mono text-xs space-y-3">
        <p>&copy; 2026 VANTAGE.INTEL &middot; ARC TESTNET &middot; HACKATHON CANTEEN x CIRCLE</p>
        <p className="text-[10px]">Agent {stats ? addr(stats.agent) : '—'} &middot; Contract {stats ? addr(stats.contract) : '—'}</p>
      </footer>
    </div>
  );
}

function TradeHistory() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch('/api/trades');
        const data = await res.json();
        setTrades(data.trades || []);
      } catch {}
    };
    fetchTrades();
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-black" />
          <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Trade History</h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#F5F5F5] py-0.5 px-2.5 rounded-full">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <div className="py-8 border border-dashed border-[#F0F0F0] rounded-2xl text-center text-[#999] text-xs font-mono">
          <Bookmark className="h-5 w-5 mx-auto mb-2" />
          <p>No trade history</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {trades.slice(0, 20).map((t: any, i: number) => {
            const won = t.result === 'WON', loss = t.result === 'LOST';
            return (
              <div key={i} className="p-4 bg-[#FCFCFC]/65 rounded-2xl border border-[#F0F0F0] flex items-start justify-between gap-3">
                <div className="space-y-1 truncate">
                  <h4 className="text-xs font-medium text-black truncate">{t.marketId || '—'}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#707070]">
                    <span>{(t.action === 'BUY' ? '▲' : '—')} {t.outcome}</span>
                    <span>${parseInt(t.amount || '0') / 1e6}</span>
                    <span>{(t.probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {won ? <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">WIN</span> : loss ? <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">LOSS</span> : null}
                  {t.timestamp && <span className="text-[9px] text-[#999] font-mono">{new Date(t.timestamp).toLocaleTimeString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
