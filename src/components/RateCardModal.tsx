import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { STANDARD_RATE_CARD, formatCurrency } from '../data/rateCard';
import { RateCardTier } from '../types';

interface RateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier?: (tier: RateCardTier) => void;
}

export const RateCardModal: React.FC<RateCardModalProps> = ({
  isOpen,
  onClose,
  onSelectTier
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Standard Physiotherapy Rate Card & Fee Schedule</h2>
              <p className="text-2xs text-slate-400">Official Clinical Sitting Rates & Service Mode Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Payment Service Mode</th>
                  <th className="p-3">Sub-Category</th>
                  <th className="p-3 text-right">Standard Sitting Rate (₹)</th>
                  {onSelectTier && <th className="p-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Online Mode */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-800 align-top">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-2xs border border-teal-200">
                      Online Mode
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    <p className="font-bold text-slate-900">Video Assessment & Exercise Guidance</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Remote tele-rehab, biomechanical analysis & home exercise progression</p>
                  </td>
                  <td className="p-3 text-right align-top whitespace-nowrap">
                    <span className="font-extrabold text-base text-teal-700">₹700</span>
                    <span className="block text-2xs text-slate-400">per session</span>
                  </td>
                  {onSelectTier && (
                    <td className="p-3 text-center align-top">
                      <button
                        onClick={() => {
                          onSelectTier(STANDARD_RATE_CARD[0]);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                </tr>

                {/* Offline In-Clinic Row 1 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td rowSpan={2} className="p-3 font-semibold text-slate-800 align-top border-r border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-2xs border border-purple-200">
                      Offline (In-Clinic / OPD)
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    <p className="font-bold text-slate-900">Standard Private Clinic Rate</p>
                    <p className="text-2xs text-slate-500 mt-0.5">General rehabilitation bay, therapeutic ultrasound & manual mobilization</p>
                  </td>
                  <td className="p-3 text-right align-top whitespace-nowrap">
                    <span className="font-extrabold text-base text-purple-700">₹800</span>
                    <span className="block text-2xs text-slate-400">per session</span>
                  </td>
                  {onSelectTier && (
                    <td className="p-3 text-center align-top">
                      <button
                        onClick={() => {
                          onSelectTier(STANDARD_RATE_CARD[1]);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                </tr>

                {/* Offline In-Clinic Row 2 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-slate-700">
                    <p className="font-bold text-slate-900">Hospital-Based / Specialist OPD</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Orthopedic & neuro specialist OPD, post-surgical complex cases</p>
                  </td>
                  <td className="p-3 text-right align-top whitespace-nowrap">
                    <span className="font-extrabold text-base text-purple-900">₹1,000</span>
                    <span className="block text-2xs text-slate-400">per session</span>
                  </td>
                  {onSelectTier && (
                    <td className="p-3 text-center align-top">
                      <button
                        onClick={() => {
                          onSelectTier(STANDARD_RATE_CARD[2]);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                </tr>

                {/* Offline Home Visit Row 1 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td rowSpan={2} className="p-3 font-semibold text-slate-800 align-top border-r border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-2xs border border-blue-200">
                      Offline (Home Visit)
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    <p className="font-bold text-slate-900">Tier-2 Cities (e.g., Pune)</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Including Pune, Jaipur, Chandigarh, Lucknow, Nagpur, Indore</p>
                  </td>
                  <td className="p-3 text-right align-top whitespace-nowrap">
                    <span className="font-extrabold text-base text-blue-700">₹1,500</span>
                    <span className="block text-2xs text-slate-400">per session</span>
                  </td>
                  {onSelectTier && (
                    <td className="p-3 text-center align-top">
                      <button
                        onClick={() => {
                          onSelectTier(STANDARD_RATE_CARD[3]);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                </tr>

                {/* Offline Home Visit Row 2 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-slate-700">
                    <p className="font-bold text-slate-900">Metro Cities (e.g., Mumbai, Delhi, Bengaluru)</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Including Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata</p>
                  </td>
                  <td className="p-3 text-right align-top whitespace-nowrap">
                    <span className="font-extrabold text-base text-blue-900">₹2,000</span>
                    <span className="block text-2xs text-slate-400">per session</span>
                  </td>
                  {onSelectTier && (
                    <td className="p-3 text-center align-top">
                      <button
                        onClick={() => {
                          onSelectTier(STANDARD_RATE_CARD[4]);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Notice */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Automatic Rate Mapping & Custom Override</p>
              <p>
                When you schedule a new appointment or select a visit type, PhysioTracker automatically selects the corresponding standard sitting fee. You can also adjust or override the fee individually per patient in case of multi-session packages or concessions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Rate Card
          </button>
        </div>
      </div>
    </div>
  );
};
