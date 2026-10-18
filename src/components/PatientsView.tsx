import React, { useState } from 'react';
import { Patient, Visit } from '../types';
import { formatCurrency, getRateTier } from '../data/rateCard';
import { 
  Search, 
  Plus, 
  Activity, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingDown, 
  CheckCircle2, 
  ChevronRight,
  FileText,
  UserCheck,
  Tag
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  visits: Visit[];
  onOpenNewPatient: () => void;
  onScheduleVisitForPatient: (patientId: string) => void;
  onOpenSoapModal: (visit: Visit) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  visits,
  onOpenNewPatient,
  onScheduleVisitForPatient,
  onOpenSoapModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    const matchesRegion = selectedRegion === 'all' || p.bodyRegion === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const patientVisits = selectedPatient 
    ? visits.filter(v => v.patientId === selectedPatient.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-4">
      {/* Top filter & actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-patients"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name, pathology, or phone..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            id="filter-patient-region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs font-semibold p-2 rounded-lg border border-slate-300 text-slate-700 bg-white"
          >
            <option value="all">All Anatomical Regions</option>
            <option value="Knee">Knee</option>
            <option value="Lumbar Spine">Lumbar Spine</option>
            <option value="Cervical Spine">Cervical Spine</option>
            <option value="Shoulder">Shoulder</option>
            <option value="Hip">Hip</option>
            <option value="Neurological">Neurological</option>
          </select>

          <button
            id="btn-add-patient-view"
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Patient Directory & Selected Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Patient List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Registered Patients ({filteredPatients.length})
          </h2>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                No patients found matching your search.
              </div>
            ) : (
              filteredPatients.map(patient => {
                const isSelected = selectedPatient?.id === patient.id;
                const painDrop = Math.max(0, patient.initialPainScore - patient.currentPainScore);
                const progressPct = Math.round((patient.completedSessions / patient.totalPrescribedSessions) * 100);

                return (
                  <div
                    key={patient.id}
                    id={`patient-card-${patient.id}`}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {patient.bodyRegion}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{patient.diagnosis}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{patient.age}y</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Pain: {patient.initialPainScore} &rarr; <strong className="text-emerald-700 font-bold">{patient.currentPainScore}/10</strong></span>
                      </div>

                      <div className="text-slate-500">
                        Sessions: <strong className="text-slate-800">{patient.completedSessions}/{patient.totalPrescribedSessions}</strong> ({progressPct}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Patient Comprehensive Profile & Clinical Record (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-2xs">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">{selectedPatient.name}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Patient
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPatient.age} years old &bull; {selectedPatient.gender} &bull; Started {selectedPatient.firstVisitDate}
                  </p>
                </div>

                <button
                  id="btn-schedule-patient-visit"
                  onClick={() => onScheduleVisitForPatient(selectedPatient.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Schedule Next Visit</span>
                </button>
              </div>

              {/* Patient Contact & Medical Background */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedPatient.address}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 font-medium">Referring Doctor:</span>{' '}
                    <span className="text-slate-800 font-semibold">{selectedPatient.referringPhysician}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Emergency:</span>{' '}
                    <span className="text-slate-800">{selectedPatient.emergencyContact || 'None on file'}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis & Goal Card */}
              <div className="space-y-2">
                <div>
                  <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">Primary Diagnosis</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedPatient.diagnosis}</p>
                </div>

                <div>
                  <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">Active Functional Goal</span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                    {selectedPatient.activeTreatmentGoal}
                  </p>
                </div>
              </div>

              {/* Recovery Progress Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <span className="text-2xs font-medium text-slate-500 block">Baseline Pain</span>
                  <span className="text-lg font-bold text-slate-700">{selectedPatient.initialPainScore}/10</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                  <span className="text-2xs font-medium text-emerald-800 block">Current Pain (NRS)</span>
                  <span className="text-lg font-bold text-emerald-700">{selectedPatient.currentPainScore}/10</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <span className="text-2xs font-medium text-slate-500 block">Sessions Completed</span>
                  <span className="text-lg font-bold text-slate-900">
                    {selectedPatient.completedSessions} / {selectedPatient.totalPrescribedSessions}
                  </span>
                </div>
              </div>

              {/* Visit History Log */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Visit Logs & Clinical Notes ({patientVisits.length})
                </h4>

                {patientVisits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No visits logged for this patient yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {patientVisits.map(visit => {
                      const tier = getRateTier(visit.serviceTier);
                      return (
                        <div
                          key={visit.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{visit.date}</span>
                              <span className="text-slate-500">&bull; {visit.timeSlot}</span>
                              <span className={`text-2xs font-semibold px-2 py-0.2 rounded-full ${
                                visit.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}>
                                {visit.status}
                              </span>
                              <span className="text-2xs font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {formatCurrency(visit.sessionFee)}
                              </span>
                            </div>
                            <p className="text-slate-600 text-2xs truncate">
                              {tier ? `${tier.subCategory} • ` : ''}{visit.chiefComplaint}
                            </p>
                          </div>

                          {visit.soapNote && (
                            <button
                              onClick={() => onOpenSoapModal(visit)}
                              className="inline-flex items-center gap-1 text-2xs font-bold text-teal-700 hover:text-teal-900 bg-white px-2 py-1 rounded border border-slate-200 shrink-0"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View SOAP</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              Select a patient from the left to view detailed rehabilitation chart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
