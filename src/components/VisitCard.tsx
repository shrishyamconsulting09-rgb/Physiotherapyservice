import React from 'react';
import { Visit, VisitStatus, PaymentStatus } from '../types';
import { formatCurrency, getRateTier } from '../data/rateCard';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Car, 
  Building2, 
  Video, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Activity,
  Calendar,
  Tag
} from 'lucide-react';
import { formatDateLabel } from '../utils/dateUtils';

interface VisitCardProps {
  visit: Visit;
  onOpenSoapModal: (visit: Visit) => void;
  onStatusChange: (visitId: string, status: VisitStatus) => void;
  onPaymentChange: (visitId: string, paymentStatus: PaymentStatus) => void;
  onDeleteVisit: (visitId: string) => void;
  showDate?: boolean;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  visit,
  onOpenSoapModal,
  onStatusChange,
  onPaymentChange,
  onDeleteVisit,
  showDate = false
}) => {
  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Activity className="h-3 w-3" /> In Session
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            No-Show
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="h-3 w-3" /> Scheduled
          </span>
        );
    }
  };

  const getTypeBadge = (type: Visit['type']) => {
    switch (type) {
      case 'home_visit':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <Car className="h-3 w-3" /> Home Visit
          </span>
        );
      case 'clinic_visit':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="h-3 w-3" /> Clinic Bay
          </span>
        );
      case 'tele_rehab':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
            <Video className="h-3 w-3" /> Tele-Rehab
          </span>
        );
    }
  };

  const getBodyRegionBadge = (region: Visit['bodyRegion']) => {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {region}
      </span>
    );
  };

  const sessionPercentage = Math.round((visit.sessionNumber / visit.totalPrescribedSessions) * 100);

  return (
    <div className={`bg-white rounded-xl border transition-all ${
      visit.status === 'in_progress'
        ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm'
        : visit.status === 'completed'
        ? 'border-slate-200 bg-slate-50/40'
        : 'border-slate-200 hover:border-slate-300 shadow-2xs'
    } p-4 sm:p-5`}>
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {showDate && (
            <div className="flex items-center gap-1 font-bold text-teal-800 text-xs bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              <Calendar className="h-3.5 w-3.5 text-teal-600" />
              <span>{formatDateLabel(visit.date)} ({visit.date})</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm sm:text-base">
            <Clock className="h-4 w-4 text-teal-600" />
            <span>{visit.timeSlot}</span>
          </div>
          {getTypeBadge(visit.type)}
          {getBodyRegionBadge(visit.bodyRegion)}
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(visit.status)}
          
          <button
            id={`btn-delete-visit-${visit.id}`}
            onClick={() => onDeleteVisit(visit.id)}
            title="Remove visit"
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Main Patient and Clinical Information */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Patient Identity & Contact */}
        <div className="md:col-span-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {visit.patientName}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {visit.patientAge}y, {visit.patientGender}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <a href={`tel:${visit.patientPhone}`} className="hover:text-teal-600 font-medium underline-offset-2 hover:underline">
              {visit.patientPhone}
            </a>
          </div>

          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{visit.location || visit.patientAddress}</span>
              {visit.type === 'home_visit' && visit.travelDistanceKm && (
                <div className="flex items-center gap-2 mt-0.5 text-slate-500 font-normal">
                  <span>{visit.travelDistanceKm} km away</span>
                  <span>&bull;</span>
                  <span>~{visit.estimatedTravelMins} mins drive</span>
                  <span>&bull;</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.patientAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-0.5"
                  >
                    Maps <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Col 2: Chief Complaint & Session Stage */}
        <div className="md:col-span-1 space-y-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chief Focus</span>
            <p className="text-xs text-slate-800 font-medium mt-0.5 leading-relaxed">
              {visit.chiefComplaint}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Rehab Progress</span>
              <span className="font-semibold text-slate-700">
                Session {visit.sessionNumber} of {visit.totalPrescribedSessions} ({sessionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full"
                style={{ width: `${sessionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Col 3: Fee & Clinical Actions */}
        <div className="md:col-span-1 flex flex-col justify-between space-y-3 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Sitting Fee:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">{formatCurrency(visit.sessionFee)}</span>
                <button
                  id={`btn-toggle-payment-${visit.id}`}
                  onClick={() => onPaymentChange(visit.id, visit.paymentStatus === 'paid' ? 'pending' : 'paid')}
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    visit.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : visit.paymentStatus === 'insurance_claim'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                  title="Click to toggle payment status"
                >
                  {visit.paymentStatus === 'paid' ? 'PAID' : visit.paymentStatus === 'insurance_claim' ? 'CLAIM' : 'PENDING'}
                </button>
              </div>
            </div>

            {/* Rate Tier Tag if assigned */}
            {visit.serviceTier && (
              <div className="flex items-center gap-1 text-2xs text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                <Tag className="h-2.5 w-2.5 text-teal-600 shrink-0" />
                <span className="truncate">{getRateTier(visit.serviceTier)?.subCategory || visit.serviceTier}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-1.5">
            {visit.status === 'scheduled' && (
              <button
                id={`btn-start-visit-${visit.id}`}
                onClick={() => {
                  onStatusChange(visit.id, 'in_progress');
                  onOpenSoapModal(visit);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start Visit & Log SOAP</span>
              </button>
            )}

            {visit.status === 'in_progress' && (
              <button
                id={`btn-resume-visit-${visit.id}`}
                onClick={() => onOpenSoapModal(visit)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-2xs"
              >
                <Activity className="h-4 w-4" />
                <span>Resume Active Session</span>
              </button>
            )}

            {visit.status === 'completed' && (
              <button
                id={`btn-view-notes-${visit.id}`}
                onClick={() => onOpenSoapModal(visit)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4 text-teal-600" />
                <span>View / Edit Clinical Note</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* If Completed: Clinical Snapshot preview banner */}
      {visit.status === 'completed' && visit.soapNote && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 bg-emerald-50/40 px-3 py-2 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-900">SOAP Snapshot:</span>
            <span>Pain: <strong className="text-slate-800">{visit.soapNote.subjective.painScoreNRS}/10 NRS</strong></span>
            {visit.soapNote.objective.romMeasurements.length > 0 && (
              <span>ROM: <strong className="text-slate-800">{visit.soapNote.objective.romMeasurements[0].measuredDegrees}° ({visit.soapNote.objective.romMeasurements[0].movement})</strong></span>
            )}
            <span className="capitalize text-emerald-800 font-medium">Trend: {visit.soapNote.assessment.progressTrend}</span>
          </div>

          <div className="text-slate-500 italic">
            {visit.soapNote.assessment.milestoneAchieved || 'Milestone documented'}
          </div>
        </div>
      )}
    </div>
  );
};
