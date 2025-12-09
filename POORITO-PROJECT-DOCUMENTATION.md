# **POORITO: Mountain Trail Booking System**
## Comprehensive Project Documentation for Panel Defense

---

## **I. RATIONALE**

### Background
The Philippines is home to over 7,000 islands with diverse mountain landscapes, making it a prime destination for hiking and outdoor adventures. However, the hiking tourism industry faces several challenges:

1. **Fragmented Information**: Trail information is scattered across social media, forums, and word-of-mouth, making it difficult for hikers to plan trips effectively.

2. **Booking Inefficiencies**: Traditional booking methods (phone calls, text messages, walk-ins) lead to overbooking, scheduling conflicts, and poor resource allocation.

3. **Safety Concerns**: Without centralized systems, tracking hikers and managing trail capacity becomes challenging, increasing safety risks.

4. **Lack of Transparency**: Pricing, availability, and itinerary details are often unclear, leading to customer dissatisfaction.

5. **Administrative Burden**: Tour organizers spend excessive time on manual booking management, confirmation calls, and record-keeping.

### The Need for Poorito
Poorito addresses these gaps by providing a **unified digital platform** that:
- Centralizes mountain/trail information (elevation, difficulty, duration, fees, itineraries)
- Automates booking management with real-time availability tracking
- Provides transparent pricing for both **joiner** and **exclusive** hikes
- Enables admins to efficiently manage bookings with approval workflows
- Improves hiker safety through capacity management and organized scheduling

---

## **II. OBJECTIVES**

### General Objective
To develop a comprehensive web-based mountain trail booking and information management system that streamlines the hiking experience for users while providing efficient administrative tools for tour operators.

### Specific Objectives

#### 1. For End Users (Hikers)
- Enable users to explore mountain trails with detailed information (location, difficulty, elevation, distance, fees, and itinerary)
- Allow users to book hikes (joiner or exclusive) with automatic date and pricing calculations
- Provide user dashboard for managing bookings and viewing receipts
- Implement secure authentication (registration, login, password recovery)

#### 2. For Administrators
- Provide mountain management tools (CRUD operations for trails)
- Implement booking approval workflow (pending → confirmed/rejected)
- Enable analytics dashboard for tracking statistics
- Support content management for articles and hiking guides

#### 3. For System Operations
- Implement real-time availability checking to prevent overbooking
- Automate email confirmations upon booking approval
- Enforce business rules (single driver rule, joiner capacity limits)
- Ensure data integrity with validation at both client and server levels

---

## **III. METHODOLOGY**

### A. System Development Methodology
**Agile Development with Iterative Approach**

| Phase | Activities | Deliverables |
|-------|-----------|--------------|
| **1. Planning** | Requirements gathering, stakeholder interviews, feature prioritization | Product backlog, user stories |
| **2. Design** | UI/UX wireframes, database schema design, API specification | Design mockups, ER diagrams |
| **3. Development** | Frontend (React), Backend (Node.js/Express), Database (Supabase/PostgreSQL) | Working modules |
| **4. Testing** | Unit testing, integration testing, UAT | Test reports, bug fixes |
| **5. Deployment** | Cloud deployment, configuration, monitoring | Live system |

---

### B. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              React.js Frontend (Website)                    │ │
│  │  • Public Pages: Home, Explore, Mountain Details, Guides    │ │
│  │  • User Pages: Dashboard, Booking, Receipt                  │ │
│  │  • Admin Pages: Dashboard, Mountains CRUD, Bookings, Articles│ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Node.js + Express.js Backend                   │ │
│  │  • REST API Endpoints                                       │ │
│  │  • JWT Authentication & Authorization                       │ │
│  │  • Business Logic (Pricing, Availability, Validation)       │ │
│  │  • Email Service (Booking Confirmations)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Supabase (PostgreSQL)                          │ │
│  │  Tables: users, mountains, bookings, articles               │ │
│  │  • Row-Level Security (RLS) Policies                        │ │
│  │  • JSONB for flexible data (itinerary, budgeting, images)   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### C. Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Frontend** | React.js 18 | Component-based, fast rendering, large ecosystem |
| **Styling** | Tailwind CSS | Utility-first, responsive design, rapid prototyping |
| **Routing** | React Router v6 | Declarative routing, nested routes support |
| **Backend** | Node.js + Express | JavaScript consistency, non-blocking I/O, RESTful APIs |
| **Database** | Supabase (PostgreSQL) | Free tier, real-time capabilities, built-in auth, RLS |
| **Authentication** | JWT + bcrypt | Stateless, secure password hashing |
| **Email** | Nodemailer | Reliable email delivery for confirmations |
| **Deployment** | Railway/Vercel | Easy CI/CD, auto-scaling, cost-effective |

---

### D. Database Schema Overview

**Core Tables:**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id, username, email, password, role |
| `mountains` | Trail information | id, name, elevation, location, difficulty, status, pricing, itinerary (JSONB), budgeting (JSONB), what_to_bring (JSONB) |
| `bookings` | Booking records | id, user_id, mountain_id, start_date, end_date, status, booking_type, number_of_participants, total_price |
| `articles` | Hiking guides/tips | id, title, content, author, category, status |

