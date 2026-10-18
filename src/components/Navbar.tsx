import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Users, 
  MapPin, 
  CalendarDays, 
  FileSpreadsheet,
  Activity,
  RotateCcw,
  Tag,
  ShieldCheck,
  Shield,
  Lock
} from 'lucide-react';
import { formatDateLabel, formatFullDate, addDaysToDate, getTodayDateString } from '../utils/dateUtils';

interface NavbarProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  viewAllDates: boolean;
  onToggleViewAllDates: (all: boolean) => void;
  activeTab: 'schedule' | 'patients' | 'route' | 'reports';
  onTabChange: (tab: 'schedule' | 'patients' | 'route' | 'reports') => void;
  onOpenNewVisit: () => void;
  onOpenNewPatient: () => void;
  onOpenRateCard?: () => void;
  onResetData: () => void;
  isEncrypted?: boolean;
  onOpenSecurityModal?: () => void;
  onLockNow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDate,
  onDateChange,
  viewAllDates,
  onToggleViewAllDates,
  activeTab,
  onTabChange,
  onOpenNewVisit,
  onOpenNewPatient,
  onOpenRateCard,
  onResetData,
  isEncrypted = false,
  onOpenSecurityModal,
  onLockNow
}) => {
  const todayStr = getTodayDateString();
  const isToday = currentDate === todayStr;

  const handlePrevDay = () => {
    onToggleViewAllDates(false);
    onDateChange(addDaysToDate(currentDate, -1));
  };

  const handleNextDay = () => {
    onToggleViewAllDates(false);
    onDateChange(addDaysToDate(currentDate, 1));
  };

  const handleGoToday = () => {
    onToggleViewAllDates(false);
    onDateChange(todayStr);
  };

  const handleToggleAll = () => {
    onToggleViewAllDates(!viewAllDates);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand & Action buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">PhysioTracker</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Clinical Visit Manager
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Daily Rehabilitation & Domiciliary Visit Management</p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex md:hidden items-center gap-1.5">
              {isEncrypted && onLockNow && (
                <button
                  onClick={onLockNow}
                  className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
                  title="Lock Vault Now"
                >
                  <Lock className="h-4 w-4 text-teal-400" />
                </button>
              )}
              {onOpenSecurityModal && (
                <button
                  onClick={onOpenSecurityModal}
                  className={`p-2 rounded-lg ${isEncrypted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                  title={isEncrypted ? 'AES-256 Vault Active' : 'Encrypt Clinic Data'}
                >
                  <ShieldCheck className="h-4 w-4" />
                </button>
              )}
              {onOpenRateCard && (
                <button
                  onClick={onOpenRateCard}
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  title="View Standard Rate Card (₹)"
                >
                  <Tag className="h-4 w-4 text-teal-600" />
                </button>
              )}
              <button
                id="btn-mobile-new-visit"
                onClick={onOpenNewVisit}
                className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                title="Add Visit"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Date Picker & Day Switcher */}
          <div className="flex items-center justify-between md:justify-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              id="btn-prev-day"
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <input
                id="input-date-selector"
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                aria-label="Select Date"
                className="text-sm font-semibold text-slate-800 bg-transparent border-none cursor-pointer focus:outline-hidden"
              />
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {formatDateLabel(currentDate)}
              </span>
            </div>

            <button
              id="btn-next-day"
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isToday && !viewAllDates && (
              <button
                id="btn-jump-today"
                onClick={handleGoToday}
                className="text-xs font-medium text-teal-700 hover:bg-teal-100/60 px-2 py-1 rounded-md transition-colors ml-1"
              >
                Today
              </button>
            )}

            <button
              id="btn-view-all-dates"
              onClick={handleToggleAll}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ml-1 ${
                viewAllDates
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Show all visits across all dates"
            >
              All
            </button>
          </div>

          {/* Action buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Security Vault Indicator & Modal Trigger */}
            {onOpenSecurityModal && (
              <button
                id="btn-nav-security"
                onClick={onOpenSecurityModal}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shadow-2xs border ${
                  isEncrypted
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    : 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
                title={isEncrypted ? 'AES-256 Vault Active & Encrypted at Rest' : 'Encrypt Clinic Database'}
              >
                {isEncrypted ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span>{isEncrypted ? 'AES-256' : 'Encrypt App'}</span>
              </button>
            )}

            {/* Quick Lock Button */}
            {isEncrypted && onLockNow && (
              <button
                id="btn-nav-lock"
                onClick={onLockNow}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                title="Lock Clinic Vault Now (Ctrl+L)"
              >
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Lock</span>
              </button>
            )}

            {onOpenRateCard && (
              <button
                id="btn-nav-rate-card"
                onClick={onOpenRateCard}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                title="View Standard Sitting Rates & Service Modes"
              >
                <Tag className="h-3.5 w-3.5 text-teal-600" />
                <span>Rate Card (₹)</span>
              </button>
            )}

            <button
              id="btn-new-patient"
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>New Patient</span>
            </button>

            <button
              id="btn-new-visit"
              onClick={onOpenNewVisit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Visit</span>
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              title="Reset to sample clinic data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 pt-2 pb-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-schedule"
            onClick={() => onTabChange('schedule')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'schedule'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Daily Itinerary</span>
          </button>

          <button
            id="tab-patients"
            onClick={() => onTabChange('patients')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'patients'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Patients & Progress</span>
          </button>

          <button
            id="tab-route"
            onClick={() => onTabChange('route')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'route'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Home Visit Routes</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => onTabChange('reports')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Daily Billing & Summary</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
