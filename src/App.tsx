import React, { useState, useEffect, useRef } from 'react';
import { Visit, Patient, VisitStatus, PaymentStatus, VisitType } from './types';
import { 
  loadPatients, 
  savePatients, 
  loadVisits, 
  saveVisits, 
  resetToDefaults,
  saveEncryptedClinicData,
  loadEncryptedClinicData,
  hasEncryptedVault
} from './utils/storage';
import { 
  isEncryptionActive, 
  getSecurityConfig, 
  saveSecurityConfig, 
  SecurityConfig, 
  EncryptedPayload, 
  decryptData,
  clearEncryptedVault 
} from './utils/crypto';
import { getTodayDateString, formatDateLabel, formatFullDate } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { DailyStats } from './components/DailyStats';
import { VisitCard } from './components/VisitCard';
import { SoapNoteModal } from './components/SoapNoteModal';
import { NewVisitModal } from './components/NewVisitModal';
import { NewPatientModal } from './components/NewPatientModal';
import { PatientsView } from './components/PatientsView';
import { HomeVisitRouteView } from './components/HomeVisitRouteView';
import { DailyBillingSummaryView } from './components/DailyBillingSummaryView';
import { PrintReportModal } from './components/PrintReportModal';
import { RateCardModal } from './components/RateCardModal';
import { LockScreen } from './components/LockScreen';
import { SecurityModal } from './components/SecurityModal';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  CalendarX, 
  Car, 
  Building2, 
  Video,
  CheckCircle2,
  Clock,
  Activity,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Encryption & Security States
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => getSecurityConfig());
  const [isEncrypted, setIsEncrypted] = useState<boolean>(() => isEncryptionActive());
  const [isLocked, setIsLocked] = useState<boolean>(() => isEncryptionActive());
  const [activePassphrase, setActivePassphrase] = useState<string | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Clinical data states (if encrypted and locked, initial data is loaded upon unlock)
  const [patients, setPatients] = useState<Patient[]>(() => {
    return isEncryptionActive() ? [] : loadPatients();
  });
  const [visits, setVisits] = useState<Visit[]>(() => {
    return isEncryptionActive() ? [] : loadVisits();
  });

  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [viewAllDates, setViewAllDates] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients' | 'route' | 'reports'>('schedule');

  // Daily Schedule filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isRateCardOpen, setIsRateCardOpen] = useState(false);
  const [activeSoapVisit, setActiveSoapVisit] = useState<Visit | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Sync to Storage (Encrypted or Plaintext)
  useEffect(() => {
    if (isLocked) return;
    if (isEncrypted && activePassphrase) {
      saveEncryptedClinicData(patients, visits, activePassphrase).catch(err => {
        console.error('Failed to sync encrypted vault', err);
      });
    } else if (!isEncrypted) {
      savePatients(patients);
      saveVisits(visits);
    }
  }, [patients, visits, isEncrypted, activePassphrase, isLocked]);

  // Keyboard shortcut: Ctrl + L or Cmd + L to lock instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        if (isEncrypted && !isLocked) {
          handleLockNow();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEncrypted, isLocked]);

  // Inactivity Auto-Lock Timer
  const lastActiveRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!isEncrypted || isLocked || !securityConfig.autoLockMinutes || securityConfig.autoLockMinutes <= 0) {
      return;
    }
    const updateActivity = () => {
      lastActiveRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const idleMs = Date.now() - lastActiveRef.current;
      const thresholdMs = securityConfig.autoLockMinutes * 60 * 1000;
      if (idleMs >= thresholdMs) {
        handleLockNow();
      }
    }, 10000);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, updateActivity));
      clearInterval(checkInterval);
    };
  }, [isEncrypted, isLocked, securityConfig.autoLockMinutes]);

  // Handler: Unlock Vault
  const handleUnlock = async (pin: string): Promise<boolean> => {
    try {
      const db = await loadEncryptedClinicData(pin);
      setPatients(db.patients);
      setVisits(db.visits);
      setActivePassphrase(pin);
      setIsLocked(false);
      lastActiveRef.current = Date.now();
      return true;
    } catch (err) {
      console.error('Vault decryption error:', err);
      return false;
    }
  };

  // Handler: Lock App Now
  const handleLockNow = () => {
    setActivePassphrase(null);
    setIsLocked(true);
  };

  // Handler: Enable Encryption
  const handleEnableEncryption = async (pin: string, autoLockMin: number): Promise<boolean> => {
    try {
      await saveEncryptedClinicData(patients, visits, pin);
      const newCfg: SecurityConfig = {
        isEncryptionEnabled: true,
        autoLockMinutes: autoLockMin,
        failedAttempts: 0,
      };
      saveSecurityConfig(newCfg);
      setSecurityConfig(newCfg);
      setActivePassphrase(pin);
      setIsEncrypted(true);
      return true;
    } catch (err) {
      console.error('Failed to enable vault encryption:', err);
      return false;
    }
  };

  // Handler: Change Master PIN
  const handleChangePassphrase = async (currentPass: string, newPass: string): Promise<boolean> => {
    try {
      const db = await loadEncryptedClinicData(currentPass);
      await saveEncryptedClinicData(db.patients, db.visits, newPass);
      setActivePassphrase(newPass);
      return true;
    } catch (err) {
      console.error('Failed to change master PIN:', err);
      return false;
    }
  };

  // Handler: Disable Encryption
  const handleDisableEncryption = async (currentPass: string): Promise<boolean> => {
    try {
      const db = await loadEncryptedClinicData(currentPass);
      savePatients(db.patients);
      saveVisits(db.visits);
      clearEncryptedVault();
      const newCfg: SecurityConfig = {
        isEncryptionEnabled: false,
        autoLockMinutes: 15,
        failedAttempts: 0,
      };
      saveSecurityConfig(newCfg);
      setSecurityConfig(newCfg);
      setIsEncrypted(false);
      setActivePassphrase(null);
      return true;
    } catch (err) {
      console.error('Failed to disable encryption:', err);
      return false;
    }
  };

  // Handler: Restore from Backup
  const handleRestoreBackup = async (payload: EncryptedPayload, passphrase: string): Promise<boolean> => {
    try {
      const decrypted = await decryptData<{ patients: Patient[]; visits: Visit[] }>(payload, passphrase);
      if (!Array.isArray(decrypted.patients) || !Array.isArray(decrypted.visits)) {
        return false;
      }
      await saveEncryptedClinicData(decrypted.patients, decrypted.visits, passphrase);
      setPatients(decrypted.patients);
      setVisits(decrypted.visits);
      setActivePassphrase(passphrase);
      setIsEncrypted(true);
      setIsLocked(false);
      const newCfg: SecurityConfig = {
        isEncryptionEnabled: true,
        autoLockMinutes: 15,
        failedAttempts: 0,
      };
      saveSecurityConfig(newCfg);
      setSecurityConfig(newCfg);
      return true;
    } catch (err) {
      console.error('Failed to restore encrypted backup:', err);
      return false;
    }
  };

  // Handler: Reset to factory defaults
  const handleResetToDefaults = () => {
    const initial = resetToDefaults();
    setPatients(initial.patients);
    setVisits(initial.visits);
    setIsEncrypted(false);
    setIsLocked(false);
    setActivePassphrase(null);
    setSecurityConfig({
      isEncryptionEnabled: false,
      autoLockMinutes: 15,
      failedAttempts: 0,
    });
  };

  // Handler: Update Visit
  const handleSaveVisit = (updatedVisit: Visit) => {
    setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
    
    // If visit was completed, also update patient's completed sessions count and current pain score
    if (updatedVisit.status === 'completed' && updatedVisit.soapNote) {
      const painScore = updatedVisit.soapNote.subjective.painScoreNRS;
      setPatients(prev => prev.map(p => {
        if (p.id === updatedVisit.patientId) {
          return {
            ...p,
            currentPainScore: painScore,
            completedSessions: Math.max(p.completedSessions, updatedVisit.sessionNumber)
          };
        }
        return p;
      }));
    }
  };

  // Handler: Change Status
  const handleStatusChange = (visitId: string, status: VisitStatus) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status,
          visitedAt: status === 'completed' || status === 'in_progress' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : v.visitedAt
        };
      }
      return v;
    }));
  };

  // Handler: Change Payment Status
  const handlePaymentChange = (visitId: string, paymentStatus: PaymentStatus) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, paymentStatus } : v));
  };

  // Handler: Delete Visit
  const handleDeleteVisit = (visitId: string) => {
    if (window.confirm('Are you sure you want to cancel and remove this visit?')) {
      setVisits(prev => prev.filter(v => v.id !== visitId));
    }
  };

  // Handler: Add New Visit
  const handleAddNewVisit = (newVisit: Visit) => {
    setVisits(prev => [...prev, newVisit]);
  };

  // Handler: Add New Patient
  const handleAddNewPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Handler: Reset to Defaults
  const handleReset = () => {
    if (window.confirm('Reset clinic data back to original clinical demo state?')) {
      const fresh = resetToDefaults();
      setPatients(fresh.patients);
      setVisits(fresh.visits);
      setCurrentDate(getTodayDateString());
      setViewAllDates(false);
    }
  };

  // Scope of visits based on viewAllDates toggle
  const activeVisitsScope = viewAllDates ? visits : visits.filter(v => v.date === currentDate);

  const filteredVisits = activeVisitsScope.filter(v => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    const matchesSearch = 
      v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.patientPhone.includes(searchQuery) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.date.includes(searchQuery);

    return matchesStatus && matchesType && matchesSearch;
  }).sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation & Header */}
      <Navbar
        currentDate={currentDate}
        onDateChange={(date) => {
          setCurrentDate(date);
          setViewAllDates(false);
        }}
        viewAllDates={viewAllDates}
        onToggleViewAllDates={setViewAllDates}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewVisit={() => setIsNewVisitOpen(true)}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenRateCard={() => setIsRateCardOpen(true)}
        onResetData={handleReset}
        isEncrypted={isEncrypted}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onLockNow={handleLockNow}
      />

      {/* Unencrypted Clinic Alert Banner */}
      {!isEncrypted && (
        <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-2">
          <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Patient Health Information (PHI) is currently unencrypted.</strong> Secure your patient database and SOAP notes with client-side AES-256-GCM encryption.
              </span>
            </div>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-2xs font-bold shrink-0 transition-colors shadow-2xs"
            >
              <Lock className="w-3 h-3" />
              <span>Encrypt Database Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* TAB 1: DAILY ITINERARY */}
        {activeTab === 'schedule' && (
          <div className="space-y-5">
            {/* Daily Operational Statistics Strip */}
            <DailyStats
              visits={activeVisitsScope}
              selectedDate={viewAllDates ? 'All Logged Dates' : currentDate}
              onOpenReportModal={() => setIsPrintReportOpen(true)}
            />

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative w-full md:w-80">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-daily-itinerary"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, date, complaint..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Scope & Visit Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                  <button
                    id="btn-toggle-date-scope"
                    onClick={() => setViewAllDates(!viewAllDates)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                      viewAllDates
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                    }`}
                  >
                    {viewAllDates ? `✓ All Dates (${visits.length})` : `Date: ${formatDateLabel(currentDate)}`}
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <button
                    id="filter-type-all"
                    onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      typeFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    All Types ({activeVisitsScope.length})
                  </button>

                  <button
                    id="filter-type-home"
                    onClick={() => setTypeFilter('home_visit')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      typeFilter === 'home_visit'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Car className="h-3 w-3" />
                    <span>Home Visits ({activeVisitsScope.filter(v => v.type === 'home_visit').length})</span>
                  </button>

                  <button
                    id="filter-type-clinic"
                    onClick={() => setTypeFilter('clinic_visit')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      typeFilter === 'clinic_visit'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Building2 className="h-3 w-3" />
                    <span>In-Clinic ({activeVisitsScope.filter(v => v.type === 'clinic_visit').length})</span>
                  </button>

                  <button
                    id="filter-type-tele"
                    onClick={() => setTypeFilter('tele_rehab')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      typeFilter === 'tele_rehab'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Video className="h-3 w-3" />
                    <span>Tele-Rehab ({activeVisitsScope.filter(v => v.type === 'tele_rehab').length})</span>
                  </button>
                </div>
              </div>

              {/* Status Sub-filter */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto scrollbar-none">
                <span className="text-slate-500 font-medium">Status:</span>
                {(['all', 'scheduled', 'in_progress', 'completed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-teal-100 text-teal-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' ? 'All Statuses' : st === 'in_progress' ? 'In Progress' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit Cards List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {viewAllDates ? `All Scheduled Visits (${filteredVisits.length})` : `Timeline for ${formatFullDate(currentDate)} (${filteredVisits.length} visits)`}
                </h2>
                {filteredVisits.length > 0 && (
                  <span className="text-2xs text-slate-400">
                    {viewAllDates ? 'Sorted chronologically across all dates' : 'Ordered by daily time slot'}
                  </span>
                )}
              </div>

              {filteredVisits.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <CalendarX className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">No visits found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'No visits match your active search and filter criteria.'
                        : `There are currently no visits on record for ${formatDateLabel(currentDate)}.`}
                    </p>
                  </div>
                  <div>
                    <button
                      id="btn-schedule-first-visit"
                      onClick={() => setIsNewVisitOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Schedule New Visit</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredVisits.map(visit => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    showDate={viewAllDates}
                    onOpenSoapModal={setActiveSoapVisit}
                    onStatusChange={handleStatusChange}
                    onPaymentChange={handlePaymentChange}
                    onDeleteVisit={handleDeleteVisit}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PATIENTS & PROGRESS */}
        {activeTab === 'patients' && (
          <PatientsView
            patients={patients}
            visits={visits}
            onOpenNewPatient={() => setIsNewPatientOpen(true)}
            onScheduleVisitForPatient={(patientId) => {
              setIsNewVisitOpen(true);
            }}
            onOpenSoapModal={setActiveSoapVisit}
          />
        )}

        {/* TAB 3: HOME VISIT ROUTE PLANNER */}
        {activeTab === 'route' && (
          <HomeVisitRouteView
            visits={activeVisitsScope}
            selectedDate={viewAllDates ? 'All Dates' : currentDate}
            onOpenSoapModal={setActiveSoapVisit}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* TAB 4: DAILY BILLING & SUMMARY */}
        {activeTab === 'reports' && (
          <DailyBillingSummaryView
            visits={activeVisitsScope}
            selectedDate={viewAllDates ? 'All Dates' : currentDate}
            onPaymentChange={handlePaymentChange}
            onOpenReportModal={() => setIsPrintReportOpen(true)}
          />
        )}
      </main>

      {/* Clinical SOAP Documentation Modal */}
      {activeSoapVisit && (
        <SoapNoteModal
          visit={activeSoapVisit}
          isOpen={true}
          onClose={() => setActiveSoapVisit(null)}
          onSave={handleSaveVisit}
        />
      )}

      {/* Schedule New Visit Modal */}
      <NewVisitModal
        isOpen={isNewVisitOpen}
        onClose={() => setIsNewVisitOpen(false)}
        onSave={handleAddNewVisit}
        patients={patients}
        defaultDate={currentDate}
      />

      {/* Register New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSave={handleAddNewPatient}
      />

      {/* Print / PDF Itinerary Modal */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        visits={activeVisitsScope}
        selectedDate={viewAllDates ? 'All Dates' : currentDate}
      />

      {/* Standard Physiotherapy Rate Card & Fee Schedule Modal */}
      <RateCardModal
        isOpen={isRateCardOpen}
        onClose={() => setIsRateCardOpen(false)}
        onSelectTier={(tier) => {
          setIsRateCardOpen(false);
          setIsNewVisitOpen(true);
        }}
      />

      {/* Security & Cryptographic Vault Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        isEncrypted={isEncrypted}
        onEnableEncryption={handleEnableEncryption}
        onChangePassphrase={handleChangePassphrase}
        onDisableEncryption={handleDisableEncryption}
        onLockNow={handleLockNow}
        onRestoreBackup={handleRestoreBackup}
        patientsCount={patients.length}
        visitsCount={visits.length}
      />

      {/* Military-Grade Lock Screen (Triggered when vault is encrypted & locked) */}
      {isLocked && (
        <LockScreen
          onUnlock={handleUnlock}
          onResetToDefaults={handleResetToDefaults}
        />
      )}
    </div>
  );
}
