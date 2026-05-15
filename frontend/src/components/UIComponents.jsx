import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline-green',
    ghost: 'btn-ghost',
    navy: 'btn-navy',
    orange: 'btn-orange',
    danger: 'btn-danger'
  };
  return (
    <button className={`btn ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', title, ...props }) => (
  <div className={`card ${className}`} {...props}>
    {title && <h3 className="card-title">{title}</h3>}
    {children}
  </div>
);

export const Badge = ({ children, variant = 'blue', className = '' }) => {
  const variants = {
    blue: 'badge-blue',
    green: 'badge-green',
    orange: 'badge-orange',
    red: 'badge-red',
    gray: 'badge-gray'
  };
  return (
    <span className={`badge ${variants[variant] || variants.blue} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input className="form-control" {...props} />
  </div>
);

export const TextArea = ({ label, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <textarea className="form-control" {...props} />
  </div>
);

export const Select = ({ label, options, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <select className="form-control" {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
