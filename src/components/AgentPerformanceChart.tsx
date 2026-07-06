import React, { useState, useMemo } from "react";
import { CloudLog } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { BarChart2, Zap, DollarSign, Filter, Layers } from "lucide-react";

interface AgentPerformanceChartProps {
  logs: CloudLog[];
  selectedWorkflowId: string;
  workflowTopic?: string;
}

export default function AgentPerformanceChart({
  logs,
  selectedWorkflowId,
  workflowTopic
}: AgentPerformanceChartProps) {
  // Filters state
  const [scope, setScope] = useState<"current" | "global">("current");
  const [metricMode, setMetricMode] = useState<"total" | "average">("average");

  // Aggregate stats based on scope and calculation type
  const chartData = useMemo(() => {
    // 1. Filter logs
    const filteredLogs = logs.filter((log) => {
      if (scope === "current") {
        return log.workflowId === selectedWorkflowId;
      }
      return true; // global scope
    });

    // 2. Group by agentName
    const groups: Record<string, { totalSeconds: number; totalCost: number; count: number }> = {};
    
    filteredLogs.forEach((log) => {
      // Clean or normalize agent name if needed
      const name = log.agentName || "UNKNOWN AGENT";
      // Ignore general orchestrator panic unless they have duration/cost
      if (name.includes("ORCHESTRATOR PANIC") && log.executionSeconds === 0) return;

      if (!groups[name]) {
        groups[name] = { totalSeconds: 0, totalCost: 0, count: 0 };
      }
      groups[name].totalSeconds += log.executionSeconds || 0;
      groups[name].totalCost += log.cost || 0;
      groups[name].count += 1;
    });

    // 3. Transform to recharts format
    const list = Object.entries(groups).map(([agentName, data]) => {
      const durationVal =
        metricMode === "average"
          ? data.totalSeconds / (data.count || 1)
          : data.totalSeconds;
      
      const costVal =
        metricMode === "average"
          ? data.totalCost / (data.count || 1)
          : data.totalCost;

      // Clean up agent name for cleaner labels (e.g. "TREND DISCOVERY AGENT" -> "Trend Discovery")
      const cleanedName = agentName
        .replace(" AGENT", "")
        .replace(" SYSTEM", "")
        .toLowerCase()
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

      return {
        originalName: agentName,
        agent: cleanedName,
        duration: parseFloat(durationVal.toFixed(2)),
        cost: parseFloat(costVal.toFixed(5)),
        rawCost: costVal,
        count: data.count
      };
    });

    // Sort by duration or cost descending to make the chart look neatly structured
    return list.sort((a, b) => b.duration - a.duration);
  }, [logs, selectedWorkflowId, scope, metricMode]);

  // Total summary computed from active scope
  const activeSummary = useMemo(() => {
    const activeLogs = logs.filter((log) => 
      scope === "current" ? log.workflowId === selectedWorkflowId : true
    );
    const seconds = activeLogs.reduce((sum, l) => sum + (l.executionSeconds || 0), 0);
    const usd = activeLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
    return {
      totalTime: seconds,
      totalCost: usd,
      logCount: activeLogs.length
    };
  }, [logs, selectedWorkflowId, scope]);

  // Formatter for Tooltip
  const customTooltipFormatter = (value: any, name: string) => {
    if (name === "duration") {
      return [`${value} seconds`, "Execution Duration"];
    }
    if (name === "cost") {
      return [`$${parseFloat(value).toFixed(5)}`, "Compute/API Cost"];
    }
    return [value, name];
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-4 shadow-xl col-span-full">
      {/* Header section with technical indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-950/40 border border-orange-500/20 rounded">
            <BarChart2 className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-tight text-zinc-100 uppercase flex items-center gap-2">
              Agent Performance Analytics <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5 normal-case font-normal">Dual Y-Axis</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Analyzing speed latency vs API resource licensing cost across active LLM subnet agents
            </p>
          </div>
        </div>

        {/* Dynamic Controls / Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Scope filter */}
          <div className="flex bg-zinc-900 rounded border border-zinc-850 p-0.5">
            <button
              onClick={() => setScope("current")}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                scope === "current"
                  ? "bg-orange-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Selected trial
            </button>
            <button
              onClick={() => setScope("global")}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                scope === "global"
                  ? "bg-orange-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Global register
            </button>
          </div>

          {/* Metric calculation type */}
          <div className="flex bg-zinc-900 rounded border border-zinc-850 p-0.5">
            <button
              onClick={() => setMetricMode("average")}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                metricMode === "average"
                  ? "bg-orange-500/15 border border-orange-500/30 text-orange-400 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Average per agent invocation"
            >
              Avg / run
            </button>
            <button
              onClick={() => setMetricMode("total")}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                metricMode === "total"
                  ? "bg-orange-500/15 border border-orange-500/30 text-orange-400 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Cumulative sum of values"
            >
              Cumulative
            </button>
          </div>
        </div>
      </div>

      {/* Quick context info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/20 border border-zinc-900 p-3 rounded-md text-[11px] font-mono">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-orange-500/80" />
          <span>Scope: <b className="text-zinc-200 uppercase">{scope === "current" ? "Selected workflow" : "All system workflows"}</b></span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 md:col-span-2 truncate">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span className="truncate">
            Target: <b className="text-zinc-200 truncate">{scope === "current" ? (workflowTopic || "N/A (" + selectedWorkflowId.substring(0,6) + ")") : "All compiled subjects"}</b>
          </span>
        </div>
        <div className="flex justify-start md:justify-end gap-3 text-zinc-500">
          <span className="text-zinc-400">Time: <b className="text-zinc-200">{activeSummary.totalTime.toFixed(1)}s</b></span>
          <span className="text-zinc-400">Cost: <b className="text-zinc-200">${activeSummary.totalCost.toFixed(4)}</b></span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2 h-[340px] w-full min-h-[300px] border border-zinc-900/50 bg-zinc-950/50 rounded-lg relative flex flex-col justify-between">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-mono text-xs">
            <BarChart2 className="w-8 h-8 text-zinc-700 mb-2 animate-bounce" />
            <p>No agent log trails collected for this filter constraint yet.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Select another scope or trigger a new factory workflow run above.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              barGap={4}
            >
              <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="agent" 
                stroke="#52525b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: '#27272a' }}
                dy={10}
              />
              
              {/* Left Y Axis for Execution Duration (seconds) */}
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="#f97316"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                unit="s"
                dx={-10}
              />

              {/* Right Y Axis for API licensing cost (USD) */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#2dd4bf"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(val) => `$${val.toFixed(4)}`}
                dx={10}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px'
                }}
                formatter={customTooltipFormatter}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                cursor={{ fill: 'rgba(39, 39, 42, 0.3)' }}
              />

              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10}
                fontSize={10}
                wrapperStyle={{ 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  paddingBottom: '10px'
                }}
              />

              {/* Duration Bar */}
              <Bar 
                yAxisId="left" 
                dataKey="duration" 
                fill="#ea580c" 
                name="Duration (Seconds)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`duration-cell-${index}`} 
                    fillOpacity={0.8}
                    className="hover:fill-opacity-100 transition duration-150"
                  />
                ))}
              </Bar>

              {/* Cost Bar */}
              <Bar 
                yAxisId="right" 
                dataKey="cost" 
                fill="#0d9488" 
                name="Cost (USD)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cost-cell-${index}`} 
                    fillOpacity={0.75}
                    className="hover:fill-opacity-100 transition duration-150"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini details card describing the parameters measured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-zinc-550 pt-2 border-t border-zinc-900/60 leading-normal">
        <div className="flex gap-2.5 items-start">
          <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-zinc-400">EXECUTION SEGMENTS:</strong> Measures the physical time elapsed in background model pipelines and agent routines. Image generation and media assembly represent the heavy-bound limits, while research relies on multi-source web scraping.
          </p>
        </div>
        <div className="flex gap-2.5 items-start">
          <DollarSign className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-zinc-400">COMPUTE LICENSE METRICS:</strong> Calculated from raw token allocations of model contexts (using Gemini model parameters). Grounding operations and dense script critiques utilize multi-shot loops with dedicated safety/compliance overheads.
          </p>
        </div>
      </div>
    </div>
  );
}
