import { Patient, Visit } from '../types';
import { getTodayDateString, addDaysToDate } from '../utils/dateUtils';

const today = getTodayDateString();
const yesterday = addDaysToDate(today, -1);
const tomorrow = addDaysToDate(today, 1);
const inTwoDays = addDaysToDate(today, 2);

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Eleanor Vance',
    age: 64,
    gender: 'Female',
    phone: '+1 (555) 234-8910',
    email: 'eleanor.vance@example.com',
    address: '742 Evergreen Terrace, West End',
    emergencyContact: 'Thomas Vance (Son) - 555-019-4421',
    referringPhysician: 'Dr. Sarah Lin (Orthopedics)',
    diagnosis: 'Right Total Knee Arthroplasty (TKA) Post-Op Day 24',
    bodyRegion: 'Knee',
    initialPainScore: 8,
    currentPainScore: 4,
    targetPainScore: 1,
    totalPrescribedSessions: 16,
    completedSessions: 6,
    firstVisitDate: '2026-08-16',
    preferredVisitType: 'home_visit',
    medicalHistory: ['Hypertension', 'Mild Osteoporosis', 'Right TKA Aug 2026'],
    activeTreatmentGoal: 'Achieve 110° active knee flexion, unassisted reciprocal stair climbing, independent ambulation without cane.',
    status: 'active'
  },
  {
    id: 'pat-2',
    name: 'Marcus Thorne',
    age: 38,
    gender: 'Male',
    phone: '+1 (555) 871-3329',
    email: 'm.thorne.eng@example.com',
    address: '1204 Pine Ridge Avenue, Suite 4B',
    emergencyContact: 'Rachel Thorne (Spouse) - 555-871-3328',
    referringPhysician: 'Dr. Michael Chen (Neurology)',
    diagnosis: 'L5-S1 Lumbar Disc Herniation with Right Sciatic Radiculopathy',
    bodyRegion: 'Lumbar Spine',
    initialPainScore: 9,
    currentPainScore: 3,
    targetPainScore: 0,
    totalPrescribedSessions: 12,
    completedSessions: 8,
    firstVisitDate: '2026-08-10',
    preferredVisitType: 'clinic_visit',
    medicalHistory: ['Sedentary Desk Job', 'No surgical history'],
    activeTreatmentGoal: 'Centralize peripheral radiation; restore pain-free lumbar flexion and sitting tolerance up to 60 mins.',
    status: 'active'
  },
  {
    id: 'pat-3',
    name: 'Sofia Rodriguez',
    age: 29,
    gender: 'Female',
    phone: '+1 (555) 443-7801',
    email: 'sofia.crossfit@example.com',
    address: '380 Ocean View Blvd, Apt 12',
    emergencyContact: 'Carlos Rodriguez (Father) - 555-443-7800',
    referringPhysician: 'Self-referred / Sports Clinic',
    diagnosis: 'Left Shoulder Subacromial Impingement & Supraspinatus Tendinopathy',
    bodyRegion: 'Shoulder',
    initialPainScore: 7,
    currentPainScore: 2,
    targetPainScore: 0,
    totalPrescribedSessions: 10,
    completedSessions: 5,
    firstVisitDate: '2026-08-20',
    preferredVisitType: 'clinic_visit',
    medicalHistory: ['Recreational Crossfit athlete', 'Mild Glenohumeral Laxity'],
    activeTreatmentGoal: 'Pain-free active shoulder abduction > 160°; rotator cuff endurance without painful arc.',
    status: 'active'
  },
  {
    id: 'pat-4',
    name: 'Arthur Pendelton',
    age: 72,
    gender: 'Male',
    phone: '+1 (555) 902-1144',
    email: 'arthur.p@example.com',
    address: '512 Maple Court, Maplewood Retirement Park',
    emergencyContact: 'Helen Pendelton (Daughter) - 555-902-1150',
    referringPhysician: 'Dr. Gregory House (Neurology)',
    diagnosis: 'Post-Ischemic Stroke Right Hemiparesis & Balance Impairment',
    bodyRegion: 'Neurological',
    initialPainScore: 4,
    currentPainScore: 2,
    targetPainScore: 0,
    totalPrescribedSessions: 24,
    completedSessions: 14,
    firstVisitDate: '2026-07-28',
    preferredVisitType: 'home_visit',
    medicalHistory: ['Ischemic Stroke (Left MCA)', 'Type 2 Diabetes', 'Dyslipidemia'],
    activeTreatmentGoal: 'Safe transfers bed-to-chair independently; improve Berg Balance Score from 38 to >46.',
    status: 'active'
  },
  {
    id: 'pat-5',
    name: 'Liam Chen',
    age: 22,
    gender: 'Male',
    phone: '+1 (555) 678-2299',
    email: 'liam.chen.uni@example.com',
    address: '89 University Way, Apt 304',
    emergencyContact: 'Karen Chen (Mother) - 555-678-2290',
    referringPhysician: 'Dr. Robert Vance (Sports Orthopedics)',
    diagnosis: 'Right ACL Reconstruction (Hamstring Autograft) - Rehab Week 9',
    bodyRegion: 'Knee',
    initialPainScore: 6,
    currentPainScore: 1,
    targetPainScore: 0,
    totalPrescribedSessions: 20,
    completedSessions: 11,
    firstVisitDate: '2026-08-01',
    preferredVisitType: 'clinic_visit',
    medicalHistory: ['University soccer athlete', 'Right lateral meniscus repair concurrently'],
    activeTreatmentGoal: 'Y-Balance test symmetry > 90%; quad peak torque index > 80% prior to return-to-run phase.',
    status: 'active'
  },
  {
    id: 'pat-6',
    name: 'Maya Patel',
    age: 45,
    gender: 'Female',
    phone: '+1 (555) 312-9988',
    email: 'maya.patel@designstudio.com',
    address: '14 Highland Drive',
    emergencyContact: 'Dev Patel (Spouse) - 555-312-9989',
    referringPhysician: 'Dr. Anita Desai (Spine Specialist)',
    diagnosis: 'Cervical Spondylosis with C6 Radiculopathy & Upper Trapezius Spasm',
    bodyRegion: 'Cervical Spine',
    initialPainScore: 8,
    currentPainScore: 3,
    targetPainScore: 1,
    totalPrescribedSessions: 10,
    completedSessions: 4,
    firstVisitDate: '2026-08-25',
    preferredVisitType: 'tele_rehab',
    medicalHistory: ['Chronic tech neck', 'Migraines associated with cervical triggers'],
    activeTreatmentGoal: 'Full cervical rotation without radicular parasthesias; postural endurance > 45 mins.',
    status: 'active'
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: 'vis-101',
    patientId: 'pat-1',
    patientName: 'Eleanor Vance',
    patientPhone: '+1 (555) 234-8910',
    patientAddress: '742 Evergreen Terrace, West End',
    patientAge: 64,
    patientGender: 'Female',
    date: today,
    timeSlot: '08:30 AM - 09:30 AM',
    type: 'home_visit',
    status: 'completed',
    location: 'Patient Residence (Home Visit)',
    travelDistanceKm: 6.4,
    estimatedTravelMins: 18,
    chiefComplaint: 'Post-Op Knee Stiffness & Quadriceps Lag upon standing',
    bodyRegion: 'Knee',
    sessionNumber: 6,
    totalPrescribedSessions: 16,
    sessionFee: 1500,
    serviceTier: 'home_tier2',
    paymentStatus: 'paid',
    visitedAt: '08:32 AM',
    soapNote: {
      subjective: {
        painScoreNRS: 4,
        painDescription: 'Aching anterior knee after 20 mins walking; morning stiffness around 15 minutes.',
        patientFeedback: 'Slept better last night. Able to bend knee enough to sit comfortably in dining chair.',
        morningStiffnessMins: 15
      },
      objective: {
        romMeasurements: [
          { joint: 'Right Knee', movement: 'Flexion (Passive)', measuredDegrees: 98, targetDegrees: 110 },
          { joint: 'Right Knee', movement: 'Extension Lag', measuredDegrees: 5, targetDegrees: 0 }
        ],
        manualMuscleGrade: 'Quadriceps 3+/5, Hamstrings 4/5',
        palpationFindings: 'Mild suprapatellar effusion grade 1. Incision well-healed, no erythema.',
        gaitOrFunctionalNote: 'Gait with single point cane shows reduced antalgic limp. Cadence 72 steps/min.'
      },
      assessment: {
        clinicalImpression: 'Excellent post-operative progress. ROM flexion gained 8° since visit #4.',
        progressTrend: 'improving',
        milestoneAchieved: 'Tolerated full straight leg raise without extensor lag for 10 reps.'
      },
      plan: {
        modalitiesUsed: ['Cryo-compression 15 mins', 'Patellar Mobilization Grade II-III inferior glides'],
        exercisesPerformed: [
          { id: 'ex-1', name: 'Seated Active-Assisted Knee Flexion with Towel', sets: 3, reps: 12, instructions: 'Hold end range for 5s' },
          { id: 'ex-2', name: 'Terminal Knee Extension in standing with theraband', sets: 3, reps: 15, instructions: 'Focus on VMO contraction' },
          { id: 'ex-3', name: 'Step-ups on 4-inch block', sets: 2, reps: 10, instructions: 'Eccentric control lowering' }
        ],
        homeExerciseProgram: 'Continue ice 3x daily post exercises. Perform heel slides and quad sets every 3 hours.',
        rehabGoalNextSession: 'Push active knee flexion past 102 degrees; initiate mini squats.',
        precautions: 'Monitor for calf swelling (DVT rule out); avoid high impact loads.'
      }
    }
  },
  {
    id: 'vis-102',
    patientId: 'pat-2',
    patientName: 'Marcus Thorne',
    patientPhone: '+1 (555) 871-3329',
    patientAddress: '1204 Pine Ridge Avenue, Suite 4B',
    patientAge: 38,
    patientGender: 'Male',
    date: today,
    timeSlot: '10:00 AM - 10:45 AM',
    type: 'clinic_visit',
    status: 'in_progress',
    location: 'Main Clinic - Treatment Bay 2',
    chiefComplaint: 'L5-S1 Disc Herniation - Lingering right lateral calf tingling',
    bodyRegion: 'Lumbar Spine',
    sessionNumber: 8,
    totalPrescribedSessions: 12,
    sessionFee: 800,
    serviceTier: 'clinic_standard',
    paymentStatus: 'paid',
    visitedAt: '10:02 AM',
    soapNote: {
      subjective: {
        painScoreNRS: 3,
        painDescription: 'Tingling centralized from lateral calf to gluteal fold. No numbness.',
        patientFeedback: 'Standing desk setup at work made a huge difference.',
        morningStiffnessMins: 10
      },
      objective: {
        romMeasurements: [
          { joint: 'Lumbar Spine', movement: 'Extension in Prone', measuredDegrees: 25, targetDegrees: 30 },
          { joint: 'Right Hip', movement: 'Straight Leg Raise (SLR)', measuredDegrees: 70, targetDegrees: 80 }
        ],
        manualMuscleGrade: 'Extensor Hallucis Longus (EHL) 5/5, Peroneals 5/5',
        palpationFindings: 'Mild hypertonicity in right quadratus lumborum & piriformis.',
        gaitOrFunctionalNote: 'Normal heel-to-toe gait without drop-foot or guarded posture.'
      },
      assessment: {
        clinicalImpression: 'Successful centralization of radicular symptoms. Core stability progressing.',
        progressTrend: 'improving',
        milestoneAchieved: 'Negative slump test with sensitized cervical flexion.'
      },
      plan: {
        modalitiesUsed: ['Lumbar Traction with gentle mechanical decompression', 'IFT 4-pole 80-100Hz'],
        exercisesPerformed: [
          { id: 'ex-4', name: 'McKenzie Prone Press-ups', sets: 3, reps: 10, instructions: 'Breathe out at apex' },
          { id: 'ex-5', name: 'Bird-Dog Quadruped with 3s hold', sets: 3, reps: 10, instructions: 'Keep pelvis level' },
          { id: 'ex-6', name: 'Pelvic Bridging with adductor squeeze', sets: 3, reps: 12, instructions: 'Neutral lumbar spine' }
        ],
        homeExerciseProgram: 'McKenzie press-ups every 2 hours if prolonged sitting occurs.',
        rehabGoalNextSession: 'Introduce dead-bug progression and light resisted hip hinge.',
        precautions: 'Avoid loaded end-range lumbar flexion and prolonged slumped seating.'
      }
    }
  },
  {
    id: 'vis-103',
    patientId: 'pat-3',
    patientName: 'Sofia Rodriguez',
    patientPhone: '+1 (555) 443-7801',
    patientAddress: '380 Ocean View Blvd, Apt 12',
    patientAge: 29,
    patientGender: 'Female',
    date: today,
    timeSlot: '11:30 AM - 12:15 PM',
    type: 'clinic_visit',
    status: 'scheduled',
    location: 'Main Clinic - Sports Rehab Area',
    chiefComplaint: 'Supraspinatus Tendinopathy - Painful Arc during overhead reach',
    bodyRegion: 'Shoulder',
    sessionNumber: 5,
    totalPrescribedSessions: 10,
    sessionFee: 1000,
    serviceTier: 'clinic_specialist',
    paymentStatus: 'pending'
  },
  {
    id: 'vis-104',
    patientId: 'pat-4',
    patientName: 'Arthur Pendelton',
    patientPhone: '+1 (555) 902-1144',
    patientAddress: '512 Maple Court, Maplewood Retirement Park',
    patientAge: 72,
    patientGender: 'Male',
    date: today,
    timeSlot: '02:00 PM - 03:00 PM',
    type: 'home_visit',
    status: 'scheduled',
    location: 'Patient Residence (Home Visit)',
    travelDistanceKm: 9.8,
    estimatedTravelMins: 22,
    chiefComplaint: 'Post-Stroke Hemiparesis - Dynamic balance and sit-to-stand training',
    bodyRegion: 'Neurological',
    sessionNumber: 14,
    totalPrescribedSessions: 24,
    sessionFee: 2000,
    serviceTier: 'home_metro',
    paymentStatus: 'insurance_claim'
  },
  {
    id: 'vis-105',
    patientId: 'pat-6',
    patientName: 'Maya Patel',
    patientPhone: '+1 (555) 312-9988',
    patientAddress: '14 Highland Drive',
    patientAge: 45,
    patientGender: 'Female',
    date: today,
    timeSlot: '04:15 PM - 05:00 PM',
    type: 'tele_rehab',
    status: 'scheduled',
    location: 'Tele-Rehab Video Room 1',
    chiefComplaint: 'Cervical Radiculopathy & Postural Muscle Strain review',
    bodyRegion: 'Cervical Spine',
    sessionNumber: 4,
    totalPrescribedSessions: 10,
    sessionFee: 700,
    serviceTier: 'online_standard',
    paymentStatus: 'pending'
  },
  // Yesterday's completed visit
  {
    id: 'vis-099',
    patientId: 'pat-5',
    patientName: 'Liam Chen',
    patientPhone: '+1 (555) 678-2299',
    patientAddress: '89 University Way, Apt 304',
    patientAge: 22,
    patientGender: 'Male',
    date: yesterday,
    timeSlot: '03:00 PM - 04:00 PM',
    type: 'clinic_visit',
    status: 'completed',
    location: 'Main Clinic - Gym & Agility Bay',
    chiefComplaint: 'ACL Reconstruction (Week 8) - Quad activation & proprioceptive drills',
    bodyRegion: 'Knee',
    sessionNumber: 11,
    totalPrescribedSessions: 20,
    sessionFee: 1000,
    serviceTier: 'clinic_specialist',
    paymentStatus: 'paid',
    visitedAt: '03:02 PM',
    soapNote: {
      subjective: {
        painScoreNRS: 1,
        painDescription: 'Minimal soreness only after 30 mins stationary bike.',
        patientFeedback: 'Confidence returning. No feelings of knee giving way.',
        morningStiffnessMins: 5
      },
      objective: {
        romMeasurements: [
          { joint: 'Right Knee', movement: 'Full Extension', measuredDegrees: 0, targetDegrees: 0 },
          { joint: 'Right Knee', movement: 'Flexion', measuredDegrees: 130, targetDegrees: 135 }
        ],
        manualMuscleGrade: 'Quadriceps 4+/5, Hamstrings 4+/5',
        palpationFindings: 'No effusion, Lachman test solid end-point.',
        gaitOrFunctionalNote: 'Normal running gait pattern on treadmill at 6.0 km/h for 4 mins warm-up.'
      },
      assessment: {
        clinicalImpression: 'Graft integration solid. Ready for phased dynamic lateral cutting introduction next week.',
        progressTrend: 'improving',
        milestoneAchieved: 'Single-leg hop test symmetry index reached 84%.'
      },
      plan: {
        modalitiesUsed: ['Neuromuscular Electrical Stimulation (NMES) on VMO during leg press'],
        exercisesPerformed: [
          { id: 'ex-7', name: 'Barbell Box Squats (50kg)', sets: 4, reps: 8, instructions: 'Equal weight distribution' },
          { id: 'ex-8', name: 'Single-leg Romanian Deadlifts with Kettlebell', sets: 3, reps: 10, instructions: 'Control hip drop' },
          { id: 'ex-9', name: 'BOSU Ball Dynamic Balance Catch Drill', sets: 3, reps: 15, instructions: 'React to weighted ball' }
        ],
        homeExerciseProgram: 'Daily hamstring stretching and calf raises. Stationary cycling 25 mins.',
        rehabGoalNextSession: 'Introduce deceleration and shuttle drills.',
        precautions: 'No pivoting without supervision until 12-week functional screen.'
      }
    }
  },
  // Tomorrow's visits
  {
    id: 'vis-106',
    patientId: 'pat-1',
    patientName: 'Eleanor Vance',
    patientPhone: '+1 (555) 234-8910',
    patientAddress: '742 Evergreen Terrace, West End',
    patientAge: 64,
    patientGender: 'Female',
    date: tomorrow,
    timeSlot: '09:00 AM - 10:00 AM',
    type: 'home_visit',
    status: 'scheduled',
    location: 'Patient Residence (Home Visit)',
    travelDistanceKm: 6.4,
    estimatedTravelMins: 18,
    chiefComplaint: 'Post-Op Knee Day 26 - Stair climbing progression',
    bodyRegion: 'Knee',
    sessionNumber: 7,
    totalPrescribedSessions: 16,
    sessionFee: 1500,
    serviceTier: 'home_tier2',
    paymentStatus: 'pending'
  },
  {
    id: 'vis-107',
    patientId: 'pat-5',
    patientName: 'Liam Chen',
    patientPhone: '+1 (555) 678-2299',
    patientAddress: '89 University Way, Apt 304',
    patientAge: 22,
    patientGender: 'Male',
    date: tomorrow,
    timeSlot: '02:30 PM - 03:30 PM',
    type: 'clinic_visit',
    status: 'scheduled',
    location: 'Main Clinic - Sports Rehab Area',
    chiefComplaint: 'ACL Week 9 - Isokinetic strength check',
    bodyRegion: 'Knee',
    sessionNumber: 12,
    totalPrescribedSessions: 20,
    sessionFee: 800,
    serviceTier: 'clinic_standard',
    paymentStatus: 'pending'
  }
];
