# CA Pro — SaaS Platform for Chartered Accountants

A production-ready SaaS web application connecting CA professionals with clients across India.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | MySQL + Prisma ORM |
| Auth | JWT + Google OAuth 2.0 |
| Payments | Razorpay |
| Storage | Cloudinary |
| Messaging | WhatsApp Business API (Meta) |
| AI | Google Gemini 1.5 Flash |
| Calendar | Google Workspace Calendar API + Google Meet |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend) + Render/AWS (backend) |

## Project Structure

```
CA/
├── frontend/               # Next.js 15 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/    # Login, Register, Forgot Password, CA Register
│   │   │   ├── (client)/  # Client Dashboard, Bookings, AI Chat
│   │   │   ├── (ca)/      # CA Dashboard, Schedule, Earnings
│   │   │   ├── (admin)/   # Super Admin Dashboard
│   │   │   ├── find-ca/   # CA Listing & Search
│   │   │   ├── ca/[id]/   # CA Profile + Booking
│   │   │   └── page.tsx   # Landing Page
│   │   ├── components/
│   │   │   ├── landing/   # Hero, Services, FAQ, etc.
│   │   │   ├── layout/    # Navbar, Footer, ThemeProvider
│   │   │   └── ui/        # ShadCN components
│   │   ├── lib/           # API client, utils
│   │   └── store/         # Zustand auth store
│   └── package.json
│
└── backend/                # Express.js API
    ├── src/
    │   ├── controllers/   # Auth, CA, Booking, Payment, Service, Admin, AI
    │   ├── middleware/     # Auth, Error, Validation, Rate Limit, Upload
    │   ├── routes/        # All API routes
    │   ├── services/      # Email, WhatsApp, Google Calendar, Gemini AI, Notifications
    │   ├── config/        # Prisma, Cloudinary, Razorpay, env
    │   └── utils/         # JWT, OTP, IDs, Logger, API response
    ├── prisma/
    │   ├── schema.prisma  # Full MySQL schema
    │   └── seed.ts        # Demo data seeder
    └── package.json
```

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Setup Database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed demo data
npm run prisma:seed
```

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# API runs at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App runs at http://localhost:3000
```

### Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@casaas.com | Admin@123456 |
| Client | client@demo.com | Client@123 |

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth sign-in |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend verification OTP |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send password reset link |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user profile |

### CA Professionals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ca` | List CA professionals (with filters) |
| GET | `/api/ca/:id` | Get CA profile |
| GET | `/api/ca/:id/slots` | Get CA available slots |
| POST | `/api/ca/register` | Register as CA (requires auth) |
| PUT | `/api/ca/profile` | Update CA profile |
| GET | `/api/ca/my/profile` | Get my CA profile |
| GET | `/api/ca/my/dashboard` | Get CA dashboard stats |
| POST | `/api/ca/upload/documents` | Upload CA documents |
| POST | `/api/ca/upload/avatar` | Upload CA avatar |
| POST | `/api/ca/slots` | Add time slots |
| DELETE | `/api/ca/slots/:id` | Delete a time slot |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/order` | Create Razorpay order |
| POST | `/api/bookings/confirm` | Confirm booking after payment |
| GET | `/api/bookings/my` | Get client's bookings |
| GET | `/api/bookings/ca/bookings` | Get CA's bookings |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking |
| POST | `/api/bookings/review` | Submit a review |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/webhook` | Razorpay webhook handler |
| GET | `/api/payments/history` | Payment history |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| GET | `/api/services/:slug` | Get service details |
| POST | `/api/services` | Create service (Admin only) |
| PUT | `/api/services/:id` | Update service (Admin only) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform dashboard stats |
| GET | `/api/admin/analytics` | Platform analytics |
| GET | `/api/admin/cas` | List all CAs |
| PUT | `/api/admin/cas/:id/approve` | Approve CA |
| PUT | `/api/admin/cas/:id/reject` | Reject CA |
| PUT | `/api/admin/cas/:id/suspend` | Suspend CA |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/toggle` | Toggle user active status |
| GET | `/api/admin/settings` | Get platform settings |
| PUT | `/api/admin/settings` | Update platform settings |

### AI (Gemini)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/recommend-ca` | Get AI CA recommendations |
| POST | `/api/ai/analyze-document` | Analyze financial document |
| POST | `/api/ai/compliance` | Get compliance suggestions |
| POST | `/api/ai/faq` | Answer tax FAQ |

## Key Business Logic

### CA Onboarding Flow
1. CA registers with email + phone + professional details
2. Razorpay order created for ₹499 onboarding fee
3. Payment processed via Razorpay
4. Webhook triggers → CA status: `PENDING_APPROVAL`
5. Admin reviews profile and documents
6. Admin approves → CA status: `ACTIVE`
7. Confirmation email + WhatsApp sent to CA

### Consultation Booking Flow
1. Client selects service + CA + time slot
2. Razorpay order created for consultation fee
3. Payment verified with signature
4. Google Calendar event + Meet link auto-generated
5. Booking confirmation email + WhatsApp to both parties
6. Reminders sent 1hr and 15min before via WhatsApp
7. Booking auto-marked `COMPLETED` 1hr after scheduled time

### Platform Commission
- Platform takes configurable % commission per consultation (default: 10%)
- CA earnings = Consultation fee - Platform commission
- Tracked in `earnings` table

## Deployment

### Backend (Render / AWS)

```bash
cd backend
npm run build

# Set environment variables in your hosting provider
# Ensure DATABASE_URL points to production MySQL
# Run migrations: npx prisma migrate deploy
```

### Frontend (Vercel)

```bash
# Connect GitHub repo to Vercel
# Set NEXT_PUBLIC_API_URL to your backend URL
# Deploy automatically on push to main
```

### Database (PlanetScale / AWS RDS)

```bash
# Production migration
npx prisma migrate deploy

# Or use PlanetScale (no direct DDL needed):
npx prisma db push
```

## Security Features

- ✅ JWT Access + Refresh token rotation
- ✅ Bcrypt password hashing (rounds: 12)
- ✅ Role-based authorization (CLIENT / CA_PROFESSIONAL / SUPER_ADMIN)
- ✅ Rate limiting (global: 200/15min, auth: 10/15min, OTP: 3/5min)
- ✅ Helmet.js security headers
- ✅ CORS with whitelist
- ✅ Input validation with express-validator
- ✅ Razorpay webhook signature verification
- ✅ File type validation on uploads
- ✅ Environment variable protection
- ✅ SQL injection prevention via Prisma parameterized queries

## Environment Variables Reference

See `backend/.env.example` and `frontend/.env.example` for all required variables.

---

Built with ❤️ for CA professionals across India
