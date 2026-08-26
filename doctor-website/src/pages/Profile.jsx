import { useState, useEffect } from 'react';
import { User, Save, Pencil, X, CheckCircle, AlertTriangle, Stethoscope, Building2, GraduationCap, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const fields = [
  { key: 'name', label: 'Full Name', icon: User, placeholder: 'Dr. Jane Smith', type: 'text' },
  { key: 'specialty', label: 'Specialty', icon: Stethoscope, placeholder: 'e.g. General Medicine', type: 'text' },
  { key: 'qualification', label: 'Qualification', icon: GraduationCap, placeholder: 'e.g. MBBS, MD', type: 'text' },
  { key: 'experience', label: 'Experience (years)', icon: Clock, placeholder: 'e.g. 10', type: 'number' },
  { key: 'hospital', label: 'Hospital / Clinic', icon: Building2, placeholder: 'e.g. City Hospital', type: 'text' },
];

export default function Profile({ doctorId }) {
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'doctors', doctorId));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setForm(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setFeedback({ type: 'error', message: 'Failed to load profile.' });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [doctorId]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleAvailable = () => {
    handleChange('available', !form.available);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        name: form.name || '',
        specialty: form.specialty || '',
        qualification: form.qualification || '',
        experience: form.experience || '',
        hospital: form.hospital || '',
        available: form.available ?? true,
      });
      setProfile(form);
      setEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-8 w-40 bg-slate-200 rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your account and professional details</p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border animate-fadeIn ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-800">Professional Information</h2>
        </div>
        <div className="p-5 space-y-4">
          {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Icon className="w-3 h-3" />
                {label}
              </label>
              {editing ? (
                <input
                  type={type}
                  value={form[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              ) : (
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 min-h-[42px] flex items-center">
                  {profile[key] || <span className="text-slate-300">Not set</span>}
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              {form.available ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
              Available for Appointments
            </label>
            {editing ? (
              <button
                type="button"
                onClick={handleToggleAvailable}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-all ${
                  form.available
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {form.available ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {form.available ? 'Available' : 'Unavailable'}
              </button>
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm min-h-[42px] flex items-center">
                {profile.available ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><span className="w-2 h-2 bg-emerald-500 rounded-full" />Available</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 bg-slate-300 rounded-full" />Unavailable</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
