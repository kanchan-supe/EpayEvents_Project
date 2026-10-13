'use client';

import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { 
  CheckCircle2, AlertCircle, RefreshCw, PlusCircle, Database, 
  Table, Layers, ShieldCheck, Radio, Server, Sparkles
} from 'lucide-react';

export default function TestSupabasePage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'orders' | 'tickets'>('events');
  const [dataList, setDataList] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchTableData = async (table: 'events' | 'orders' | 'tickets') => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        setStatusMsg({ text: `Query error: ${error.message}`, isError: true });
        setDataList([]);
      } else {
        setDataList(data || []);
      }
    } catch (err: any) {
      setStatusMsg({ text: err?.message || 'Failed to query database', isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchTableData(activeTab);
    }
  }, [activeTab]);

  const handleSeedMockData = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const sampleEvent = {
        id: `evt-${Date.now()}`,
        title: 'ePay Global FinTech & Payments Summit 2026',
        slug: `epay-fintech-summit-${Date.now().toString().slice(-4)}`,
        short_description: 'Join 2,000+ engineers, founders, and product teams building instant payments.',
        description: 'Comprehensive summit on UPI, micro-settlements, and open payment APIs.',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
        event_type: 'hybrid',
        status: 'published',
        start_date: new Date(Date.now() + 86400000 * 14).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 15).toISOString(),
        timezone: 'IST',
        featured: true,
        category_slug: 'business-fintech',
        venue: {
          name: 'International Tech Convention Center',
          city: 'Mumbai',
          country: 'India',
        },
      };

      const { data, error } = await supabase.from('events').insert([sampleEvent]).select().single();
      if (error) {
        setStatusMsg({ text: `Insert failed: ${error.message}. (Did you execute supabase_schema.sql in Supabase SQL Editor?)`, isError: true });
      } else {
        setStatusMsg({ text: `Successfully inserted sample event "${data.title}" (ID: ${data.id})!`, isError: false });
        fetchTableData(activeTab);
      }
    } catch (err: any) {
      setStatusMsg({ text: err?.message || 'Failed to insert test event', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Supabase Database Explorer
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                  PostgreSQL
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Project URL: <span className="font-mono text-slate-300">https://jxqagybvkdfolhbjfbvb.supabase.co</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTableData(activeTab)}
              disabled={loading || !isConfigured}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSeedMockData}
              disabled={loading || !isConfigured}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Insert Test Event</span>
            </button>
          </div>
        </div>

        {/* Configuration Notice */}
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${isConfigured ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200' : 'bg-amber-950/20 border-amber-800/60 text-amber-200'}`}>
          {isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm">
              {isConfigured ? 'Supabase Credentials Connected' : 'Anon Key Required in .env.local'}
            </p>
            <p className="opacity-90 mt-0.5">
              {isConfigured
                ? 'Your project is connected to Supabase REST and Realtime endpoints.'
                : 'Please add your Supabase anon/publishable key into .env.local to query your tables live.'}
            </p>
          </div>
        </div>

        {/* Status message */}
        {statusMsg && (
          <div className={`p-3.5 rounded-lg border text-xs flex items-start space-x-2.5 ${statusMsg.isError ? 'bg-red-950/30 border-red-800/70 text-red-200' : 'bg-emerald-950/30 border-emerald-800/70 text-emerald-200'}`}>
            {statusMsg.isError ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Table Selector Tabs */}
        <div className="flex space-x-2 border-b border-slate-800">
          {(['events', 'orders', 'tickets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Results Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Live Rows in <span className="text-emerald-400 font-mono font-bold">{activeTab}</span>
            </span>
            <span className="text-slate-500 font-mono">{dataList.length} row(s)</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Querying Supabase database...</span>
            </div>
          ) : dataList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <p>No records found in table "{activeTab}".</p>
              <p className="text-[11px] text-slate-600">
                Run the script <span className="font-mono text-slate-400">supabase_schema.sql</span> in your Supabase SQL Editor and insert rows via our app forms!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {dataList.map((row, idx) => (
                <div key={row.id || idx} className="p-4 hover:bg-slate-800/40 transition text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-emerald-400">{row.id}</span>
                    <span className="text-slate-500 text-[11px]">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Setup Instructions */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>How to execute the Schema on your Supabase project</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>Open your <a href="https://supabase.com/dashboard/project/jxqagybvkdfolhbjfbvb/sql" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Supabase SQL Editor</a>.</li>
            <li>Copy the contents of <span className="font-mono text-emerald-300">supabase_schema.sql</span> from your project root.</li>
            <li>Paste into the SQL query window and click <b>Run</b>.</li>
            <li>Your <span className="font-mono text-slate-300">events</span>, <span className="font-mono text-slate-300">orders</span>, and <span className="font-mono text-slate-300">tickets</span> tables will immediately be active and live!</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
