import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface NarrativeCardsProps {
  rings: any[];
  selectedRing: any;
  setSelectedRing: (ring: any) => void;
}

export function NarrativeCards({ rings, selectedRing, setSelectedRing }: NarrativeCardsProps) {
  if (!rings || rings.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="flex flex-col items-center justify-center py-12 text-ui-muted">
          <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-ui-text">No active mule rings detected</p>
          <p className="text-sm mt-1">The network is currently clean. Graph algorithms are running passively.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="border-b border-ui-border mb-4">
        <h3 className="font-bold text-ui-text flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-ui-riskRed mr-3 animate-pulse"></span>
          Detected Mule Rings ({rings.length})
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {rings.map((ring: any, idx: number) => (
          <div 
            key={idx} 
            className={`p-5 rounded-sm border transition-all duration-300 ease-out cursor-pointer ${
              selectedRing?.community_id === ring.community_id 
                ? 'bg-ui-bg border-ui-riskRed shadow-[0_0_15px_rgba(224,82,67,0.1)]' 
                : 'bg-ui-bg/50 border-ui-border hover:border-ui-accent hover:-translate-y-0.5 hover:shadow-sm'
            }`}
            onClick={() => setSelectedRing(selectedRing?.community_id === ring.community_id ? null : ring)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-bold text-ui-riskRed font-mono tracking-tight">RING #{ring.community_id} • DRAIN: {ring.drain_node}</div>
                <div className="text-xs text-ui-muted mt-1.5 font-mono">
                  {ring.nodes_count} Nodes • Fan-in: {ring.fan_in} • Vol: ₹{ring.total_volume.toLocaleString()} • Drain: {(ring.drain_ratio * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tighter text-ui-riskRed">{ring.mule_score}</div>
            </div>
            
            {/* Expanded State */}
            {selectedRing?.community_id === ring.community_id && (
              <div className="mt-4 pt-4 border-t border-ui-border/50 text-sm text-ui-muted leading-relaxed animate-fade-in">
                {ring.explanation}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

