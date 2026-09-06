import { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle, Hourglass, Send, X, AlertTriangle, User, Calendar } from 'lucide-react';
import { getAllPatients, forwardAppointment, rejectAppointment, getAppointmentsForDoctor } from '../services/patients';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ReceptionDashboard({ doctorId }) {
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forwardModal, setForwardModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [forwardDate, setForwardDate] = useState('');
  const [forwardTime, setForwardTime] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAssignedDoctors = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'doctors', doctorId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const assignedIds = data.assignedDoctors || [];
          const doctors = [];
          for (const uid of assignedIds) {
            const dDoc = await getDoc(doc(db, 'doctors', uid));
            if (dDoc.exists()) {
              doctors.push({ id: uid, ...dDoc.data() });
            }
          }
          setAssignedDoctors(doctors);
          if (doctors.length > 0) setSelectedDoctor(doctors[0].id);
        }
      } catch (err) {
        console.error('Error fetching assigned doctors:', err);
      }
    };
    fetchAssignedDoctors();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDoctor) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentsForDoctor(selectedDoctor);
        if (!cancelled) setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      if (!cancelled) setLoading(false);
    };
    fetchAppointments();
    const timer = setInterval(fetchAppointments, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [selectedDoctor]);

  const pending = appointments.filter(a => a.status === 'pending');
  const forwarded = appointments.filter(a => a.status === 'forwarded');
  const accepted = appointments.filter(a => a.status === 'accepted');

  const handleForward = async () => {
    if (!forwardDate || !forwardTime) return;
    setActionLoading(true);
    try {
      const scheduledDateTime = new Date(`${forwardDate}T${forwardTime}`);
      await forwardAppointment(forwardModal.id, scheduledDateTime, doctorId);
      setAppointments(prev => prev.map(a =>
        a.id === forwardModal.id
          ? { ...a, status: 'forwarded', scheduledTime: { seconds: scheduledDateTime.getTime() / 1000 } }
          : a
      ));
      setForwardModal(null);
      setForwardDate('');
      setForwardTime('');
    } catch (err) {
      console.error('Error forwarding appointment:', err);
      alert('Failed to forward: ' + err.message);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectAppointment(rejectModal.id, rejectReason);
      setAppointments(prev => prev.map(a =>
        a.id === rejectModal.id
          ? { ...a, status: 'rejected', rejectionReason: rejectReason }
          : a
      ));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert('Failed to reject: ' + err.message);
    }
    setActionLoading(false);
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Reception Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Manage appointment requests for your assigned doctors</p>
      </div>

      <div className="grid grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Hourglass className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{pending.length}</p>
          <p className="text-xs text-slate-400 font-medium">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Send className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{forwarded.length}</p>
          <p className="text-xs text-slate-400 font-medium">Forwarded</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{accepted.length}</p>
          <p className="text-xs text-slate-400 font-medium">Accepted</p>
        </div>
      </div>

      {assignedDoctors.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          {assignedDoctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctor(doc.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedDoctor === doc.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              Dr. {doc.name || 'Unknown'}
            </button>
          ))}
        </div>
      )}

      {assignedDoctors.length === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Dr. {assignedDoctors[0].name}</span>
        </div>
      )}

      {assignedDoctors.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center animate-fadeIn">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CalendarCheck className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium text-sm">No doctors assigned</p>
          <p className="text-slate-400 text-xs mt-0.5">Ask a doctor to assign you from their dashboard.</p>
        </div>
      )}

      {!loading && selectedDoctor && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Pending Requests</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {pending.length === 0 && (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No pending requests</p>
                <p className="text-slate-400 text-xs mt-0.5">All caught up!</p>
              </div>
            )}
            {pending.map((apt) => (
              <div key={apt.id} className="px-5 py-4 hover:bg-slate-50/80 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-slate-800">{apt.patientName || apt.patientId}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{apt.message}</p>
                    {apt.createdAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Requested: {formatDate(apt.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setForwardModal(apt); setForwardDate(today); setForwardTime('10:00'); }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Forward
                    </button>
                    <button
                      onClick={() => { setRejectModal(apt); setRejectReason(''); }}
                      className="px-3 py-1.5 bg-white text-red-600 border border-red-200 text-xs font-medium rounded-lg hover:bg-red-50 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {forwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setForwardModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <button onClick={() => setForwardModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Forward Appointment</h3>
            <p className="text-sm text-slate-400 mb-5">Patient: {forwardModal.patientName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
                <input
                  type="date"
                  value={forwardDate}
                  onChange={(e) => setForwardDate(e.target.value)}
                  min={today}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Time</label>
                <input
                  type="time"
                  value={forwardTime}
                  onChange={(e) => setForwardTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setForwardModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={!forwardDate || !forwardTime || actionLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Forwarding...' : <>Forward <Send className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <button onClick={() => setRejectModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Reject Appointment</h3>
            <p className="text-sm text-slate-400 mb-5">Patient: {rejectModal.patientName}</p>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Doctor unavailable on this date"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Rejecting...' : <>Reject <XCircle className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
