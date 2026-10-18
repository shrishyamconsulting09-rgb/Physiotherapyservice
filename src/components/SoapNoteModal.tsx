import React, { useState, useEffect } from 'react';
import { Visit, SOAPNote, RangeOfMotionRecord, ExercisePrescription } from '../types';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Dumbbell, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sparkles,
  Save,
  FileCheck
} from 'lucide-react';

interface SoapNoteModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVisit: Visit) => void;
}

const COMMON_MODALITIES = [
  'Cryotherapy (Cold Pack)',
  'Thermotherapy (Hot Pack)',
  'TENS (Transcutaneous Electrical Nerve Stimulation)',
  'IFT (Interferential Therapy)',
  'Therapeutic Ultrasound (1MHz / 3MHz)',
  'Grade II-III Joint Mobilization',
  'Myofascial Trigger Point Release',
  'Mechanical / Manual Traction',
  'Dry Needling',
  'Kinesiology Taping (K-Tape)',
  'NMES (Neuromuscular Stim)',
  'Pulsed Shortwave Diathermy'
];

export const SoapNoteModal: React.FC<SoapNoteModalProps> = ({
  visit,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  // Active Timer state
  const [seconds, setSeconds] = useState<number>(visit.timerDurationSeconds || 2400); // default 40 mins
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // SOAP State
  const initialSoap: SOAPNote = visit.soapNote || {
    subjective: {
      painScoreNRS: 4,
      painDescription: 'Aching during movement; relieved by rest.',
      patientFeedback: 'Exercised at home 2 times since previous visit.',
      morningStiffnessMins: 15
    },
    objective: {
      romMeasurements: [
        { joint: visit.bodyRegion, movement: 'Active Flexion', measuredDegrees: 90, targetDegrees: 120 }
      ],
      manualMuscleGrade: 'Grade 4/5 (Good resistance)',
      palpationFindings: 'Mild hypertonicity and local tenderness over muscle belly.',
      gaitOrFunctionalNote: 'Gait stable with mild antalgic compensation.'
    },
    assessment: {
      clinicalImpression: 'Positive response to manual therapy and eccentric loading. Neuromuscular control improving.',
      progressTrend: 'improving',
      milestoneAchieved: 'Tolerated functional progression without acute pain spike.'
    },
    plan: {
      modalitiesUsed: ['Thermotherapy (Hot Pack)', 'Grade II-III Joint Mobilization'],
      exercisesPerformed: [
        { id: '1', name: 'Isometric Contractions', sets: 3, reps: 10, instructions: 'Hold 5s each rep', completedInSession: true },
        { id: '2', name: 'Active Assisted Range Exercises', sets: 3, reps: 12, instructions: 'Smooth controlled movement', completedInSession: true }
      ],
      homeExerciseProgram: 'Continue prescribed exercises 2x daily. Apply cold/warm pack 15 mins post activity.',
      rehabGoalNextSession: 'Increase active range by 5-10 degrees; progress resistance load.',
      precautions: 'Avoid loaded end-range stress; notify therapist if pain exceeds 5/10.'
    }
  };

  const [soap, setSoap] = useState<SOAPNote>(initialSoap);
  const [activeTab, setActiveTab] = useState<'S' | 'O' | 'A' | 'P'>('S');

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Modality toggle
  const toggleModality = (modality: string) => {
    const current = soap.plan.modalitiesUsed;
    if (current.includes(modality)) {
      setSoap({
        ...soap,
        plan: {
          ...soap.plan,
          modalitiesUsed: current.filter(m => m !== modality)
        }
      });
    } else {
      setSoap({
        ...soap,
        plan: {
          ...soap.plan,
          modalitiesUsed: [...current, modality]
        }
      });
    }
  };

  // ROM Handlers
  const handleAddRom = () => {
    setSoap({
      ...soap,
      objective: {
        ...soap.objective,
        romMeasurements: [
          ...soap.objective.romMeasurements,
          { joint: visit.bodyRegion, movement: 'Movement', measuredDegrees: 0, targetDegrees: 90 }
        ]
      }
    });
  };

  const handleUpdateRom = (index: number, field: keyof RangeOfMotionRecord, value: any) => {
    const updated = [...soap.objective.romMeasurements];
    updated[index] = { ...updated[index], [field]: value };
    setSoap({
      ...soap,
      objective: {
        ...soap.objective,
        romMeasurements: updated
      }
    });
  };

  const handleDeleteRom = (index: number) => {
    setSoap({
      ...soap,
      objective: {
        ...soap.objective,
        romMeasurements: soap.objective.romMeasurements.filter((_, i) => i !== index)
      }
    });
  };

  // Exercise Handlers
  const handleAddExercise = () => {
    setSoap({
      ...soap,
      plan: {
        ...soap.plan,
        exercisesPerformed: [
          ...soap.plan.exercisesPerformed,
          {
            id: Date.now().toString(),
            name: 'New Exercise Drill',
            sets: 3,
            reps: 10,
            instructions: 'Smooth tempo',
            frequency: '2x/day',
            completedInSession: true
          }
        ]
      }
    });
  };

  const handleUpdateExercise = (index: number, field: keyof ExercisePrescription, value: any) => {
    const updated = [...soap.plan.exercisesPerformed];
    updated[index] = { ...updated[index], [field]: value };
    setSoap({
      ...soap,
      plan: {
        ...soap.plan,
        exercisesPerformed: updated
      }
    });
  };

  const handleDeleteExercise = (index: number) => {
    setSoap({
      ...soap,
      plan: {
        ...soap.plan,
        exercisesPerformed: soap.plan.exercisesPerformed.filter((_, i) => i !== index)
      }
    });
  };

  // Quick Clinical Presets
  const applyPreset = (type: 'knee' | 'spine' | 'shoulder' | 'neuro') => {
    if (type === 'knee') {
      setSoap({
        subjective: {
          painScoreNRS: 3,
          painDescription: 'Anterior joint line tightness after prolonged standing.',
          patientFeedback: 'Doing heel slides 3x daily. Swelling down noticeably.',
          morningStiffnessMins: 10
        },
        objective: {
          romMeasurements: [
            { joint: 'Knee', movement: 'Flexion', measuredDegrees: 105, targetDegrees: 120 },
            { joint: 'Knee', movement: 'Extension Lag', measuredDegrees: 0, targetDegrees: 0 }
          ],
          manualMuscleGrade: 'Quadriceps 4/5, Hamstrings 4/5',
          palpationFindings: 'Minimal effusion; incision clean without warmth.',
          gaitOrFunctionalNote: 'Reciprocal stair descent attempted with handrail support.'
        },
        assessment: {
          clinicalImpression: 'Steady progressive recovery. Patellofemoral mobility restoring smoothly.',
          progressTrend: 'improving',
          milestoneAchieved: 'Full zero-degree knee extension restored in terminal range.'
        },
        plan: {
          modalitiesUsed: ['Cryotherapy (Cold Pack)', 'Grade II-III Joint Mobilization'],
          exercisesPerformed: [
            { id: '1', name: 'Terminal Knee Extensions with Band', sets: 3, reps: 15, instructions: 'VMO squeeze 3s', frequency: '2x/day', completedInSession: true },
            { id: '2', name: 'Step-ups & Eccentric Lowering', sets: 3, reps: 10, instructions: 'Keep knee aligned with second toe', frequency: 'Daily', completedInSession: true }
          ],
          homeExerciseProgram: 'Continue ice 15 min after drills. Straight leg raises 3x15.',
          rehabGoalNextSession: 'Push active knee flexion to 110 degrees.',
          precautions: 'No deep squats beyond 90 degrees.'
        }
      });
    } else if (type === 'spine') {
      setSoap({
        subjective: {
          painScoreNRS: 2,
          painDescription: 'Aching localized to lower lumbar; no radiating leg pain.',
          patientFeedback: 'Sitting tolerance up to 45 minutes without sciatica flare.',
          morningStiffnessMins: 10
        },
        objective: {
          romMeasurements: [
            { joint: 'Lumbar Spine', movement: 'Extension', measuredDegrees: 25, targetDegrees: 30 },
            { joint: 'Lumbar Spine', movement: 'Flexion', measuredDegrees: 60, targetDegrees: 75 }
          ],
          manualMuscleGrade: 'Core Transversus Abdominis 4/5',
          palpationFindings: 'Softening of lumbar paraspinal trigger points.',
          gaitOrFunctionalNote: 'Erect posture maintained without antalgic list.'
        },
        assessment: {
          clinicalImpression: 'Complete centralization of nerve root compression.',
          progressTrend: 'improving',
          milestoneAchieved: 'Full pain-free extension in prone position achieved.'
        },
        plan: {
          modalitiesUsed: ['Thermotherapy (Hot Pack)', 'Mechanical / Manual Traction', 'IFT (Interferential Therapy)'],
          exercisesPerformed: [
            { id: '3', name: 'McKenzie Prone Press-ups', sets: 3, reps: 10, instructions: 'Exhale at top', frequency: 'Every 3 hours', completedInSession: true },
            { id: '4', name: 'Bird-Dog Stability', sets: 3, reps: 10, instructions: 'Zero pelvis rotation', frequency: '2x/day', completedInSession: true }
          ],
          homeExerciseProgram: 'Perform 10 press-ups after every prolonged sitting session.',
          rehabGoalNextSession: 'Advance to quadruped dead-bugs and hip hinges.',
          precautions: 'Avoid heavy spinal loading in forward flexion.'
        }
      });
    } else if (type === 'shoulder') {
      setSoap({
        subjective: {
          painScoreNRS: 3,
          painDescription: 'Catching pain at 90-110° abduction; resting comfortable.',
          patientFeedback: 'Can put on coat without sharp jolt now.',
          morningStiffnessMins: 5
        },
        objective: {
          romMeasurements: [
            { joint: 'Shoulder', movement: 'Abduction', measuredDegrees: 145, targetDegrees: 170 },
            { joint: 'Shoulder', movement: 'External Rotation', measuredDegrees: 60, targetDegrees: 80 }
          ],
          manualMuscleGrade: 'Infraspinatus 4-/5, Serratus Anterior 4/5',
          palpationFindings: 'Subacromial tenderness upon Hawkins-Kennedy provocation.',
          gaitOrFunctionalNote: 'Scapulohumeral rhythm improving, less winging during eccentric lowering.'
        },
        assessment: {
          clinicalImpression: 'Resolving subacromial impingement; rotator cuff strength gains evident.',
          progressTrend: 'improving',
          milestoneAchieved: 'Pain-free reach behind back (T10 level reached).'
        },
        plan: {
          modalitiesUsed: ['Therapeutic Ultrasound (1MHz / 3MHz)', 'Grade II-III Joint Mobilization', 'Kinesiology Taping (K-Tape)'],
          exercisesPerformed: [
            { id: '5', name: 'Side-lying External Rotation with 2kg Dumbbell', sets: 3, reps: 12, instructions: 'Elbow pinned to towel roll', frequency: 'Daily', completedInSession: true },
            { id: '6', name: 'Serratus Wall Slides with Band', sets: 3, reps: 10, instructions: 'Push into wall at top', frequency: '2x/day', completedInSession: true }
          ],
          homeExerciseProgram: 'Sleeper stretch 3x30s. Rotator cuff resistance tubing drills.',
          rehabGoalNextSession: 'Introduce overhead kettlebell bottoms-up carries.',
          precautions: 'Avoid sudden ballistic overhead throwing motions.'
        }
      });
    } else {
      setSoap({
        subjective: {
          painScoreNRS: 1,
          painDescription: 'Fatigue in paretic leg after 15 minutes continuous standing.',
          patientFeedback: 'Walked to kitchen independently using quad cane yesterday.',
          morningStiffnessMins: 20
        },
        objective: {
          romMeasurements: [
            { joint: 'Ankle', movement: 'Dorsiflexion', measuredDegrees: 8, targetDegrees: 15 }
          ],
          manualMuscleGrade: 'Tibialis Anterior 3/5, Hip Abductors 3+/5',
          palpationFindings: 'Mild gastrocnemius tone (Modified Ashworth 1).',
          gaitOrFunctionalNote: 'Step length increased by 10cm; foot clearance adequate with AFO.'
        },
        assessment: {
          clinicalImpression: 'Neuro-plastic gait adaptation continuing favorably. Dynamic balance scores improving.',
          progressTrend: 'improving',
          milestoneAchieved: 'Independent transfer from wheelchair to mat table accomplished.'
        },
        plan: {
          modalitiesUsed: ['NMES (Neuromuscular Stim)', 'Myofascial Trigger Point Release'],
          exercisesPerformed: [
            { id: '7', name: 'Weight Shift & Step-Forward Drills in Parallel Bars', sets: 4, reps: 10, instructions: 'Encourage weight bearing on affected heel', frequency: 'Daily', completedInSession: true },
            { id: '8', name: 'Sit-to-Stand from 18-inch Chair without Arms', sets: 3, reps: 8, instructions: 'Equal hip alignment', frequency: '2x/day', completedInSession: true }
          ],
          homeExerciseProgram: 'Caregiver-assisted seated ankle pumps and standing balance drills.',
          rehabGoalNextSession: 'Challenge uneven surface walking on foam mat.',
          precautions: 'Fall risk precautions: caregiver supervision mandatory on stairs.'
        }
      });
    }
  };

  const handleSaveAndComplete = () => {
    const updated: Visit = {
      ...visit,
      status: 'completed',
      timerDurationSeconds: seconds,
      soapNote: {
        ...soap,
        completedTimestamp: new Date().toISOString()
      }
    };
    onSave(updated);
    onClose();
  };

  const handleSaveDraft = () => {
    const updated: Visit = {
      ...visit,
      timerDurationSeconds: seconds,
      soapNote: soap
    };
    onSave(updated);
    onClose();
  };

  // Pain color helper
  const getPainColor = (score: number) => {
    if (score <= 2) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score <= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-lg text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{visit.patientName}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Session #{visit.sessionNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900 text-teal-200 border border-teal-700">
                  {visit.bodyRegion}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {visit.type === 'home_visit' ? 'Domiciliary Home Visit' : visit.type === 'tele_rehab' ? 'Tele-Rehabilitation' : 'In-Clinic Rehabilitation'} &bull; {visit.timeSlot}
              </p>
            </div>
          </div>

          {/* Session Stopwatch / Timer */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="h-4 w-4 text-teal-400" />
            <span className="font-mono text-sm font-bold text-slate-100">{formatTimer(seconds)}</span>
            <button
              id="btn-timer-toggle"
              onClick={() => setTimerRunning(!timerRunning)}
              className={`p-1 rounded-md transition-colors ${
                timerRunning ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
              }`}
              title={timerRunning ? 'Pause Session Timer' : 'Start Session Timer'}
            >
              {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              id="btn-timer-reset"
              onClick={() => { setTimerRunning(false); setSeconds(0); }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200"
              title="Reset Timer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          <button
            id="btn-close-soap-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-3"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Preset Quick Fill Bar */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Fast Charting Templates:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="preset-knee"
              onClick={() => applyPreset('knee')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-colors"
            >
              Knee (ACL/TKA)
            </button>
            <button
              id="preset-spine"
              onClick={() => applyPreset('spine')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-colors"
            >
              Lumbar Disc / Spine
            </button>
            <button
              id="preset-shoulder"
              onClick={() => applyPreset('shoulder')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-colors"
            >
              Shoulder Impingement
            </button>
            <button
              id="preset-neuro"
              onClick={() => applyPreset('neuro')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-colors"
            >
              Neuro / Stroke
            </button>
          </div>
        </div>

        {/* SOAP Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2">
          <button
            id="tab-soap-s"
            onClick={() => setActiveTab('S')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'S'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            S - Subjective
          </button>
          <button
            id="tab-soap-o"
            onClick={() => setActiveTab('O')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'O'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            O - Objective (ROM/MMT)
          </button>
          <button
            id="tab-soap-a"
            onClick={() => setActiveTab('A')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'A'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            A - Clinical Assessment
          </button>
          <button
            id="tab-soap-p"
            onClick={() => setActiveTab('P')}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'P'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            P - Plan & Exercises
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB S: SUBJECTIVE */}
          {activeTab === 'S' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="pain-score-slider" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Numeric Pain Rating Scale (NRS 0 - 10)
                  </label>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getPainColor(soap.subjective.painScoreNRS)}`}>
                    {soap.subjective.painScoreNRS} / 10 &bull; {
                      soap.subjective.painScoreNRS === 0 ? 'No Pain' :
                      soap.subjective.painScoreNRS <= 3 ? 'Mild Discomfort' :
                      soap.subjective.painScoreNRS <= 6 ? 'Moderate Pain' :
                      soap.subjective.painScoreNRS <= 8 ? 'Severe Pain' : 'Extreme / Debilitating'
                    }
                  </span>
                </div>
                <input
                  id="pain-score-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={soap.subjective.painScoreNRS}
                  onChange={(e) => setSoap({
                    ...soap,
                    subjective: { ...soap.subjective, painScoreNRS: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-2xs text-slate-400 mt-1.5 font-medium px-1">
                  <span>0 (Zero)</span>
                  <span>2 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>7 (Severe)</span>
                  <span>10 (Worst)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-morning-stiffness" className="block text-xs font-bold text-slate-700 mb-1">
                    Morning Stiffness (Minutes)
                  </label>
                  <input
                    id="input-morning-stiffness"
                    type="number"
                    value={soap.subjective.morningStiffnessMins}
                    onChange={(e) => setSoap({
                      ...soap,
                      subjective: { ...soap.subjective, morningStiffnessMins: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="input-pain-description" className="block text-xs font-bold text-slate-700 mb-1">
                    Pain Characteristics & Aggravating Factors
                  </label>
                  <input
                    id="input-pain-description"
                    type="text"
                    value={soap.subjective.painDescription}
                    onChange={(e) => setSoap({
                      ...soap,
                      subjective: { ...soap.subjective, painDescription: e.target.value }
                    })}
                    placeholder="e.g., Aching, sharp catching during flexion, burning..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="textarea-patient-feedback" className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Self-Reported Feedback / Activities Since Last Visit
                </label>
                <textarea
                  id="textarea-patient-feedback"
                  rows={3}
                  value={soap.subjective.patientFeedback}
                  onChange={(e) => setSoap({
                    ...soap,
                    subjective: { ...soap.subjective, patientFeedback: e.target.value }
                  })}
                  placeholder="Patient reports adherence to home exercises, changes in sleep, work posture tolerance..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB O: OBJECTIVE */}
          {activeTab === 'O' && (
            <div className="space-y-4">
              {/* Range of Motion Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Range of Motion (Goniometry in Degrees)
                    </h3>
                  </div>
                  <button
                    id="btn-add-rom"
                    onClick={handleAddRom}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-white px-2.5 py-1 rounded-md border border-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Joint Movement
                  </button>
                </div>

                <div className="space-y-2">
                  {soap.objective.romMeasurements.map((rom, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={rom.joint}
                          onChange={(e) => handleUpdateRom(idx, 'joint', e.target.value)}
                          placeholder="Joint (e.g. Knee)"
                          className="w-full p-1.5 rounded border border-slate-200 font-medium text-slate-800"
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={rom.movement}
                          onChange={(e) => handleUpdateRom(idx, 'movement', e.target.value)}
                          placeholder="Movement (e.g. Flexion)"
                          className="w-full p-1.5 rounded border border-slate-200 text-slate-700"
                        />
                      </div>
                      <div className="w-24">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={rom.measuredDegrees}
                            onChange={(e) => handleUpdateRom(idx, 'measuredDegrees', parseInt(e.target.value) || 0)}
                            className="w-full p-1.5 rounded border border-slate-200 font-bold text-slate-900"
                          />
                          <span className="text-slate-500 font-medium">°</span>
                        </div>
                      </div>
                      <div className="w-24 text-slate-500 flex items-center gap-1">
                        <span className="text-2xs">Target:</span>
                        <input
                          type="number"
                          value={rom.targetDegrees}
                          onChange={(e) => handleUpdateRom(idx, 'targetDegrees', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 rounded border border-slate-200 text-slate-700"
                        />
                        <span className="text-slate-500 font-medium">°</span>
                      </div>
                      <button
                        onClick={() => handleDeleteRom(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove ROM test"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-mmt-grade" className="block text-xs font-bold text-slate-700 mb-1">
                    Manual Muscle Strength (MMT / Oxford Scale)
                  </label>
                  <input
                    id="input-mmt-grade"
                    type="text"
                    value={soap.objective.manualMuscleGrade}
                    onChange={(e) => setSoap({
                      ...soap,
                      objective: { ...soap.objective, manualMuscleGrade: e.target.value }
                    })}
                    placeholder="e.g., Grade 4+/5 Quadriceps, Grade 3/5 Tibialis Anterior"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="input-palpation" className="block text-xs font-bold text-slate-700 mb-1">
                    Palpation & Soft Tissue Findings
                  </label>
                  <input
                    id="input-palpation"
                    type="text"
                    value={soap.objective.palpationFindings}
                    onChange={(e) => setSoap({
                      ...soap,
                      objective: { ...soap.objective, palpationFindings: e.target.value }
                    })}
                    placeholder="e.g., Grade 1 effusion, trigger points in upper traps, scar mobility"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="textarea-gait" className="block text-xs font-bold text-slate-700 mb-1">
                  Functional Movement & Gait Observations
                </label>
                <textarea
                  id="textarea-gait"
                  rows={2}
                  value={soap.objective.gaitOrFunctionalNote}
                  onChange={(e) => setSoap({
                    ...soap,
                    objective: { ...soap.objective, gaitOrFunctionalNote: e.target.value }
                  })}
                  placeholder="Gait patterns, cadence, balance stance, transfers, special orthopedic tests performed..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB A: ASSESSMENT */}
          {activeTab === 'A' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="select-progress-trend" className="block text-xs font-bold text-slate-700 mb-2">
                  Clinical Recovery Trajectory
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['improving', 'stable', 'plateau', 'flare-up'] as const).map(trend => (
                    <button
                      key={trend}
                      type="button"
                      onClick={() => setSoap({
                        ...soap,
                        assessment: { ...soap.assessment, progressTrend: trend }
                      })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all text-center ${
                        soap.assessment.progressTrend === trend
                          ? trend === 'improving'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : trend === 'stable'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : trend === 'plateau'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="textarea-clinical-impression" className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Impression & Functional Progress
                </label>
                <textarea
                  id="textarea-clinical-impression"
                  rows={3}
                  value={soap.assessment.clinicalImpression}
                  onChange={(e) => setSoap({
                    ...soap,
                    assessment: { ...soap.assessment, clinicalImpression: e.target.value }
                  })}
                  placeholder="Therapist analysis of response to therapy, tissue healing stage, functional barrier analysis..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="input-milestone" className="block text-xs font-bold text-slate-700 mb-1">
                  Rehabilitation Milestone Achieved
                </label>
                <input
                  id="input-milestone"
                  type="text"
                  value={soap.assessment.milestoneAchieved}
                  onChange={(e) => setSoap({
                    ...soap,
                    assessment: { ...soap.assessment, milestoneAchieved: e.target.value }
                  })}
                  placeholder="e.g., Unassisted stair climb, full overhead abduction, 20m unassisted walking"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB P: PLAN & EXERCISES */}
          {activeTab === 'P' && (
            <div className="space-y-4">
              {/* Modalities Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Physiotherapy Modalities & Manual Techniques Applied
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_MODALITIES.map(modality => {
                    const isSelected = soap.plan.modalitiesUsed.includes(modality);
                    return (
                      <button
                        key={modality}
                        type="button"
                        onClick={() => toggleModality(modality)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{modality}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Therapeutic Exercises Log */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-teal-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Therapeutic Exercises Conducted in Session
                    </h3>
                  </div>
                  <button
                    id="btn-add-exercise"
                    onClick={handleAddExercise}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-white px-2.5 py-1 rounded-md border border-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-2">
                  {soap.plan.exercisesPerformed.map((ex, idx) => (
                    <div key={ex.id || idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                          placeholder="Exercise Name"
                          className="w-full p-1.5 rounded border border-slate-200 font-semibold text-slate-800"
                        />
                      </div>
                      <div className="w-16">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                            className="w-full p-1.5 rounded border border-slate-200 text-center font-bold"
                          />
                          <span className="text-2xs text-slate-400">sets</span>
                        </div>
                      </div>
                      <div className="w-16">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full p-1.5 rounded border border-slate-200 text-center font-bold"
                          />
                          <span className="text-2xs text-slate-400">reps</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={ex.instructions}
                          onChange={(e) => handleUpdateExercise(idx, 'instructions', e.target.value)}
                          placeholder="Instructions / hold time / tempo"
                          className="w-full p-1.5 rounded border border-slate-200 text-slate-600 text-2xs"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteExercise(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove exercise"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Exercise Program (HEP) */}
              <div>
                <label htmlFor="textarea-hep" className="block text-xs font-bold text-slate-700 mb-1">
                  Home Exercise Program (HEP) & Patient Self-Care Instructions
                </label>
                <textarea
                  id="textarea-hep"
                  rows={2}
                  value={soap.plan.homeExerciseProgram}
                  onChange={(e) => setSoap({
                    ...soap,
                    plan: { ...soap.plan, homeExerciseProgram: e.target.value }
                  })}
                  placeholder="Specific exercises and daily frequency prescribed for home..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-rehab-goal" className="block text-xs font-bold text-slate-700 mb-1">
                    Target Focus for Next Session
                  </label>
                  <input
                    id="input-rehab-goal"
                    type="text"
                    value={soap.plan.rehabGoalNextSession}
                    onChange={(e) => setSoap({
                      ...soap,
                      plan: { ...soap.plan, rehabGoalNextSession: e.target.value }
                    })}
                    placeholder="e.g., Progress to closed kinetic chain; advance gait speed"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="input-precautions" className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Precautions & Red Flags
                  </label>
                  <input
                    id="input-precautions"
                    type="text"
                    value={soap.plan.precautions}
                    onChange={(e) => setSoap({
                      ...soap,
                      plan: { ...soap.plan, precautions: e.target.value }
                    })}
                    placeholder="e.g., Avoid weightbearing past 50%; watch for calf pain/edema"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Patient:</span> {visit.patientName} &bull; {visit.date}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-save-draft"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Save className="h-3.5 w-3.5 inline mr-1" />
              Save Draft
            </button>

            <button
              id="btn-complete-session"
              onClick={handleSaveAndComplete}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete & Sign Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
