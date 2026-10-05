# Sahyog Setu — NCCT Integrated Cooperative Training Platform

> **A production-oriented full-stack digital ecosystem for cooperative-sector training, learning, assessment, attendance, certification, and programme management.**

Sahyog Setu is a comprehensive **role-based training and learning management platform** designed to digitally manage the complete lifecycle of cooperative-sector training programmes — from programme creation and participant registration to learning, attendance, assessments, completion, certification, and certificate verification.

The platform brings together **training management, e-learning, assessment, attendance, certification, analytics, and role-based administration** into a single centralized system.

---

## 🚀 Live Application

### 🌐 Frontend
**Live Demo:**  
https://ncct-platform-wzvt.vercel.app

### ⚙️ Backend API
**Backend:**  
https://ncct-platform-2ga2.onrender.com

---

# 🎯 Problem Statement

Traditional training management systems often involve disconnected processes for:

- Programme creation
- Participant registration
- Candidate nomination
- Trainee management
- Attendance
- Learning materials
- Assessments
- Completion tracking
- Certificate generation
- Certificate verification
- Reporting and analytics

This creates operational overhead, data duplication, limited visibility, and difficulty in tracking a trainee's complete learning journey.

### 💡 Solution

**Sahyog Setu** provides a centralized digital ecosystem where administrators, institutions, trainers, and trainees can interact through role-specific dashboards and workflows.

The system manages the complete journey:

```text
Programme Creation
       ↓
Registration / Application
       ↓
Approval & Enrollment
       ↓
Training & Learning
       ↓
Attendance
       ↓
Assignments / Quizzes
       ↓
Completion
       ↓
Certificate Generation
       ↓
QR-Based Certificate Verification
       ↓
Analytics & Reporting
```

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- Role-based access control
- Role-specific dashboards
- Authentication middleware
- Authorization middleware
- Secure API access

### Supported Roles

| Role | Responsibility |
|---|---|
| Super Admin | Platform-wide administration |
| Institute Admin | Institution and programme management |
| Trainer | Training, content and assessments |
| Trainee | Learning, attendance, assessments and certificates |

---

# 🏛️ Programme Management

Administrators can manage the complete training programme lifecycle.

### Features

- Create programmes
- Update programme information
- Manage programme duration
- Define eligibility
- Manage programme capacity
- View programme details
- Manage trainers
- Manage enrolled trainees
- Track programme status

---

# 📝 Registration & Application Workflow

The platform supports a structured participant registration workflow.

```text
Trainee
   ↓
Programme Selection
   ↓
Application
   ↓
Admin Review
   ↓
Approval / Rejection
   ↓
Enrollment
```

### Includes

- Programme applications
- Application status
- Approval workflow
- Rejection handling
- Trainee-programme relationship
- Application tracking

---

# 👤 Trainee Management

Each trainee can maintain a centralized profile containing relevant training information.

### Profile capabilities

- Personal information
- Contact information
- Institution details
- Training programmes
- Enrollment history
- Attendance
- Assessments
- Completion status
- Certificates

---

# 📚 E-Learning Module

Trainers can manage learning resources associated with programmes.

### Features

- Learning content
- Course/module organization
- Training materials
- Learning progress
- Programme-specific resources

The architecture can be extended to support:

- Video learning
- Documents
- External resources
- Interactive lessons
- Progress tracking

---

# 🗓️ Training & Timetable Management

The system provides structured training scheduling.

### Capabilities

- Training schedules
- Session management
- Trainer assignment
- Programme-wise timetable
- Session tracking

---

# 📍 Attendance Management

Attendance can be managed at programme/session level.

### Features

- Mark attendance
- View attendance records
- Track trainee attendance
- Programme-wise attendance
- Attendance-based completion logic

The architecture is designed to support future integrations such as:

- QR attendance
- Face recognition
- Digital check-in

---

# 🧠 Assignments & Assessments

Trainers can create assessments for trainees.

### Supported workflow

```text
Trainer
   ↓
Create Quiz / Assessment
   ↓
Trainee Attempts
   ↓
Submission
   ↓
Evaluation
   ↓
Score
   ↓
Completion Tracking
```

### Features

- Quiz creation
- Questions and options
- Trainee submissions
- Evaluation
- Score calculation
- Assessment tracking

