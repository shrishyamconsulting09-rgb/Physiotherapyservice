export type VisitType = 'home_visit' | 'clinic_visit' | 'tele_rehab';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'paid' | 'pending' | 'insurance_claim';

export type ServiceTier = 
  | 'online_standard'      // Video Assessment & Exercise Guidance (₹700)
  | 'clinic_standard'      // Standard Private Clinic Rate (₹800)
  | 'clinic_specialist'    // Hospital-Based / Specialist OPD (₹1,000)
  | 'home_tier2'          // Tier-2 Cities (e.g., Pune) (₹1,500)
  | 'home_metro';         // Metro Cities (e.g., Mumbai, Delhi, Bengaluru) (₹2,000)

export interface RateCardTier {
  id: ServiceTier;
  serviceMode: 'Online Mode' | 'Offline (In-Clinic / OPD)' | 'Offline (Home Visit)';
  subCategory: string;
  rate: number; // in INR (₹)
  visitType: VisitType;
  description: string;
  cityExample?: string;
}

export interface ExercisePrescription {
  id: string;
  name: string;
  sets: number;
  reps: number;
  holdSeconds?: number;
  frequency?: string; // e.g. "2x daily"
  instructions: string;
  completedInSession?: boolean;
}

export interface RangeOfMotionRecord {
  joint: string;
  movement: string; // e.g. "Flexion", "Extension", "Abduction"
  measuredDegrees: number;
  targetDegrees: number;
}

export interface SOAPNote {
  subjective: {
    painScoreNRS: number; // 0 to 10
    painDescription: string;
    patientFeedback: string;
    morningStiffnessMins: number;
  };
  objective: {
    romMeasurements: RangeOfMotionRecord[];
    manualMuscleGrade: string; // e.g. "Grade 4-/5"
    palpationFindings: string;
    gaitOrFunctionalNote: string;
  };
  assessment: {
    clinicalImpression: string;
    progressTrend: 'improving' | 'stable' | 'plateau' | 'flare-up';
    milestoneAchieved: string;
  };
  plan: {
    modalitiesUsed: string[]; // e.g. "Ultrasound 1MHz", "TENS (80Hz)", "Grade III Glenohumeral Glide", "Trigger Point Release"
    exercisesPerformed: ExercisePrescription[];
    homeExerciseProgram: string;
    rehabGoalNextSession: string;
    precautions: string;
  };
  completedTimestamp?: string;
  therapistNotes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 AM - 09:45 AM"
  type: VisitType;
  status: VisitStatus;
  location: string;
  travelDistanceKm?: number;
  estimatedTravelMins?: number;
  chiefComplaint: string;
  bodyRegion: 'Cervical Spine' | 'Lumbar Spine' | 'Shoulder' | 'Knee' | 'Hip' | 'Ankle & Foot' | 'Neurological' | 'Elbow & Wrist';
  sessionNumber: number;
  totalPrescribedSessions: number;
  sessionFee: number;
  serviceTier?: ServiceTier;
  paymentStatus: PaymentStatus;
  soapNote?: SOAPNote;
  timerDurationSeconds?: number;
  visitedAt?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  referringPhysician: string;
  diagnosis: string;
  bodyRegion: 'Cervical Spine' | 'Lumbar Spine' | 'Shoulder' | 'Knee' | 'Hip' | 'Ankle & Foot' | 'Neurological' | 'Elbow & Wrist';
  initialPainScore: number;
  currentPainScore: number;
  targetPainScore: number;
  totalPrescribedSessions: number;
  completedSessions: number;
  firstVisitDate: string;
  preferredVisitType: VisitType;
  medicalHistory: string[];
  activeTreatmentGoal: string;
  status: 'active' | 'discharged' | 'on_hold';
}
