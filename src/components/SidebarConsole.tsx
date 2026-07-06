import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Key, 
  Cpu, 
  Link2, 
  Power, 
  PowerOff,
  User,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  BookOpen,
  Sliders
} from "lucide-react";
import { ApiKeyConfig, McpConnection } from "../types";

const AGENTS_LIST = [
  {
    key: "TREND DISCOVERY AGENT",
    title: "SCANNER & TREND DISCOVERY AGENT",
    desc: "Scours digital streams and tracks global search indicators to identify trending technical topics.",
    icon: "Cpu"
  },
  {
    key: "RESEARCH AGENT",
    title: "🔍 FACT-SEEKING DEEP RESEARCH AGENT",
    desc: "Does deep web research, analyzes academic whitepapers, and fetches concrete performance metrics.",
    icon: "BookOpen"
  },
  {
    key: "CONTENT STRATEGIST AGENT",
    title: "🧠 STRATEGY & ANGLE DESIGNER",
    desc: "Crafts the instructional theme, pacing strategy, hook triggers, and target developer personas.",
    icon: "Sparkles"
  },
  {
    key: "SCRIPT WRITER AGENT",
    title: "✍️ LEAD NARRATIVE SCRIPT WRITER",
    desc: "Converts strategy, research reports, and technical details into a punchy spoken-narrative word-for-word transcript.",
    icon: "User"
  },
  {
    key: "SCRIPT REVIEW AGENT",
    title: "🎯 CRITIC & SCRIPT REVIEW AGENT",
    desc: "Scores scripts natively on technical completeness, flow continuity, and retention potential before production.",
    icon: "ShieldCheck"
  },
  {
    key: "SCENE PLANNER AGENT",
    title: "🎬 TIMELINE & SCENE PLANNER AGENT",
    desc: "Sequences narrative paragraphs into timeline storyboard shots, and formats active imagery scenes.",
    icon: "Cpu"
  },
  {
    key: "PROMPT ENGINEERING AGENT",
    title: "🧬 STYLIST & PROMPT ENGINEER AGENT",
    desc: "Fuses lighting concepts, artistic themes, aspect continuity coordinates, and neon dark aesthetics.",
    icon: "Sparkles"
  },
  {
    key: "IMAGE GENERATION AGENT",
    title: "🎨 GENERATIVE IMAGE RENDERING AGENT",
    desc: "Renders stunning high-fidelity graphic assets matching story board cards using Gemini imaging.",
    icon: "Sparkles"
  },
  {
    key: "SEO AGENT",
    title: "📈 EXPORT & SEO OPTIMIZATION AGENT",
    desc: "Calculates virality indicators, packages click-ready descriptions, metadata keywords, and dynamic chapter bookmarks.",
    icon: "BookOpen"
  }
];

interface SidebarConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  apiError: string | null;
  setApiError: (err: string | null) => void;
}