---

# 🏆 Course Completion

Completion is calculated using training-related requirements such as:

- Programme enrollment
- Attendance
- Learning/assessment completion
- Required assessments

Once the trainee fulfills the required criteria, the system can mark the programme as completed.

---

# 🎓 Digital Certificate System

One of the core features of Sahyog Setu is its digital certification workflow.

### Certificate lifecycle

```text
Training Completed
       ↓
Eligibility Check
       ↓
Certificate Generation
       ↓
Unique Certificate Number
       ↓
QR Code
       ↓
Digital Verification
```

### Certificate features

- Unique certificate number
- Trainee information
- Programme information
- Completion information
- Digital certificate
- QR-based verification
- Public verification page

---

# 🔎 Certificate Verification

Anyone can verify a certificate using its unique certificate number / QR code.

### Verification workflow

```text
Scan QR
   ↓
Verification URL
   ↓
Certificate Number
   ↓
Backend Verification
   ↓
Certificate Details
   ↓
Valid / Invalid Result
```

This provides an additional layer of trust and reduces the possibility of fraudulent certificates.

---

# 📊 Dashboards & Analytics

Different users receive different dashboards based on their roles.

### Super Admin Dashboard

- Platform overview
- User statistics
- Programme statistics
- Training activity
- System-level insights

### Institute Admin Dashboard

- Institution programmes
- Applications
- Trainees
- Training activity
- Programme performance

### Trainer Dashboard

- Assigned programmes
- Trainees
- Training sessions
- Attendance
- Assessments
- Quiz management

### Trainee Dashboard

- Enrolled programmes
- Learning content
- Attendance
- Assessments
- Progress
- Completion
- Certificates

---

# 🛡️ Security Architecture

Security is treated as a core part of the application rather than an afterthought.

### Implemented / planned security practices

- JWT authentication
- Password hashing
- Protected routes
- Role-based authorization
- Backend middleware authorization
- Environment variables for secrets
- CORS configuration
- Input validation
- Secure API design
- Error handling
- HTTP security headers
- Protection against common web vulnerabilities

### Security areas considered

```text
Authentication
Authorization
       ↓
Input Validation
       ↓
CORS
       ↓
XSS Protection
       ↓
CSRF Awareness
       ↓
Injection Prevention
       ↓
Secure Cookies / Tokens
       ↓
HTTPS
       ↓
Secrets Management
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express.js API     │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
          Authentication   Business Logic   APIs
                 │
                 ▼
          ┌──────────────────────┐
          │       MongoDB        │
          │       Database       │
          └──────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

- React.js
- React Router
- Axios
- Vite
- CSS
- Responsive UI

## Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt
- Middleware architecture

## Database

- MongoDB
- Mongoose
- MongoDB Atlas

## Development & Deployment

- Git
- GitHub
- Vercel
- Render
- npm
- Environment Variables

---

# 📁 Project Structure

```text
NCCT-platform/
│
├── backend/
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── config/
│   │
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🔄 API Architecture

The backend follows a modular REST API architecture.

Example API structure:

```text
/api
│
├── /auth
│   ├── register
│   └── login
│
├── /users
│
├── /programmes
│
├── /applications
│
├── /attendance
│
├── /assessments
│
├── /quizzes
│
├── /certificates
│
└── /verify-certificate
```

The architecture separates:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
```

This separation improves maintainability, scalability, and debugging.

---

# ⚙️ Installation & Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/tannu01-dev/NCCT-platform.git
```

```bash
cd NCCT-platform
```

---

# 🔹 Backend Setup

```bash
cd backend
npm install
```

Create an environment file:

```text
.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start backend:

```bash
npm run dev
```

or:

```bash
node server.js
```

Backend will run on:

```text
http://localhost:5000
```

---

# 🔹 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will normally run on:

```text
http://localhost:5173
```

---

# 🧪 Production Build

Frontend:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🌍 Deployment

## Frontend

The React/Vite frontend is deployed using **Vercel**.

Deployment configuration:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Backend

The Node.js/Express backend is deployed using **Render**.

Configuration:

```text
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

## Database

MongoDB Atlas is used as the cloud database.

---

# 🔐 Environment Variables

Never commit sensitive credentials to GitHub.

Example:

```env
MONGO_URI=********
JWT_SECRET=********
```

