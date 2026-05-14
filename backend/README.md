# SafeHaven Backend (SRS-Aligned)

Node.js + Express + SQLite backend implementing FR-01 to FR-09 for the SafeHaven Domestic Violence Reporting and Support System.

## Run

```bash
npm install
npm run dev
```

Server runs on `http://localhost:4000` by default.

## Folder Structure

```text
src/
  app.js
  server.js
  config/
    env.js
    db.js
  db/
    schema.sql
    seed.js
  middleware/
    auth.js
    rateLimiter.js
    errorHandler.js
  controllers/
    authController.js
    incidentController.js
    resourceController.js
    profileController.js
    supportController.js
    caseController.js
    dashboardController.js
    feedbackController.js
    adminController.js
    notificationController.js
  routes/
    authRoutes.js
    incidentRoutes.js
    resourceRoutes.js
    profileRoutes.js
    supportRoutes.js
    caseRoutes.js
    dashboardRoutes.js
    feedbackRoutes.js
    adminRoutes.js
    notificationRoutes.js
  utils/
    asyncHandler.js
    jwt.js
    sanitize.js
    notifications.js
```

## Database Schema (SRS Table 17-19)

Implemented in `src/db/schema.sql`:

- **Table 17 (DB01 User Table)**: `users` with required fields:
  - `user_id`, `full_name`, `email`, `password`, `report`, `service_needed`, `created_at`
  - plus operational fields: `role`, `phone`, `updated_at`
- **Table 18 (DB02 Support System Table)**: `support_system`
  - `org_id`, `user_id`, `organization`, `service`, `status`, `reported_at`, `resolved_at`
- **Table 19 (DB03 Arada Kefele Ketema Women and Child Office Issues Table)**:
  - `arada_kefele_ketema_women_child_office_issues`
  - `issue_id`, `user_id`, `issue_details`, `status`, `reported_at`, `resolved_at`
  - plus operational fields: `incident_type`, `service_needed`, `location`, `is_anonymous`, `file_reference`, `updated_at`

Additional tables for use-cases: `resources`, `support_requests`, `feedback`, `notifications`.

## Demo Credentials

- Victim: `victim@safehaven.test` / `Victim@123`
- Support Staff: `staff@safehaven.test` / `Staff@123`
- Admin: `admin@safehaven.test` / `Admin@123`

## API Endpoints (FR Mapping)

### FR-01 User Registration

- `POST /api/auth/signup`

Request:
```json
{
  "full_name": "Selam T.",
  "email": "selam@example.com",
  "password": "StrongPass123",
  "role": "victim",
  "phone": "+251900000111"
}
```

Response:
```json
{
  "message": "Account created successfully.",
  "token": "<jwt>",
  "user": {
    "user_id": "uuid",
    "full_name": "Selam T.",
    "email": "selam@example.com",
    "role": "victim",
    "phone": "+251900000111"
  }
}
```

### FR-02 Login / Authentication

- `POST /api/auth/login`
- `GET /api/auth/me` (protected)

### FR-03 Report Incident (anonymous + logged-in)

- `POST /api/reports`
  - Supports anonymous with `"is_anonymous": true`
  - Supports file simulation (`multipart/form-data`, file field: `file`)

### FR-04 Access Resources

- `GET /api/resources` (protected)

### FR-05 Track Report Status

- `GET /api/reports/:issueId/status` (protected)

### FR-06 Request Support

- `POST /api/support-requests` (protected)

Request:
```json
{
  "issue_id": "issue-1001",
  "support_type": "Counseling",
  "message": "Need immediate counseling support"
}
```

### FR-07 View Case History (role-protected)

- `GET /api/case-history/:userId` (victim own data only; support/admin can view by permission)

### FR-08 Edit Profile

- `GET /api/profile` (protected)
- `PUT /api/profile` (protected)

### FR-09 Administrator Access

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:userId`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:issueId`
- `DELETE /api/admin/reports/:issueId`

## Additional Use Case Endpoints

- Dashboard:
  - `GET /api/dashboard`
  - `GET /api/dashboard/stats`
- Feedback:
  - `POST /api/feedback`
- Provide support (staff/admin):
  - `PATCH /api/support-requests/:requestId`
- Notifications:
  - `GET /api/notifications`
  - `PATCH /api/notifications/:notificationId/read`

## Security and Non-Functional

- Password hashing with `bcryptjs`
- JWT authentication and role-based authorization
- Basic input sanitization
- Basic rate limiting (`authLimiter`, `generalLimiter`)
- Helmet headers for secure defaults
- Graceful error responses for all major failure paths
- Notification simulation and external SMS/email simulation via server logs
