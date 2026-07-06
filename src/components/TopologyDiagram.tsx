import React, { useState } from "react";
import { Server, Share2, Layers, Cpu, ShieldAlert, FileText, Database } from "lucide-react";

export default function TopologyDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    { id: "input", x: 60, y: 150, label: "AI Trends Scraper", type: "Input", desc: "Monitors YouTube, X/Twitter, Reddit, HackerNews, or arXiv for breakthrough model releases." },
    { id: "eventarc", x: 190, y: 150, label: "Eventarc Router", type: "Broker", desc: "Routes high-speed structured events asynchronously to register trends dynamically." },
    { id: "orchestration", x: 340, y: 150, label: "Workflows Engine", type: "Orchestrator", desc: "Underlying state coordinator checking stages of the 17 independent agents." },
    { id: "agents", x: 490, y: 150, label: "Multi-Agent Pool", type: "Processors", desc: "Decoupled server tasks executed using Gemini models, evaluating output accuracy." },
    { id: "firestore", x: 340, y: 280, label: "Firestore DB", type: "Persistence", desc: "Keeps durable system states, agent checkpoints, and historic approval trends." },
    { id: "human", x: 640, y: 150, label: "Telegram Loop", type: "Gateway", desc: "Forces Human-In-The-Loop audit approval step before YouTube publication is possible." },
    { id: "youtube", x: 780, y: 150, label: "YouTube SDK", type: "Output", desc: "Uploads finalized videos with metadata, hashtaging, chapter lists and titles." }
  ];

  const agentPool = [
    { label: "1. Trend Search", color: "border-orange-500/30" },
    { label: "2. Base Research", color: "border-orange-500/30" },
    { label: "3. Strategy Angle", color: "border-orange-500/30" },
    { label: "4. Script Writing", color: "border-orange-500/30" },
    { label: "5. Critic Evaluation", color: "border-orange-500/30" },
    { label: "6. Scene Storyboard", color: "border-pink-500/30" },
    { label: "7. Prompt Engineers", color: "border-pink-500/30" },
    { label: "8. Asset Gen (Imagen)", color: "border-pink-500/30" },
    { label: "9. Quality Auditor", color: "border-pink-500/30" },
    { label: "10. Video Pan (Veo)", color: "border-teal-500/30" },
    { label: "11. Audio TTS (Kore)", color: "border-teal-500/30" },
    { label: "12. Music Licensing", color: "border-teal-500/30" },
    { label: "13. Assembly Stitch", color: "border-teal-500/30" },
    { label: "14. QA Certifier", color: "border-teal-500/30" },
    { label: "15. Thumbnail Variant", color: "border-blue-500/30" },
    { label: "16. CTR Title Optimizer", color: "border-blue-500/30" },
    { label: "17. SEO Description", color: "border-blue-500/30" }
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 lg:col-span-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <Share2 className="text-orange-500 w-5 h-5" /> 
            GLOBAL EVENT-DRIVEN TOPOLOGY
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Interactive system architecture of autonomous multi-agent workers integrated with Google Cloud Run & Eventarc.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-orange-950/40 border border-orange-500/30 text-orange-400 rounded">Asynchronous Messaging</span>
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">Audit Controlled</span>
        </div>
      </div>

      {/* SVG Canvas diagram mapping topology of asynchronous workflows */}
      <div className="relative overflow-x-auto select-none py-4 bg-zinc-900/10 rounded-xl border border-zinc-900">
        <div className="min-w-[860px] h-[340px] relative mx-auto">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f3f46" />
              </marker>
              <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
              </marker>
            </defs>

            {/* Connecting vectors layout */}
            <line x1="150" y1="150" x2="190" y2="150" stroke="#f97316" strokeWidth="2" strokeDasharray="3,3" markerEnd="url(#arrow-gold)" />
            <line x1="280" y1="150" x2="330" y2="150" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrow-gold)" />
            <line x1="420" y1="150" x2="480" y2="150" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrow-gold)" />
            <line x1="570" y1="150" x2="630" y2="150" stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="720" y1="150" x2="770" y2="150" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrow-gold)" />

            {/* Persistence state loops */}
            <path d="M 380 170 L 380 270" stroke="#3f3f46" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 370 270 L 370 175" stroke="#f97316" strokeWidth="1.5" markerEnd="url(#arrow-gold)" />
          </svg>

          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
              style={{ left: `${node.x}px`, top: `${node.y - 40}px` }}
              className={`absolute w-32 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                activeNode === node.id 
                  ? "bg-zinc-800 border-orange-500 scale-105 shadow-md shadow-orange-500/10" 
                  : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:shadow-sm"
              }`}
            >
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">{node.type}</p>
              <h4 className="text-xs font-bold text-zinc-200 mt-1 truncate">{node.label}</h4>
              <p className="text-[8px] text-orange-400 mt-1 font-mono">Info Check &bull;</p>
            </div>
          ))}
        </div>

        {/* Selected element descriptions drawer */}
        {activeNode && (
          <div className="mx-6 mb-2 mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg animate-fade-in">
            <h4 className="text-xs font-bold text-orange-400 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              {nodes.find(n => n.id === activeNode)?.label.toUpperCase()} SPECIFICATIONS
            </h4>
            <p className="text-xs text-zinc-300 mt-2 font-sans">
              {nodes.find(n => n.id === activeNode)?.desc}
            </p>
          </div>
        )}
      </div>

      {/* Grid of the 17 fully decoupled AI Agents within the pipeline */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" />
          DECOUPLED PIPELINE AGENT CLUSTER (1-17)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {agentPool.map((agent, index) => (
            <div
              key={index}
              className={`p-3 bg-zinc-900/60 rounded border ${agent.color} transition-all duration-300 hover:bg-zinc-900/100`}
            >
              <p className="text-xs font-bold text-zinc-100 truncate font-sans">{agent.label}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Idle State</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