---

### E. Key Features & Business Logic

#### 1. Booking Types

| Type | Description | Pricing Logic |
|------|-------------|---------------|
| **Joiner** | Shared hike with other participants | `base_price_per_head × participants × trip_duration` |
| **Exclusive** | Private hike for a group | Fixed `exclusive_price` |

#### 2. Booking Workflow

```
User Books → Status: PENDING → Admin Reviews → 
  ├─ APPROVE → Status: CONFIRMED → Email Sent → Affects Availability
  └─ REJECT  → Status: REJECTED → No availability impact
```

#### 3. Availability Management
- **Joiner Capacity**: Max participants per date (default: 14)
- **Exclusive Blocking**: Exclusive bookings block all slots for those dates
- **Single Driver Rule**: Only one confirmed booking per date globally (business rule)

#### 4. Validation Rules
- Start date must be in the future
- End date auto-calculated based on `trip_duration`
- Participants: 1-20 for joiners; full capacity for exclusive
- No duplicate bookings for same user/mountain/date range

---

### F. User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Guest** | View mountains, explore trails, read articles |
| **User** | All guest actions + Register, login, book hikes, manage bookings, view receipts |
| **Admin** | All actions + Mountain CRUD, booking approval/rejection, article management, analytics |

---

### G. Security Measures

| Measure | Implementation |
|---------|----------------|
| **Authentication** | JWT tokens with expiration |
| **Password Security** | bcrypt hashing (10 salt rounds) |
| **Authorization** | Role-based middleware (`requireAdmin`) |
| **Database Security** | Row-Level Security (RLS) policies |
| **API Protection** | Rate limiting (100 req/15 min), Helmet headers, CORS |
| **Input Validation** | Client-side + Server-side validation |

---

## **IV. CONCLUSION**

### Summary of Achievements
The **Poorito Mountain Trail Booking System** successfully delivers:

1. **A User-Friendly Platform** - Intuitive interface for exploring mountains and booking hikes with real-time availability checking

2. **Efficient Administrative Tools** - Comprehensive dashboard for managing mountains, processing bookings with approval workflow, and tracking analytics

3. **Robust Business Logic** - Automated pricing calculations, capacity management, and booking conflict prevention

4. **Scalable Architecture** - Modern tech stack (React + Node.js + Supabase) enabling future growth and feature additions

5. **Security & Reliability** - JWT authentication, RLS policies, input validation, and error handling ensure data protection and system stability

### Recommendations for Future Enhancements
- Mobile application (React Native)
- Payment gateway integration (GCash, PayMaya)
- Real-time notifications (WebSocket)
- Review and rating system
- GPS trail mapping integration
- Weather API integration for trip planning

---

## **V. SAMPLE Q&A**

### Technical Questions

---

**Q1: Why did you choose Supabase over other databases like Firebase or traditional MySQL?**

> Supabase offers PostgreSQL's full relational database capabilities with built-in Row-Level Security (RLS), which is crucial for our multi-user booking system. Unlike Firebase's NoSQL structure, PostgreSQL allows complex queries and relationships (e.g., joining bookings with mountains and users). Additionally, Supabase provides a generous free tier and real-time subscriptions if we need them in the future.

---

**Q2: How do you prevent double-booking or overbooking scenarios?**

> We implemented multiple layers of protection:
> 1. **Real-time availability check** before showing booking options
> 2. **Server-side validation** that re-checks availability during booking creation
> 3. **Pending status workflow** - bookings don't affect availability until admin approves
> 4. **Single driver rule** - only one confirmed booking per date globally
> 5. **Database constraints** via RLS policies and unique constraints

---

**Q3: Explain your authentication flow.**

> We use JWT (JSON Web Tokens) for stateless authentication:
> 1. User registers → password hashed with bcrypt → stored in database
> 2. User logs in → credentials verified → JWT generated with user ID and role
> 3. JWT sent in Authorization header for protected routes
> 4. Server middleware validates JWT on each request
> 5. Token expiration forces re-authentication for security

---

**Q4: How does the pricing calculation work?**

> ```javascript
> // Joiner Pricing
> total = base_price_per_head × number_of_participants × trip_duration
> 
> // Exclusive Pricing  
> total = exclusive_price (fixed rate)
> 
> // Additional fees (optional)
> + environmental_fee + overtime_fee + food_stub
> ```
> This is calculated both client-side (for preview) and server-side (for accuracy).

---

**Q5: What happens if the server goes down during a booking?**

> The system handles this gracefully:
> - **Client-side**: Loading states and error messages inform the user
> - **Server-side**: All database operations are atomic; partial bookings cannot occur
> - **Email failures**: Non-blocking; booking still succeeds even if email fails
> - **Recovery**: Users can retry; duplicate booking prevention ensures no double charges

---

### Functional Questions

---

**Q6: How does a user book a hike?**

