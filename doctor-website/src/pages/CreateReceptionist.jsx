import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { createReceptionist } from '../services/auth';

export default function CreateReceptionist({ doctorId }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await createReceptionist(email, password, name.trim(), [doctorId]);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else if (err.code === 'auth/weak-password') setError('Password is too weak');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else setError('Failed to create receptionist: ' + err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Receptionist Created!</h2>
          <p className="text-sm text-slate-400">They can now log in with the provided credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5.5 h-5.5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add Receptionist</h2>
            <p className="text-xs text-slate-400">Create an account for your reception staff</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-300" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="receptionist@clinic.com"
                className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-300" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 py-3.5 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>Create Receptionist <UserPlus className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
