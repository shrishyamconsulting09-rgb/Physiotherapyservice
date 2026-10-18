import React, { useState } from 'react';
import { Visit, Patient, VisitType, PaymentStatus, ServiceTier } from '../types';
import { STANDARD_RATE_CARD, formatCurrency, getRateTier } from '../data/rateCard';
import { X, Calendar, Clock, MapPin, User, AlertCircle, Tag, Check } from 'lucide-react';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newVisit: Visit) => void;
  patients: Patient[];
  defaultDate: string;
}

const TIME_SLOTS = [
  '08:00 AM - 08:45 AM',
  '08:45 AM - 09:30 AM',
  '09:30 AM - 10:15 AM',
  '10:15 AM - 11:00 AM',
  '11:00 AM - 11:45 AM',
  '11:45 AM - 12:30 PM',
  '01:30 PM - 02:15 PM',
  '02:15 PM - 03:00 PM',
  '03:00 PM - 03:45 PM',
  '03:45 PM - 04:30 PM',
  '04:30 PM - 05:15 PM',
  '05:15 PM - 06:00 PM'
];

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  defaultDate
}) => {
  if (!isOpen) return null;

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [date, setDate] = useState<string>(defaultDate);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[2]);
  
  // Rate Tier state
  const [selectedTier, setSelectedTier] = useState<ServiceTier>('home_tier2');
  const [type, setType] = useState<VisitType>('home_visit');
  const [sessionFee, setSessionFee] = useState<number>(1500);

  const [location, setLocation] = useState<string>(patients[0]?.address || 'Patient Residence');
  const [travelDistanceKm, setTravelDistanceKm] = useState<number>(5.0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [chiefComplaint, setChiefComplaint] = useState<string>('Post-op rehabilitation & joint mobilization');
  const [bodyRegion, setBodyRegion] = useState<Visit['bodyRegion']>('Knee');

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setLocation(type === 'home_visit' ? pat.address : 'Main Clinic Treatment Area');
      setBodyRegion(pat.bodyRegion);
      setChiefComplaint(`${pat.diagnosis} - Session Followup`);
    }
  };

  const handleTierSelect = (tierId: ServiceTier) => {
    setSelectedTier(tierId);
    const tier = STANDARD_RATE_CARD.find(t => t.id === tierId);
    if (tier) {
      setType(tier.visitType);
      setSessionFee(tier.rate);
      const pat = patients.find(p => p.id === selectedPatientId);
      if (tier.visitType === 'home_visit') {
        setLocation(pat?.address || 'Patient Residence');
      } else if (tier.visitType === 'clinic_visit') {
        setLocation(tier.id === 'clinic_specialist' ? 'Specialist OPD Suite 3' : 'Main Clinic - Bay 1');
      } else {
        setLocation('Tele-Rehab Video Session');
      }
    }
  };

  const handleTypeChange = (newType: VisitType) => {
    setType(newType);
    const pat = patients.find(p => p.id === selectedPatientId);
    if (newType === 'home_visit') {
      setSelectedTier('home_tier2');
      setLocation(pat?.address || 'Patient Residence');
      setSessionFee(1500);
    } else if (newType === 'clinic_visit') {
      setSelectedTier('clinic_standard');
      setLocation('Main Clinic - Bay 1');
      setSessionFee(800);
    } else {
      setSelectedTier('online_standard');
      setLocation('Tele-Rehab Video Session');
      setSessionFee(700);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === selectedPatientId) || patients[0];

    const newVisit: Visit = {
      id: `vis-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      patientPhone: pat.phone,
      patientAddress: pat.address,
      patientAge: pat.age,
      patientGender: pat.gender,
      date,
      timeSlot,
      type,
      status: 'scheduled',
      location,
      travelDistanceKm: type === 'home_visit' ? travelDistanceKm : undefined,
      estimatedTravelMins: type === 'home_visit' ? Math.round(travelDistanceKm * 2.5) : undefined,
      chiefComplaint,
      bodyRegion,
      sessionNumber: (pat.completedSessions || 0) + 1,
      totalPrescribedSessions: pat.totalPrescribedSessions || 12,
      sessionFee,
      serviceTier: selectedTier,
      paymentStatus
    };

    onSave(newVisit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">Schedule New Physiotherapy Visit</h2>
            <p className="text-xs text-slate-400">Configure appointment with standard rate tier & clinical focus</p>
          </div>
          <button
            id="btn-close-new-visit-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Patient Selection */}
          <div>
            <label htmlFor="select-visit-patient" className="block font-bold text-slate-700 mb-1">
              Select Patient *
            </label>
            <select
              id="select-visit-patient"
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ({p.bodyRegion} &bull; {p.diagnosis})
                </option>
              ))}
            </select>
          </div>

          {/* Standard Sitting Rate & Service Mode Tier */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700">
                Payment Service Mode & Standard Sitting Rate (₹) *
              </label>
              <span className="text-2xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Official Clinical Rate Matrix
              </span>
            </div>

            <div className="space-y-1.5">
              {STANDARD_RATE_CARD.map(tier => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => handleTierSelect(tier.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600 text-teal-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            tier.serviceMode === 'Online Mode' 
                              ? 'bg-teal-100 text-teal-800'
                              : tier.serviceMode === 'Offline (In-Clinic / OPD)'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tier.serviceMode}
                          </span>
                          <span className="font-bold text-slate-900">{tier.subCategory}</span>
                        </div>
                        <p className="text-2xs text-slate-500 mt-0.5">{tier.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="font-extrabold text-sm text-slate-900">{formatCurrency(tier.rate)}</span>
                      <span className="block text-2xs text-slate-400">/ session</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-visit-date" className="block font-bold text-slate-700 mb-1">
                Visit Date *
              </label>
              <input
                id="input-visit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label htmlFor="select-visit-time" className="block font-bold text-slate-700 mb-1">
                Time Slot *
              </label>
              <select
                id="select-visit-time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              >
                {TIME_SLOTS.map(ts => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location / Address */}
          <div>
            <label htmlFor="input-visit-location" className="block font-bold text-slate-700 mb-1">
              Location / Destination Address *
            </label>
            <input
              id="input-visit-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace, West End"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              required
            />
          </div>

          {type === 'home_visit' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-travel-distance" className="block font-bold text-slate-700 mb-1">
                  Est. Travel Distance (km)
                </label>
                <input
                  id="input-travel-distance"
                  type="number"
                  step="0.5"
                  value={travelDistanceKm}
                  onChange={(e) => setTravelDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Transit Time
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                  ~{Math.round(travelDistanceKm * 2.5)} minutes
                </div>
              </div>
            </div>
          )}

          {/* Chief Focus / Complaint */}
          <div>
            <label htmlFor="input-chief-focus" className="block font-bold text-slate-700 mb-1">
              Visit Rehabilitation Focus / Objective *
            </label>
            <input
              id="input-chief-focus"
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Joint mobilization, gait re-education, eccentric loading..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Fee & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="input-session-fee" className="block font-bold text-slate-700 mb-1">
                Applied Session Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  id="input-session-fee"
                  type="number"
                  value={sessionFee}
                  onChange={(e) => setSessionFee(parseInt(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <span className="text-2xs text-slate-400 mt-0.5 block">Standard tier applied. Can be customized if concession given.</span>
            </div>

            <div>
              <label htmlFor="select-payment-status" className="block font-bold text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                id="select-payment-status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="insurance_claim">Insurance Claim</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-add-visit"
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm"
            >
              Add Visit to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
