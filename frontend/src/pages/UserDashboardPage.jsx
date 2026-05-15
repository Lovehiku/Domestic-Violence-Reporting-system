import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button, Card, Badge } from '../components/UIComponents';
import { Link } from 'react-router-dom';
import { api, normalizeReport } from '../api';

const UserDashboardPage = ({ user, onLogout }) => {
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes, appointmentsRes, notificationsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/dashboard/stats'),
        api.get('/appointments/my'),
        api.get('/notifications')
      ]);
      setReports((reportsRes.data.reports || []).map(normalizeReport));
      setStats(statsRes.data.stats || {});
      setAppointments(appointmentsRes.data.appointments || []);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'under_review': return <Badge variant="orange">Under Review</Badge>;
      case 'in_progress': return <Badge variant="blue">In Progress</Badge>;
      case 'resolved': return <Badge variant="green">Resolved</Badge>;
      case 'closed': return <Badge variant="gray">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="user-dashboard">
        <div className="dashboard-header mb-xl">
          <div>
            <h1 className="dashboard-title">Welcome, {user?.full_name || 'Survivor'}</h1>
            <p className="text-muted">Your safety is our priority. Monitor your active cases and access immediate support below.</p>
          </div>
          <Link to="/report" className="no-underline">
            <Button variant="navy" className="btn-icon-text">
              <span className="plus-icon">+</span> Report New Incident
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 mb-xl">
          {Object.entries(stats).map(([label, value]) => (
            <Card key={label} className="stats-card text-center">
              <div className="stats-label">{label.toUpperCase()}</div>
              <div className="stats-value">{value}</div>
            </Card>
          ))}
        </div>

        <div className="grid-main-sidebar">
          <div className="main-dash-content">
            {/* Active Reports Table */}
            <Card className="p-0 mb-xl overflow-hidden">
              <div className="card-header-flex p-l border-bottom">
                <h3 className="m-0">My Reports</h3>
                <Link to="#" className="text-green text-bold no-underline">View History →</Link>
              </div>
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Incident Type</th>
                      <th>Status</th>
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center p-xl">Loading reports...</td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan="4" className="text-center p-xl">No active reports found.</td></tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id}>
                          <td className="text-bold">#{report.id?.slice(-6).toUpperCase()}</td>
                          <td>{report.incidentType}</td>
                          <td>{getStatusBadge(report.status)}</td>
                          <td className="text-muted">{new Date(report.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Appointments Section */}
            <Card className="p-0 overflow-hidden">
              <div className="card-header-flex p-l border-bottom">
                <h3 className="m-0">My Appointments</h3>
              </div>
              <div className="appointment-list p-l">
                {loading ? (
                  <p>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-muted italic">No upcoming appointments scheduled.</p>
                ) : (
                  appointments.map((app) => (
                    <div key={app.id} className="appointment-item mb-m p-m border rounded">
                      <div className="app-meta">
                        <Badge variant={app.status === 'confirmed' ? 'green' : 'orange'}>{app.status.toUpperCase()}</Badge>
                        <span className="app-date">{new Date(app.appointment_date).toLocaleString()}</span>
                      </div>
                      <div className="app-details">
                        <div className="app-type"><strong>{app.service_type}</strong></div>
                        <div className="app-notes small text-muted italic">{app.notes}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <aside className="dashboard-sidebar">
            {/* Notifications */}
            <Card className="p-0 mb-xl overflow-hidden">
              <div className="card-header p-l border-bottom">
                <h3 className="m-0">Recent Activity</h3>
              </div>
              <div className="notification-list">
                {notifications.filter(n => !n.is_read).length === 0 ? (
                  <div className="p-l text-center text-muted">No new notifications.</div>
                ) : (
                  notifications.filter(n => !n.is_read).map((note) => (
                    <div key={note.id} className="notification-item p-l border-bottom">
                      <div className="note-icon">🔔</div>
                      <div className="note-body">
                        <div className="note-title text-bold">{note.title}</div>
                        <div className="note-msg small mb-s">{note.message}</div>
                        <div className="note-time x-small text-muted">{new Date(note.created_at).toLocaleTimeString()}</div>
                        <button 
                          className="btn-text-small mt-s"
                          onClick={() => handleMarkAsRead(note.id)}
                        >
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Featured Guide */}
            <div className="featured-resource-card">
              <div className="resource-overlay">
                <Badge variant="orange" className="mb-m">EMERGENCY RESOURCE</Badge>
                <h2 className="text-white mb-m">How to build a safety plan</h2>
                <p className="text-white opacity-90 small mb-xl">
                  A step-by-step guide on securing your digital and physical environment after reporting an incident.
                </p>
                <Button variant="ghost" className="bg-white text-navy w-full">Read Full Guide</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboardPage;
