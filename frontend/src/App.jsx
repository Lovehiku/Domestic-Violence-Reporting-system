import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api, normalizeUser, normalizeReport } from "./api";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import SupportServicesPage from "./pages/SupportServicesPage";

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("safehaven_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("safehaven_token");
    localStorage.removeItem("safehaven_user");
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const loadData = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/reports");
      setReports((data.reports || []).map(normalizeReport));
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route path="/login" element={<LoginPage onAuth={setUser} />} />
      <Route path="/signup" element={<SignupPage onAuth={setUser} />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} onAuth={setUser}>
            {user?.role === 'victim' ? (
              <UserDashboardPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            ) : (
              <AdminDashboardPage user={user} onLogout={handleLogout} />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute user={user} onAuth={setUser}>
            <ReportIncidentPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute user={user} onAuth={setUser}>
            <SupportServicesPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} onAuth={setUser}>
            <AdminDashboardPage user={user} onLogout={handleLogout} />
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
      <p>Restoring secure session...</p>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default App;
