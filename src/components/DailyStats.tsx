import React from 'react';
import { Visit } from '../types';
import { formatCurrency } from '../data/rateCard';
import { 
  CheckCircle2, 
  Clock, 
  Car, 
  CalendarCheck, 
  Printer,
  Sparkles,
  Tag
} from 'lucide-react';

interface DailyStatsProps {
  visits: Visit[];
  selectedDate: string;
  onOpenReportModal: () => void;
}

export const DailyStats: React.FC<DailyStatsProps> = ({
  visits,
  selectedDate,
  onOpenReportModal
}) => {
  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => v.status === 'completed').length;
  const inProgressVisits = visits.filter(v => v.status === 'in_progress').length;
  const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;
  
  const homeVisits = visits.filter(v => v.type === 'home_visit');
  const totalTravelKm = homeVisits.reduce((acc, v) => acc + (v.travelDistanceKm || 0), 0);
  
  const totalFees = visits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);
  const collectedFees = visits
    .filter(v => v.paymentStatus === 'paid')
    .reduce((acc, v) => acc + (v.sessionFee || 0), 0);

  const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Day Operations Overview</h2>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
            {totalVisits} {totalVisits === 1 ? 'Visit' : 'Visits'} Planned
          </span>
        </div>

        <button
          id="btn-print-itinerary"
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500" />
          <span>Print / Export Itinerary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {/* Status: Completed */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{completedVisits}</span>
            <span className="text-xs text-slate-500">/ {totalVisits}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* In Progress / Active */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Progress / Next</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{inProgressVisits}</span>
            <span className="text-xs text-amber-700 font-medium">
              {scheduledVisits} waiting
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 truncate">Active session tracking</p>
        </div>

        {/* Home Visits & Transit */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Home Visits</span>
            <Car className="h-4 w-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{homeVisits.length}</span>
            <span className="text-xs text-sky-700 font-medium">{totalTravelKm.toFixed(1)} km</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 truncate">Domiciliary care transit</p>
        </div>

        {/* Financials / Fees */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sitting Fees (₹)</span>
            <span className="font-bold text-xs text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">INR</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900">{formatCurrency(collectedFees)}</span>
            <span className="text-xs text-slate-500 font-normal">of {formatCurrency(totalFees)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {visits.filter(v => v.paymentStatus === 'pending').length} pending collections
          </p>
        </div>
      </div>
    </div>
  );
};
