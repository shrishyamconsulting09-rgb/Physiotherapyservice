import React, { useState } from 'react';
import { Visit, PaymentStatus } from '../types';
import { formatCurrency, getRateTier, STANDARD_RATE_CARD } from '../data/rateCard';
import { RateCardModal } from './RateCardModal';
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Printer, 
  ShieldCheck,
  Tag,
  Car,
  Building2,
  Video,
  Info
} from 'lucide-react';

interface DailyBillingSummaryViewProps {
  visits: Visit[];
  selectedDate: string;
  onPaymentChange: (visitId: string, paymentStatus: PaymentStatus) => void;
  onOpenReportModal: () => void;
}

export const DailyBillingSummaryView: React.FC<DailyBillingSummaryViewProps> = ({
  visits,
  selectedDate,
  onPaymentChange,
  onOpenReportModal
}) => {
  const [isRateCardOpen, setIsRateCardOpen] = useState(false);

  const totalBilled = visits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);
  const paidVisits = visits.filter(v => v.paymentStatus === 'paid');
  const pendingVisits = visits.filter(v => v.paymentStatus === 'pending');
  const claimVisits = visits.filter(v => v.paymentStatus === 'insurance_claim');

  const totalCollected = paidVisits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);
  const totalPending = pendingVisits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);
  const totalInsurance = claimVisits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);

  // Revenue by Mode
  const onlineRevenue = visits.filter(v => v.type === 'tele_rehab').reduce((acc, v) => acc + v.sessionFee, 0);
  const clinicRevenue = visits.filter(v => v.type === 'clinic_visit').reduce((acc, v) => acc + v.sessionFee, 0);
  const homeRevenue = visits.filter(v => v.type === 'home_visit').reduce((acc, v) => acc + v.sessionFee, 0);

  // Modality statistics across documented visits
  const modalityCounts: Record<string, number> = {};
  visits.forEach(v => {
    if (v.soapNote?.plan?.modalitiesUsed) {
      v.soapNote.plan.modalitiesUsed.forEach(m => {
        modalityCounts[m] = (modalityCounts[m] || 0) + 1;
      });
    }
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Daily Billing & Practice Analytics</h2>
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
              INR (₹) Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Revenue reconciliation and clinical sitting rates tracker for {selectedDate}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-view-rate-card"
            onClick={() => setIsRateCardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Tag className="h-3.5 w-3.5 text-teal-600" />
            <span>Standard Rate Card (₹)</span>
          </button>

          <button
            id="btn-print-billing-sheet"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Billing Sheet</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards in Indian Rupees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Value</span>
            <span className="text-2xs font-bold text-slate-400">INR</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalBilled)}</div>
          <p className="text-2xs text-slate-400 mt-1">{visits.length} total scheduled visits</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Collected (Paid)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalCollected)}</div>
          <p className="text-2xs text-emerald-600 mt-1">{paidVisits.length} payments received</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Due</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalPending)}</div>
          <p className="text-2xs text-amber-600 mt-1">{pendingVisits.length} awaiting settlement</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Insurance Claims</span>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(totalInsurance)}</div>
          <p className="text-2xs text-purple-600 mt-1">{claimVisits.length} claims pending</p>
        </div>
      </div>

      {/* Service Mode Breakdown Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Revenue by Payment Service Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <Video className="h-3.5 w-3.5 text-teal-600" />
                <span>Online Mode</span>
              </div>
              <p className="text-2xs text-teal-700 mt-0.5">Video Assessment & Exercises (₹700)</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{formatCurrency(onlineRevenue)}</span>
              <span className="block text-2xs text-slate-500">{visits.filter(v => v.type === 'tele_rehab').length} sessions</span>
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <Building2 className="h-3.5 w-3.5 text-purple-600" />
                <span>Offline (In-Clinic / OPD)</span>
              </div>
              <p className="text-2xs text-purple-700 mt-0.5">Standard ₹800 &bull; Specialist ₹1,000</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{formatCurrency(clinicRevenue)}</span>
              <span className="block text-2xs text-slate-500">{visits.filter(v => v.type === 'clinic_visit').length} sessions</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Car className="h-3.5 w-3.5 text-blue-600" />
                <span>Offline (Home Visit)</span>
              </div>
              <p className="text-2xs text-blue-700 mt-0.5">Tier-2 ₹1,500 &bull; Metro ₹2,000</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{formatCurrency(homeRevenue)}</span>
              <span className="block text-2xs text-slate-500">{visits.filter(v => v.type === 'home_visit').length} sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Visit Ledger & Modalities Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ledger */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Daily Visit Billing Ledger
          </h3>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Payment Service Mode & Tier</th>
                  <th className="p-3">Sitting Fee (₹)</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map(v => {
                  const tier = getRateTier(v.serviceTier);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">
                        {v.patientName}
                        <span className="block text-2xs font-normal text-slate-500">{v.timeSlot} &bull; {v.date}</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-semibold text-slate-800">
                          {tier?.subCategory || (v.type === 'home_visit' ? 'Home Visit' : v.type === 'clinic_visit' ? 'In-Clinic' : 'Tele-Rehab')}
                        </div>
                        <div className="text-2xs text-slate-500">
                          {tier?.serviceMode || (v.type === 'home_visit' ? 'Offline (Home Visit)' : v.type === 'clinic_visit' ? 'Offline (In-Clinic / OPD)' : 'Online Mode')}
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {formatCurrency(v.sessionFee)}
                      </td>
                      <td className="p-3">
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                          v.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.paymentStatus === 'insurance_claim'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onPaymentChange(v.id, v.paymentStatus === 'paid' ? 'pending' : 'paid')}
                          className="text-2xs font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Modalities Applied */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Clinical Modalities Applied
          </h3>

          {Object.keys(modalityCounts).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No modalities recorded in completed SOAP notes for today yet.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(modalityCounts).map(([modality, count]) => (
                <div key={modality} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">{modality}</span>
                  <span className="font-bold text-teal-700 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                    {count} {count === 1 ? 'patient' : 'patients'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-lg text-xs space-y-1 text-teal-900">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <span>Standard Billing Compliance</span>
            </div>
            <p className="text-2xs text-teal-800 leading-relaxed">
              Standard sitting rates reflect clinical norms for private clinics (₹800), specialist OPD (₹1,000), Tier-2 domiciliary care (₹1,500), and Metro home visits (₹2,000).
            </p>
          </div>
        </div>
      </div>

      {/* Rate Card Modal */}
      <RateCardModal
        isOpen={isRateCardOpen}
        onClose={() => setIsRateCardOpen(false)}
      />
    </div>
  );
};
