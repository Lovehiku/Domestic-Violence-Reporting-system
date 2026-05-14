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
      <Route path="/" element={<LandingPage user={user} />} />
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
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "victim", remember: false, privacyAgreement: false, anonymous: false });
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
    <div className="auth-shell">
      <div className="auth-topbar">
        <span>IMMEDIATE ASSISTANCE REQUIRED? CALL 911 OR LOCAL EMERGENCY SERVICES</span>
      </div>
      <header className="auth-header">
        <div className="auth-brand">SAFETYLINK</div>
        <nav className="auth-nav">
          <a href="/" className="auth-nav-link">HOME</a>
          <a href="/" className="auth-nav-link">SUPPORT SERVICES</a>
        </nav>
        <div className="auth-actions">
          <Link to="/login" className="auth-action-link">Login</Link>
          <Link to="/signup" className="auth-action-button">Sign Up</Link>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-panel auth-panel-left">
          <div className="auth-card auth-card-hero">
            <div className="auth-card-badge">END-TO-END ENCRYPTED</div>
            <h2>{isLogin ? "Your Secure Hub for Safety." : "Secure your journey to safety."}</h2>
            <p>
              {isLogin
                ? "Empowering incident response with institutional reliability and empathetic support."
                : "Join SafetyLink to access specialized support services, track your incident reports securely, and connect with trained professionals in a private, protected environment."
              }
            </p>

            {!isLogin && (
              <div className="auth-info-grid">
                <div className="info-tile">
                  <strong>Data Privacy</strong>
                  <p>Your identity and records are protected by bank-level encryption.</p>
                </div>
                <div className="info-tile">
                  <strong>Expert Support</strong>
                  <p>Immediate connection to specialized case management teams.</p>
                </div>
              </div>
            )}

            <div className={isLogin ? "hero-visual hero-visual-login" : "hero-visual hero-visual-signup"}>
              <div className="hero-overlay" />
              <div className="hero-copy">
                <span>{isLogin ? "Secure workspace" : "Welcome to SafetyLink"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel-right">
          <div className="auth-card auth-card-form">
            <div className="form-headline">
              <h3>{isLogin ? "Welcome Back" : "Create Account"}</h3>
              <p>{isLogin ? "Log in to manage your safety reports." : "Step 1 of 2: Basic Information"}</p>
            </div>

            <form onSubmit={submit} className="auth-form">
              {!isLogin && (
                <label className="field-group">
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </label>
              )}

              <label className="field-group">
                <span>Email Address</span>
                <input
                  type="email"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={isLogin ? "name@organization.com" : "name@example.com"}
                />
              </label>

              <label className="field-group">
                <div className="field-label-row">
                  <span>Password</span>
                  {isLogin ? <a href="/" className="field-link">Forgot Password?</a> : null}
                </div>
                <input
                  type="password"
                  value={form.password}
                  required
                  minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                {!isLogin && <span className="field-hint">Minimum 8 characters with at least one symbol.</span>}
              </label>

              {isLogin ? (
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  />
                  <span>Remember this device</span>
                </label>
              ) : (
                <>
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={form.privacyAgreement}
                      onChange={(e) => setForm({ ...form, privacyAgreement: e.target.checked })}
                    />
                    <span>I agree to the <a href="/" className="inline-link">Privacy Policy</a> and terms of service.</span>
                  </label>
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={form.anonymous}
                      onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                    />
                    <span>I want to report anonymously</span>
                  </label>
                </>
              )}

              {error && <div className="auth-error"><span>⚠️</span>{error}</div>}

              <button type="submit" className="primary auth-submit-btn" disabled={loading}>
                {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "SIGN IN" : "CREATE MY SECURE ACCOUNT")}
              </button>
            </form>

            <div className="auth-switch">
              <span>{isLogin ? "New to SafetyLink?" : "Already have an account?"}</span>
              <Link to={isLogin ? "/signup" : "/login"} className="auth-switch-link">
                {isLogin ? "CREATE AN ACCOUNT" : "Log in here"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
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

function LandingPage({ user }) {
  return (
    <div className="landing-page">
      <div className="lp-warning-bar">
        <span className="lp-warning-icon">!</span> IMMEDIATE HELP: Call 952 or 1234
      </div>
      <header className="lp-header">
        <div className="lp-header-content">
          <div className="lp-logo">SAFETYLINK</div>
          <nav className="lp-nav">
            <Link to="/" className="lp-nav-link active">HOME</Link>
            <Link to="/dashboard" className="lp-nav-link">SUPPORT SERVICES</Link>
            {user ? (
              <Link to="/dashboard" className="lp-nav-link">DASHBOARD</Link>
            ) : (
              <>
                <Link to="/login" className="lp-nav-link">LOGIN</Link>
                <Link to="/signup" className="lp-btn-primary">SIGN UP</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <h1 className="lp-title">
            <span className="lp-title-line">You Are Not Alone.</span>
            <span className="lp-title-line">Get Help or Report Safely.</span>
          </h1>
          <p className="lp-subtitle">
            A secure, confidential space for incident management and professional<br />
            support services. We prioritize your privacy and safety above all else.
          </p>

          <div className="lp-hero-cards">
            <div className="lp-card lp-card-report">
              <div className="lp-card-icon-wrap lp-icon-dark">
                <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2>Report an Incident</h2>
              <p>Submit a secure, confidential report to our safety officers. We ensure complete discretion and immediate review.</p>
              <Link to="/dashboard" className="lp-btn-dark">START REPORTING <span className="lp-arrow">&rarr;</span></Link>
            </div>
            
            <div className="lp-card lp-card-support">
              <div className="lp-card-icon-wrap lp-icon-green">
                <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              </div>
              <h2>Access Support Services</h2>
              <p>Connect with mental health resources, legal guidance, and professional counselors available 24/7.</p>
              <Link to="/dashboard" className="lp-btn-outline">FIND SUPPORT <span className="lp-chat-icon">💬</span></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="lp-secondary">
        <div className="lp-secondary-content">
          <div className="lp-resources">
            <h2>Immediate Resource Directory</h2>
            <p>Browse our verified library of safety protocols, legal documentation, and crisis management tools designed for clarity and rapid response.</p>
            
            <div className="lp-resource-cards">
              <div className="lp-resource-card">
                <svg className="lp-r-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
                <div>
                  <h4>Incident Guides</h4>
                  <p>Step-by-step documentation</p>
                </div>
              </div>
              <div className="lp-resource-card">
                <svg className="lp-r-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <div>
                  <h4>Legal Rights</h4>
                  <p>Know your protections</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lp-expert-card">
            <div className="lp-expert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3>Talk to an Expert</h3>
            <p>Speak directly with a trained safety consultant in a secure environment.</p>
            <Link to="/login" className="lp-btn-orange">CONNECT NOW</Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-left">
            <strong>SafetyLink Support</strong>
            <p>&copy; 2024 SafetyLink Support. All rights reserved.</p>
          </div>
          <div className="lp-footer-links">
            <Link to="#">Contact Us</Link>
            <Link to="#">Legal Disclaimers</Link>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Accessibility</Link>
          </div>
          <div className="lp-footer-social">
            <svg className="lp-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" y1="8" x2="12" y2="8" />
              <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
              <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
            </svg>
            <svg className="lp-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
