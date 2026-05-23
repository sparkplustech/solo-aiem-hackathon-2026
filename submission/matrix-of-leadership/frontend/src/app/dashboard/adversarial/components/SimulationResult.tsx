import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import ExplainabilityCard from '@/components/ExplainabilityCard';

interface SimulationResultProps {
  result: any;
}

export function SimulationResult({ result }: SimulationResultProps) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b border-ui-border mb-4">
        <h3 className="font-bold text-ui-text">Engine Response</h3>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-ui-bg rounded-sm border border-ui-border shadow-sm">
              <span className="text-ui-muted font-bold tracking-wider text-sm">RISK SCORE</span>
              <span className={`text-4xl font-bold tracking-tight ${result.risk_level === 'red' ? 'text-ui-riskRed' : result.risk_level === 'yellow' ? 'text-ui-riskAmber' : 'text-ui-riskGreen'}`}>
                {result.risk_score}
              </span>
            </div>
            
            {result.rule_flags?.length > 0 && (
              <div className="space-y-2">
                <span className="text-ui-muted font-bold tracking-wider text-xs block uppercase">Rules Fired</span>
                <div className="flex flex-wrap gap-2">
                  {result.rule_flags.map((r: string) => (
                    <span key={r} className="px-2.5 py-1 text-xs font-mono font-medium bg-ui-bg border border-ui-border text-ui-text rounded-md shadow-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <ExplainabilityCard txn={result} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-ui-muted space-y-4 border-2 border-dashed border-ui-border/50 rounded-sm bg-ui-bg/30">
            <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm font-medium">Awaiting payload injection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

