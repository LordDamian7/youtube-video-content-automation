import React, { useState } from "react";
import { VideoWorkflow } from "../types";
import { Check, X, RotateCcw, Image, MessageSquare, Tag, Play } from "lucide-react";

interface TelegramSimulatorProps {
  workflow: VideoWorkflow;
  onApprove: (id: string, titleIndex: number, thumbnailIndex: number) => void;
  onReject: (id: string, reason: string, affectedScenes: number[], instructions: string) => void;
}

export default function TelegramSimulator({ workflow, onApprove, onReject }: TelegramSimulatorProps) {
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("Narrative Adjustment");
  const [affectedSceneStr, setAffectedSceneStr] = useState("1, 2");
  const [rejectInstructions, setRejectInstructions] = useState("Make the hook more punchy and mention Neural Networks early on.");

  const handleApproveSubmit = () => {
    onApprove(workflow.id, selectedTitle, selectedThumb);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scenes = affectedSceneStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    onReject(workflow.id, rejectReason, scenes, rejectInstructions);
    setIsRejecting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
      case "AWAITING_APPROVAL": return "text-amber-400 bg-amber-950/40 border-amber-500/20 animate-pulse";
      case "REJECTED": return "text-red-400 bg-red-950/40 border-red-500/20";
      default: return "text-blue-400 bg-blue-950/40 border-blue-500/10";
    }
  };

  return (
    <div className="bg-[#17212b] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Telegram Channel Header */}
      <div className="bg-[#242f3d] p-4 flex justify-between items-center border-b border-[#101921]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-zinc-950 font-bold font-mono">
            AF
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 font-sans flex items-center gap-1.5">
              🤖 AI CONTENT FACTORY
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            </h4>
            <p className="text-[11px] text-zinc-400 font-mono">9 agents online &bull; preview_channel</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded text-[10px] font-mono border ${getStatusColor(workflow.status)}`}>
          {workflow.currentStep}
        </div>
      </div>

      {/* Telegram Message Timeline Board */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[500px]">
        <div className="bg-[#182533] border border-[#202b36] rounded-lg p-4 space-y-4 shadow-sm">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Workflow Event Queue</span>
            <span>ID: {workflow.id}</span>
          </div>

          {/* Active Thumbnail View Card */}
          <div className="relative rounded overflow-hidden bg-zinc-950 aspect-video group">
            {workflow.thumbnailUrls && workflow.thumbnailUrls.length > 0 ? (
              <img 
                src={workflow.thumbnailUrls[selectedThumb]} 
                alt="Active Render Preview" 
                className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                <Image className="w-10 h-10 mb-2 text-zinc-600" />
                <span className="text-xs font-mono">Image Asset Sandbox</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-[#111c24]/90 border border-[#202b36] px-2 py-1 rounded text-[10px] text-zinc-300 font-mono flex items-center gap-1">
              <Play className="w-3 h-3 text-orange-400" /> Frame preview active
            </div>
          </div>

          {/* Title Options Slider Section */}
          {workflow.titles && workflow.titles.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Candidate Title Variations (CTR Optimized)
              </label>
              <div className="space-y-1.5">
                {workflow.titles.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTitle(idx)}
                    className={`text-left w-full p-2.5 rounded text-xs transition border flex items-start gap-2 ${
                      selectedTitle === idx 
                        ? "bg-[#2b5278]/20 border-[#2b5278] text-zinc-100" 
                        : "bg-[#182533] border-[#202b36] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-mono text-orange-400 flex-shrink-0 mt-0.5">#{idx + 1}</span>
                    <span className="flex-1 font-sans font-medium">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail Picker Choices */}
          {workflow.thumbnailUrls && workflow.thumbnailUrls.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Image className="w-3.5 h-3.5" /> Render Thumbnail Choices
              </label>
              <div className="grid grid-cols-3 gap-2">
                {workflow.thumbnailUrls.map((tUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedThumb(idx)}
                    className={`relative rounded overflow-hidden aspect-video border transition ${
                      selectedThumb === idx ? "border-orange-500 scale-102" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={tUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Video Script Outline Details */}
          {workflow.script && (
            <div className="mt-4 p-3 bg-[#111c24] border border-[#202b36] rounded text-xs space-y-3">
              <div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Hook Script Block</p>
                <p className="text-zinc-200 mt-1 italic font-sans">"{workflow.script.hook}"</p>
              </div>
              <div className="border-t border-[#202b36] pt-2">
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Problem Statement</p>
                <p className="text-zinc-300 mt-1 font-sans">{workflow.script.problem}</p>
              </div>
              <div className="border-t border-[#202b36] pt-2">
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Call To Action (CTA)</p>
                <p className="text-zinc-300 mt-1 font-sans">{workflow.script.cta}</p>
              </div>
            </div>
          )}

          {/* Storyboard scenes expander list */}
          {workflow.scenes && workflow.scenes.map((scene, idx) => (
            <div key={idx} className="p-3 bg-[#111c24] border border-[#202b36] rounded text-xs flex gap-3">
              <div className="w-20 aspect-video rounded overflow-hidden bg-zinc-950 flex-shrink-0">
                {scene.imageUrl ? (
                  <img src={scene.imageUrl} alt="Scene image" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-zinc-900" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-mono text-orange-400 font-bold uppercase">Scene {scene.sceneNumber} &bull; {scene.duration}s</p>
                <p className="text-zinc-200 font-medium font-sans leading-relaxed">{scene.narrationText}</p>
                <p className="text-[9px] font-mono text-zinc-400 truncate">Prompt: {scene.scenePrompt}</p>
              </div>
            </div>
          ))}

          {/* Detailed Target SEO Metadata package */}
          {workflow.metadata && (
            <div className="p-3 bg-[#111c24] rounded text-[11px] font-mono border border-[#202b36] space-y-1 text-zinc-400 leading-relaxed">
              <p className="text-zinc-200 font-bold font-sans flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                TARGET DESCRIPTION PAYLOAD
              </p>
              <p className="text-zinc-300 mt-1.5 whitespace-pre-wrap font-sans leading-relaxed">{workflow.metadata.description}</p>
              <div className="pt-2 flex flex-wrap gap-1">
                {workflow.metadata.keywords.map((kw, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[#2b5278]/20 text-zinc-300 rounded text-[9px]">#{kw.replace(/\s+/g, '')}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Human Interactive Web Dialog buttons */}
      <div className="p-4 bg-[#242f3d] border-t border-[#101921] space-y-3">
        {!isRejecting ? (
          <div className="flex gap-2">
            <button
              onClick={handleApproveSubmit}
              disabled={workflow.status !== "AWAITING_APPROVAL"}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 font-sans font-bold text-xs text-zinc-100 py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md"
            >
              <Check className="w-4 h-4" />
              APPROVE & PUBLISH YOUTUBE
            </button>
            <button
              onClick={() => setIsRejecting(true)}
              disabled={workflow.status !== "AWAITING_APPROVAL"}
              className="bg-red-950/80 hover:bg-red-900 border border-red-500/30 disabled:opacity-40 disabled:hover:bg-red-950/80 text-red-400 p-3 rounded-lg flex items-center justify-center transition cursor-pointer"
              title="Reject Workflow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleRejectSubmit} className="space-y-3 bg-[#182533] p-3 rounded border border-red-900/30">
            <div>
              <label className="text-[10px] font-bold text-red-400 font-mono uppercase">Rejection Reason</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#111c24] text-zinc-100 text-xs border border-zinc-700/60 p-2 rounded mt-1 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-red-400 font-mono uppercase">Affected Scenes</label>
                <input
                  type="text"
                  value={affectedSceneStr}
                  onChange={(e) => setAffectedSceneStr(e.target.value)}
                  placeholder="e.g. 1, 2"
                  className="w-full bg-[#111c24] text-zinc-100 text-xs border border-zinc-700/60 p-2 rounded mt-1 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-red-400 font-mono uppercase">Action Sequence</label>
                <div className="text-[10px] text-zinc-400 mt-2 font-mono flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-red-500 animate-spin" /> Rollback script layout
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-400 font-mono uppercase">Improvement Instructions</label>
              <textarea
                value={rejectInstructions}
                onChange={(e) => setRejectInstructions(e.target.value)}
                className="w-full h-16 bg-[#111c24] text-zinc-100 text-xs border border-zinc-700/60 p-2 rounded mt-1 outline-none resize-none font-sans"
              />
            </div>
            <div className="flex gap-2 pt-1.5">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-500 font-bold text-xs text-zinc-100 py-2 rounded font-sans transition cursor-pointer"
              >
                SUBMIT EVENT REJECTION
              </button>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="bg-zinc-805 hover:bg-zinc-800 text-zinc-300 px-3 py-2 border border-zinc-700 rounded text-xs font-sans transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
