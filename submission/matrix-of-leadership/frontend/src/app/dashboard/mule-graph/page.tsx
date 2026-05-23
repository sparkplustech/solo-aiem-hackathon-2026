"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { NarrativeCards } from "./components/NarrativeCards";
import { Card } from "@/components/ui/Card";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type MuleRing = {
  community_id: number;
  drain_node: string;
  mule_score: number;
  nodes_count: number;
  total_volume: number;
  fan_in: number;
  drain_ratio: number;
  explanation: string;
};

type GraphData = {
  nodes: any[];
  links: any[];
  mule_rings?: MuleRing[];
};

export default function MuleGraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedRing, setSelectedRing] = useState<MuleRing | null>(null);
  const [viewMode, setViewMode] = useState<"topology" | "flow">("topology");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [backendOnline, setBackendOnline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      const r = await fetch("http://localhost:8000/api/v1/graph");
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (d.nodes?.length > 0) {
        setGraphData(d);
        setBackendOnline(true);
      }
    } catch {
      setBackendOnline(false);
      // Deterministic fallback
      const nodes: any[] = [];
      const links: any[] = [];
      const mule_rings: MuleRing[] = [];
      nodes.push({ id: "DRAIN_MASTER", group: 0, val: 80, mule_suspect: true, total_in: 180000, total_out: 0 });
      const communities = ["OTP_RELAY", "MULE_LAYER_A", "MULE_LAYER_B"];
      communities.forEach((center, c) => {
        nodes.push({ id: center, group: c + 1, val: 45, mule_suspect: true, total_in: 60000, total_out: 58000 });
        links.push({ source: center, target: "DRAIN_MASTER", weight: 58000 + c * 5000 });
        for (let i = 0; i < 5; i++) {
          const leaf = `VICTIM_${c}_${i}`;
          nodes.push({ id: leaf, group: c + 1, val: 10, mule_suspect: false, total_in: 0, total_out: 12000 });
          links.push({ source: leaf, target: center, weight: 10000 + Math.random() * 5000 });
        }
        mule_rings.push({
          community_id: c + 1, drain_node: center, mule_score: 92 - c * 7,
          nodes_count: 6, total_volume: 60000 + c * 10000, fan_in: 5,
          drain_ratio: 0.97 - c * 0.05,
          explanation: `Community ${c + 1} — ${center} acts as a layer-${c + 1} aggregator. ${5} victim accounts funneled ₹${(60000 + c * 10000).toLocaleString()} in. ${(97 - c * 5)}% was drained upward within 2h, matching a classic Jamtara-style UPI layering funnel. Behavioural velocity score: HIGH.`
        });
      });
      setGraphData({ nodes, links, mule_rings });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(fetchGraph, 15000); // 15s poll as fallback
    
    // Live WS updates
    const connectWs = () => {
      const ws = new WebSocket("ws://localhost:8000/ws/transactions");
      ws.onopen = () => setBackendOnline(true);
      ws.onmessage = () => {
        // Just let it update on interval to avoid expensive graph recalculations on every single tx
      };
      ws.onclose = () => {
        setBackendOnline(false);
        setTimeout(connectWs, 5000);
      };
      wsRef.current = ws;
    };
    connectWs();

    const update = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchGraph]);

  const handleSelectRing = useCallback((ring: MuleRing) => {
    setSelectedRing(ring === selectedRing ? null : ring);
  }, [selectedRing]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ui-text">Mule Network Graph</h2>
          <p className="text-base text-ui-muted">Louvain community detection and betweenness centrality</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-mono font-medium">
          <div className="flex items-center"><span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span> {backendOnline ? 'Live' : 'Offline'}</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-ui-riskRed mr-2"></span> Mule Suspect</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-ui-accent mr-2"></span> Community A</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-ui-riskGreen mr-2"></span> Community B</div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden min-h-[400px]" ref={containerRef}>
        {(typeof window !== "undefined") && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeAutoColorBy="group"
            nodeRelSize={1}
            nodeVal={(node: any) => node.val}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleSpeed={0.01}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              const isSelected = selectedRing && node.group === selectedRing.community_id;
              const isMule = node.mule_suspect;
              
              const color = isSelected ? "#E05243" : (isMule ? "#E05243" : "#B8733B");
              
              // Glow effect
              ctx.shadowColor = color;
              ctx.shadowBlur = isMule ? 15 : 5;
              ctx.fillStyle = color;
              
              const size = node.val ? Math.max(2, node.val / 10) : 4;
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.fill();
              
              // Reset shadow for text
              ctx.shadowBlur = 0;
              
              // Label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = isMule ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)';
              ctx.fillText(label, node.x, node.y + size + 4);
            }}
            linkColor={() => "rgba(63, 60, 57, 0.8)"}
            linkWidth={(link: any) => Math.max(1, (link.weight || 0) / 1000)}
            backgroundColor="#141414"
          />
        )}
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Card className="p-4 flex flex-col items-center justify-center border-t-4 border-t-ui-accent border-x-0 border-b-0 rounded-b-xl rounded-t-sm shadow-none bg-ui-bg">
          <div className="text-2xl font-bold text-ui-text">{graphData.nodes.length}</div>
          <div className="text-xs text-ui-muted font-medium mt-1">Total Nodes</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-t-4 border-t-ui-accent border-x-0 border-b-0 rounded-b-xl rounded-t-sm shadow-none bg-ui-bg">
          <div className="text-2xl font-bold text-ui-text">{graphData.links.length}</div>
          <div className="text-xs text-ui-muted font-medium mt-1">Total Edges</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-t-4 border-t-ui-riskGreen border-x-0 border-b-0 rounded-b-xl rounded-t-sm shadow-none bg-ui-bg">
          <div className="text-2xl font-bold text-ui-text">{new Set(graphData.nodes.map((n:any) => n.group)).size}</div>
          <div className="text-xs text-ui-muted font-medium mt-1">Communities</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center border-t-4 border-t-ui-riskRed border-x-0 border-b-0 rounded-b-xl rounded-t-sm shadow-none bg-ui-bg">
          <div className="text-2xl font-bold text-ui-riskRed">{graphData.nodes.filter((n:any) => n.mule_suspect).length}</div>
          <div className="text-xs text-ui-muted font-medium mt-1">Mule Suspects</div>
        </Card>
      </div>

      <NarrativeCards 
        rings={graphData.mule_rings || []} 
        selectedRing={selectedRing} 
        setSelectedRing={setSelectedRing} 
      />
    </div>
  );
}
