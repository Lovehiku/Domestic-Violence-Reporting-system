import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button, Card, Select, TextArea, Input } from '../components/UIComponents';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

const ReportIncidentPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    incidentType: '',
    description: '',
    location: '',
    witness_info: '',
    serviceNeeded: 'Counseling',
    urgency: 'medium',
    is_anonymous: false
  });

  const steps = [
    { id: 1, label: 'Details' },
    { id: 2, label: 'Location & Witness' },
    { id: 3, label: 'Review' },
  ];

  const handleContinue = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/reports', {
        incident_type: form.incidentType,
        issue_details: form.description,
        location: form.location,
        witness_info: form.witness_info,
        service_needed: form.serviceNeeded,
        urgency: form.urgency,
        is_anonymous: form.is_anonymous
      });
      // Corrected redirection to dashboard instead of landing page
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const violenceTypes = [
    { value: '', label: 'Select the nature of the incident' },
    { value: 'Physical Abuse', label: 'Physical Abuse' },
    { value: 'Emotional Abuse', label: 'Emotional Abuse' },
    { value: 'Sexual Abuse', label: 'Sexual Abuse' },
    { value: 'Harassment', label: 'Harassment' },
    { value: 'Stalking', label: 'Stalking' },
    { value: 'Financial Abuse', label: 'Financial Abuse' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Not immediate threat' },
    { value: 'medium', label: 'Medium - Potential threat' },
    { value: 'high', label: 'High - Immediate danger' },
  ];

  const services = [
    { value: 'Counseling', label: 'Counseling' },
    { value: 'Legal Aid', label: 'Legal Aid' },
    { value: 'Shelter', label: 'Emergency Shelter' },
    { value: 'Medical', label: 'Medical Assistance' },
  ];

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="reporting-container">
        <div className="reporting-header">
          <div>
            <h1 className="reporting-title">Report an Incident</h1>
            <p className="text-muted">Step {step} of 3: {steps.find(s => s.id === step).label}</p>
          </div>
          <div className="encryption-badge">
            <span role="img" aria-label="lock">🔒</span> This report is end-to-end encrypted.
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="steps-tabs">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`step-tab ${step === s.id ? 'active' : ''}`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="grid-main-sidebar">
          <div className="reporting-form-area">
            <Card className="p-large">
              {error && <div className="error-alert">{error}</div>}
              
              {step === 1 && (
                <div className="animate-fade-in">
                  <Select 
                    label="Type of Violence"
                    options={violenceTypes}
                    value={form.incidentType}
                    onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
                    required
                  />
                  <TextArea 
                    label="Description of Incident"
                    placeholder="Please describe what happened in as much detail as you feel comfortable sharing..."
                    rows={8}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <div className="checkbox-group">
                    <input 
                      type="checkbox" 
                      id="anonymous" 
                      checked={form.is_anonymous}
                      onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                    />
                    <label htmlFor="anonymous">Report anonymously</label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <Input 
                    label="Incident Location"
                    placeholder="Where did this occur?"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                  <Input 
                    label="Witness Information (Optional)"
                    placeholder="Names or contact details of any witnesses"
                    value={form.witness_info}
                    onChange={(e) => setForm({ ...form, witness_info: e.target.value })}
                  />
                  <Select 
                    label="Urgency Level"
                    options={urgencyLevels}
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  />
                  <Select 
                    label="Primary Service Needed"
                    options={services}
                    value={form.serviceNeeded}
                    onChange={(e) => setForm({ ...form, serviceNeeded: e.target.value })}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in review-section">
                  <h3>Review Your Report</h3>
                  <div className="review-grid">
                    <div className="review-item"><strong>Type:</strong> {form.incidentType}</div>
                    <div className="review-item"><strong>Location:</strong> {form.location}</div>
                    <div className="review-item"><strong>Urgency:</strong> {form.urgency.toUpperCase()}</div>
                    <div className="review-item"><strong>Service:</strong> {form.serviceNeeded}</div>
                    <div className="review-item"><strong>Anonymous:</strong> {form.is_anonymous ? 'Yes' : 'No'}</div>
                    <div className="review-item full-width"><strong>Description:</strong> {form.description}</div>
                    {form.witness_info && <div className="review-item full-width"><strong>Witnesses:</strong> {form.witness_info}</div>}
                  </div>
                </div>
              )}

              <div className="form-actions mt-xl">
                {step > 1 && <Button variant="ghost" onClick={handleBack}>BACK</Button>}
                {step < 3 ? (
                  <Button onClick={handleContinue} className="btn-wide">CONTINUE</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading} className="btn-wide">
                    {loading ? 'SUBMITTING...' : 'SUBMIT SECURE REPORT'}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>CANCEL</Button>
              </div>
            </Card>
          </div>

          <aside className="reporting-sidebar">
            <Card className="bg-light-green mb-l">
              <div className="sidebar-safety-title">
                <span role="img" aria-label="shield">🛡️</span> Reporting Safely
              </div>
              <ul className="safety-list">
                <li>Ensure you are in a private, secure location before filling out this form.</li>
                <li>Use Incognito or Private browsing mode if you are using a shared device.</li>
                <li>You can save your progress and return later if you feel unsafe.</li>
              </ul>
            </Card>

            <Card className="bg-navy text-white">
              <h4 className="text-white mb-m">Need to talk now?</h4>
              <p className="small opacity-80 mb-l">
                Our support specialists are standing by to offer confidential guidance.
              </p>
              <button onClick={() => navigate('/support')} className="btn-link-white">
                View Support Resources →
              </button>
            </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default ReportIncidentPage;
