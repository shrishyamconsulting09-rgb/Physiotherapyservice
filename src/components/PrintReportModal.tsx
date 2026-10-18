import React from 'react';
import { Visit } from '../types';
import { formatCurrency, getRateTier } from '../data/rateCard';
import { X, Printer, Download, CheckCircle2, Calendar, Activity } from 'lucide-react';
import { formatFullDate } from '../utils/dateUtils';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  selectedDate: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  visits,
  selectedDate
}) => {
  if (!isOpen) return null;

  const completed = visits.filter(v => v.status === 'completed');
  const totalBilled = visits.reduce((acc, v) => acc + (v.sessionFee || 0), 0);
  const totalCollected = visits
    .filter(v => v.paymentStatus === 'paid')
    .reduce((acc, v) => acc + (v.sessionFee || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(visits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `physiotracker-itinerary-${selectedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Controls (Hidden in actual print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-bold">Daily Clinical Itinerary & Visit Log</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-json"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              id="btn-close-report-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-6 sm:p-8 overflow-y-auto text-slate-800 space-y-6" id="printable-report">
          {/* Practice Header */}
          <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-base">
                  PT
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">PhysioTracker Clinical Practice</h1>
                  <p className="text-xs text-slate-500">Physical Therapy Rehabilitation & Domiciliary Care Services</p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-900">{formatFullDate(selectedDate)}</p>
              <p>Practice ID: PT-CLINIC-2026</p>
              <p>Total Visits Logged: {visits.length}</p>
            </div>
          </div>

          {/* Operational Summary Strip */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Total Scheduled:</span>
              <strong className="text-base text-slate-900">{visits.length}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Completed Visits:</span>
              <strong className="text-base text-emerald-700">{completed.length}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Sitting Value:</span>
              <strong className="text-base text-slate-900">{formatCurrency(totalBilled)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Amount Collected:</span>
              <strong className="text-base text-teal-700">{formatCurrency(totalCollected)}</strong>
            </div>
          </div>

          {/* Detailed Itinerary Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Patient Visits Itinerary & SOAP Documentation
            </h2>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Time & Date</th>
                    <th className="p-2.5">Patient Details</th>
                    <th className="p-2.5">Payment Mode & Sub-Category</th>
                    <th className="p-2.5">Clinical Focus / Outcome</th>
                    <th className="p-2.5 text-right">Sitting Rate (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visits.map((v) => {
                    const tier = getRateTier(v.serviceTier);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900 whitespace-nowrap">
                          {v.timeSlot}
                          <div className="text-2xs font-normal capitalize text-slate-500">{v.date} &bull; {v.status}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{v.patientName}</div>
                          <div className="text-2xs text-slate-500">{v.patientAge}y, {v.patientGender} &bull; {v.bodyRegion}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-800">
                            {tier?.subCategory || (v.type === 'home_visit' ? 'Home Visit' : v.type === 'clinic_visit' ? 'In-Clinic' : 'Tele-Rehab')}
                          </div>
                          <div className="text-2xs text-slate-500 truncate max-w-xs">{tier?.serviceMode || v.location || v.patientAddress}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-medium text-slate-800">{v.chiefComplaint}</div>
                          {v.soapNote && (
                            <div className="text-2xs text-emerald-700 mt-0.5 font-medium">
                              Pain: {v.soapNote.subjective.painScoreNRS}/10 NRS &bull; {v.soapNote.assessment.progressTrend} &bull; {v.soapNote.assessment.milestoneAchieved || 'Progressing'}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatCurrency(v.sessionFee)}
                          <div className={`text-2xs font-semibold uppercase ${v.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {v.paymentStatus}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Certification / Signature footer */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Generated via PhysioTracker Clinical Management System</p>
              <p>Timestamp: {new Date().toLocaleTimeString()} - Confidential Medical Record</p>
            </div>
            <div className="text-right border-t border-slate-400 pt-2 min-w-[200px]">
              <p className="font-bold text-slate-800">Licensed Physical Therapist</p>
              <p className="text-2xs text-slate-400">Signature / License Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
