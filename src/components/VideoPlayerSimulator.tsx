import React, { useState, useEffect, useRef } from "react";
import { VideoWorkflow } from "../types";
import { 
  Play, 
  Pause, 
  FastForward, 
  SkipForward, 
  SkipBack, 
  Video, 
  Volume2, 
  Maximize2, 
  Monitor, 
  Compass, 
  Sparkles,
  RefreshCw,
  Cpu,
  Mic,
  Activity
} from "lucide-react";

interface VideoPlayerSimulatorProps {
  workflow: VideoWorkflow;
}

export default function VideoPlayerSimulator({ workflow }: VideoPlayerSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0); // Progress (%) within current scene
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 3>(1); // Support fast scrubbing (1x, 2x, 3x)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scenes = workflow.scenes || [];
  const hasScenes = scenes.length > 0;

  // Calculate global statistics
  const totalDuration = scenes.reduce((acc, s) => acc + (s?.duration || 0), 0);
  
  const getElapsedAndCurrentProgress = () => {
    if (!hasScenes) return { elapsed: 0, percentage: 0 };
    
    let elapsedBefore = 0;
    const safeCurrentSceneIndex = Math.min(currentSceneIndex, scenes.length - 1);
    for (let i = 0; i < safeCurrentSceneIndex; i++) {
      elapsedBefore += scenes[i]?.duration || 0;
    }
    
    const currentSceneDuration = scenes[safeCurrentSceneIndex]?.duration || 0;
    const elapsedInCurrent = (sceneProgress / 100) * currentSceneDuration;
    const totalElapsed = elapsedBefore + elapsedInCurrent;
    const globalPercentage = totalDuration > 0 ? (totalElapsed / totalDuration) * 100 : 0;
    
    return {
      elapsed: totalElapsed,
      percentage: globalPercentage
    };
  };

  const { elapsed, percentage: globalPercentage } = getElapsedAndCurrentProgress();

  // Reset to scene 0 when workflow changes
  useEffect(() => {
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(false);
  }, [workflow.id]);

  // Handle high frequency temporal frame rendering logic
  useEffect(() => {
    const sceneDur = scenes[currentSceneIndex]?.duration || 10;
    if (isPlaying && hasScenes && sceneDur > 0) {
      const intervalMs = 100; // Tick every 100ms
      const incrementPerTick = (intervalMs / (sceneDur * 1000)) * 100 * playbackSpeed;

      timerRef.current = setInterval(() => {
        setSceneProgress(prev => {
          if (prev + incrementPerTick >= 100) {
            // Scene completed! Proceed to next scene if it exists
            if (currentSceneIndex < scenes.length - 1) {
              setCurrentSceneIndex(curr => curr + 1);
              return 0; // Reset progress for next scene
            } else {
              // End of entire video reached
              setIsPlaying(false);
              setPlaybackSpeed(1);
              return 100;
            }
          }
          return prev + incrementPerTick;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex, hasScenes, playbackSpeed, scenes]);

  const handlePlayPause = () => {
    if (elapsed >= totalDuration && !isPlaying) {
      // Replay from beginning
      setCurrentSceneIndex(0);
      setSceneProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setSceneProgress(0);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setSceneProgress(0);
    } else {
      setSceneProgress(0);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasScenes || totalDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * totalDuration;

    // Find which scene contains target seconds
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      const sceneDur = scenes[i]?.duration || 0;
      if (sceneDur > 0 && accumulated + sceneDur >= targetSeconds) {
        setCurrentSceneIndex(i);
        const elapsedInScene = targetSeconds - accumulated;
        setSceneProgress((elapsedInScene / sceneDur) * 100);
        return;
      }
      accumulated += sceneDur;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeScene = scenes[currentSceneIndex];

  return (
    <div id="video-preview-assessment" className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Visual Header */}
      <div className="bg-zinc-900/40 p-4 border-b border-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-950/40 border border-pink-500/20 rounded">
            <Video className="w-4 h-4 text-pink-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
              3-Minute Multi-Agent Cinematic Previewer <span className="text-[9px] bg-pink-950 text-pink-400 font-normal px-2 py-0.5 border border-pink-500/10 rounded-full animate-pulse">GENERATED VIDEO</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">Synced Narration Vocals by American Benevolent Male Voice Profile</p>
          </div>
        </div>
        
        {/* Playback speed scrub toggler */}
        {hasScenes && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Assessment speed:</span>
            <div className="flex bg-zinc-900 p-0.5 rounded border border-zinc-800 text-[10px] font-mono font-bold">
              <button 
                onClick={() => setPlaybackSpeed(1)}
                className={`px-2 py-1 rounded transition cursor-pointer ${playbackSpeed === 1 ? "bg-pink-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                1x
              </button>
              <button 
                onClick={() => setPlaybackSpeed(2)}
                className={`px-2 py-1 rounded transition cursor-pointer ${playbackSpeed === 2 ? "bg-pink-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                2x Fast
              </button>
              <button 
                onClick={() => setPlaybackSpeed(3)}
                className={`px-2 py-1 rounded transition cursor-pointer ${playbackSpeed === 3 ? "bg-pink-300 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
                title="Super-fast scrub to assess 3 minutes sequence quickly"
              >
                3x Fast
              </button>
            </div>
          </div>
        )}
      </div>

      {!hasScenes ? (
        /* Empty state / Generating space placeholder */
        <div className="p-12 text-center text-zinc-500 font-mono text-xs space-y-3.5 bg-zinc-950">
          <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-600">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <p className="text-zinc-300 font-bold">Waiting for Media Generation Logs to settle...</p>
            <p className="text-[10px] text-zinc-600 leading-normal">
              Once you start a sandbox factory workflow, the Image Generation agent creates storyboard assets with Nano Banana 2 and compiles them with Veo 3 Generate.
            </p>
          </div>
        </div>
      ) : (
        /* Video screen rendering and subtitles interface */
        <div className="flex flex-col">
          
          {/* Main Visual Display Block */}
          <div className="relative aspect-video w-full bg-black overflow-hidden group border-b border-zinc-900">
            
            {/* Visual background image representing active scene */}
            {activeScene?.imageUrl ? (
              <img 
                src={activeScene.imageUrl} 
                alt={`Scene ${activeScene.sceneNumber}`}
                className="w-full h-full object-cover transition-transform duration-1000 transform scale-102 filter brightness-[0.70] contrast-102"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Cpu className="w-12 h-12 text-pink-500/25 animate-pulse" />
                <p className="text-xs text-zinc-500 font-mono">Synthesizing scene matrix placeholder...</p>
              </div>
            )}

            {/* Simulated overlay stats bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none text-[10px] font-mono select-none">
              <div className="space-y-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-2 rounded text-zinc-300 flex flex-col shadow-lg">
                <span className="text-pink-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                  SCENE {activeScene?.sceneNumber} / {scenes.length}
                </span>
                <span className="text-zinc-500 uppercase">Aspect-ratio: 16:9 Cinema Wide</span>
                <span className="text-zinc-500 animate-pulse uppercase">Source: {activeScene?.imageUrl ? "gemini-3.1-flash-image (Nano Banana 2)" : "Generating"}</span>
              </div>

              <div className="space-y-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-2 rounded text-zinc-300 flex flex-col text-right shadow-lg">
                <span className="text-zinc-300 font-bold flex items-center justify-end gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400 inline" /> Camera motion controller
                </span>
                <span className="text-blue-400 italic font-sans">{activeScene?.cameraMotion || "Steady drift pan mapping frame grid"}</span>
                <span className="text-zinc-550 uppercase">Transition: {activeScene?.transitionType || "Cross Fade"}</span>
              </div>
            </div>

            {/* BIG SYNCHRONIZED CLOSED CAPTION SUBTITLES */}
            <div className="absolute bottom-8 left-6 right-6 flex flex-col items-center pointer-events-none select-none text-center">
              <div className="bg-zinc-950/90 border border-zinc-800 px-5 py-3 rounded-xl max-w-2xl shadow-2xl backdrop-blur-md transition-all duration-300">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <Volume2 className="w-3 h-3 text-pink-500" /> American Benevolent Male voice-over track:
                </p>
                <p className="text-sm font-sans font-semibold text-zinc-100 leading-normal tracking-wide">
                  {activeScene?.narrationText || "Formatting audio frequencies..."}
                </p>
              </div>
            </div>

            {/* Watermark brand overlay */}
            <span className="absolute bottom-3 right-4 text-[9px] font-mono text-zinc-650 tracking-wider pointer-events-none select-none uppercase">
              Veo 3.1 temporal video stream output
            </span>
          </div>

          {/* Interactive Timeline Seek Bar */}
          <div className="px-5 pt-3.5 pb-2.5 bg-zinc-900/25 space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-300 font-bold">{formatTime(elapsed)}</span>
              <span className="text-zinc-500">Video runtime length: <strong className="text-zinc-300">{formatTime(totalDuration)}</strong> ({totalDuration}s) &bull; EXCEEDS 3 MINS THRESHOLD</span>
            </div>

            {/* Timeline track container */}
            <div 
              onClick={handleTimelineClick}
              className="relative h-2.5 bg-zinc-850 hover:h-3 rounded-full cursor-pointer transition duration-150 overflow-hidden group shadow-inner"
              title="Click on progress bar to seek time"
            >
              {/* Global progress indicator */}
              <div 
                style={{ width: `${globalPercentage}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-orange-500 group-hover:from-pink-400 group-hover:to-orange-400 transition-all duration-100 ease-out rounded-full"
              />

              {/* Segment markers separating individual scenes */}
              {scenes.map((scene, index) => {
                let accumulatedPercent = 0;
                for (let i = 0; i < index; i++) {
                  accumulatedPercent += ((scenes[i]?.duration || 0) / (totalDuration || 1)) * 100;
                }
                return (
                  <div 
                    key={index}
                    style={{ left: `${accumulatedPercent}%` }}
                    className="absolute inset-y-0 w-[1.5px] bg-zinc-950/60 z-10"
                  />
                );
              })}
            </div>
          </div>

          {/* Player controls row */}
          <div className="p-4 bg-zinc-900/60 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Control buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
                className="p-2 bg-zinc-850 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                className={`p-3 rounded-full shadow-lg transition transform active:scale-95 cursor-pointer ${
                  isPlaying 
                    ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" 
                    : "bg-pink-500 text-zinc-950 hover:bg-pink-400"
                }`}
                title={isPlaying ? "Pause Scene Cycle" : "Play Storyboard sequence"}
              >
                {isPlaying ? <Pause className="w-5 h-5 font-bold" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={handleNextScene}
                disabled={currentSceneIndex === scenes.length - 1}
                className="p-2 bg-zinc-850 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Quick jump drop-down selection of scenes */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Navigate scenes:</span>
              <div className="flex flex-wrap gap-1">
                {scenes.map((scene, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setSceneProgress(0);
                    }}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition ${
                      currentSceneIndex === idx
                        ? "bg-pink-950 text-pink-400 border border-pink-500/30"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-950 hover:border-zinc-850"
                    }`}
                  >
                    S{scene.sceneNumber} ({scene.duration}s)
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Render parameters audit panel */}
          <div className="bg-zinc-950/80 p-4 border-t border-zinc-900 text-[11px] font-mono space-y-2">
            <h4 className="text-zinc-400 font-bold uppercase flex items-center gap-1.5 text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Active Prompt Parameter sheet for rendering engine (Scene {activeScene?.sceneNumber}):
            </h4>
            <p className="text-zinc-500 leading-normal italic bg-zinc-900/40 p-3 border border-zinc-900 rounded font-sans pr-4">
              "{activeScene?.scenePrompt || "Readying generative canvas parameters..."}"
            </p>
          </div>

          {/* Active Narration Configuration Panel */}
          <div className="bg-zinc-950 border-t border-zinc-900 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column: Voice Blueprint Credentials */}
            <div id="narration-specs-column" className="space-y-3 bg-zinc-900/20 p-3.5 rounded-lg border border-zinc-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-teal-400" /> Active Narration Configuration
                  </h4>
                  <span className="text-[9px] font-mono bg-teal-950/60 text-teal-400 px-2 py-0.5 border border-teal-500/20 rounded-full font-bold">
                    Profile Locked
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-zinc-950/40 p-2 rounded border border-zinc-900">
                    <span className="text-zinc-500 block text-[9px] uppercase">Gender / Profiling</span>
                    <span className="text-zinc-200 font-bold">Male</span>
                  </div>
                  <div className="bg-zinc-950/40 p-2 rounded border border-zinc-900">
                    <span className="text-zinc-500 block text-[9px] uppercase">Regional Accent</span>
                    <span className="text-zinc-200 font-bold">American (US)</span>
                  </div>
                  <div className="bg-zinc-950/40 p-2 rounded border border-zinc-900 col-span-2">
                    <span className="text-zinc-500 block text-[9px] uppercase">Vocal Tone & Personality</span>
                    <span className="text-teal-400 font-bold flex items-center gap-1">
                      Benevolent, Calm, Warm, Trustworthy
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400/95 leading-normal font-sans pt-1">
                Calibrated against our <span className="font-mono text-pink-400">TTS-Neural-Fenrir v3</span> voice template. Voice tracks are automatically aligned with video cues.
              </p>
            </div>

            {/* Right Column: Audio Waveform & Real-Time Sync Sync */}
            <div id="voice-synced-visualizer-column" className="space-y-3 bg-zinc-900/20 p-3.5 rounded-lg border border-zinc-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-pink-500" /> Neural Waveform & Status
                  </h4>
                  <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : "bg-zinc-600"}`} />
                    {isPlaying ? "SYNCHRONIZING..." : "READY"}
                  </span>
                </div>
                
                {/* Simulated Audio Waveform Bar graph pulsing */}
                <div className="h-10 flex items-end gap-[2px] px-1 bg-zinc-950 border border-zinc-900 rounded-md mt-2 pb-[1px] relative overflow-hidden justify-between">
                  {isPlaying ? (
                    /* Pulsing animation when audio is active */
                    Array.from({ length: 30 }).map((_, i) => {
                      const heights = ["h-3", "h-7", "h-9", "h-4", "h-6", "h-2", "h-8", "h-5", "h-3", "h-6", "h-8", "h-9", "h-5", "h-7", "h-4", "h-8", "h-6", "h-2", "h-5", "h-9", "h-3", "h-7", "h-5", "h-8", "h-4", "h-6", "h-3", "h-8", "h-5", "h-2"];
                      return (
                        <div 
                          key={i} 
                          className={`w-[4px] bg-gradient-to-t from-teal-500 via-pink-500 to-orange-500 rounded-t shrink-0 animate-pulse ${heights[i % heights.length]}`} 
                          style={{ animationDelay: `${i * 45}ms` }}
                        />
                      );
                    })
                  ) : (
                    /* Low resting waveform state */
                    Array.from({ length: 30 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-[4px] bg-zinc-800 rounded-t shrink-0 ${
                          i % 3 === 0 ? "h-2" : i % 5 === 0 ? "h-3" : "h-1"
                        }`} 
                      />
                    ))
                  )}
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] text-zinc-500 font-mono tracking-wider bg-zinc-950/45 backdrop-blur-[0.5px] select-none pointer-events-none">
                    {isPlaying ? "Streaming American Male Accent Vocal Feed" : "Waveform Analyzer Standby"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500/95 flex justify-between items-center bg-zinc-950/40 px-2 py-1.5 rounded border border-zinc-900/60 leading-none font-mono">
                <span>Output: <strong className="text-zinc-300">voice_american_benevolent_male.wav</strong></span>
                <span>Format: <strong className="text-zinc-300">48kHz Audio</strong></span>
              </div>
            </div>
            
          </div>

        </div>
      )}
    </div>
  );
}
