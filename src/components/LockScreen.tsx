import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface LockScreenProps {
  onUnlock: (passphrase: string) => Promise<boolean>;
  onResetToDefaults: () => void;
  isFirstSetup?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  onResetToDefaults,
  isFirstSetup = false
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Please enter your Master PIN or Passphrase.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const success = await onUnlock(pin.trim());
      if (!success) {
        setAttempts(prev => prev + 1);
        setErrorMsg('Incorrect Master PIN or Passphrase. Please try again.');
        setPin('');
      }
    } catch (err) {
      console.error('Decryption error:', err);
      setErrorMsg('Failed to decrypt database. Verify your PIN and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setPin('');
      setErrorMsg('');
    } else if (val === 'BACK') {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length < 32) {
        setPin(prev => prev + val);
        setErrorMsg('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <Lock className="w-7 h-7 text-teal-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">PhysioTracker Secure Vault</h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xs mx-auto">
            Protected by Military-Grade AES-256-GCM Encryption & PBKDF2 Key Derivation
          </p>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-2xs font-semibold mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>Zero-Knowledge Clinical Storage</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter Master PIN / Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="vault-pin-input"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-8 digit PIN or password..."
                  autoFocus
                  className="w-full px-4 py-3 text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all bg-slate-50"
                />
              </div>

              {errorMsg && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {attempts > 2 && (
                <p className="text-2xs text-amber-700 mt-1.5 text-center">
                  Notice: Repeated incorrect attempts detected. Please verify your PIN.
                </p>
              )}
            </div>

            {/* Quick Numeric Keypad for fast touchscreen / tablet unlocking */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    key === 'CLEAR'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs border border-rose-200'
                      : key === 'BACK'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs border border-slate-200'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              ))}
            </div>

            <button
              id="btn-unlock-vault"
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Decrypting Database...' : 'Unlock Clinic Vault'}</span>
            </button>
          </form>

          {/* Reset / Emergency Recovery Option */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-2xs text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Forgot PIN / Reset to fresh database?</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-2xs text-amber-800 leading-relaxed">
                    <strong>Cryptographic Safety Notice:</strong> Because this application uses zero-knowledge AES-256 encryption, your data cannot be decrypted without your Master PIN. Resetting will clear the encrypted vault and restore fresh sample clinic data.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-2xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onResetToDefaults}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-2xs font-bold"
                  >
                    Confirm Reset & Wipe Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Footer Details */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200/80 flex items-center justify-between text-2xs text-slate-500">
          <span className="flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            AES-GCM 256-bit
          </span>
          <span>DISHA & HIPAA Architecture</span>
        </div>
      </div>
    </div>
  );
};
