import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, FileText, CheckCircle, Upload, Zap, BarChart3, Download, RefreshCw, ChevronRight,
  DollarSign, Layers, Cpu, ArrowRight, MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- API CONFIGURATION ---
const BASE_URL = 'http://localhost:8000'; 

const api = {
  // Fetch list of all RFPs
  rfps: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/agents/sales/rfps`);
      if (!res.ok) throw new Error('Failed to fetch RFPs');
      return await res.json();
    } catch (e) { console.error(e); return []; }
  },
  // Trigger Sales Agent Scan
  scan: async () => {
    const res = await fetch(`${BASE_URL}/api/agents/sales/scan`, { method: 'POST' });
    return await res.json();
  },
  // Trigger Technical Agent
  analyze: async (id) => {
    const res = await fetch(`${BASE_URL}/api/agents/technical/${id}/analyze`, { method: 'POST' });
    return await res.json();
  },
  // Trigger Pricing Agent
  price: async (id) => {
    const res = await fetch(`${BASE_URL}/api/agents/pricing/${id}/calculate`, { method: 'POST' });
    return await res.json();
  },
  // Trigger Main Agent (Generate PPT)
  generate: async (id) => {
    const res = await fetch(`${BASE_URL}/api/agents/main/${id}/generate-proposal`, { method: 'POST' });
    return await res.json();
  },

  autoPilot: async (id) => {
    await fetch(`http://localhost:5678/webhook/auto-process?id=${id}`, { mode: 'no-cors' });
  },

   chat: async (id, question) => {
    const res = await fetch(`${BASE_URL}/api/agents/main/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    return await res.json();
  },


  upload: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/agents/sales/upload`, {
      method: 'POST',
      body: formData, 
    });
    if (!res.ok) throw new Error('Upload Failed');
    return await res.json();
  }
};


