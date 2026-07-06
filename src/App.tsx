import React, { useState, useEffect, useRef } from "react";
import { 
  VideoStatus, 
  VideoWorkflow, 
  CloudLog, 
  SystemStats, 
  AgentState 
} from "./types";
import MetricCard from "./components/MetricCard";
import TopologyDiagram from "./components/TopologyDiagram";
import ArchSpecs from "./components/ArchSpecs";
import TelegramSimulator from "./components/TelegramSimulator";
import SidebarConsole from "./components/SidebarConsole";
import VideoPlayerSimulator from "./components/VideoPlayerSimulator";
import AgentPerformanceChart from "./components/AgentPerformanceChart";
import { 
  Cpu, 
  Flame, 
  Play, 
  Trash2, 
  List, 
  Activity, 
  Settings2, 
  BarChart2, 
  CheckCircle2, 
  RotateCw, 
  ExternalLink,
  Users,
  Eye,
  Clock,
  TrendingUp,
  LogOut,
  AlertTriangle,
  RefreshCcw,
  BookOpen
} from "lucide-react";

export default function App() {
  const [workflows, setWorkflows] = useState<VideoWorkflow[]>([]);
  const [logs, setLogs] = useState<CloudLog[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalWatchTime: 830,
    subscribers: 410,
    views: 12450,
    avgCtr: 8.4,
    totalCost: 1.45,
    apiTokensUsed: 1812500
  });
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workspace" | "specs">("workspace");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch metrics and logs from Express backend
  const fetchData = async () => {
    try {
      setApiError(null);
      // Fetch status variables
      const statusRes = await fetch("/api/status");
      if (!statusRes.ok) throw new Error("Backend offline");
      const statusData = await statusRes.json();
      setStats(statusData.stats);
      setAgents(statusData.agents);

      // Fetch workflows
      const wfRes = await fetch("/api/workflows");
      const wfData = await wfRes.json();
      setWorkflows(wfData.workflows);

      // Fetch logs
      const logsRes = await fetch("/api/logs");
      const logsData = await logsRes.json();
      setLogs(logsData.logs);

      // Autofill selected workflow on first load or if state clears out
      if (wfData.workflows.length > 0) {
        setSelectedWorkflowId(prev => {
          if (!prev) return wfData.workflows[0].id;
          // Verify if active one still exists
          const exists = wfData.workflows.some(w => w.id === prev);
          return exists ? prev : wfData.workflows[0].id;
        });
      }
    } catch (error: any) {
      console.warn("Sync client status (retry pending):", error.message || error);
      setApiError("Express Server offline or compiling. Please wait...");
    }
  };

  // Run data polling every 4 seconds to animate status logs and agent changes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);
    setApiError(null);
    try {
      const res = await fetch("/api/workflows/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customTopic.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Initialization failed");
      
      setCustomTopic("");
      await fetchData();
      if (data.workflowId) {
        setSelectedWorkflowId(data.workflowId);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to launch pipeline event.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleApprove = async (id: string, titleIndex: number, thumbnailIndex: number) => {
    try {
      const res = await fetch("/api/workflows/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titleIndex, thumbnailIndex })
      });
      if (!res.ok) throw new Error("Approve api failed");
      await fetchData();
    } catch (err: any) {
      setApiError("Unable to approve workflow. Verify connection.");
    }
  };

  const handleReject = async (id: string, reason: string, affectedScenes: number[], instructions: string) => {
    try {
      const res = await fetch("/api/workflows/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason, affectedScenes, improvementInstructions: instructions })
      });
      if (!res.ok) throw new Error("Reject api failed");
      await fetchData();
    } catch (err: any) {
      setApiError("Unable to register rejection feedback.");
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!window.confirm("Delete this workflow record and all related log lines permanently?")) return;
    try {
      const res = await fetch("/api/workflows/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Delete api failed");
      await fetchData();
    } catch (err: any) {
      setApiError("Unable to delete selected item.");
    }
  };

  const handleResetSystem = async () => {
    if (!window.confirm("Reset entire system database back to starting seed blocks? All your active drafts will be cleared.")) return;
    try {
      const res = await fetch("/api/workflows/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error("Reset api failed");
      await fetchData();
    } catch (err: any) {
      setApiError("Failed to trigger safe system reset.");
    }
  };

  // Extract selected inspected workflow object
  const inspectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

  // Check if any workflow is currently cooking / running in background
  const activeWfs = workflows.filter(w => 
    w.status !== VideoStatus.PUBLISHED && 
    w.status !== VideoStatus.APPROVED && 
    w.status !== VideoStatus.REJECTED
  );
  const isWorkflowActive = activeWfs.length > 0;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-zinc-950">
      
      {/* Top Console Navigation Bar */}
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 py-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-950/40 border border-orange-500/30 rounded">
            <Cpu className="text-orange-500 w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100 font-mono flex items-center gap-2">
              YOUTUBE AUTOMATION FACTORY <span className="text-[10px] bg-orange-900/40 text-orange-400 font-normal border border-orange-500/20 rounded px-1.5 py-0.5">ORCHESTRATOR</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Continuous emergence &bull; Google Cloud Run stack</p>
          </div>
        </div>

        {/* Global tab panels toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex bg-zinc-900 p-1 rounded border border-zinc-850 text-xs font-mono">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${activeTab === "workspace" ? "bg-orange-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <Activity className="w-3.5 h-3.5" /> Operations center
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer ${activeTab === "specs" ? "bg-orange-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Architecture Spec
            </button>
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 px-3.5 bg-orange-950/45 text-orange-400 border border-orange-500/35 hover:bg-orange-900/50 rounded transition flex items-center gap-1.5 cursor-pointer font-mono text-[10px]"
            title="Open Menu Sidebar & Dashboard"
          >
            <List className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> MENU / DASHBOARD
          </button>

          <button
            onClick={handleResetSystem}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-450 border border-zinc-800 rounded transition flex items-center gap-1 cursor-pointer font-mono text-[10px]"
            title="Reset Database"
          >
            <RefreshCcw className="w-3 h-3 text-zinc-400" /> RESET SEEDS
          </button>
        </div>
      </header>

      {/* Warning/Status API Error message banner */}
      {apiError && (
        <div className="bg-red-950/40 border-b border-red-900 text-red-400 px-6 py-2.5 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 animate-bounce" />
          <span>{apiError}</span>
          <button onClick={fetchData} className="ml-auto underline cursor-pointer hover:text-zinc-200">Retry Now</button>
        </div>
      )}

      {/* Main Grid View */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 space-y-6">
        
        {activeTab === "workspace" ? (
          <>
            {/* Real-time KPI Metric Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard 
                title="Accumulated Views" 
                value={stats.views.toLocaleString()} 
                icon={<Eye className="w-4 h-4 text-orange-400" />} 
                subtitle="High retention videos"
                accent="bg-orange-500"
              />
              <MetricCard 
                title="Watch Time (Hrs)" 
                value={stats.totalWatchTime.toLocaleString()} 
                icon={<Clock className="w-4 h-4 text-pink-400" />} 
                subtitle="Average 71% retention"
                accent="bg-pink-500"
              />
              <MetricCard 
                title="Subscribers Base" 
                value={`+${stats.subscribers.toLocaleString()}`} 
                icon={<Users className="w-4 h-4 text-teal-400" />} 
                subtitle="Targeted tech community"
                accent="bg-teal-500"
              />
              <MetricCard 
                title="Average CTR" 
                value={`${stats.avgCtr.toFixed(1)}%`} 
                icon={<TrendingUp className="w-4 h-4 text-blue-400" />} 
                subtitle="Optimized thumbnail engine"
                accent="bg-blue-500"
              />
              <MetricCard 
                title="Computed Budget" 
                value={`$${stats.totalCost.toFixed(4)}`} 
                icon={<Activity className="w-4 h-4 text-amber-400" />} 
                subtitle="Automatic low-cost routing"
                accent="bg-amber-500"
              />
              <MetricCard 
                title="Gemini Tokens" 
                value={stats.apiTokensUsed.toLocaleString()} 
                icon={<Cpu className="w-4 h-4 text-emerald-400" />} 
                subtitle="Lazy model structures"
                accent="bg-emerald-500"
              />
            </div>

            {/* Middle panel content factory trigger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Sandbox Simulator launch and list of Video workflows */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Launch dynamic content factory panel */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5">
                    <Flame className="text-orange-500 w-4 h-4" /> Trigger Sandbox Factory Cycle
                  </h3>
                  <form onSubmit={handleLaunchWorkflow} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 uppercase">Target Video Topic / Niche Nudge</label>
                      <input
                        type="text"
                        placeholder="e.g. OpenAI GPT-5 Rumors, Rust vs Go for AI, GPT Agents..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        disabled={isLaunching || isWorkflowActive}
                        className="w-full bg-zinc-900 text-zinc-200 text-xs border border-zinc-800 p-3 rounded mt-1 outline-none focus:border-zinc-700 disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLaunching || isWorkflowActive}
                      className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-850 disabled:text-zinc-600 disabled:border-zinc-900 disabled:hover:scale-100 font-sans font-bold text-xs text-zinc-950 py-3 rounded flex items-center justify-center gap-1.5 transition transform active:scale-98 cursor-pointer"
                    >
                      {isLaunching ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" /> Preparing Assets...
                        </>
                      ) : isWorkflowActive ? (
                        <>
                          <Cpu className="w-4 h-4 text-zinc-600" /> Pipeline Currently Active
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> LAUNCH AGENTIC SYSTEM PIPELINE
                        </>
                      )}
                    </button>
                    {isWorkflowActive && (
                      <p className="text-[10px] text-orange-400/85 font-mono text-center">
                        An active pipeline execution is running. Watch logs update live!
                      </p>
                    )}
                  </form>
                </div>

                {/* List of workflow items */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-3">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider mb-2 flex items-center justify-between">
                    <span>Workflow executions</span>
                    <span className="text-[10px] bg-zinc-900 text-zinc-500 rounded px-1.5">{workflows.length} records</span>
                  </h3>
                  
                  {workflows.length === 0 ? (
                    <div className="p-8 text-center border border-zinc-900 rounded bg-zinc-900/10 text-zinc-500 text-xs font-mono">
                      No workflows active. Use the trigger above to launch one.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto">
                      {workflows.map(wf => {
                        const isSelected = wf.id === selectedWorkflowId;
                        const isCurrentActive = wf.status !== VideoStatus.PUBLISHED && wf.status !== VideoStatus.REJECTED;
                        return (
                          <div
                            key={wf.id}
                            onClick={() => setSelectedWorkflowId(wf.id)}
                            className={`p-3.5 rounded border text-left cursor-pointer transition ${
                              isSelected 
                                ? "bg-zinc-900 border-orange-500 text-zinc-100" 
                                : "bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900/100 hover:border-zinc-800 text-zinc-400"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold font-sans text-zinc-200 truncate flex-1">{wf.topic}</h4>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(wf.id); }}
                                  className="p-1 hover:text-red-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                                  title="Delete workflow logs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2.5 text-[10px] font-mono">
                              <span className={`px-1.5 py-0.5 rounded ${isCurrentActive ? "text-orange-400 bg-orange-950/20" : "text-zinc-500 bg-zinc-850"}`}>
                                {wf.status}
                              </span>
                              <span className="text-zinc-500">
                                {new Date(wf.updatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* High fidelity real-time agent registry status panel */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5">
                  <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider mb-4 flex items-center gap-1.5">
                    <Activity className="text-orange-500 w-4 h-4 animate-pulse" /> Agent States Registry
                  </h3>
                  <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                    {agents.map((agent, i) => (
                      <div key={i} className="flex gap-3 text-xs items-start bg-zinc-900/20 p-2.5 rounded border border-zinc-950 hover:border-zinc-900">
                        <div className="text-lg bg-zinc-900 p-1.5 border border-zinc-800 rounded flex-shrink-0">{agent.avatar}</div>
                        <div className="flex-1 space-y-0.5 truncate">
                          <p className="font-bold text-zinc-200 font-sans text-[11px] truncate">{agent.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{agent.lastMessage}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "running" ? "bg-orange-500 animate-ping" : "bg-zinc-700"}`} />
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">{agent.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Inspector displaying agent logs or the Telegram view approval gateway */}
              <div className="lg:col-span-2 space-y-6">
                
                {inspectedWorkflow ? (
                  <div className="space-y-6">
                    {/* Video Assessment & Virtual Playback Deck */}
                    <VideoPlayerSimulator workflow={inspectedWorkflow} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Visual Storyboard Timeline / Progress Panel */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                        <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider">
                          Pipeline workflow inspector
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono">Execution details</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Selected Target Topic</p>
                        <h2 className="text-sm font-bold text-zinc-100 font-sans leading-snug">{inspectedWorkflow.topic}</h2>
                      </div>

                      {/* Display confidence score report card if research finished */}
                      {inspectedWorkflow.research && (
                        <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded text-xs space-y-2.5">
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-orange-400 font-bold uppercase tracking-wider">A1/A2 discovery research dossier</span>
                            <span className="bg-zinc-800 rounded px-1 text-zinc-400">Confidence: {inspectedWorkflow.research.confidenceScore}%</span>
                          </div>
                          <p className="text-zinc-300 font-sans leading-relaxed">{inspectedWorkflow.research.summary}</p>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">Citations list and Primary sources:</span>
                            {inspectedWorkflow.research.citations.map((cite, index) => (
                              <div key={index} className="flex justify-between items-center text-[10px] font-mono bg-zinc-950 p-2 rounded">
                                <span className="text-zinc-400 truncate max-w-[210px]">{cite.title}</span>
                                <a 
                                  href={cite.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-orange-400 hover:underline flex items-center gap-0.5 whitespace-nowrap"
                                >
                                  {cite.source} <ExternalLink className="w-2.5 h-2.5 inline" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video logs feed table showing runtime metrics */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                          <List className="w-4 h-4 text-orange-500" /> Runtime Event Broker Logs ({logs.filter(l => l.workflowId === inspectedWorkflow.id).length})
                        </h3>
                        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                          {logs.filter(l => l.workflowId === inspectedWorkflow.id).length === 0 ? (
                            <div className="p-6 text-center text-zinc-600 font-mono text-xs border border-dashed border-zinc-900 rounded bg-zinc-950">
                              Preparing system stream. Wait for Eventarc registration...
                            </div>
                          ) : (
                            logs.filter(l => l.workflowId === inspectedWorkflow.id).map(log => (
                              <div 
                                key={log.id} 
                                className={`p-3 rounded border text-xs font-mono space-y-1.5 ${
                                  log.status === "FAILED" 
                                    ? "bg-red-950/20 border-red-950" 
                                    : log.status === "START" 
                                      ? "bg-blue-950/20 border-blue-900/30" 
                                      : "bg-zinc-900 border-zinc-850"
                                }`}
                              >
                                <div className="flex justify-between text-[10px] items-center">
                                  <span className="text-orange-400 font-bold">{log.agentName}</span>
                                  <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-zinc-200 mt-1 font-sans">{log.message}</p>
                                <div className="pt-1.5 border-t border-zinc-850 flex justify-between text-[9px] text-zinc-500 gap-2">
                                  <span className="truncate max-w-[130px]">In: {log.input}</span>
                                  <span className="whitespace-nowrap font-bold text-zinc-400">Duration: {log.executionSeconds}s &bull; Cost: ${log.cost.toFixed(5)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right column within operating board: Human approval simulation loop on Telegram */}
                    <div className="lg:col-span-1">
                      <TelegramSimulator 
                        workflow={inspectedWorkflow} 
                        onApprove={handleApprove} 
                        onReject={handleReject} 
                      />
                    </div>

                  </div>

                </div>
                ) : (
                  <div className="p-12 text-center border border-zinc-900 rounded-lg bg-zinc-950 text-zinc-500 font-mono text-xs">
                    Please select an operations pipeline in the executions pool to inspect telemetry records.
                  </div>
                )}

              </div>

            </div>

            {/* Agent Performance Analytics Section */}
            <div className="grid grid-cols-1 gap-6">
              <AgentPerformanceChart 
                logs={logs} 
                selectedWorkflowId={selectedWorkflowId} 
                workflowTopic={inspectedWorkflow?.topic} 
              />
            </div>

            {/* Architecture node system diagrams */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopologyDiagram />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ArchSpecs />
          </div>
        )}

      </main>

      {/* Humble Footer */}
      <footer className="mt-auto bg-zinc-950 border-t border-zinc-900 py-6 px-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 font-mono gap-4">
        <p>Google AI Studio Orchestrator stack &bull; 17 Decoupled Agents Pool</p>
        <p>Copyright &copy; 2026. Resilient Event Loops &bull; All evaluations certified true</p>
      </footer>

      {/* Slide out Profile and Connections manager Console */}
      <SidebarConsole 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        apiError={apiError} 
        setApiError={setApiError} 
      />

    </div>
  );
}
