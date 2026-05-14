import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import {
  api,
  getErrorMessage,
  normalizeDashboard,
  normalizeReport,
  normalizeResource,
  normalizeUser
} from "./api";

const statusSteps = ["under_review", "in_progress", "ongoing", "resolved", "solved"];
const isStaffOrAdmin = (role) => role === "support_staff" || role === "admin";

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("safehaven_user");
    return raw ? JSON.parse(raw) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("safehaven_token");
    localStorage.removeItem("safehaven_user");
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage type="login" onAuth={setUser} />} />
      <Route path="/signup" element={<AuthPage type="signup" onAuth={setUser} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} onAuth={setUser}>
            <Dashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedRoute({ user, onAuth, children }) {
  const [loading, setLoading] = useState(!!localStorage.getItem("safehaven_token") && !user);

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem("safehaven_token") || user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        const normalized = normalizeUser(data.user);
        localStorage.setItem("safehaven_user", JSON.stringify(normalized));
        onAuth(normalized);
      } catch {
        localStorage.removeItem("safehaven_token");
        localStorage.removeItem("safehaven_user");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [user, onAuth]);

  if (loading) return <main className="auth-shell"><section className="card">Restoring secure session...</section></main>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthPage({ type, onAuth }) {
  const navigate = useNavigate();
  const isLogin = type === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "victim" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const { data } = await api.post(path, payload);
      const normalized = normalizeUser(data.user);
      localStorage.setItem("safehaven_token", data.token);
      localStorage.setItem("safehaven_user", JSON.stringify(normalized));
      onAuth(normalized);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <h1>SafeHaven Support</h1>
        <p className="muted">{isLogin ? "Welcome back. Access your secure workspace." : "Create your secure account."}</p>
        <form onSubmit={submit}>
          {!isLogin && (
            <label>
              Full Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </label>
          {!isLogin && (
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="victim">Victim</option>
                <option value="support_staff">Support Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button disabled={loading} className="primary" type="submit">
            {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
          </button>
        </form>
        <p className="muted small">
          {isLogin ? "No account yet? " : "Already have an account? "}
          <Link to={isLogin ? "/signup" : "/login"}>{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const isVictim = user.role === "victim";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, resourcesRes, statsRes, profileRes] = await Promise.all([
        api.get("/reports"),
        api.get("/resources"),
        api.get("/dashboard/stats"),
        api.get("/profile")
      ]);
      setReports((reportsRes.data.reports || []).map(normalizeReport));
      setResources((resourcesRes.data.resources || []).map(normalizeResource));
      setStats(normalizeDashboard(statsRes.data));
      const normalizedProfile = normalizeUser(profileRes.data.profile);
      localStorage.setItem("safehaven_user", JSON.stringify(normalizedProfile));
      onUserUpdate(normalizedProfile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="dashboard-shell">
      <header className="topbar card">
        <div>
          <h2>Hello, {user.name}</h2>
          <p className="muted">Role: {user.role}</p>
        </div>
        <button onClick={onLogout}>Log out</button>
      </header>

      {error && <p className="error card" aria-live="polite">{error}</p>}
      {notice && <p className="success card" aria-live="polite">{notice}</p>}
      {loading ? (
        <p className="card">Loading your secure workspace...</p>
      ) : (
        <>
          <section className="grid stats-grid">
            {Object.entries(stats || {}).map(([k, v]) => (
              <article key={k} className="card stat">
                <p className="muted">{k}</p>
                <h3>{v}</h3>
              </article>
            ))}
          </section>

          {isVictim ? (
            <VictimView reports={reports} resources={resources} setNotice={setNotice} reload={load} user={user} onUserUpdate={onUserUpdate} />
          ) : isStaffOrAdmin(user.role) ? (
            <StaffAdminView reports={reports} resources={resources} setNotice={setNotice} reload={load} />
          ) : (
            <p className="error card">Unknown role for this account. Please contact an administrator.</p>
          )}
        </>
      )}
    </main>
  );
}

function VictimView({ reports, resources, reload, setNotice, user, onUserUpdate }) {
  return (
    <div className="grid columns-2">
      <section className="card">
        <h3>Report Incident</h3>
        <ReportForm onSuccess={async (msg) => { setNotice(msg); await reload(); }} />
      </section>
      <section className="card">
        <h3>Update Profile</h3>
        <ProfileForm user={user} onUserUpdate={onUserUpdate} setNotice={setNotice} />
      </section>
      <section className="card">
        <h3>Case Status Tracking</h3>
        {reports.length === 0 && <p className="muted">No reports yet. Submit an incident to start tracking.</p>}
        {reports.map((r) => <ReportCard key={r.id} report={r} />)}
      </section>
      <section className="card">
        <h3>Feedback & Support</h3>
        <FeedbackForm setNotice={setNotice} />
        <SupportForm setNotice={setNotice} reports={reports} />
      </section>
      <section className="card full">
        <h3>Resource Library</h3>
        <ResourceList resources={resources} />
      </section>
    </div>
  );
}

function StaffAdminView({ reports, resources, reload, setNotice }) {
  const [statusPatch, setStatusPatch] = useState({});
  const [error, setError] = useState("");

  const updateStatus = async (id) => {
    setError("");
    try {
      await api.patch(`/reports/${id}/status`, { status: statusPatch[id] || "under_review" });
      setNotice("Case status updated successfully.");
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="grid columns-2">
      <section className="card full">
        <h3>Incident Queue</h3>
        {error && <p className="error">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.incidentType}</td>
                  <td>{r.status}</td>
                  <td>{r.urgency}</td>
                  <td>
                    <select
                      aria-label={`Update status for ${r.id}`}
                      value={statusPatch[r.id] || r.status}
                      onChange={(e) => setStatusPatch({ ...statusPatch, [r.id]: e.target.value })}
                    >
                      {statusSteps.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => updateStatus(r.id)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>Support Request</h3>
        <SupportForm setNotice={setNotice} reports={reports} />
      </section>
      <section className="card">
        <h3>Resources</h3>
        <ResourceList resources={resources} />
      </section>
    </div>
  );
}

function ReportCard({ report }) {
  const currentIndex = useMemo(() => statusSteps.indexOf(report.status), [report.status]);
  return (
    <article className="report">
      <h4>{report.title}</h4>
      <p className="muted">{report.description}</p>
      <p className="tiny">Case ID: {report.id} | Urgency: {report.urgency}</p>
      <div className="timeline">
        {statusSteps.map((step, i) => (
          <span key={step} className={i <= currentIndex ? "dot active" : "dot"}>
            {step}
          </span>
        ))}
      </div>
    </article>
  );
}

function ReportForm({ onSuccess }) {
  const [form, setForm] = useState({
    incidentType: "",
    description: "",
    location: "",
    serviceNeeded: "Counseling"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        incident_type: form.incidentType,
        issue_details: form.description,
        location: form.location,
        service_needed: form.serviceNeeded
      };
      const { data } = await api.post("/reports", payload);
      setForm({ incidentType: "", description: "", location: "", serviceNeeded: "Counseling" });
      onSuccess(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <label>Incident Type<input required value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })} /></label>
      <label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label>Location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
      <label>
        Service Needed
        <select value={form.serviceNeeded} onChange={(e) => setForm({ ...form, serviceNeeded: e.target.value })}>
          <option value="Counseling">Counseling</option>
          <option value="Legal Referral">Legal Referral</option>
          <option value="Emergency Shelter">Emergency Shelter</option>
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={loading}>{loading ? "Submitting..." : "Submit Secure Report"}</button>
    </form>
  );
}

function ProfileForm({ user, onUserUpdate, setNotice }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || ""
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.put("/profile", form);
      const normalized = normalizeUser(data.profile);
      localStorage.setItem("safehaven_user", JSON.stringify(normalized));
      onUserUpdate(normalized);
      setNotice(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <form onSubmit={submit}>
      <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      {error && <p className="error">{error}</p>}
      <button>Save Profile</button>
    </form>
  );
}

function FeedbackForm({ setNotice }) {
  const [form, setForm] = useState({ comment: "", rating: 5 });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/feedback", form);
      setNotice(data.message);
      setForm({ comment: "", rating: 5 });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <form onSubmit={submit}>
      <label>Feedback<textarea rows={2} required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></label>
      <label>
        Rating
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button>Send Feedback</button>
    </form>
  );
}

function SupportForm({ setNotice, reports }) {
  const defaultIssueId = reports.find((r) => r.status !== "resolved" && r.status !== "solved")?.id || reports[0]?.id || "";
  const [form, setForm] = useState({ supportType: "Counseling", issueId: defaultIssueId, message: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form.issueId && defaultIssueId) {
      setForm((prev) => ({ ...prev, issueId: defaultIssueId }));
    }
  }, [defaultIssueId, form.issueId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        support_type: form.supportType,
        issue_id: form.issueId,
        message: form.message
      };
      const { data } = await api.post("/support-requests", payload);
      setNotice(data.message);
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  return (
    <form onSubmit={submit}>
      <label>
        Report
        <select required value={form.issueId} onChange={(e) => setForm({ ...form, issueId: e.target.value })}>
          <option value="">Select a report</option>
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} - {r.incidentType}
            </option>
          ))}
        </select>
      </label>
      <label>
        Support Type
        <select value={form.supportType} onChange={(e) => setForm({ ...form, supportType: e.target.value })}>
          <option value="Counseling">Counseling</option>
          <option value="Legal Referral">Legal Referral</option>
          <option value="Medical Assistance">Medical Assistance</option>
          <option value="Shelter">Shelter</option>
        </select>
      </label>
      <label>Message<textarea rows={2} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      {error && <p className="error">{error}</p>}
      <button>Request Support</button>
    </form>
  );
}

function ResourceList({ resources }) {
  return (
    <div className="grid resource-grid">
      {resources.map((res) => (
        <article className="resource card-soft" key={res.id}>
          <p className="tiny">{res.category}</p>
          <h4>{res.title}</h4>
          <p className="muted">{res.description}</p>
          <p className="tiny">{res.phone} | {res.location}</p>
        </article>
      ))}
    </div>
  );
}

export default App;