> 1. User browses mountains on Explore page
> 2. Clicks on a mountain to view details
> 3. Clicks "Book Now" (redirects to login if not authenticated)
> 4. Selects start date → end date auto-calculated based on trip duration
> 5. Chooses booking type (joiner/exclusive) and number of participants
> 6. System shows availability and pricing breakdown
> 7. Confirms booking → status becomes "Pending"
> 8. Admin reviews and approves/rejects
> 9. If approved, user receives email confirmation and can view receipt

---

**Q7: Why do bookings start as "Pending" instead of immediately confirmed?**

> This design ensures:
> - Admin can verify payment or special requests
> - Prevents fraudulent or spam bookings from blocking slots
> - Allows capacity management when multiple requests come simultaneously
> - Gives business flexibility (e.g., reviewing group size for safety)

---

**Q8: How do you handle different hike types (backtrail, traverse, loop)?**

> The `status` field in mountains stores the trail type. This affects:
> - Display labeling in the UI
> - Potentially different preparation checklists
> - Future: Could affect duration calculations or pricing

---

### Design Questions

---

**Q9: Why did you separate the admin panel from the public site?**

> 1. **Security**: Different route protection and access patterns
> 2. **UX**: Admins have different workflows and don't need public navigation
> 3. **Performance**: Admin features (analytics, bulk operations) don't affect public site
> 4. **Scalability**: Can deploy admin panel separately if needed

---

**Q10: How did you ensure the system is user-friendly?**

> - Responsive design (mobile-first with Tailwind CSS)
> - Clear visual hierarchy and color coding (difficulty levels)
> - Loading states and error messages for all operations
> - Auto-calculation (end date, pricing) reduces user input
> - Search and filter functionality on explore page
> - Unsaved changes warning prevents accidental data loss

---

### Business Logic Questions

---

**Q11: What is the "single driver rule"?**

> This is a business constraint specific to this tour operator:
> - Only one confirmed booking can exist per calendar date across ALL mountains
> - Ensures the single available driver isn't double-booked
> - Implemented in the admin approval workflow
> - Pending bookings don't trigger this rule (only confirmed ones)

---

**Q12: How do you handle cancellations?**

> - Users can cancel their own bookings (confirmed or pending)
> - Cancelled bookings no longer affect availability
> - Status changes to "cancelled" with timestamp
> - In the future: Could implement refund policies or cancellation fees

---

## **VI. API ENDPOINTS REFERENCE**

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Mountains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mountains` | Get all mountains |
| GET | `/api/mountains/:id` | Get single mountain |
| POST | `/api/mountains` | Create mountain (admin) |
| PUT | `/api/mountains/:id` | Update mountain (admin) |
| DELETE | `/api/mountains/:id` | Delete mountain (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/my-bookings` | Get user's bookings |
| GET | `/api/bookings/availability/:mountainId` | Check availability |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| PUT | `/api/bookings/:id/approve` | Approve booking (admin) |
| PUT | `/api/bookings/:id/reject` | Reject booking (admin) |
| GET | `/api/bookings/:id/receipt` | Get booking receipt |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get published articles |
| GET | `/api/articles/:id` | Get single article |
| POST | `/api/articles` | Create article (admin) |
| PUT | `/api/articles/:id` | Update article (admin) |
| DELETE | `/api/articles/:id` | Delete article (admin) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard overview (admin) |
| GET | `/api/analytics/public-stats` | Public statistics |

---

## **VII. PROJECT STRUCTURE**

```
Poorito-with-User/
├── Website/                    # Frontend (React)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── PublicLayout.js
│   │   │   ├── AdminLayout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/           # React contexts
│   │   ├── pages/
│   │   │   ├── public/         # Public pages
│   │   │   │   ├── Home.js
│   │   │   │   ├── Explore.js
│   │   │   │   ├── MountainDetail.js
│   │   │   │   ├── UserDashboard.js
│   │   │   │   └── Receipt.js
│   │   │   ├── Dashboard.js    # Admin dashboard
│   │   │   ├── Mountains.js    # Admin mountain list
│   │   │   ├── MountainForm.js # Admin mountain form
│   │   │   └── Login.js        # Admin login
│   │   ├── services/
│   │   │   └── api.js          # API service
│   │   └── App.js              # Main app with routes
│   └── package.json
│
├── backend/                    # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js         # Supabase configuration
│   ├── database/
│   │   ├── supabase-schema.sql # Database schema
│   │   └── migrations/         # SQL migrations
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── mountains.js        # Mountain routes
│   │   ├── bookings.js         # Booking routes
│   │   ├── articles.js         # Article routes
│   │   └── analytics.js        # Analytics routes
│   ├── services/
│   │   ├── emailService.js     # Email notifications
│   │   └── bookingCleanup.js   # Booking cleanup service
│   ├── utils/
│   │   ├── pricing.js          # Pricing calculations
│   │   └── availability.js     # Availability logic
│   ├── server.js               # Main server file
│   └── package.json
│
└── POORITO-PROJECT-DOCUMENTATION.md  # This file
```

---

*Document prepared for Panel Defense - Poorito Mountain Trail Booking System*


