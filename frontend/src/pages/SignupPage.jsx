import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, normalizeUser } from '../api';
import { Button, Card, Input, Select } from '../components/UIComponents';

const SignupPage = ({ onAuth }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'victim', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        full_name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone
      });
      const normalized = normalizeUser(data.user);
      localStorage.setItem('safehaven_token', data.token);
      localStorage.setItem('safehaven_user', JSON.stringify(normalized));
      onAuth(normalized);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background" />
      <div className="auth-container">
        <Card className="auth-card p-xl">
          <div className="auth-header text-center mb-xl">
            <h1 className="auth-logo mb-s">SafetyLink</h1>
            <p className="text-muted">Create your secure, confidential account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input 
              label="Full Name" 
              required 
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input 
              label="Email Address" 
              type="email" 
              required 
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="grid-2 gap-m">
              <Input 
                label="Password (min. 8 chars)" 
                type="password" 
                required 
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Input 
                label="Phone (Optional)" 
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            
            <Select 
              label="Account Type"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'victim', label: 'Survivor / Citizen' },
                { value: 'support_staff', label: 'Support Worker (NGO/Gov)' },
                { value: 'admin', label: 'System Administrator' },
              ]}
            />
            
            {error && <div className="error-alert mb-l">{error}</div>}
            
            <Button 
              type="submit" 
              disabled={loading} 
              variant="navy" 
              className="w-full py-m mb-l"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE SECURE ACCOUNT'}
            </Button>
          </form>

          <div className="auth-footer text-center">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-orange text-bold no-underline">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
