import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ user }) => {
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
            <Link to="/support" className="lp-nav-link">SUPPORT SERVICES</Link>
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
              <Link to="/report" className="lp-btn-dark">START REPORTING <span className="lp-arrow">&rarr;</span></Link>
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
              <Link to="/support" className="lp-btn-outline">FIND SUPPORT <span className="lp-chat-icon">💬</span></Link>
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
            {/* Social Icons Placeholder */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
