CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  report TEXT,
  service_needed TEXT,
  role TEXT NOT NULL CHECK(role IN ('victim','support_staff','admin')),
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Table 18: DB02-Support System Table (names match SRS)
CREATE TABLE IF NOT EXISTS support_system (
  org_id TEXT PRIMARY KEY,
  user_id TEXT,
  organization TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ongoing','resolved','pending')),
  reported_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Table 19: DB03-Arada Kefele Ketema Women and Child Office Issues Table (names match SRS)
CREATE TABLE IF NOT EXISTS arada_kefele_ketema_women_child_office_issues (
  issue_id TEXT PRIMARY KEY,
  user_id TEXT,
  issue_details TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('under_review','in_progress','resolved','ongoing','solved')),
  reported_at TEXT NOT NULL,
  resolved_at TEXT,
  incident_type TEXT NOT NULL,
  service_needed TEXT,
  location TEXT,
  witness_info TEXT,
  urgency TEXT CHECK(urgency IN ('low','medium','high')),
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  file_reference TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resources (
  resource_id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  description TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_requests (
  request_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  issue_id TEXT,
  support_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('open','in_progress','closed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (issue_id) REFERENCES arada_kefele_ketema_women_child_office_issues(issue_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('info','success','warning','alert')),
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider_id TEXT, -- Can be null if generic request
  service_type TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','cancelled','completed')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
