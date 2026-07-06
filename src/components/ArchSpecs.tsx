import { useState } from "react";
import { BookOpen, ShieldAlert, DollarSign, Terminal, Code } from "lucide-react";

export default function ArchSpecs() {
  const [activeTab, setActiveTab] = useState<"practices" | "prompts" | "cost">("practices");

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 lg:col-span-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <BookOpen className="text-orange-500 w-5 h-5" /> 
            AI ARCHITECTURE TECHNICAL SPECS
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Deep dive into prompt frameworks, cost guidelines, guardrails, and event orchestration rules.
          </p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded border border-zinc-850 gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("practices")}
            className={`px-3 py-1.5 rounded transition ${activeTab === "practices" ? "bg-orange-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Best Practices
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`px-3 py-1.5 rounded transition ${activeTab === "prompts" ? "bg-orange-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            System prompts
          </button>
          <button
            onClick={() => setActiveTab("cost")}
            className={`px-3 py-1.5 rounded transition ${activeTab === "cost" ? "bg-orange-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Safety & Costs
          </button>
        </div>
      </div>

      {activeTab === "practices" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-zinc-900/40 rounded border border-zinc-900">
              <h4 className="text-xs font-bold text-orange-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> 1. Decoupled Architecture
              </h4>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed font-sans">
                Agents are strictly forbidden from direct coupling or calling other agents. This prevents stack traces from propagating and collapsing entire processes. All states and transactions occur via structured message routers (Pub/Sub & Eventarc) writing to Firestore checkpoints.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/40 rounded border border-zinc-900">
              <h4 className="text-xs font-bold text-orange-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Code className="w-4 h-4" /> 2. Dual Loop Evaluation
              </h4>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed font-sans">
                Evaluation thresholds execute at two distinct layers. Script Quality is evaluated by a specialized critic agent scoring parameters out of 100. Values below 85 automatically force local loop regenerations without resetting prior research state blocks.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/40 rounded border border-zinc-900">
              <h4 className="text-xs font-bold text-orange-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> 3. Human-In-The-Loop (HITL) Checkpoints
              </h4>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed font-sans">
                Workflows suspend execution and wait at the "Awaiting Approval" state inside a simulated Telegram gateway. Rejections rollback state variables locally, capturing structured annotations to continuously feed lessons back into the Optimization Agent.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/40 rounded border border-zinc-900">
              <h4 className="text-xs font-bold text-orange-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> 4. Budget Gating Limits
              </h4>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed font-sans">
                To eliminate runaway agent costs, each transaction tracks token overhead. Standard validators use smaller, high-speed models (e.g. <code className="text-orange-300 font-mono">gemini-3.5-flash</code>) with low temperatures (0.2) to maintain absolute semantic compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "prompts" && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-4 rounded border border-zinc-850 font-mono text-xs">
            <p className="text-orange-400 font-bold mb-2">// CORE ORCHESTRATOR SYSTEM DESIGN PROMPT:</p>
            <p className="text-zinc-300 leading-relaxed">
              "You are the central clock and event scheduler of the content orchestrator factory. Your task is to process incoming trend candidate events, direct appropriate downstream payload schemas to specialized workers, and ensure final QA validations occur prior to human transmission. If any worker outputs invalid schemas or values that drop below defined quality indices, immediately trigger event rollbacks to checkpoint states of that specific stage."
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded border border-zinc-850 font-mono text-xs">
            <p className="text-orange-400 font-bold mb-2">// SCRIPT REVIEW CRITIC ENGINE PROMPT:</p>
            <p className="text-zinc-300 leading-relaxed">
              "Analyze the incoming YouTube markdown draft. Evaluate the density of information, readability metrics, and hook strength dynamics. Provide a strict rating from 0-100 across Clarity, Engagement, Accuracy, and Novelty. If the aggregate margin falls below 85, flag "approved: false" and provide detailed structural feedback directions so the writer agent can correct focal mistakes."
            </p>
          </div>
        </div>
      )}

      {activeTab === "cost" && (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
            <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4.5 h-4.5" /> REJECTING HALLUCINATIONS & SAFEGUARD ACCURACY
            </h4>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Our architecture avoids hallucinated statistics or unverified claims by enforcing the following guidelines:
            </p>
            <ul className="list-disc pl-5 text-xs text-zinc-400 mt-2 space-y-1">
              <li>Always query primary sources, official models documentation, and benchmark releases.</li>
              <li>Integrate dynamic **Google Search Grounding** inside the raw text generations to extract real-time web references and URIs.</li>
              <li>Filter outbound transcripts for trigger terms representing misinformation or unsafe data before committing to audio stages.</li>
            </ul>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <DollarSign className="w-4.5 h-4.5" /> AGENT COST CONTROL RULES
            </h4>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Maintain optimal budgets during continuous cycles by keeping the model temperatures strictly bounded. Use low-complexity schemas for metadata, titles, and tags. Pre-screen trends recursively to ignore stale or duplicate content before triggering multi-stage multimedia models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
