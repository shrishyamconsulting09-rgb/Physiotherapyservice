import React, { useState } from 'react';
import { Patient, VisitType } from '../types';
import { X, User, Phone, MapPin, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPatient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [age, setAge] = useState(42);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+1 (555) ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [referringPhysician, setReferringPhysician] = useState('Dr. Davis (Ortho)');
  const [diagnosis, setDiagnosis] = useState('');
  const [bodyRegion, setBodyRegion] = useState<Patient['bodyRegion']>('Lumbar Spine');
  const [initialPainScore, setInitialPainScore] = useState(7);
  const [totalPrescribedSessions, setTotalPrescribedSessions] = useState(12);
  const [preferredVisitType, setPreferredVisitType] = useState<VisitType>('home_visit');
  const [activeTreatmentGoal, setActiveTreatmentGoal] = useState('');
  const [medicalHistoryStr, setMedicalHistoryStr] = useState('No prior surgeries, sedentary desk job');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: name.trim(),
      age: Number(age) || 30,
      gender,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address: address.trim() || 'Local Area',
      emergencyContact: emergencyContact.trim(),
      referringPhysician: referringPhysician.trim(),
      diagnosis: diagnosis.trim(),
      bodyRegion,
      initialPainScore,
      currentPainScore: initialPainScore,
      targetPainScore: Math.max(0, initialPainScore - 6),
      totalPrescribedSessions: Number(totalPrescribedSessions) || 10,
      completedSessions: 0,
      firstVisitDate: getTodayDateString(),
      preferredVisitType,
      medicalHistory: medicalHistoryStr.split(',').map(s => s.trim()).filter(Boolean),
      activeTreatmentGoal: activeTreatmentGoal.trim() || 'Restore full pain-free functional mobility and independence.',
      status: 'active'
    };

    onSave(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-teal-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Register New Physiotherapy Patient</h2>
              <p className="text-xs text-slate-400">Create profile, diagnosis & treatment plan</p>
            </div>
          </div>
          <button
            id="btn-close-new-patient-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="input-patient-name" className="block font-bold text-slate-700 mb-1">
                Full Patient Name *
              </label>
              <input
                id="input-patient-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jennifer Aniston"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label htmlFor="input-patient-age" className="block font-bold text-slate-700 mb-1">
                Age
              </label>
              <input
                id="input-patient-age"
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-patient-gender" className="block font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                id="select-patient-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="input-patient-phone" className="block font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                id="input-patient-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-patient-address" className="block font-bold text-slate-700 mb-1">
              Residential Address (for Domiciliary / Home Visits)
            </label>
            <input
              id="input-patient-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 45 Elm Street, Apartment 3B"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Clinical Information */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-teal-600" />
              Clinical Condition & Diagnosis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="select-patient-region" className="block font-bold text-slate-700 mb-1">
                  Primary Anatomical Region *
                </label>
                <select
                  id="select-patient-region"
                  value={bodyRegion}
                  onChange={(e) => setBodyRegion(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="Knee">Knee (ACL, Meniscus, TKA)</option>
                  <option value="Lumbar Spine">Lumbar Spine (Disc, Sciatica, Stenosis)</option>
                  <option value="Cervical Spine">Cervical Spine (Neck, Radiculopathy)</option>
                  <option value="Shoulder">Shoulder (Rotator Cuff, Impingement, Frozen)</option>
                  <option value="Hip">Hip (Bursitis, Labrum, THA)</option>
                  <option value="Ankle & Foot">Ankle & Foot (Sprain, Achilles, Plantar)</option>
                  <option value="Neurological">Neurological (Stroke, Parkinson's, Balance)</option>
                  <option value="Elbow & Wrist">Elbow & Wrist (Epicondylitis, Carpal Tunnel)</option>
                </select>
              </div>

              <div>
                <label htmlFor="input-initial-pain" className="block font-bold text-slate-700 mb-1">
                  Initial Baseline Pain (NRS 0-10): <span className="text-teal-700 font-bold">{initialPainScore}</span>
                </label>
                <input
                  id="input-initial-pain"
                  type="range"
                  min="0"
                  max="10"
                  value={initialPainScore}
                  onChange={(e) => setInitialPainScore(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer mt-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-clinical-diagnosis" className="block font-bold text-slate-700 mb-1">
                Clinical Diagnosis & Pathology *
              </label>
              <input
                id="input-clinical-diagnosis"
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., Right knee osteoarthritis grade III, L4-L5 disc protrusion..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-prescribed-sessions" className="block font-bold text-slate-700 mb-1">
                Prescribed Sessions Count
              </label>
              <input
                id="input-prescribed-sessions"
                type="number"
                value={totalPrescribedSessions}
                onChange={(e) => setTotalPrescribedSessions(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="select-preferred-visit" className="block font-bold text-slate-700 mb-1">
                Preferred Visit Mode
              </label>
              <select
                id="select-preferred-visit"
                value={preferredVisitType}
                onChange={(e) => setPreferredVisitType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="home_visit">Home Visit (Domiciliary)</option>
                <option value="clinic_visit">Clinic Bay Visit</option>
                <option value="tele_rehab">Tele-Rehab Video</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="input-treatment-goal" className="block font-bold text-slate-700 mb-1">
              Primary Functional Goal
            </label>
            <input
              id="input-treatment-goal"
              type="text"
              value={activeTreatmentGoal}
              onChange={(e) => setActiveTreatmentGoal(e.target.value)}
              placeholder="e.g. Return to running 5km, achieve 110 deg knee flexion, climb stairs..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="input-medical-history" className="block font-bold text-slate-700 mb-1">
              Medical History / Co-morbidities (comma separated)
            </label>
            <input
              id="input-medical-history"
              type="text"
              value={medicalHistoryStr}
              onChange={(e) => setMedicalHistoryStr(e.target.value)}
              placeholder="e.g. Hypertension, Osteoporosis, Diabetes..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
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
              id="btn-confirm-add-patient"
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm"
            >
              Save Patient Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