The `.env` file should remain ignored through `.gitignore`.

---

# 📈 Scalability Considerations

The system is designed with future scalability in mind.

Potential improvements include:

- Redis caching
- API rate limiting
- Database indexing
- Pagination
- Query optimization
- Background jobs
- Object storage
- CDN
- Docker containerization
- CI/CD pipelines
- Cloud monitoring
- Centralized logging
- Horizontal scaling

---

# 🚀 Future Enhancements

The architecture can be extended with advanced capabilities.

### 🤖 AI-Powered Learning

- AI learning assistant
- Personalized course recommendations
- AI-generated assessments
- Automated learner insights
- Skill-gap analysis

### 📱 Mobile Application

- Android/iOS application
- Push notifications
- Mobile attendance
- Offline learning

### 🧑‍💻 Advanced Attendance

- QR-based attendance
- Face recognition
- Geo-fencing
- Real-time attendance

### 📊 Advanced Analytics

- Training performance analytics
- Institution comparison
- Trainer performance
- Skill-gap dashboards
- Employment-oriented analytics

### 🌐 Multilingual Learning

Support for:

- English
- Hindi
- Regional Indian languages

### ☁️ Infrastructure

Future infrastructure improvements may include:

- Docker
- Redis
- CI/CD
- Cloud storage
- Monitoring
- Automated backups

---

# 🧩 Engineering Principles

The project follows several software engineering principles:

- Modular architecture
- Separation of concerns
- Reusable components
- RESTful API design
- Role-based authorization
- Secure authentication
- Database abstraction using Mongoose
- Centralized error handling
- Environment-based configuration
- Git-based version control
- Production-oriented deployment

---

# 🧪 Testing Strategy

The project can be extended with automated testing at multiple levels.

### Unit Testing

Test individual:

- Controllers
- Services
- Utilities
- Components

### API Testing

Test:

- Authentication
- Authorization
- CRUD operations
- Applications
- Attendance
- Assessments
- Certificates

### Integration Testing

Validate complete workflows such as:

```text
Register
   ↓
Login
   ↓
Apply
   ↓
Approve
   ↓
Attend Training
   ↓
Complete Assessment
   ↓
Generate Certificate
   ↓
Verify Certificate
```

---

# 📌 Core User Journey

## Trainee

```text
Register
   ↓
Login
   ↓
Browse Programmes
   ↓
Apply
   ↓
Get Approved
   ↓
Join Training
   ↓
Access Learning Material
   ↓
Attend Sessions
   ↓
Attempt Assessments
   ↓
Complete Programme
   ↓
Receive Certificate
   ↓
Verify Certificate
```

## Trainer

```text
Login
   ↓
View Assigned Programmes
   ↓
Manage Training
   ↓
Manage Learning Content
   ↓
Mark Attendance
   ↓
Create Assessments
   ↓
Evaluate Performance
```

## Institute Admin

```text
Login
   ↓
Manage Programmes
   ↓
Review Applications
   ↓
Manage Trainees
   ↓
Manage Training
   ↓
Monitor Performance
```

## Super Admin

```text
Login
   ↓
Platform Dashboard
   ↓
Manage Users
   ↓
Manage Institutions
   ↓
Monitor Programmes
   ↓
View Analytics
```

---

# 🏆 Why Sahyog Setu?

Sahyog Setu is not just a CRUD application.

It combines multiple real-world enterprise concepts:

- Authentication
- Authorization
- RBAC
- REST APIs
- Database relationships
- Application workflows
- Learning management
- Assessment systems
- Attendance management
- Certificate generation
- QR verification
- Analytics
- Cloud deployment
- Security
- Scalable architecture

The project demonstrates how a full-stack application can solve an end-to-end organizational problem rather than implementing isolated CRUD features.

---

# 👩‍💻 Developer

**Tannu Pal**

Full-Stack Developer

### Areas Demonstrated

```text
React
JavaScript
Node.js
Express.js
MongoDB
Mongoose
REST APIs
JWT Authentication
RBAC
Git & GitHub
Vite
Cloud Deployment
Software Architecture
Web Security
```

---

# 📄 License

This project is developed for educational, portfolio, demonstration, and competition purposes.

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## Built with ❤️ for Digital Transformation of Cooperative Training
