import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button, TextArea } from '../components/UIComponents';
import { api, normalizeReport } from '../api';

const AdminDashboardPage = ({ user, onLogout }) => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('queue'); // 'queue', 'users', 'appointments'
  const [selectedReport, setSelectedReport] = useState(null);
  const [supportNote, setSupportNote] = useState('');

  const isSupportStaff = user?.role === 'support_staff';
  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.get('/admin/reports'),
        api.get('/dashboard/stats')
      ]);
      setReports((reportsRes.data.reports || []).map(normalizeReport));
      setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status });
      fetchData();
      setSelectedReport(null);
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProvideSupport = async (reportId) => {
    if (!supportNote.trim()) return alert('Please enter a support note.');
    try {
      // Corrected API endpoint (removed double /api)
      await api.post(`/support-requests`, {
        issue_id: reportId,
        support_type: 'Staff Follow-up',
        message: supportNote
      });
      alert('Support note sent to the survivor.');
      setSupportNote('');
    } catch (err) {
      alert('Error sending support: ' + (err.response?.data?.message || err.message));
    }
  };

  const getPriorityColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="staff-dashboard">
        <div className="dashboard-header mb-xl">
          <div>
            <h1 className="dashboard-title">
              {isSupportStaff ? 'Support Intelligence Dashboard' : 'System Administration'}
            </h1>
            <p className="text-muted">
              {isSupportStaff 
                ? 'Real-time oversight of reported incidents and active support requests.' 
                : 'Manage system users, resources, and oversight of all platform activity.'}
            </p>
          </div>
          <div className="dashboard-actions">
            <Button variant="outline" onClick={fetchData}>Refresh Data</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-3 mb-xl">
          {Object.entries(stats).map(([label, value]) => (
            <Card key={label} className="stats-card">
              <div className="stats-label">{label.toUpperCase()}</div>
              <div className="stats-value">{value}</div>
              <div className={`stats-trend ${value > 10 ? 'trend-up' : ''}`}>
                {value > 10 ? 'Active' : 'Stable'}
              </div>
            </Card>
          ))}
        </div>

        {/* View Switcher */}
        <div className="tab-navigation mb-l">
          <button 
            className={`tab-btn ${view === 'queue' ? 'active' : ''}`}
            onClick={() => setView('queue')}
          >
            Incident Queue
          </button>
          {isAdmin && (
            <button 
              className={`tab-btn ${view === 'users' ? 'active' : ''}`}
              onClick={() => setView('users')}
            >
              User Management
            </button>
          )}
          <button 
            className={`tab-btn ${view === 'appointments' ? 'active' : ''}`}
            onClick={() => setView('appointments')}
          >
            Appointments
          </button>
        </div>

        {view === 'queue' && (
          <div className="incident-queue">
            {loading ? (
              <div className="loading-state">Loading active incidents...</div>
            ) : reports.length === 0 ? (
              <Card className="empty-state">No pending incidents in the queue.</Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="incident-item mb-m">
                  <div className={`priority-indicator bg-${getPriorityColor(report.urgency)}`} />
                  <div className="incident-content">
                    <div className="incident-meta mb-s">
                      <Badge variant={getPriorityColor(report.urgency)}>{report.urgency?.toUpperCase()} PRIORITY</Badge>
                      <span className="case-id">CASE #{report.id?.slice(-6).toUpperCase()}</span>
                      <span className="case-time">{new Date(report.reportedAt).toLocaleString()}</span>
                    </div>
                    <h3 className="incident-type mb-s">{report.incidentType}</h3>
                    <p className="incident-desc mb-m">{report.description}</p>
                    <div className="incident-footer">
                      <div className="incident-location">
                        <span role="img" aria-label="pin">📍</span> {report.location}
                      </div>
                      <div className="incident-status">
                        <span role="img" aria-label="status">🔄</span> Status: <Badge variant="blue">{report.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="incident-actions">
                    <Button 
                      variant="primary" 
                      onClick={() => setSelectedReport(report)}
                    >
                      MANAGE CASE
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Case Management Modal/Drawer Overlay */}
        {selectedReport && (
          <div className="modal-overlay">
            <Card className="modal-content p-xl">
              <div className="modal-header mb-l">
                <h2>Manage Case #{selectedReport.id?.slice(-6).toUpperCase()}</h2>
                <button className="close-btn" onClick={() => setSelectedReport(null)}>&times;</button>
              </div>
              
              <div className="modal-body grid-2 mb-l">
                <div className="case-details">
                  <h4>Incident Details</h4>
                  <p><strong>Type:</strong> {selectedReport.incidentType}</p>
                  <p><strong>Location:</strong> {selectedReport.location}</p>
                  <p><strong>Urgency:</strong> {selectedReport.urgency}</p>
                  <p><strong>Service Requested:</strong> {selectedReport.serviceNeeded}</p>
                  <p className="mt-m"><strong>Description:</strong></p>
                  <p className="bg-light p-m rounded">{selectedReport.description}</p>
                </div>
                
                <div className="case-action-panel">
                  <h4>Update Status</h4>
                  <div className="status-buttons mb-l">
                    <Button 
                      variant={selectedReport.status === 'under_review' ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedReport.id, 'under_review')}
                    >
                      Under Review
                    </Button>
                    <Button 
                      variant={selectedReport.status === 'in_progress' ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedReport.id, 'in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant={selectedReport.status === 'resolved' ? 'primary' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    >
                      Resolved
                    </Button>
                  </div>

                  <h4>Provide Support Response</h4>
                  <TextArea 
                    placeholder="Write a message or support instructions for the survivor..."
                    value={supportNote}
                    onChange={(e) => setSupportNote(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    variant="navy" 
                    className="w-full"
                    onClick={() => handleProvideSupport(selectedReport.id)}
                  >
                    SEND SUPPORT NOTE
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
