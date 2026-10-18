/**
 * PhysioTracker Clinical Cryptography & Vault Security
 * Standard: AES-GCM 256-bit with PBKDF2-HMAC-SHA-256 Key Derivation (100,000 iterations)
 * Zero external dependencies: Uses native browser Web Crypto API (SubtleCrypto)
 */

export interface EncryptedPayload {
  version: number;
  algorithm: string;
  salt: string; // base64
  iv: string;   // base64
  ciphertext: string; // base64
  keyCheck: string;   // base64 verification token for fast password/PIN check
  timestamp: string;
}

export interface SecurityConfig {
  isEncryptionEnabled: boolean;
  autoLockMinutes: number; // 0 for disabled, 5, 15, 30, 60
  lastUnlockedAt?: number;
  failedAttempts: number;
  lockoutUntil?: number;
}

const SECURITY_CONFIG_KEY = 'physiotracker_security_cfg_v1';
const ENCRYPTED_VAULT_KEY = 'physiotracker_encrypted_vault_v1';
const PBKDF2_ITERATIONS = 100000;
const KEY_CHECK_PLAINTEXT = 'PHYSIOTRACKER_VAULT_INTEGRITY_CHECK_TOKEN_OK';

// Utility: ArrayBuffer <-> Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM 256-bit key from passphrase and salt
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary JSON data with user PIN/passphrase using AES-GCM 256-bit
 */
export async function encryptData(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Cryptography API is not available in this browser environment.');
  }

  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const checkIv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  // 1. Encrypt keyCheck token
  const keyCheckEncrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: checkIv },
    key,
    encoder.encode(KEY_CHECK_PLAINTEXT)
  );

  // Combine checkIv + keyCheckEncrypted into single token
  const checkCombined = new Uint8Array(checkIv.length + keyCheckEncrypted.byteLength);
  checkCombined.set(checkIv, 0);
  checkCombined.set(new Uint8Array(keyCheckEncrypted), checkIv.length);

  // 2. Encrypt primary clinical payload
  const plaintextBytes = encoder.encode(JSON.stringify(data));
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes
  );

  return {
    version: 1,
    algorithm: 'AES-256-GCM',
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    keyCheck: bufferToBase64(checkCombined),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quickly verify if a passphrase or PIN is correct without decrypting the entire dataset
 */
export async function verifyPassphrase(payload: EncryptedPayload, passphrase: string): Promise<boolean> {
  if (!window.crypto?.subtle) return false;
  try {
    const salt = base64ToBuffer(payload.salt);
    const key = await deriveKey(passphrase, salt);

    const checkCombined = base64ToBuffer(payload.keyCheck);
    const checkIv = checkCombined.slice(0, 12);
    const checkCiphertext = checkCombined.slice(12);

    const decryptedCheck = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: checkIv },
      key,
      checkCiphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedCheck) === KEY_CHECK_PLAINTEXT;
  } catch {
    return false;
  }
}

/**
 * Decrypt payload with user PIN/passphrase
 */
export async function decryptData<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Cryptography API is not available in this browser environment.');
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}

// ---------------- Storage & Security State ----------------

export function getSecurityConfig(): SecurityConfig {
  try {
    const raw = localStorage.getItem(SECURITY_CONFIG_KEY);
    if (!raw) {
      return {
        isEncryptionEnabled: false,
        autoLockMinutes: 15,
        failedAttempts: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      isEncryptionEnabled: false,
      autoLockMinutes: 15,
      failedAttempts: 0,
    };
  }
}

export function saveSecurityConfig(cfg: SecurityConfig): void {
  try {
    localStorage.setItem(SECURITY_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save security configuration', e);
  }
}

export function getStoredEncryptedVault(): EncryptedPayload | null {
  try {
    const raw = localStorage.getItem(ENCRYPTED_VAULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredEncryptedVault(payload: EncryptedPayload): void {
  try {
    localStorage.setItem(ENCRYPTED_VAULT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save encrypted vault to localStorage', e);
  }
}

export function clearEncryptedVault(): void {
  try {
    localStorage.removeItem(ENCRYPTED_VAULT_KEY);
  } catch (e) {
    console.error('Failed to clear encrypted vault', e);
  }
}

export function isEncryptionActive(): boolean {
  const cfg = getSecurityConfig();
  const vault = getStoredEncryptedVault();
  return cfg.isEncryptionEnabled && vault !== null;
}
