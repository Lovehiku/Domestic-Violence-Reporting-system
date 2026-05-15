import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Badge, Input, TextArea } from '../components/UIComponents';
import { api } from '../api';

const SupportServicesPage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Counseling');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get('/resources');
        setResources(data.resources || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleRequestReferral = (resource) => {
    setSelectedResource(resource);
    setShowAppointmentModal(true);
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      // Real API call for scheduling
      await api.post('/appointments', {
        service_type: selectedResource.category,
        appointment_date: `${appointmentForm.date}T${appointmentForm.time}`,
        notes: appointmentForm.notes,
        provider_id: selectedResource.id
      });
      
      // Also send a support request to notify staff
      await api.post('/support-requests', {
        support_type: 'Appointment Request',
        message: `User ${user.full_name} requested an appointment with ${selectedResource.name} on ${appointmentForm.date} at ${appointmentForm.time}. Notes: ${appointmentForm.notes}`
      });

      alert('Appointment requested! A support staff member will confirm shortly.');
      setShowAppointmentModal(false);
      setAppointmentForm({ date: '', time: '', notes: '' });
    } catch (err) {
      alert('Error scheduling appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const tabs = ['Counseling', 'Legal Aid', 'Shelters', 'Medical'];

  const filteredResources = resources.filter(r => 
    r.category.toLowerCase().includes(activeTab.toLowerCase().split(' ')[0]) ||
    (activeTab === 'Shelters' && r.category.toLowerCase().includes('shelter'))
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="support-services-container">
        <div className="support-header mb-xl">
          <h1 className="support-title">Support Services</h1>
          <p className="text-muted">Access professional counseling, legal aid, and medical resources tailored to your safety needs.</p>
        </div>

        <div className="search-bar-wrap mb-xl">
          <Input 
            placeholder="Search by organization, keyword, or location..." 
            className="search-input"
          />
          <Button className="search-btn">FIND HELP</Button>
        </div>

        <div className="support-tabs mb-l">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              className={`support-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid-main-sidebar">
          <div className="resource-list">
            {loading ? (
              <div className="loading-state">Loading verified resources...</div>
            ) : filteredResources.length === 0 ? (
              <Card className="empty-state">No resources found in this category near your location.</Card>
            ) : (
              filteredResources.map((res) => (
                <Card key={res.id} className="resource-card mb-m">
                  <div className="resource-badge-wrap">
                    <Badge variant="green">{res.category.toUpperCase()}</Badge>
                    <div className="resource-phone-icon">📞</div>
                  </div>
                  <h3 className="resource-name mb-s">{res.name}</h3>
                  <div className="resource-location mb-m">
                    <span role="img" aria-label="pin">📍</span> {res.location}
                  </div>
                  <p className="resource-desc mb-l">{res.description}</p>
                  
                  <div className="resource-actions">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => handleRequestReferral(res)}
                    >
                      REQUEST REFERRAL & APPOINTMENT →
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <aside className="support-sidebar">
            <Card className="mb-l">
              <h3 className="mb-l">Educational Content</h3>
              <div className="edu-list">
                <div className="edu-item mb-m">
                  <div className="edu-tag text-orange">ARTICLE</div>
                  <h4 className="edu-title">Recognizing Early Warning Signs</h4>
                  <div className="edu-border border-orange" />
                </div>
                <div className="edu-item mb-m">
                  <div className="edu-tag text-green">LEGAL GUIDE</div>
                  <h4 className="edu-title">Understanding Your Legal Protections</h4>
                  <div className="edu-border border-green" />
                </div>
                <div className="edu-item">
                  <div className="edu-tag text-navy">SAFETY PLAN</div>
                  <h4 className="edu-title">Building a Digital Safety Strategy</h4>
                  <div className="edu-border border-navy" />
                </div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="map-placeholder">
                <div className="map-pin">📍</div>
              </div>
              <div className="p-l">
                <h4 className="mb-s">Nearby Resources</h4>
                <p className="small text-muted mb-m">Showing 14 results within 5 miles of your current location.</p>
                <a href="#" className="map-link">Open Interactive Map ↗</a>
              </div>
            </Card>
          </aside>
        </div>

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="modal-overlay">
            <Card className="modal-content p-xl" style={{ maxWidth: '500px' }}>
              <div className="modal-header mb-l">
                <h2>Schedule with {selectedResource.name}</h2>
                <button className="close-btn" onClick={() => setShowAppointmentModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleScheduleAppointment}>
                <div className="grid-2 gap-m mb-m">
                  <Input 
                    label="Preferred Date" 
                    type="date" 
                    required 
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                  />
                  <Input 
                    label="Preferred Time" 
                    type="time" 
                    required 
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                  />
                </div>
                <TextArea 
                  label="Additional Notes" 
                  placeholder="Is there anything the consultant should know beforehand?"
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                />
                <div className="mt-l">
                  <Button type="submit" className="w-full">CONFIRM APPOINTMENT REQUEST</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupportServicesPage;
