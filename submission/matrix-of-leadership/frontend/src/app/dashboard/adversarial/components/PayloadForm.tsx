import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface PayloadFormProps {
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function PayloadForm({ formData, setFormData, handleSubmit, loading }: PayloadFormProps) {
  const setPreset = (preset: string) => {
    if (preset === "OTP Relay") {
      setFormData({ ...formData, amount: 95000, is_new_beneficiary: true, new_device_flag: true, txn_count_1h: 3, amount_avg_1h: 1000, timestamp: new Date().toISOString(), fraud_template: "OTP_RELAY" });
    } else if (preset === "Mule Funnel") {
      setFormData({ ...formData, amount: 2000, is_new_beneficiary: false, new_device_flag: false, txn_count_1h: 15, amount_avg_1h: 2000, timestamp: new Date().toISOString(), fraud_template: "MULE_FUNNEL" });
    } else if (preset === "Night Burst") {
      const nightTime = new Date(); nightTime.setHours(2, 30);
      setFormData({ ...formData, amount: 45000, is_new_beneficiary: true, new_device_flag: false, txn_count_1h: 5, amount_avg_1h: 500, timestamp: nightTime.toISOString(), fraud_template: "NIGHT_BURST" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-ui-border mb-4 gap-4">
        <h3 className="font-bold text-ui-text">Craft Payload</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPreset("OTP Relay")} className="text-ui-riskRed border-ui-riskRed/20 hover:border-ui-riskRed">OTP Relay</Button>
          <Button size="sm" variant="secondary" onClick={() => setPreset("Mule Funnel")} className="text-ui-riskAmber border-ui-riskAmber/20 hover:border-ui-riskAmber">Mule Funnel</Button>
          <Button size="sm" variant="secondary" onClick={() => setPreset("Night Burst")} className="text-ui-accent border-ui-accent/20 hover:border-ui-accent">Night Burst</Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="AMOUNT (₹)"
            type="number" 
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
          />
          <Input 
            label="TIMESTAMP"
            type="text" 
            value={formData.timestamp}
            onChange={e => setFormData({...formData, timestamp: e.target.value})}
          />
          
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.new_device_flag}
                onChange={e => setFormData({...formData, new_device_flag: e.target.checked})}
                className="w-4 h-4 rounded border-ui-border bg-ui-bg text-ui-accent focus:ring-ui-accent"
              />
              <span className="text-sm text-ui-muted font-medium">New Unrecognized Device</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_new_beneficiary}
                onChange={e => setFormData({...formData, is_new_beneficiary: e.target.checked})}
                className="w-4 h-4 rounded border-ui-border bg-ui-bg text-ui-accent focus:ring-ui-accent"
              />
              <span className="text-sm text-ui-muted font-medium">New Beneficiary</span>
            </label>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-ui-muted">TXN COUNT (1H)</label>
              <span className="text-sm font-bold text-ui-text font-mono">{formData.txn_count_1h}</span>
            </div>
            <input 
              type="range" min="0" max="20" step="1"
              value={formData.txn_count_1h}
              onChange={e => setFormData({...formData, txn_count_1h: parseInt(e.target.value)})}
              className="w-full accent-ui-accent"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-ui-muted">AVG AMOUNT (1H)</label>
              <span className="text-sm font-bold text-ui-text font-mono">₹{formData.amount_avg_1h.toLocaleString()}</span>
            </div>
            <input 
              type="range" min="100" max="100000" step="100"
              value={formData.amount_avg_1h}
              onChange={e => setFormData({...formData, amount_avg_1h: parseInt(e.target.value)})}
              className="w-full accent-ui-accent"
            />
          </div>

          <Button 
            type="submit" 
            isLoading={loading}
            variant="primary"
            className="w-full"
            size="lg"
          >
            INJECT PAYLOAD
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
