import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  FileCheck,
  Shield,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  getSecurityConfig, 
  saveSecurityConfig, 
  getStoredEncryptedVault, 
  SecurityConfig, 
  EncryptedPayload,
  verifyPassphrase
} from '../utils/crypto';
import { Patient, Visit } from '../types';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEncrypted: boolean;
  onEnableEncryption: (passphrase: string, autoLockMinutes: number) => Promise<boolean>;
  onChangePassphrase: (currentPass: string, newPass: string) => Promise<boolean>;
  onDisableEncryption: (currentPass: string) => Promise<boolean>;
  onLockNow: () => void;
  onRestoreBackup: (payload: EncryptedPayload, passphrase: string) => Promise<boolean>;
  patientsCount: number;
  visitsCount: number;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  isEncrypted,
  onEnableEncryption,
  onChangePassphrase,
  onDisableEncryption,
  onLockNow,
  onRestoreBackup,
  patientsCount,
  visitsCount
}) => {
  const [config, setConfig] = useState<SecurityConfig>(() => getSecurityConfig());
  const [activeTab, setActiveTab] = useState<'overview' | 'change_pin' | 'backup' | 'audit'>('overview');

  // Setup form states
  const [setupPin, setSetupPin] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [autoLockMin, setAutoLockMin] = useState<number>(config.autoLockMinutes || 15);
  const [setupError, setSetupError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Change PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);

  // Disable encryption states
  const [disablePin, setDisablePin] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Restore states
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePin, setRestorePin] = useState('');
  const [restoreError, setRestoreError] = useState('');

  if (!isOpen) return null;

  // Handle Enable Encryption
  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSuccessMsg('');

    if (setupPin.length < 4) {
      setSetupError('PIN or Passphrase must be at least 4 characters long.');
      return;
    }
    if (setupPin !== setupPinConfirm) {
      setSetupError('PIN confirmation does not match.');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await onEnableEncryption(setupPin, autoLockMin);
      if (ok) {
        setSuccessMsg('AES-256 Vault enabled! Your clinic database is now encrypted.');
        setSetupPin('');
        setSetupPinConfirm('');
        setConfig(getSecurityConfig());
      } else {
        setSetupError('Failed to enable encryption. Check console logs.');
      }
    } catch (err) {
      console.error(err);
      setSetupError('An unexpected error occurred during encryption.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSuccessMsg('');

    if (!currentPin) {
      setSetupError('Please enter your current PIN.');
      return;
    }
    if (newPin.length < 4) {
      setSetupError('New PIN must be at least 4 characters.');
      return;
    }
    if (newPin !== newPinConfirm) {
      setSetupError('New PIN confirmation does not match.');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await onChangePassphrase(currentPin, newPin);
      if (ok) {
        setSuccessMsg('Master PIN successfully changed. Vault re-encrypted.');
        setCurrentPin('');
        setNewPin('');
        setNewPinConfirm('');
      } else {
        setSetupError('Current PIN is incorrect. Vault could not be re-encrypted.');
      }
    } catch (err) {
      console.error(err);
      setSetupError('Failed to change PIN.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Disable Encryption
  const handleDisable = async () => {
    if (!disablePin) {
      setSetupError('Enter your Master PIN to authorize decrypting the database.');
      return;
    }

    setIsProcessing(true);
    setSetupError('');
    try {
      const ok = await onDisableEncryption(disablePin);
      if (ok) {
        setSuccessMsg('Encryption disabled. Data restored to standard storage.');
        setShowDisableConfirm(false);
        setDisablePin('');
        setConfig(getSecurityConfig());
      } else {
        setSetupError('Incorrect Master PIN. Could not decrypt data.');
      }
    } catch (err) {
      console.error(err);
      setSetupError('Error disabling encryption.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Export Backup
  const handleExportBackup = () => {
    const vault = getStoredEncryptedVault();
    if (!vault) {
      alert('No encrypted vault exists yet to export.');
      return;
    }

    const exportObject = {
      app: 'PhysioTracker',
      exportType: 'AES-256-ENCRYPTED-VAULT',
      exportedAt: new Date().toISOString(),
      vault: vault,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physiotracker-encrypted-backup-${new Date().toISOString().slice(0, 10)}.physiovault`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Import Backup
  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) {
      setRestoreError('Please select a backup file (.physiovault or .json).');
      return;
    }
    if (!restorePin) {
      setRestoreError('Please enter the Master PIN for this backup.');
      return;
    }

    setIsProcessing(true);
    setRestoreError('');
    try {
      const text = await restoreFile.text();
      const parsed = JSON.parse(text);
      const payload: EncryptedPayload = parsed.vault ? parsed.vault : parsed;

      if (!payload.ciphertext || !payload.salt || !payload.iv) {
        setRestoreError('Invalid backup file format.');
        setIsProcessing(false);
        return;
      }

      const ok = await onRestoreBackup(payload, restorePin);
      if (ok) {
        setSuccessMsg('Encrypted vault restored successfully!');
        setRestoreFile(null);
        setRestorePin('');
        onClose();
      } else {
        setRestoreError('Failed to decrypt backup. Incorrect PIN or corrupted data.');
      }
    } catch (err) {
      console.error(err);
      setRestoreError('Failed to read or parse the backup file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isEncrypted ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Clinical Data Security & Vault</h3>
                {isEncrypted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Lock className="w-3 h-3" />
                    AES-256 ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Unlock className="w-3 h-3" />
                    UNENCRYPTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                End-to-end client-side cryptographic protection for patient medical records & SOAP notes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security Overview
          </button>
          {isEncrypted && (
            <button
              onClick={() => setActiveTab('change_pin')}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'change_pin'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Change PIN / Key
            </button>
          )}
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Encrypted Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cryptographic Audit
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {setupError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{setupError}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Quick Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800">Protected Clinical Dataset</span>
                  </div>
                  <p className="text-2xs text-slate-500">
                    {patientsCount} Patient records &bull; {visitsCount} Visits & Clinical SOAP notes
                  </p>
                </div>

                {isEncrypted ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onLockNow}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Lock App Now</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Action Recommended: Set PIN
                  </span>
                )}
              </div>

              {/* Encryption Setup Form (if not yet encrypted) */}
              {!isEncrypted ? (
                <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/40 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-teal-700" />
                      <span>Enable AES-256 Vault Encryption</span>
                    </h4>
                    <p className="text-xs text-teal-800/80 mt-1">
                      Choose a Master PIN or Passphrase. All patient profiles, diagnoses, addresses, treatment notes, and billing records will be encrypted locally with AES-256-GCM.
                    </p>
                  </div>

                  <form onSubmit={handleEnable} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                          Create Master PIN / Password
                        </label>
                        <div className="relative">
                          <input
                            type={showSetupPin ? 'text' : 'password'}
                            value={setupPin}
                            onChange={(e) => setSetupPin(e.target.value)}
                            placeholder="Min 4 characters or digits"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-hidden font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSetupPin(!showSetupPin)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showSetupPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                          Confirm Master PIN
                        </label>
                        <input
                          type={showSetupPin ? 'text' : 'password'}
                          value={setupPinConfirm}
                          onChange={(e) => setSetupPinConfirm(e.target.value)}
                          placeholder="Re-enter to confirm"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-2xs font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Auto-Lock Timeout (Inactivity)</span>
                      </label>
                      <select
                        value={autoLockMin}
                        onChange={(e) => setAutoLockMin(Number(e.target.value))}
                        className="w-full sm:w-60 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value={5}>Lock after 5 minutes of inactivity</option>
                        <option value={15}>Lock after 15 minutes of inactivity (Recommended)</option>
                        <option value={30}>Lock after 30 minutes of inactivity</option>
                        <option value={60}>Lock after 1 hour of inactivity</option>
                        <option value={0}>Manual Lock Only (Never auto-lock)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isProcessing || !setupPin || !setupPinConfirm}
                        className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Encrypting Database...' : 'Encrypt & Secure Clinic Data'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Active Encryption Settings */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-950">Zero-Knowledge Storage Active</h4>
                      <p className="text-2xs text-emerald-800 leading-relaxed">
                        Every patient record, phone number, medical diagnosis, SOAP note, and fee record is encrypted at rest in your browser using AES-GCM 256-bit with PBKDF2 100,000 iterations. Plaintext is automatically purged from local storage.
                      </p>
                    </div>
                  </div>

                  {/* Auto-Lock Configuration */}
                  <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>Auto-Lock Timeout</span>
                      </label>
                      <select
                        value={config.autoLockMinutes}
                        onChange={(e) => {
                          const mins = Number(e.target.value);
                          const updated = { ...config, autoLockMinutes: mins };
                          saveSecurityConfig(updated);
                          setConfig(updated);
                          setSuccessMsg(`Auto-lock timeout updated to ${mins === 0 ? 'Manual Only' : mins + ' minutes'}.`);
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value={5}>5 minutes</option>
                        <option value={15}>15 minutes (Default)</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={0}>Manual Lock Only</option>
                      </select>
                    </div>
                    <p className="text-2xs text-slate-500">
                      When idle on this device, the vault will lock automatically to prevent unauthorized viewing. You can also press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-2xs">Ctrl + L</kbd> anytime.
                    </p>
                  </div>

                  {/* Disable Encryption Section */}
                  <div className="pt-2 border-t border-slate-100">
                    {!showDisableConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDisableConfirm(true)}
                        className="text-2xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Revert to unencrypted storage (Not Recommended)
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-rose-900">Disable AES-256 Encryption?</h5>
                            <p className="text-2xs text-rose-700">
                              This will decrypt all patient records back to plain text in local storage. Enter your current Master PIN to confirm.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            value={disablePin}
                            onChange={(e) => setDisablePin(e.target.value)}
                            placeholder="Enter current PIN"
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleDisable}
                            disabled={isProcessing || !disablePin}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                          >
                            {isProcessing ? 'Decrypting...' : 'Confirm Decrypt'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDisableConfirm(false);
                              setDisablePin('');
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE PIN */}
          {activeTab === 'change_pin' && isEncrypted && (
            <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Update Master PIN / Passphrase</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Re-encrypts the entire clinical database with a new cryptographic key.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                    Current Master PIN
                  </label>
                  <input
                    type={showChangePin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter existing PIN"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                    New Master PIN
                  </label>
                  <input
                    type={showChangePin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Min 4 characters or digits"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                    Confirm New Master PIN
                  </label>
                  <input
                    type={showChangePin ? 'text' : 'password'}
                    value={newPinConfirm}
                    onChange={(e) => setNewPinConfirm(e.target.value)}
                    placeholder="Re-enter new PIN"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowChangePin(!showChangePin)}
                    className="text-2xs font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                  >
                    {showChangePin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showChangePin ? 'Hide PIN characters' : 'Show PIN characters'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || !currentPin || !newPin || !newPinConfirm}
                    className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                  >
                    {isProcessing ? 'Re-encrypting...' : 'Update Master PIN'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: ENCRYPTED BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Export Backup Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-teal-600" />
                      <span>Export Encrypted Vault Backup</span>
                    </h4>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      Download a standalone encrypted file (<code className="font-mono">.physiovault</code>) containing all patients and visits.
                    </p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup</span>
                  </button>
                </div>
                <p className="text-2xs text-slate-400">
                  Because the backup file is encrypted with AES-256, it is safe to email, store in Google Drive, or transfer via USB drive.
                </p>
              </div>

              {/* Restore Backup Card */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>Restore Database from Encrypted Backup</span>
                </h4>
                <p className="text-2xs text-slate-500">
                  Select a previous <code className="font-mono">.physiovault</code> backup file to restore records on this device.
                </p>

                <form onSubmit={handleRestoreBackup} className="space-y-3 pt-1">
                  <div>
                    <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                      Choose Backup File
                    </label>
                    <input
                      type="file"
                      accept=".physiovault,.json"
                      onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                  </div>

                  {restoreFile && (
                    <div>
                      <label className="text-2xs font-bold text-slate-700 uppercase block mb-1">
                        Master PIN for this Backup
                      </label>
                      <input
                        type="password"
                        value={restorePin}
                        onChange={(e) => setRestorePin(e.target.value)}
                        placeholder="Enter the PIN used when creating this backup"
                        className="w-full sm:w-80 px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  )}

                  {restoreError && (
                    <div className="p-2.5 bg-rose-50 rounded-lg text-rose-700 text-xs border border-rose-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{restoreError}</span>
                    </div>
                  )}

                  {restoreFile && (
                    <button
                      type="submit"
                      disabled={isProcessing || !restorePin}
                      className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      {isProcessing ? 'Verifying & Restoring...' : 'Decrypt & Restore Vault'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: CRYPTOGRAPHIC AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Encryption Standard</span>
                  <span className="font-bold text-slate-900 text-sm">AES-256-GCM (NIST SP 800-38D)</span>
                  <p className="text-2xs text-slate-500">Authenticated Encryption with 128-bit integrity tag validation.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Key Derivation Function</span>
                  <span className="font-bold text-slate-900 text-sm">PBKDF2-HMAC-SHA-256</span>
                  <p className="text-2xs text-slate-500">100,000 computation rounds to resist GPU/brute-force attacks.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Entropy & Randomness</span>
                  <span className="font-bold text-slate-900 text-sm">CSPRNG (Web Crypto API)</span>
                  <p className="text-2xs text-slate-500">Cryptographically secure 16-byte salt and 12-byte IV per write cycle.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Storage Isolation</span>
                  <span className="font-bold text-slate-900 text-sm">Zero Plaintext At Rest</span>
                  <p className="text-2xs text-slate-500">Plaintext patient keys are removed from localStorage upon vault activation.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 text-xs text-slate-600 space-y-2">
                <h5 className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-700" />
                  <span>Clinical Compliance Alignment</span>
                </h5>
                <p className="text-2xs leading-relaxed text-teal-950/80">
                  Meets Digital Information Security in Healthcare Act (DISHA) and HIPAA Title II Security Rule technical safeguards for encryption of Electronic Protected Health Information (ePHI) both in storage and backup archives.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            PhysioTracker Vault Security v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