export default function SidebarConsole({ 
  isOpen, 
  onClose, 
  apiError, 
  setApiError 
}: SidebarConsoleProps) {
  // Navigation State
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "connections" | "grounding">("dashboard");

  // Password-lock state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Connection variables
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [mcpConnections, setMcpConnections] = useState<McpConnection[]>([]);
  
  // Agent Grounding Prompts state
  const [agentGroundingPrompts, setAgentGroundingPrompts] = useState<Record<string, string>>({});
  const [isSavingGrounding, setIsSavingGrounding] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyService, setNewKeyService] = useState("Google Gemini Engine");

  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpAppName, setNewMcpAppName] = useState("");
  const [newMcpEndpoint, setNewMcpEndpoint] = useState("");
  const [newMcpDescription, setNewMcpDescription] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all connections from backend
  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error("Could not fetch remote connections list.");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
      setMcpConnections(data.mcpConnections || []);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed reading connection tables.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch grounding prompts from backend
  const fetchGrounding = async () => {
    try {
      const res = await fetch("/api/grounding");
      if (!res.ok) throw new Error("Could not fetch grounding prompts.");
      const data = await res.json();
      setAgentGroundingPrompts(data.agentGroundingPrompts || {});
    } catch (err: any) {
      console.error("Failed to load agent grounding prompts:", err);
    }
  };

  const handleSaveGrounding = async () => {
    try {
      setIsSavingGrounding(true);
      setSaveSuccess(false);
      const res = await fetch("/api/grounding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentGroundingPrompts })
      });
      if (!res.ok) throw new Error("Failed to save grounding settings.");
      const data = await res.json();
      if (data.success) {
        setAgentGroundingPrompts(data.agentGroundingPrompts || {});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to commit grounding prompts.");
    } finally {
      setIsSavingGrounding(false);
    }
  };

  const handleResetToFactory = async () => {
    if (!window.confirm("Restore all agent grounding prompts to industry-standard defaults?")) return;
    try {
      setIsSavingGrounding(true);
      const defaultPrompts = {
        "TREND DISCOVERY AGENT": "Focus on high-growth emerging enterprise AI breakthroughs, cloud automation events, and durable serverless workflows.",
        "RESEARCH AGENT": "Always seek verifiable facts, exact technical benchmarks, open-source performance figures, and scientific papers (ArXiv/academic).",
        "CONTENT STRATEGIST AGENT": "Design high-engagement story themes targeting developers and cloud architects. Elevate viewer retention with immediate deep technical setups.",
        "SCRIPT WRITER AGENT": "Write script narration using concise, punchy, active voice sentences. Avoid buzzwords, filler explanations, or conversational AI boilerplate.",
        "SCRIPT REVIEW AGENT": "Evaluate instructional clarity vs viewer fatigue. Verify that explanations contain substantial concrete details.",
        "SCENE PLANNER AGENT": "Map out stunning, visually detailed, highly structured, cinematic storyboard shots focusing on physical hardware or sleek node diagrams.",
        "PROMPT ENGINEERING AGENT": "Consistently request brutalist cyberpunk design, neon indicators, volumetric dark atmospheric glowing visual continuity parameters.",
        "IMAGE GENERATION AGENT": "Synthesize ultra-crisp, high-fidelity scene graphics representing advanced computing components.",
        "SEO AGENT": "Formulate highly relevant video chapters, click-friendly title ideas, and optimal developer tag arrays."
      };
      const res = await fetch("/api/grounding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentGroundingPrompts: defaultPrompts })
      });
      if (!res.ok) throw new Error("Failed to reset grounding prompts.");
      const data = await res.json();
      if (data.success) {
        setAgentGroundingPrompts(data.agentGroundingPrompts || {});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to restore default prompts.");
    } finally {
      setIsSavingGrounding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
      fetchGrounding();
    }
  }, [isOpen]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput === "admin123") {
      setIsAuthenticated(true);
      setPasswordInput("");
    } else {
      setAuthError("Cryptographic verification failed. Correct default password is 'admin123'.");
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) {
      setApiError("Please fill out complete fields for the custom API credential.");
      return;
    }
    try {
      const res = await fetch("/api/connections/keys/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          value: newKeyValue,
          service: newKeyService
        })
      });
      if (!res.ok) throw new Error("Key addition rejected.");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
      setNewKeyName("");
      setNewKeyValue("");
      setNewKeyService("Google Gemini Engine");
    } catch (err: any) {
      setApiError(err.message || "Database failed saving credentials.");
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch("/api/connections/keys/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Deletion failed.");
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch (err: any) {
      setApiError(err.message || "Could not remove API config.");
    }
  };

  const handleAddMcp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcpName || !newMcpEndpoint) {
      setApiError("Name and endpoint URL are required parameters for standard connection.");
      return;
    }
    try {
      const res = await fetch("/api/connections/mcp/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMcpName,
          appName: newMcpAppName || "External MCP App Bridge",
          endpoint: newMcpEndpoint,
          description: newMcpDescription || "Integrated microservice app layer."
        })
      });
      if (!res.ok) throw new Error("MCP registration request failed.");
      const data = await res.json();
      setMcpConnections(data.mcpConnections || []);
      setNewMcpName("");
      setNewMcpAppName("");
      setNewMcpEndpoint("");
      setNewMcpDescription("");
    } catch (err: any) {
      setApiError(err.message || "Could not record MCP.");
    }
  };

  const handleDeleteMcp = async (id: string) => {
    try {
      const res = await fetch("/api/connections/mcp/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("MCP deletion rejected.");
      const data = await res.json();
      setMcpConnections(data.mcpConnections || []);
    } catch (err: any) {
      setApiError(err.message || "Failed removing MCP registration.");
    }
  };

  const handleToggleMcpStatus = async (id: string) => {
    try {
      const res = await fetch("/api/connections/mcp/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Toggle status aborted.");
      const data = await res.json();
      setMcpConnections(data.mcpConnections || []);
    } catch (err: any) {
      setApiError(err.message || "Status toggle update failed.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Glass overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 cursor-pointer backdrop-blur-xs"
          />

          {/* Drawer Body Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-2xl h-screen overflow-hidden"
          >
            {/* Header console */}
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-950/40 border border-orange-500/20 rounded">
                  <User className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xs font-bold font-mono tracking-tight text-zinc-200">ORCHESTRATOR PROFILE CONSOLE</h2>
                  <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">User features & security authorization</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 bg-zinc-90 w-7 h-7 rounded border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selection Navigation Bar */}
            <div className="px-5 py-2.5 border-b border-zinc-900 bg-zinc-950/80 flex gap-2 font-mono text-[11px] flex-shrink-0">
              <button
                onClick={() => setActiveSidebarTab("dashboard")}
                className={`flex-1 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer font-bold border ${
                  activeSidebarTab === "dashboard" 
                    ? "bg-orange-500/15 border-orange-500/30 text-orange-400" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border-transparent"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> DASHBOARD
              </button>
              <button
                onClick={() => setActiveSidebarTab("connections")}
                className={`flex-1 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer font-bold border ${
                  activeSidebarTab === "connections" 
                    ? "bg-orange-500/15 border-orange-500/30 text-orange-400" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border-transparent"
                }`}
              >
                <Key className="w-3.5 h-3.5" /> KEYCARDS
              </button>
              <button
                onClick={() => setActiveSidebarTab("grounding")}
                className={`flex-1 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer font-bold border ${
                  activeSidebarTab === "grounding" 
                    ? "bg-orange-500/15 border-orange-500/30 text-orange-400" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border-transparent"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> GROUNDING
              </button>
            </div>

            {/* Content view scrollable area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {activeSidebarTab === "dashboard" ? (
                /* ========================================================= */
                /* TAB 1: SYSTEM DASHBOARD & ACTIONABLE INSTRUCTIONS         */
                /* ========================================================= */
                <div className="space-y-6">
                  {/* Profile Card & User Features */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-lg p-4 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-tr from-orange-600 to-pink-500 rounded-full flex items-center justify-center p-0.5 text-zinc-950 font-sans font-black shadow-lg">
                        <span className="bg-zinc-900 text-orange-400 w-full h-full rounded-full flex items-center justify-center">O</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1.5">
                          Orchestrator Admin <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono">Role: Lead AI Architect</p>
                      </div>
                      <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-400 bg-orange-950/20 animate-pulse">
                        GOLD PREMIUM ACCESS
                      </span>
                    </div>

                    <div className="border-t border-zinc-900/60 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-zinc-950/40 p-2 border border-zinc-900 rounded">
                        <p className="text-zinc-500 uppercase">Publish Channel</p>
                        <p className="text-zinc-300 font-sans font-bold mt-0.5 truncate">Tech Catalyst Studio</p>
                      </div>
                      <div className="bg-zinc-950/40 p-2 border border-zinc-900 rounded">
                        <p className="text-zinc-500 uppercase">Target Audience</p>
                        <p className="text-zinc-300 font-sans font-bold mt-0.5">Software Engineering</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[10px] text-zinc-400 font-sans">
                      <p className="font-bold font-mono text-zinc-300 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 inline" /> Fully Autonomous Workflow
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Designed to continuously research latest developer publications, script scripts, evaluate visual parameters, and manage publication statuses. Follow specifications below.
                      </p>
                    </div>
                  </div>

                  {/* system design info cards */}
                  <div className="space-y-4">
                    <div className="border-b border-zinc-950 pb-2">
                      <h4 className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-orange-500" /> FACTORY SPECIFICATIONS & INSTRUCTIONS
                      </h4>
                      <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">Operational guidelines for pipeline rendering</p>
                    </div>

                    <div className="space-y-3">
                      {/* Image synthesis */}
                      <div className="bg-zinc-900/60 border border-zinc-900 rounded-lg p-3.5 space-y-1.5 hover:border-zinc-850 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-200">1. IMAGE SYNTHESIS (STORYBOARD)</span>
                          <span className="text-[8px] font-mono bg-pink-950/40 text-pink-400 border border-pink-500/20 px-1.5 py-0.5 rounded uppercase">Nano Banana 2</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          The Image Generation module utilizes the <strong className="text-pink-400">gemini-3.1-flash-image</strong> API directly to synthesize high-contrast, storyboard scenes based on structural text prompts. Each visual asset outputs inside a pristine 16:9 cinematic aspect ratio.
                        </p>
                      </div>

                      {/* Video synthesis */}
                      <div className="bg-zinc-900/60 border border-zinc-900 rounded-lg p-3.5 space-y-1.5 hover:border-zinc-850 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-200">2. VIDEO RECONSTRUCTION OVER 3 MINS</span>
                          <span className="text-[8px] font-mono bg-orange-950/40 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">Veo 3 Generate</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          Powered by the <strong className="text-orange-400">veo-3.1-generate-preview</strong> temporal modeling suite. Specially calibrated to construct visual scenes that **exceed 3 minutes in runtime length** for comprehensive sequence walkthrough assessment.
                        </p>
                      </div>

                      {/* Male Vocal tracks */}
                      <div className="bg-zinc-900/60 border border-zinc-900 rounded-lg p-3.5 space-y-1.5 hover:border-zinc-850 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-200">3. NARRATION AUDIO ENGINE</span>
                          <span className="text-[8px] font-mono bg-teal-950/40 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded uppercase text-[8px]">Benevolent Voice</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          Vocal tracks are rendered with an American Benevolent Male voice-over track. Synthesized closed captions are aligned with frame-level updates to deliver educational developer topics in complete sync with video flows.
                        </p>
                      </div>

                      {/* Integration Bridges info box */}
                      <div className="bg-zinc-900/60 border border-zinc-900 rounded-lg p-3.5 space-y-1.5 hover:border-zinc-850 transition">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-200">4. SYSTEM INTEGRATION BRIDGES</span>
                          <span className="text-[8px] font-mono bg-blue-950/40 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase text-[8px]">MCP Clients</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          Bridges background states with external platforms such as Slack, GitHub, and local databases through standard <strong className="text-blue-400">Model Context Protocol (MCP)</strong> clients setup in the tab dashboard above.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action checklist */}
                  <div className="bg-orange-950/15 border border-orange-500/10 rounded-lg p-4 space-y-3 font-mono">
                    <span className="text-[10px] font-bold text-orange-400 uppercase block tracking-wider">How to test and assess workflow:</span>
                    <ul className="text-[10px] text-zinc-400 space-y-2 leading-relaxed font-sans">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 font-bold font-mono">1.</span>
                        <span>Click the <strong className="text-zinc-200">Operations Center</strong> tab, fill out custom topics or engineering niches, and click **LAUNCH AGENTIC SYSTEM PIPELINE**.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 font-bold font-mono">2.</span>
                        <span>Watch scenes sequence timeline. Play, pause, or seek tracks in real-time. Click **3x Fast** button to scrub the entire 3 minutes block quickly.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 font-bold font-mono">3.</span>
                        <span>Secure credentials easily by clicking the **CONNECTIONS MANAGER** tab above. Enter <strong className="text-zinc-200">admin123</strong> to unlock secret edits!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : activeSidebarTab === "connections" ? (
                /* ========================================================= */
                /* TAB 2: SECURE CONNECTION KEYS MANAGER (with lock)          */
                /* ========================================================= */
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-orange-500" /> API Connections Manager
                    </h3>
                    <div className="flex items-center gap-1">
                      {isAuthenticated ? (
                        <span className="text-[9px] font-mono text-teal-400 bg-teal-950/20 border border-teal-500/20 rounded px-1.5 py-0.5 flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5" /> UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-amber-500 bg-amber-950/20 border border-amber-500/20 rounded px-1.5 py-0.5 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    /* Password Gateway Layer */
                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 text-center space-y-4">
                      <div className="inline-flex p-3 bg-orange-950/30 border border-orange-500/20 rounded-full text-orange-400 mb-1">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-zinc-200">Credential Verification Required</h4>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Enter password to gain access to connection config keys</p>
                      </div>

                      <form onSubmit={handleAuthSubmit} className="space-y-3">
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full bg-zinc-900 text-zinc-100 text-xs text-center font-mono border border-zinc-800 p-2.5 rounded outline-none focus:border-zinc-700 focus:bg-zinc-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 transform transition animate-none"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {authError && (
                          <p className="text-[10px] text-red-400 font-mono font-medium">{authError}</p>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs py-2 rounded transition cursor-pointer"
                        >
                          Authorize Access Credentials
                        </button>
                      </form>

                      <div className="pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Password hint: <span className="text-zinc-400 underline">admin123</span>
                      </div>
                    </div>
                  ) : (
                    /* Authenticated Content panel */
                    <div className="space-y-6">
                      {/* API keys section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Authenticated Provider Keycards ({apiKeys.length})</span>
                        </div>

                        {/* Add key form */}
                        <form onSubmit={handleAddKey} className="bg-zinc-900/30 border border-zinc-900 rounded p-3 space-y-2.5">
                          <p className="text-[10px] font-mono text-orange-400 uppercase font-bold tracking-wider">Register custom API Secret</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase">Key Label</label>
                              <input
                                type="text"
                                placeholder="e.g. ELEVENLAB_KEY"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase">Service Provider</label>
                              <select
                                value={newKeyService}
                                onChange={(e) => setNewKeyService(e.target.value)}
                                className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800 animate-none"
                              >
                                <option value="Google Gemini Engine">Google Gemini Engine</option>
                                <option value="ElevenLabs Audios">ElevenLabs Audios</option>
                                <option value="OpenAI Platforms">OpenAI Platforms</option>
                                <option value="YouTube Stream API">YouTube Stream API</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Secret Token Value</label>
                            <input
                              type="password"
                              placeholder="Paste secret configuration token here..."
                              value={newKeyValue}
                              onChange={(e) => setNewKeyValue(e.target.value)}
                              className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs py-1.5 rounded transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-orange-400" /> Save Key parameters
                          </button>
                        </form>

                        {/* Display Key Cards */}
                        <div className="space-y-2">
                          {apiKeys.length === 0 ? (
                            <div className="p-4 border border-zinc-900 rounded text-center text-zinc-600 font-mono text-[10px]">
                              No custom keys referenced in database state.
                            </div>
                          ) : (
                            apiKeys.map(k => (
                              <div key={k.id} className="p-3 bg-zinc-900 border border-zinc-855 rounded flex justify-between items-center transition hover:border-zinc-800 text-xs">
                                <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-zinc-200">{k.name}</span>
                                    <span className="text-[8px] bg-zinc-950 px-1 py-0.5 text-zinc-500 uppercase border border-zinc-900 rounded">{k.service}</span>
                                  </div>
                                  <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">••••••••••••{k.value.slice(-4) || "LIVE_TOKEN"}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteKey(k.id)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 rounded transition cursor-pointer"
                                  title="Delete secret key card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* MCP Connections Section */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Model Context Protocol (MCP) integrations ({mcpConnections.length})</span>

                        {/* Add MCP integration form */}
                        <form onSubmit={handleAddMcp} className="bg-zinc-900/30 border border-zinc-900 rounded p-3 space-y-2.5">
                          <p className="text-[10px] font-mono text-pink-500 uppercase font-bold tracking-wider">Register custom MCP Connection</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase">MCP Instance Label</label>
                              <input
                                type="text"
                                placeholder="e.g. Filesystem MCP"
                                value={newMcpName}
                                onChange={(e) => setNewMcpName(e.target.value)}
                                className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase">App / Tools Target</label>
                              <input
                                type="text"
                                placeholder="e.g. google-drive-tools"
                                value={newMcpAppName}
                                onChange={(e) => setNewMcpAppName(e.target.value)}
                                className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Connection Endpoint URL</label>
                            <input
                              type="text"
                              placeholder="e.g. http://localhost:8080/mcp"
                              value={newMcpEndpoint}
                              onChange={(e) => setNewMcpEndpoint(e.target.value)}
                              className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-zinc-500 uppercase">Connection Description / Scope</label>
                            <input
                              type="text"
                              placeholder="e.g. Bridges file context queries directly."
                              value={newMcpDescription}
                              onChange={(e) => setNewMcpDescription(e.target.value)}
                              className="w-full bg-zinc-950 text-zinc-200 text-xs border border-zinc-900 p-2 rounded mt-0.5 outline-none focus:border-zinc-800"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs py-1.5 rounded transition uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-pink-500" /> Save MCP connection
                          </button>
                        </form>

                        {/* Display MCP Cards */}
                        <div className="space-y-2">
                          {mcpConnections.length === 0 ? (
                            <div className="p-4 border border-zinc-900 rounded text-center text-zinc-600 font-mono text-[10px]">
                              No registered Model Context Protocol clients.
                            </div>
                          ) : (
                            mcpConnections.map(m => (
                              <div key={m.id} className="p-3 bg-zinc-900 border border-zinc-855 rounded flex justify-between items-start transition hover:border-zinc-800 text-xs">
                                <div className="space-y-1 min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-zinc-200">{m.name}</span>
                                    <span className="text-[8px] bg-zinc-950 px-1 py-0.5 text-zinc-500 uppercase border border-zinc-900 rounded tracking-wider">{m.appName}</span>
                                  </div>
                                  <p className="text-[10px] font-mono text-zinc-400 mt-1 truncate">{m.endpoint}</p>
                                  <p className="text-[10px] text-zinc-550 leading-normal font-sans italic mt-1">{m.description}</p>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0 animate-none">
                                  <button
                                    onClick={() => handleToggleMcpStatus(m.id)}
                                    className={`p-1.5 rounded border transition cursor-pointer flex items-center justify-center ${
                                      m.status === "connected"
                                        ? "bg-teal-950/20 border-teal-500/20 text-teal-400 hover:bg-teal-900/30"
                                        : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:bg-zinc-900"
                                    }`}
                                    title={m.status === "connected" ? "Deactivate MCP Connection" : "Activate MCP Connection"}
                                  >
                                    {m.status === "connected" ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteMcp(m.id)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 rounded transition cursor-pointer"
                                    title="Delete MCP client config"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setIsAuthenticated(false)}
                        className="w-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-800 text-zinc-400 py-2.5 rounded font-mono text-[10px] transition cursor-pointer uppercase flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5 text-orange-400" /> Lock Manager Interface
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ========================================================= */
                /* TAB 3: AGENT GROUNDING PROMPTS                             */
                /* ========================================================= */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Agent Grounding Workspace
                    </h3>
                    <span className="text-[9px] font-mono text-zinc-550 border border-zinc-800 rounded px-1.5 py-0.5">
                      9 ACTIVE ROLES
                    </span>
                  </div>

                  <p className="text-[10px] uppercase font-mono text-zinc-500 leading-normal">
                    Equip each autonomous agent with customized behavioral grounding directives, style parameters, or specialized focus criteria to ensure brand, technical accuracy, and layout consistency.
                  </p>

                  <div className="space-y-4">
                    {AGENTS_LIST.map((agent) => {
                      const IconComponent = 
                        agent.icon === "Cpu" ? Cpu :
                        agent.icon === "BookOpen" ? BookOpen :
                        agent.icon === "Sparkles" ? Sparkles :
                        agent.icon === "User" ? User :
                        ShieldCheck;
                      
                      return (
                        <div key={agent.key} className="bg-zinc-900/40 border border-zinc-900 rounded-lg p-3.5 space-y-2.5 transition duration-200 hover:border-zinc-800">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80 mt-0.5">
                              <IconComponent className="w-3.5 h-3.5 text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight">{agent.title}</h4>
                              <p className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-normal">{agent.desc}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase flex justify-between items-center">
                              <span>GROUNDING DIRECTIVE PROMPT</span>
                              <span className="text-[8px] text-zinc-650 truncate max-w-[150px]">KEY: {agent.key}</span>
                            </label>
                            <textarea
                              value={agentGroundingPrompts[agent.key] || ""}
                              onChange={(e) => {
                                setAgentGroundingPrompts((prev) => ({
                                  ...prev,
                                  [agent.key]: e.target.value
                                }));
                              }}
                              className="w-full h-24 bg-zinc-950 text-[11px] font-mono text-zinc-300 border border-zinc-900 p-2 rounded outline-none focus:border-zinc-800 focus:bg-zinc-950 resize-y"
                              placeholder="Describe customized behavior constraints for this role..."
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded p-4 space-y-3.5 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-zinc-550 uppercase">Save & Commit Configs</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveGrounding}
                        disabled={isSavingGrounding}
                        className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs py-2 rounded transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isSavingGrounding ? "Saving Prompts..." : saveSuccess ? "✓ Groundings Saved" : "Save Grounding Strategy"}
                      </button>
                      <button
                        onClick={handleResetToFactory}
                        className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 px-3 py-2 rounded transition cursor-pointer flex items-center justify-center [transition:all_1s_ease]"
                        title="Restore agent defaults"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400 transition cursor-pointer" />
                      </button>
                    </div>

                    {saveSuccess && (
                      <p className="text-[9px] text-teal-400 font-mono text-center">✓ Grounding prompt guidelines active in pipeline memory</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
