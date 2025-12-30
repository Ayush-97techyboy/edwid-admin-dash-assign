import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import DarkModeToggle from '../components/ui/DarkModeToggle';

const AuthScreen = ({ onLogin, onOfflineMode }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters to handle cross-origin issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Try popup first, fallback to redirect if blocked
      try {
        await signInWithPopup(auth, provider);
      } catch (popupError) {
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          // Fallback to redirect method
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return; // Don't set loading to false as page will redirect
        }
        throw popupError;
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      
      // Handle specific cross-origin and session storage errors
      if (err.code === 'auth/popup-blocked' || 
          err.code === 'auth/cancelled-popup-request' ||
          err.message.includes('missing initial state') ||
          err.message.includes('sessionStorage') ||
          err.message.includes('Cross-Origin-Opener-Policy')) {
        setError('Google Sign-in blocked by browser security settings. Please try Guest mode or use a different browser/device.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-primary px-4 transition-colors duration-300">
      <div className="fixed top-6 right-6 z-50">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 theme-bg-secondary p-8 rounded-2xl shadow-xl theme-border border transition-colors duration-300">
        <div className="text-center">
          <div className="mx-auto mb-4">
            <img src="/edwid-logo.png" alt="Edwid Logo" className="h-16 w-16 mx-auto rounded-xl shadow-lg" />
          </div>
          <h2 className="text-3xl font-extrabold theme-text-primary transition-colors duration-300">Edwid Tech</h2>
          <p className="mt-2 text-sm theme-text-secondary transition-colors duration-300">{mode === 'login' ? 'Sign in to access Dashboard' : 'Create admin account'}</p>
        </div>

        <div className="flex gap-2 theme-bg-tertiary p-1 rounded-lg transition-colors duration-300">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-[#ff8449] text-white shadow-sm' : 'theme-text-secondary'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('register')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-[#ff8449] text-white shadow-sm' : 'theme-text-secondary'}`}
          >
            Register
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            <InputField 
              icon={Mail} 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <InputField 
              icon={Lock} 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center font-bold mb-1">
                <AlertCircle size={16} className="mr-2"/> Error
              </div>
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign in' : 'Create Account')}
          </Button>
        </form>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleGoogleAuth} 
              disabled={loading}
              className="px-4 py-2 bg-[#ff8449] hover:bg-[#e6753d] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Google
            </button>
            <button 
              onClick={handleGuestAuth} 
              disabled={loading}
              className="px-4 py-2 bg-[#ff8449] hover:bg-[#e6753d] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guest (Test)
            </button>
          </div>
          
          <button 
            onClick={onOfflineMode} 
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Offline Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
