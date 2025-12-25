// src/pages/AuthPage.jsx
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
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">E</div>
          <h2 className="text-3xl font-extrabold text-gray-900">Edwid Tech</h2>
          <p className="mt-2 text-sm text-gray-600">{mode === 'login' ? 'Sign in to access Dashboard' : 'Create admin account'}</p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('register')} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
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

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={handleGoogleAuth} disabled={loading}>
            Google
          </Button>
          <Button variant="outline" onClick={handleGuestAuth} disabled={loading}>
            Guest (Test)
          </Button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={onOfflineMode} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Switch to Offline Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;