import { RateCardTier, ServiceTier } from '../types';

export const STANDARD_RATE_CARD: RateCardTier[] = [
  {
    id: 'online_standard',
    serviceMode: 'Online Mode',
    subCategory: 'Video Assessment & Exercise Guidance',
    rate: 700,
    visitType: 'tele_rehab',
    description: 'Remote live video biomechanical assessment, exercise progression & posture guidance'
  },
  {
    id: 'clinic_standard',
    serviceMode: 'Offline (In-Clinic / OPD)',
    subCategory: 'Standard Private Clinic Rate',
    rate: 800,
    visitType: 'clinic_visit',
    description: 'Private clinic consultation, standard electrotherapy & manual physical therapy'
  },
  {
    id: 'clinic_specialist',
    serviceMode: 'Offline (In-Clinic / OPD)',
    subCategory: 'Hospital-Based / Specialist OPD',
    rate: 1000,
    visitType: 'clinic_visit',
    description: 'Specialist consultant evaluation, post-operative rehabilitation & advanced modalities'
  },
  {
    id: 'home_tier2',
    serviceMode: 'Offline (Home Visit)',
    subCategory: 'Tier-2 Cities (e.g., Pune)',
    rate: 1500,
    visitType: 'home_visit',
    cityExample: 'Pune, Ahmedabad, Jaipur, Chandigarh, Lucknow, etc.',
    description: 'Personalized home rehabilitation with portable physiotherapy equipment in Tier-2 locations'
  },
  {
    id: 'home_metro',
    serviceMode: 'Offline (Home Visit)',
    subCategory: 'Metro Cities (e.g., Mumbai, Delhi, Bengaluru)',
    rate: 2000,
    visitType: 'home_visit',
    cityExample: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata',
    description: 'Bedside domiciliary physiotherapy with specialized geriatric/neuro care in Metro hubs'
  }
];

export const getRateTier = (id?: ServiceTier): RateCardTier | undefined => {
  if (!id) return undefined;
  return STANDARD_RATE_CARD.find(item => item.id === id);
};

export const getDefaultTierForType = (type: string): RateCardTier => {
  if (type === 'tele_rehab') {
    return STANDARD_RATE_CARD[0]; // online_standard ₹700
  }
  if (type === 'clinic_visit') {
    return STANDARD_RATE_CARD[1]; // clinic_standard ₹800
  }
  // Default home visit to Tier-2 ₹1500 or Metro ₹2000
  return STANDARD_RATE_CARD[3]; // home_tier2 ₹1500
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
