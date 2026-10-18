import { Patient, Visit } from '../types';
import { INITIAL_PATIENTS, INITIAL_VISITS } from '../data/mockData';
import { 
  encryptData, 
  decryptData, 
  getStoredEncryptedVault, 
  saveStoredEncryptedVault, 
  clearEncryptedVault,
  getSecurityConfig,
  saveSecurityConfig,
  EncryptedPayload 
} from './crypto';

export const PATIENTS_STORAGE_KEY = 'physiotracker_patients_v2';
export const VISITS_STORAGE_KEY = 'physiotracker_visits_v2';

export interface ClinicDatabase {
  patients: Patient[];
  visits: Visit[];
}

export function hasEncryptedVault(): boolean {
  return getStoredEncryptedVault() !== null;
}

export function hasPlaintextData(): boolean {
  return localStorage.getItem(PATIENTS_STORAGE_KEY) !== null || localStorage.getItem(VISITS_STORAGE_KEY) !== null;
}

export function wipePlaintextData(): void {
  try {
    localStorage.removeItem(PATIENTS_STORAGE_KEY);
    localStorage.removeItem(VISITS_STORAGE_KEY);
    localStorage.removeItem('physiotracker_patients_v1');
    localStorage.removeItem('physiotracker_visits_v1');
  } catch (e) {
    console.error('Failed to wipe plaintext data', e);
  }
}

export function loadPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      // Check for v1
      const oldRaw = localStorage.getItem('physiotracker_patients_v1');
      if (oldRaw) {
        const parsed = JSON.parse(oldRaw);
        savePatients(parsed);
        return parsed;
      }
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load patients from storage', e);
    return INITIAL_PATIENTS;
  }
}

export function savePatients(patients: Patient[]): void {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save patients to storage', e);
  }
}

export function loadVisits(): Visit[] {
  try {
    const raw = localStorage.getItem(VISITS_STORAGE_KEY);
    if (!raw) {
      const oldRaw = localStorage.getItem('physiotracker_visits_v1');
      if (oldRaw) {
        const parsed: Visit[] = JSON.parse(oldRaw);
        const hasOldCurrency = parsed.some(v => v.sessionFee < 500);
        if (hasOldCurrency) {
          saveVisits(INITIAL_VISITS);
          return INITIAL_VISITS;
        }
        saveVisits(parsed);
        return parsed;
      }
      return INITIAL_VISITS;
    }
    const parsed: Visit[] = JSON.parse(raw);
    if (parsed.some(v => v.sessionFee < 500)) {
      saveVisits(INITIAL_VISITS);
      return INITIAL_VISITS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load visits from storage', e);
    return INITIAL_VISITS;
  }
}

export function saveVisits(visits: Visit[]): void {
  try {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch (e) {
    console.error('Failed to save visits to storage', e);
  }
}

/**
 * Encrypt and save complete clinic database with passphrase
 */
export async function saveEncryptedClinicData(
  patients: Patient[],
  visits: Visit[],
  passphrase: string
): Promise<EncryptedPayload> {
  const payload = await encryptData({ patients, visits }, passphrase);
  saveStoredEncryptedVault(payload);
  // Guarantee zero plaintext left in localStorage when encryption is enabled
  wipePlaintextData();
  return payload;
}

/**
 * Decrypt complete clinic database using passphrase
 */
export async function loadEncryptedClinicData(passphrase: string): Promise<ClinicDatabase> {
  const vault = getStoredEncryptedVault();
  if (!vault) {
    throw new Error('No encrypted clinical vault was found in storage.');
  }
  const decrypted = await decryptData<ClinicDatabase>(vault, passphrase);
  if (!decrypted || !Array.isArray(decrypted.patients) || !Array.isArray(decrypted.visits)) {
    throw new Error('Corrupted or invalid clinic database structure.');
  }
  return decrypted;
}

export function resetToDefaults(): { patients: Patient[]; visits: Visit[] } {
  clearEncryptedVault();
  saveSecurityConfig({
    isEncryptionEnabled: false,
    autoLockMinutes: 15,
    failedAttempts: 0,
  });
  savePatients(INITIAL_PATIENTS);
  saveVisits(INITIAL_VISITS);
  return { patients: INITIAL_PATIENTS, visits: INITIAL_VISITS };
}
