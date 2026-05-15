import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, normalizeUser } from '../api';
import { Button, Card, Input } from '../components/UIComponents';

const LoginPage = ({ onAuth }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const normalized = normalizeUser(data.user);
      localStorage.setItem('safehaven_token', data.token);
      localStorage.setItem('safehaven_user', JSON.stringify(normalized));
      onAuth(normalized);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
            <p className="text-muted">Welcome back. Access your secure workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input 
              label="Email Address" 
              type="email" 
              required 
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input 
              label="Password" 
              type="password" 
              required 
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            
            {error && <div className="error-alert mb-l">{error}</div>}
            
            <Button 
              type="submit" 
              disabled={loading} 
              variant="navy" 
              className="w-full py-m mb-l"
            >
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </Button>
          </form>

          <div className="auth-footer text-center">
            <span className="text-muted">No account yet? </span>
            <Link to="/signup" className="text-orange text-bold no-underline">Create an Account</Link>
          </div>
        </Card>
        
        <div className="auth-security-notice mt-l text-center">
          <span role="img" aria-label="shield">🛡️</span> Your data is protected by military-grade encryption.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