const NeoCard = ({ children, className, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={cn(
      "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
      className
    )}
  >
    {children}
  </motion.div>
);

const NeoButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled, loading, className }) => {
  const variants = {
    primary: "bg-[#FFD700] text-black hover:bg-[#ffe033]", 
    secondary: "bg-white text-black hover:bg-gray-100",
    success: "bg-[#4ade80] text-black hover:bg-[#22c55e]",
    dark: "bg-slate-800 text-white hover:bg-slate-700",
    danger: "bg-red-400 text-black hover:bg-red-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 font-black uppercase tracking-wider px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const StatusChip = ({ status }) => {
  // Matched to Backend Statuses
  const styles = {
    'New': 'bg-blue-200 text-blue-900',
    'Processed': 'bg-purple-200 text-purple-900',      
    'Pricing Complete': 'bg-orange-200 text-orange-900',
    'Ready to Submit': 'bg-green-300 text-green-900',    
  };
  return (
    <span className={cn("px-3 py-1 font-bold border-2 border-black text-xs uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", styles[status] || 'bg-gray-200')}>
      {status || 'Unknown'}
    </span>
  );
};

// --- LAYOUT COMPONENTS ---

const Sidebar = () => {
  const location = useLocation();
  const links = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/rfps', icon: FileText, label: 'All RFPs' },
    { path: '/upload', icon: Upload, label: 'Manual Upload' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r-4 border-black min-h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b-4 border-black bg-[#FFD700]">
        <h1 className="text-4xl font-black italic tracking-tighter text-black">BidWin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-4">
        {links.map((link) => (
          <Link key={link.path} to={link.path}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 font-bold border-2 border-transparent transition-all hover:bg-white/10 hover:translate-x-2 text-white",
              location.pathname === link.path && "bg-white text-black border-black shadow-[4px_4px_0px_0px_#FFD700]"
            )}>
              <link.icon className="w-5 h-5" />
              {link.label}
            </div>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t-4 border-slate-700">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-8 h-8 bg-[#FFD700] border-2 border-black rounded-full flex items-center justify-center text-black font-bold">JD</div>
          <span className="font-mono text-sm">sales@asianpaints.com</span>
        </div>
      </div>
    </div>
  );
};

const TopNav = () => (
  <header className="md:ml-64 bg-slate-900 border-b-4 border-black p-4 flex justify-between items-center sticky top-0 z-20 shadow-xl">
    <div className="md:hidden text-[#FFD700] font-black text-2xl">BidWin</div>
    <div className="flex items-center gap-4 w-full justify-end">
      <div className="text-white font-mono text-xs hidden sm:block">
        CONNECTED TO: <span className="text-[#FFD700]">{BASE_URL}</span>
      </div>
      <div className="p-2 bg-slate-800 border-2 border-slate-600 text-[#FFD700]">
        <CheckCircle className="w-5 h-5" />
      </div>
    </div>
  </header>
);

// --- PAGE COMPONENTS ---

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [recentRfps, setRecentRfps] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, processing: 0, ready: 0 });

  const loadData = async () => {
    const data = await api.rfps();
    if(Array.isArray(data)) {
      setRecentRfps(data.slice(0, 4));
      setStats({
        total: data.length,
        new: data.filter(r => r.status === 'New').length,
        processing: data.filter(r => ['Processed', 'Pricing Complete'].includes(r.status)).length,
        ready: data.filter(r => r.status === 'Ready to Submit').length
      });
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await api.scan();
      if(res.status === "success") {
        alert(`Scan Complete! Found ${res.scanned_count} tenders.`);
        loadData(); // Refresh data
      }
    } catch (e) { alert("Scan Failed"); }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-100 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total RFPs', val: stats.total, color: 'bg-blue-400' },
          { label: 'New Finds', val: stats.new, color: 'bg-[#FFD700]' },
          { label: 'In Progress', val: stats.processing, color: 'bg-purple-400' },
          { label: 'Ready to Submit', val: stats.ready, color: 'bg-green-400' },
        ].map((stat, i) => (
          <NeoCard key={i} delay={i * 0.1} className={cn("flex flex-col justify-between h-40 relative overflow-hidden group", stat.color)}>
            <div className="absolute -right-4 -bottom-4 opacity-20 text-black transform rotate-[-15deg] group-hover:scale-110 transition-transform">
              <BarChart3 size={120} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black pb-2 inline-block w-max">{stat.label}</h3>
            <p className="text-6xl font-black">{stat.val}</p>
          </NeoCard>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <NeoButton onClick={handleScan} loading={loading} icon={Zap} className="flex-1 py-8 text-2xl w-full">
          {loading ? "Scanning Portals..." : "Trigger Sales Agent Scan"}
        </NeoButton>
      </div>

      {/* Recent Activity */}
      <NeoCard className="bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black italic">LIVE PIPELINE</h2>
          <Link to="/rfps" className="text-blue-600 font-bold hover:underline flex items-center gap-1">View All <ChevronRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {recentRfps.map((rfp) => (
            <div key={rfp.id} className="border-2 border-black p-4 hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_#cbd5e1] flex justify-between items-center">
              <div>
                <div className="flex gap-2 mb-2">
                   <StatusChip status={rfp.status} />
                   <span className="text-xs font-mono border border-gray-400 px-1 rounded bg-gray-100">ID: {rfp.id}</span>
                </div>
                <h4 className="font-bold text-lg leading-tight">{rfp.title}</h4>
                <p className="text-sm font-mono text-gray-600">{rfp.client_name}</p>
              </div>
              <Link to={`/rfps/${rfp.id}`}>
                <div className="p-3 bg-black text-white hover:bg-[#FFD700] hover:text-black transition-colors border-2 border-transparent hover:border-black">
                    <ArrowRight size={24} />
                </div>
              </Link>
            </div>
          ))}
          {recentRfps.length === 0 && <div className="p-8 text-center text-gray-500 font-mono">No RFPs found. Click Scan.</div>}
        </div>
      </NeoCard>
    </div>
  );
};

const RfpList = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.rfps();
      setRfps(Array.isArray(data) ? data : []);
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">All Tenders</h1>
        <NeoButton variant="secondary" icon={RefreshCw} onClick={async () => setRfps(await api.rfps())}>Refresh</NeoButton>
      </div>

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white border-b-4 border-black">
            <tr>
              <th className="p-4 font-black uppercase">ID</th>
              <th className="p-4 font-black uppercase">Client</th>
              <th className="p-4 font-black uppercase w-1/3">Title</th>
              <th className="p-4 font-black uppercase">Deadline</th>
              <th className="p-4 font-black uppercase">Status</th>
              <th className="p-4 font-black uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rfps.map((rfp) => (
              <tr key={rfp.id} onClick={() => navigate(`/rfps/${rfp.id}`)} className="border-b-2 border-black hover:bg-yellow-50 cursor-pointer transition-colors group">
                <td className="p-4 font-mono font-bold">#{rfp.id}</td>
                <td className="p-4 font-bold">{rfp.client_name}</td>
                <td className="p-4 font-medium group-hover:underline">{rfp.title}</td>
                <td className="p-4 font-mono text-sm">{rfp.deadline}</td>
                <td className="p-4"><StatusChip status={rfp.status} /></td>
                <td className="p-4 text-right">
                    <ChevronRight className="inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RfpDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Hello! I have analyzed this tender. Ask me about specs, pricing, or clauses.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    // Add User Message
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.chat(id, userMsg.text);
      // Add Bot Message
      setChatHistory(prev => [...prev, { role: 'bot', text: res.response || "Sorry, I couldn't process that." }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Error connecting to AI." }]);
    }
    setChatLoading(false);
  };

  // Fetch details
  const fetchDetails = async () => {
    const all = await api.rfps();
    const found = all.find(r => r.id === parseInt(id));
    if(found) {
        setRfp(found);
        if(found.status === 'Ready to Submit') setIsPolling(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  // Polling Logic
  useEffect(() => {
    let interval;
    if (isPolling) {
      interval = setInterval(() => fetchDetails(), 2000);
    }
    return () => clearInterval(interval);
  }, [isPolling]);

  // Agent Handlers
  const runAgent = async (agentType) => {
    setLoading(true);
    try {
      if(agentType === 'technical') await api.analyze(id);
      if(agentType === 'pricing') await api.price(id);
      if(agentType === 'proposal') await api.generate(id);
      await fetchDetails();
    } catch (e) { alert("Agent Operation Failed"); }
    setLoading(false);
  };

  const runAutoPilot = async () => {
    if(!confirm("🚀 Launch n8n Auto-Pilot?")) return;
    setIsPolling(true); 
    try { await api.autoPilot(id); } 
    catch (e) { setIsPolling(false); alert("Failed to trigger n8n"); }
  };

  if (!rfp) return <div className="p-8 font-mono">Loading...</div>;

  const extracted = rfp.extracted_data || {};
  
  const isMultiSku = Array.isArray(extracted.line_items);
  
  const lineItems = isMultiSku ? extracted.line_items : [];
  const commercial = extracted.commercial || {};

  const getProgressStep = (status) => {
      if (status === 'New') return 0;
      if (status === 'Processed') return 1;
      if (status === 'Pricing Complete') return 2;
      if (status === 'Ready to Submit') return 3;
      return 0;
  };
  const currentStep = getProgressStep(rfp.status);

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_#FFD700]">
        <div className="flex justify-between items-start">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <Link to="/rfps" className="text-gray-400 hover:text-white"><ChevronRight className="rotate-180 inline" /> Back</Link>
                <StatusChip status={rfp.status} />
                {isPolling && <span className="text-xs font-mono text-[#FFD700] animate-pulse">● LIVE SYNC</span>}
             </div>
             <h1 className="text-3xl font-black mb-1">{rfp.title}</h1>
             <p className="text-xl text-slate-400 font-mono">{rfp.client_name} | ID: {rfp.id}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Auto-Pilot Button */}
            {currentStep < 3 && (
                <NeoButton onClick={runAutoPilot} loading={isPolling} icon={Zap} className="bg-purple-500 hover:bg-purple-600 text-white border-white w-64">
                    {isPolling ? "AGENTS RUNNING..." : "RUN AUTO-PILOT"}
                </NeoButton>
            )}
            
            {/* Manual Buttons */}
            {!isPolling && (
                <div className="flex gap-2">
                    {rfp.status === 'New' && <NeoButton onClick={() => runAgent('technical')} loading={loading} icon={Cpu} variant="dark" className="text-sm py-1">Analyze</NeoButton>}
                    {rfp.status === 'Processed' && <NeoButton onClick={() => runAgent('pricing')} loading={loading} icon={DollarSign} variant="primary" className="text-sm py-1">Pricing</NeoButton>}
                    {rfp.status === 'Pricing Complete' && <NeoButton onClick={() => runAgent('proposal')} loading={loading} icon={FileText} variant="success" className="text-sm py-1">Proposal</NeoButton>}
                </div>
            )}

            {rfp.status === 'Ready to Submit' && (
                 <a href={`http://localhost:8000/api/agents/main/download/proposal_${rfp.id}.pptx`} target="_blank" rel="noreferrer">
                    <NeoButton icon={Download} variant="secondary">Download PPT</NeoButton>
                 </a>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
            { label: "Technical Ensemble", step: 1, icon: Cpu },
            { label: "Pricing Calc", step: 2, icon: DollarSign },
            { label: "Proposal Gen", step: 3, icon: FileText }
        ].map((s) => (
            <div key={s.step} className={cn("border-4 border-black p-4 flex items-center gap-4", currentStep >= s.step ? "bg-[#4ade80]" : "bg-white opacity-50")}>
                <s.icon className="w-6 h-6" />
                <span className="font-black uppercase">{s.label}</span>
            </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 flex flex-col gap-4">
          {[
            { id: 'summary', label: 'Overview (BoQ)', icon: FileText },
            { id: 'technical', label: 'Ensemble Match', icon: Layers },
            { id: 'pricing', label: 'Commercials', icon: DollarSign },
            { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-3 p-4 border-4 border-black font-black text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", activeTab === tab.id ? "bg-[#FFD700] translate-x-1" : "bg-white hover:bg-gray-50")}>
              <tab.icon className="w-6 h-6" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              
              {/* === TAB 1: OVERVIEW (BoQ) === */}
              {activeTab === 'summary' && (
                <NeoCard>
                    <div className="border-b-4 border-black pb-2 mb-4">
                        <h3 className="text-2xl font-black">Extracted Bill of Quantities</h3>
                        <p className="font-mono text-sm text-gray-500">AI identified {lineItems.length} distinct line items.</p>
                    </div>
                    {lineItems.length > 0 ? (
                        <div className="space-y-4">
                            {lineItems.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 border-2 border-black flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-xs bg-black text-white px-2 py-1 rounded">ITEM #{idx+1}</span>
                                        <h4 className="font-black text-lg mt-1">{item.requirement.item_name}</h4>
                                        <p className="font-mono text-sm text-gray-600">{item.requirement.specs}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-gray-500">QTY</span>
                                        <span className="block text-xl font-black">{item.requirement.quantity || "1"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-10 font-bold text-gray-400">No items extracted yet. Run Analysis.</div>}
                </NeoCard>
              )}

              {/* === TAB 2: TECHNICAL (Ensemble) === */}
              {activeTab === 'technical' && (
                <NeoCard>
                  <h3 className="text-2xl font-black border-b-4 border-black pb-2 mb-6">Ensemble Decision Engine</h3>
                  {lineItems.length > 0 && lineItems[0].match ? (
                      <div className="space-y-6">
                          {lineItems.map((item, idx) => {
                              const match = item.match || {};
                              const scores = match.scores || {};
                              return (
                                <div key={idx} className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-xl">{match.product_name}</h4>
                                            <p className="text-sm font-mono text-gray-500">Matched to: {item.requirement.item_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-3xl font-black text-green-600">{scores.ensemble}%</span>
                                            <span className="text-xs font-bold uppercase">Confidence</span>
                                        </div>
                                    </div>
                                    
                                    {/* Score Breakdown Bar */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-blue-50 p-2 border border-blue-200 text-center">
                                            <span className="block text-xs font-bold text-blue-800">SEMANTIC</span>
                                            <span className="block font-black text-lg">{scores.semantic || 0}</span>
                                        </div>
                                        <div className="bg-purple-50 p-2 border border-purple-200 text-center">
                                            <span className="block text-xs font-bold text-purple-800">KEYWORD</span>
                                            <span className="block font-black text-lg">{scores.keyword || 0}</span>
                                        </div>
                                        <div className="bg-orange-50 p-2 border border-orange-200 text-center">
                                            <span className="block text-xs font-bold text-orange-800">RULE</span>
                                            <span className="block font-black text-lg">{scores.rule || 0}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm bg-gray-100 p-2 border border-gray-300 font-mono italic">" {match.reason} "</p>
                                </div>
                              );
                          })}
                      </div>
                  ) : <div className="text-center py-10 font-bold text-gray-400">Waiting for Engine...</div>}
                </NeoCard>
              )}

              {/* === TAB 3: PRICING (Invoice) === */}
              {/* === TAB 3: PRICING (Commercials) === */}
              {activeTab === 'pricing' && (
                <NeoCard>
                  <div className="flex justify-between items-end border-b-4 border-black pb-2 mb-6">
                      <h3 className="text-2xl font-black">Commercial Quote</h3>
                      {commercial.lines && <span className="font-mono text-sm bg-gray-200 px-2">Currency: INR</span>}
                  </div>
                  
                  {commercial.lines ? (
                      <div>
                          {/* SECTION A: PRODUCTS */}
                          <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">A. Material Supply</h4>
                          <div className="overflow-x-auto mb-8">
                              <table className="w-full border-2 border-black text-sm">
                                  <thead className="bg-black text-white">
                                      <tr>
                                          <th className="p-3 text-left">Item</th>
                                          <th className="p-3 text-left">Matched SKU</th>
                                          <th className="p-3 text-right">Qty</th>
                                          <th className="p-3 text-right">Unit Price</th>
                                          <th className="p-3 text-right">Line Total</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {commercial.lines.map((line, i) => (
                                          <tr key={i} className="border-b border-gray-300">
                                              <td className="p-3 font-bold max-w-[200px] truncate" title={line.item_name}>{line.item_name}</td>
                                              <td className="p-3 font-mono text-gray-600">{line.sku}</td>
                                              <td className="p-3 text-right">{line.qty}</td>
                                              <td className="p-3 text-right">₹ {line.unit_price}</td>
                                              <td className="p-3 text-right font-bold">₹ {line.line_total}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>

                          {/* SECTION B: SERVICES (NEW) */}
                          <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">B. Testing & Acceptance Services</h4>
                          {commercial.services && commercial.services.length > 0 ? (
                             <div className="overflow-x-auto mb-8">
                                <table className="w-full border-2 border-black text-sm bg-blue-50">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="p-3 text-left">Required Test / Service</th>
                                            <th className="p-3 text-left">Rate Card Match</th>
                                            <th className="p-3 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commercial.services.map((s, i) => (
                                            <tr key={i} className="border-b border-blue-200 text-blue-900">
                                                <td className="p-3 font-bold">{s.test_name}</td>
                                                <td className="p-3 font-mono text-xs opacity-70">{s.matched_service}</td>
                                                <td className="p-3 text-right font-bold">₹ {s.cost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                          ) : (
                             <div className="p-4 border-2 border-dashed border-gray-300 text-gray-400 mb-8 italic">
                                No specific billable tests identified in this tender.
                             </div>
                          )}

                          {/* GRAND TOTAL BLOCK */}
                          <div className="flex flex-col items-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                              <div className="text-right text-sm font-mono text-gray-600 space-y-1">
                                  <p>Material Subtotal: <span className="font-bold text-black">₹ {commercial.product_total || 0}</span></p>
                                  <p>Services Subtotal: <span className="font-bold text-black">₹ {commercial.service_total || 0}</span></p>
                              </div>
                              <div className="bg-[#FFD700] p-6 border-4 border-black text-right shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-[320px]">
                                  <span className="block text-sm font-bold uppercase tracking-widest">Total Project Value</span>
                                  <span className="block text-4xl font-black mt-1">₹ {commercial.grand_total_inr}</span>
                              </div>
                          </div>
                      </div>
                  ) : (
                    <div className="text-center py-10">
                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-gray-500">Waiting for Pricing Agent...</p>
                    </div>
                  )}
                </NeoCard>
              )}
              {/* === TAB 4: CHAT ASSISTANT === */}
              {activeTab === 'chat' && (
                <NeoCard className="h-[600px] flex flex-col">
                  <div className="border-b-4 border-black pb-4 mb-4">
                    <h3 className="text-2xl font-black flex items-center gap-2">
                        <Zap className="text-[#FFD700] fill-current" /> 
                        Chat with RFP
                    </h3>
                    <p className="font-mono text-sm text-gray-500">Ask questions about the PDF or our Pricing Analysis.</p>
                  </div>

                  {/* Chat History Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 border-2 border-black mb-4">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] p-3 font-mono text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                          msg.role === 'user' ? "bg-[#FFD700] text-black" : "bg-white text-gray-800"
                        )}>
                          <strong>{msg.role === 'user' ? 'You' : 'BidWin AI'}:</strong>
                          <p className="mt-1 whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white p-3 border-2 border-black font-mono text-sm text-gray-500 animate-pulse">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 border-4 border-black p-3 font-mono focus:outline-none"
                      placeholder="e.g., What is the penalty for late delivery?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <NeoButton onClick={handleSendChat} disabled={chatLoading} icon={ArrowRight} variant="dark">
                      SEND
                    </NeoButton>
                  </div>
                </NeoCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    deadline: '',
    file: null
  });

  const handleFileChange = (e) => {
    if (e.target.files) setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) return alert("Please fill all fields");

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title);
      data.append('client', formData.client);
      data.append('deadline', formData.deadline);

      const res = await api.upload(data);
      
      if (res.status === 'success') {
        alert("✅ Upload Successful! Redirecting to Pipeline...");
        navigate(`/rfps/${res.rfp_id}`); 
      }
    } catch (err) {
      alert("Upload Failed. Check console.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen flex justify-center items-center">
      <NeoCard className="w-full max-w-2xl">
        <div className="border-b-4 border-black pb-4 mb-6">
          <h2 className="text-4xl font-black italic">UPLOAD MANUAL RFP</h2>
          <p className="font-mono text-gray-500 mt-2">Add offline tenders to the AI Pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block font-bold uppercase mb-2">RFP Title</label>
            <input 
              type="text" 
              required
              className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              placeholder="e.g. Supply of Industrial Primer - Batch A"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Client & Deadline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold uppercase mb-2">Client Name</label>
              <input 
                type="text" 
                required
                className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                placeholder="e.g. Indian Railways"
                value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-bold uppercase mb-2">Deadline</label>
              <input 
                type="date" 
                required
                className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          {/* File Upload Area */}
          <div className="border-4 border-dashed border-gray-400 p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
             <input 
                type="file" 
                accept=".pdf"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
             <p className="font-bold text-lg">
               {formData.file ? formData.file.name : "Click to Upload PDF Document"}
             </p>
             <p className="text-xs font-mono text-gray-500 mt-1">MAX SIZE: 10MB</p>
          </div>

          {/* Submit Button */}
          <NeoButton 
            variant="primary" 
            className="w-full py-4 text-xl" 
            loading={loading} 
            icon={CheckCircle}
          >
            {loading ? "UPLOADING..." : "UPLOAD & START AI"}
          </NeoButton>
        </form>
      </NeoCard>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex bg-slate-100 min-h-screen font-sans">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex flex-col">
          <TopNav />
          <main className="flex-1 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rfps" element={<RfpList />} />
              <Route path="/rfps/:id" element={<RfpDetail />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;