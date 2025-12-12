import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, FileText, CheckCircle, Upload, Zap, BarChart3, Download, RefreshCw, ChevronRight,
  DollarSign, Layers, Cpu, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- API CONFIGURATION ---
const BASE_URL = 'http://localhost:8000'; // Ensure your Docker/FastAPI is running here

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
    await fetch(`http://localhost:5678/webhook-test/auto-process?id=${id}`, { mode: 'no-cors' });
  }
};

// --- DESIGN COMPONENTS (UNCHANGED THEME) ---

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
    'Processed': 'bg-purple-200 text-purple-900',       // After Technical Agent
    'Pricing Complete': 'bg-orange-200 text-orange-900', // After Pricing Agent
    'Ready to Submit': 'bg-green-300 text-green-900',    // After Main Agent
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
      // Calculate Stats based on real backend statuses
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
  const [isPolling, setIsPolling] = useState(false); // Track if we are watching live

  // Fetch single RFP details
  const fetchDetails = async () => {
    const all = await api.rfps();
    const found = all.find(r => r.id === parseInt(id));
    if(found) {
        setRfp(found);
        // Stop polling if finished
        if(found.status === 'Ready to Submit') setIsPolling(false);
    }
  };

  // Initial Load
  useEffect(() => { fetchDetails(); }, [id]);

  // 🔄 REAL-TIME POLLING MAGIC
  useEffect(() => {
    let interval;
    // Poll every 2 seconds if we are in "Polling Mode" OR if status is not final yet
    if (isPolling) {
      interval = setInterval(() => {
        fetchDetails();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPolling]);


  // Handler for Manual Agent Actions
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
    
    try {
      await api.autoPilot(id);
    } catch (e) { 
      setIsPolling(false);
      alert("Failed to trigger n8n"); 
    }
  };

  if (!rfp) return <div className="p-8 font-mono">Loading RFP Data...</div>;

  // Derived Data
  const extracted = rfp.extracted_data || {};
  const requirements = extracted.requirements || {};
  const match = extracted.match || {};
  const pricing = extracted.pricing || {};

  // Status Progress Logic (0 to 3)
  const getProgressStep = (status) => {
      if (status === 'New') return 0;
      if (status === 'Processed') return 1;
      if (status === 'Pricing Complete') return 2;
      if (status === 'Ready to Submit') return 3;
      return 0;
  };
  const currentStep = getProgressStep(rfp.status);
  const safeRender = (value) => {
    if (!value) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
    }
    return value.toString();
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_#FFD700]">
        <div className="flex justify-between items-start">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <Link to="/rfps" className="text-gray-400 hover:text-white"><ChevronRight className="rotate-180 inline" /> Back</Link>
                <StatusChip status={rfp.status} />
                {isPolling && <span className="text-xs font-mono text-[#FFD700] animate-pulse">● LIVE AGENT SYNC ACTIVE</span>}
             </div>
             <h1 className="text-3xl font-black mb-1">{rfp.title}</h1>
             <p className="text-xl text-slate-400 font-mono">{rfp.client_name} | ID: {rfp.id}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Auto-Pilot Button */}
            {currentStep < 3 && (
                <NeoButton 
                    onClick={runAutoPilot} 
                    loading={isPolling} 
                    icon={Zap} 
                    className="bg-purple-500 hover:bg-purple-600 text-white border-white w-64"
                >
                    {isPolling ? "AGENTS RUNNING..." : "RUN AUTO-PILOT"}
                </NeoButton>
            )}

            {/* Manual Fallback Buttons */}
            {!isPolling && (
                <>
                    {rfp.status === 'New' && <NeoButton onClick={() => runAgent('technical')} loading={loading} icon={Cpu} variant="dark" className="text-sm py-1">Manual: Tech Analysis</NeoButton>}
                    {rfp.status === 'Processed' && <NeoButton onClick={() => runAgent('pricing')} loading={loading} icon={DollarSign} variant="primary" className="text-sm py-1">Manual: Pricing</NeoButton>}
                    {rfp.status === 'Pricing Complete' && <NeoButton onClick={() => runAgent('proposal')} loading={loading} icon={FileText} variant="success" className="text-sm py-1">Manual: Proposal</NeoButton>}
                </>
            )}

            {rfp.status === 'Ready to Submit' && (
                 <a href={`http://localhost:8000/api/agents/main/download/proposal_${rfp.id}.pptx`} target="_blank" rel="noreferrer">
                    <NeoButton icon={Download} variant="secondary">Download Final PPT</NeoButton>
                 </a>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 LIVE PIPELINE VISUALIZER */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
            { label: "Technical Analysis", step: 1, icon: Cpu },
            { label: "Pricing Calc", step: 2, icon: DollarSign },
            { label: "Proposal Gen", step: 3, icon: FileText }
        ].map((s) => (
            <div key={s.step} className={cn(
                "border-4 border-black p-4 flex items-center gap-4 transition-all duration-500",
                currentStep >= s.step ? "bg-[#4ade80] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white opacity-50"
            )}>
                <div className={cn("p-2 rounded-full border-2 border-black", currentStep >= s.step ? "bg-white" : "bg-gray-200")}>
                    <s.icon className="w-6 h-6" />
                </div>
                <div>
                    <span className="font-mono text-xs font-bold uppercase text-gray-600">Step 0{s.step}</span>
                    <h4 className="font-black text-lg">{s.label}</h4>
                    {currentStep >= s.step && <span className="text-xs font-bold">COMPLETED ✅</span>}
                    {currentStep === s.step - 1 && isPolling && <span className="text-xs font-bold animate-pulse">PROCESSING...</span>}
                </div>
            </div>
        ))}
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 flex flex-col gap-4">
          {[
            { id: 'summary', label: 'Overview', icon: FileText },
            { id: 'technical', label: 'Technical Match', icon: Layers },
            { id: 'pricing', label: 'Pricing Quote', icon: DollarSign },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 p-4 border-4 border-black font-black text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                activeTab === tab.id ? "bg-[#FFD700] translate-x-1" : "bg-white hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-6 h-6" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* === TAB 1: OVERVIEW === */}
              {activeTab === 'summary' && (
                <NeoCard>
                    <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4">
                        <h3 className="text-2xl font-black">AI Extracted Requirements</h3>
                        <span className="text-xs font-mono bg-gray-200 px-2 py-1">Source: {rfp.file_url.split('/').pop()}</span>
                    </div>
                  
                  {Object.keys(requirements).length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(requirements).map(([k, v]) => (
                          <div key={k} className="bg-slate-50 p-4 border-2 border-black">
                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">{k.replace(/_/g, ' ')}</span>
                            {/* USE THE HELPER FUNCTION HERE */}
                            <span className="block text-lg font-bold font-mono break-words">
                                {safeRender(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-10 bg-gray-100 border-2 border-dashed border-gray-400">
                          <p className="font-bold text-gray-500">Waiting for Technical Analysis...</p>
                          {isPolling && <RefreshCw className="w-6 h-6 animate-spin mx-auto mt-2 text-gray-400" />}
                      </div>
                  )}
                </NeoCard>
              )}

              {/* === TAB 2: TECHNICAL === */}
              {activeTab === 'technical' && (
                <NeoCard>
                  <h3 className="text-2xl font-black border-b-4 border-black pb-2 mb-6">Product Matching</h3>
                  {match.product_id ? (
                      <div className="space-y-6">
                          <div className="flex items-center gap-4 bg-green-100 p-6 border-2 border-black">
                              <CheckCircle className="text-green-600 w-12 h-12" />
                              <div>
                                  <h4 className="font-black text-xl">Match Found: Product ID {match.product_id}</h4>
                                  <p className="font-mono text-sm">Confidence Score: <b>{match.match_score}%</b></p>
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 p-6 border-2 border-black">
                              <h5 className="font-black uppercase mb-2">AI Reasoning</h5>
                              <p className="font-mono text-sm leading-relaxed">{match.reason}</p>
                          </div>
                      </div>
                  ) : (
                    <div className="text-center py-10">
                        <Cpu className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-gray-500">Technical Agent Waiting...</p>
                        {isPolling && <span className="text-xs text-blue-600 animate-pulse">Agent is thinking...</span>}
                    </div>
                  )}
                </NeoCard>
              )}

              {/* === TAB 3: PRICING === */}
              {activeTab === 'pricing' && (
                <NeoCard>
                  <h3 className="text-2xl font-black border-b-4 border-black pb-2 mb-6">Commercial Proposal</h3>
                  {pricing.final_unit_price ? (
                      <div>
                          <div className="flex justify-between items-center bg-[#FFD700] p-6 border-4 border-black mb-6">
                              <span className="font-black text-xl">FINAL UNIT PRICE</span>
                              <span className="font-black text-4xl">₹ {pricing.final_unit_price}</span>
                          </div>

                          <table className="w-full border-2 border-black">
                              <thead className="bg-black text-white">
                                  <tr>
                                      <th className="p-3 text-left">Component</th>
                                      <th className="p-3 text-right">Cost (INR)</th>
                                  </tr>
                              </thead>
                              <tbody className="font-mono text-sm">
                                  <tr className="border-b border-gray-300">
                                      <td className="p-3">Base Price ({pricing.sku})</td>
                                      <td className="p-3 text-right">{pricing.components?.base_price}</td>
                                  </tr>
                                  <tr className="border-b border-gray-300 bg-gray-50">
                                      <td className="p-3">Logistics (5%)</td>
                                      <td className="p-3 text-right">{pricing.components?.logistics_5_percent}</td>
                                  </tr>
                                  <tr className="border-b border-gray-300 bg-gray-50">
                                      <td className="p-3">Margin (20%)</td>
                                      <td className="p-3 text-right">{pricing.components?.margin_20_percent}</td>
                                  </tr>
                                  <tr className="border-b border-gray-300">
                                      <td className="p-3">GST (18%)</td>
                                      <td className="p-3 text-right">{pricing.components?.gst_18_percent}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  ) : (
                    <div className="text-center py-10">
                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-gray-500">Pricing Agent Waiting...</p>
                        {isPolling && <span className="text-xs text-blue-600 animate-pulse">Pending Technical Match...</span>}
                    </div>
                  )}
                </NeoCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
// --- MAIN APP ENTRY ---

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
              <Route path="/upload" element={<div className="p-8 text-2xl font-black">MANUAL UPLOAD (Future Scope)</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;