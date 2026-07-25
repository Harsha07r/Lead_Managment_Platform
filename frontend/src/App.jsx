import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE, withCredentials: true });
const DEFAULT_USER = { id: '', name: '', email: '', role: 'member' };
const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('lm-user') || 'null');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-slate-900 py-4 text-center text-sm text-slate-200">
      Built for Digital Heroes Training Task &nbsp;|&nbsp;
      <a className="underline" href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
        https://digitalheroesco.com
      </a>
    </footer>
  );
}

function PublicLeadForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    message: '',
  });
  const [notice, setNotice] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads/public', form);
      setNotice('Lead submitted successfully.');
      setForm({ name: '', email: '', phone: '', company: '', source: '', message: '' });
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to submit lead.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="card p-8">
        <h1 className="mb-2 text-3xl font-semibold">Public Lead Capture</h1>
        <p className="mb-6 text-slate-600">Capture new leads from the public website and store them in MongoDB.</p>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input required className="rounded-xl border p-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required className="rounded-xl border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required className="rounded-xl border p-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required className="rounded-xl border p-3" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input required className="rounded-xl border p-3" placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <textarea required className="rounded-xl border p-3 md:col-span-2" placeholder="Message" rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="md:col-span-2">
            <button className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white">Submit Lead</button>
          </div>
        </form>
        {notice && <div className="mt-4 rounded-lg bg-slate-100 p-3">{notice}</div>}
      </div>
    </div>
  );
}

function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@digitalheroesco.com', password: 'Password123!' });
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      // server issues httpOnly cookie; store user locally for UI
      localStorage.setItem('lm-user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="mb-2 text-3xl font-semibold">Login</h1>
        <p className="mb-6 text-slate-600">Use your admin or member account.</p>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full rounded-xl border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" className="w-full rounded-xl border p-3" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="w-full rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Sign In</button>
        </form>
        {message && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-rose-700">{message}</div>}
      </div>
    </div>
  );
}

function DashboardPage() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('lm-user') || JSON.stringify(DEFAULT_USER)), []);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('lm-token');
    api
      .get('/leads', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLeads(res.data.leads || []))
      .catch(() => setLeads([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-slate-600">Welcome {user.name} ({user.role})</p>
        </div>
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={async () => { try { await api.post('/auth/logout'); } catch {} localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5"><div className="text-sm text-slate-500">Total Leads</div><div className="text-3xl font-semibold">{leads.length}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Role</div><div className="text-3xl font-semibold">{user.role}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Access</div><div className="text-3xl font-semibold">{user.role === 'admin' ? 'Full' : 'Assigned Only'}</div></div>
      </div>
    </div>
  );
}

function LeadsPage() {
  const token = localStorage.getItem('lm-token');
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/leads', { params: { status, search }, headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLeads(res.data.leads || []))
      .catch(() => setLeads([]));
  }, [status, search, token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-semibold">Lead Table</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <input className="rounded-xl border p-3" placeholder="Search leads" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-xl border p-3" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Company</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-t">
                <td className="p-3">{lead.name}</td>
                <td className="p-3">{lead.company}</td>
                <td className="p-3">{lead.status}</td>
                <td className="p-3">{lead.assignedTo?.name || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadDetailsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl font-semibold">Lead Details</h1>
        <p className="mt-2 text-slate-600">Detailed lead activity and notes are shown here.</p>
      </div>
    </div>
  );
}

function UsersPage() {
  const token = localStorage.getItem('lm-token');
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get('/users', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setUsers(res.data.users || [])).catch(() => setUsers([]));
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-semibold">Users</h1>
      <div className="card overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityPage() {
  const token = localStorage.getItem('lm-token');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/leads', { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
      const allActivity = (res.data.leads || []).flatMap((lead) => (lead.activity || []).map((item) => ({
        ...item,
        leadName: lead.name,
      })));
      setEvents(allActivity);
    }).catch(() => setEvents([]));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl font-semibold">Activity Timeline</h1>
        <div className="mt-4 space-y-3">
          {events.map((event, index) => (
            <div key={`${event.createdAt}-${index}`} className="rounded-xl border bg-slate-50 p-3">
              <div className="font-semibold">{event.leadName}</div>
              <div className="text-sm text-slate-600">{event.actor} • {event.action}</div>
              <div className="text-sm">{event.details}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('lm-user') || JSON.stringify(DEFAULT_USER)), []);
  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/leads', label: 'Lead Table' },
    { to: '/lead-details', label: 'Lead Details' },
    { to: '/users', label: 'Users', adminOnly: true },
    { to: '/activity', label: 'Activity Timeline' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="font-semibold">Lead Management Platform</div>
          <div className="flex gap-3 text-sm">
            {nav.filter((item) => !item.adminOnly || user.role === 'admin').map((item) => (
              <a key={item.to} href={item.to} className="rounded-lg px-3 py-2 hover:bg-slate-100">{item.label}</a>
            ))}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/public" replace />} />
        <Route path="/public" element={<PublicLeadForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/lead-details" element={<ProtectedRoute><LeadDetailsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute role="admin"><UsersPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return <AppShell />;
}

export default App;
