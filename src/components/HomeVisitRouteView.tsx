import React from 'react';
import { Visit } from '../types';
import { 
  Car, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Phone, 
  AlertCircle,
  Calendar
} from 'lucide-react';

interface HomeVisitRouteViewProps {
  visits: Visit[];
  selectedDate: string;
  onOpenSoapModal: (visit: Visit) => void;
  onStatusChange: (visitId: string, status: Visit['status']) => void;
}

export const HomeVisitRouteView: React.FC<HomeVisitRouteViewProps> = ({
  visits,
  selectedDate,
  onOpenSoapModal,
  onStatusChange
}) => {
  const homeVisits = visits
    .filter(v => v.type === 'home_visit')
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const totalDistanceKm = homeVisits.reduce((acc, v) => acc + (v.travelDistanceKm || 0), 0);
  const totalTransitMins = homeVisits.reduce((acc, v) => acc + (v.estimatedTravelMins || 0), 0);
  const completedStops = homeVisits.filter(v => v.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Route Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Domiciliary Home Visits Route Planner
              </h2>
              <p className="text-xs text-slate-500">
                Optimized driving itinerary for home rehabilitation visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-blue-600" />
              <span>{homeVisits.length} Home Stops ({totalDistanceKm.toFixed(1)} km total)</span>
            </div>
            <div className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
              Est. Transit: ~{totalTransitMins} mins
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>Stops Completed: {completedStops} of {homeVisits.length}</span>
          <span className="font-semibold text-slate-800">
            {homeVisits.length > 0 ? Math.round((completedStops / homeVisits.length) * 100) : 0}% Done
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${homeVisits.length > 0 ? (completedStops / homeVisits.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Itinerary Stops */}
      {homeVisits.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          <Car className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-slate-700">No home visits scheduled for {selectedDate}.</p>
          <p className="text-slate-400 mt-1">Schedule a home visit by clicking &quot;New Visit&quot; and selecting Home Visit mode.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {homeVisits.map((visit, index) => {
            const isDone = visit.status === 'completed';
            const isInProgress = visit.status === 'in_progress';

            return (
              <div
                key={visit.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all ${
                  isInProgress
                    ? 'border-amber-400 ring-2 ring-amber-100 shadow-sm'
                    : isDone
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{visit.patientName}</h3>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {visit.bodyRegion}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{visit.chiefComplaint}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{visit.timeSlot}</span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.patientAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                    >
                      <span>Navigate</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Location and transit details */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{visit.patientAddress}</p>
                        <p className="text-slate-500 text-2xs mt-0.5">
                          Distance: <strong>{visit.travelDistanceKm} km</strong> &bull; Estimated driving time: ~{visit.estimatedTravelMins} mins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 pl-5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <a href={`tel:${visit.patientPhone}`} className="hover:underline text-teal-700 font-medium">
                        {visit.patientPhone}
                      </a>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2">
                    {visit.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          onStatusChange(visit.id, 'in_progress');
                          onOpenSoapModal(visit);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                      >
                        Arrived & Start
                      </button>
                    )}

                    {visit.status === 'in_progress' && (
                      <button
                        onClick={() => onOpenSoapModal(visit)}
                        className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                      >
                        Active Session Note
                      </button>
                    )}

                    {visit.status === 'completed' && (
                      <button
                        onClick={() => onOpenSoapModal(visit)}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Visit Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
