# 🎫 IT Help Desk Ticket System

A full-stack IT Help Desk Ticket Raising System built with **React** (frontend) and **Java Spring Boot** (backend).

---

## 🏗️ Project Structure

```
helpdesk-system/
├── backend/                     # Java Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/helpdesk/
│       ├── HelpdeskApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java     # JWT + CORS security
│       │   ├── JwtUtils.java           # JWT generation/validation
│       │   └── DataSeeder.java         # Demo data on startup
│       ├── controller/
│       │   ├── AuthController.java     # /api/auth/**
│       │   └── TicketController.java   # /api/tickets/**
│       ├── model/
│       │   ├── User.java               # User entity (USER/AGENT/ADMIN)
│       │   ├── Ticket.java             # Ticket entity
│       │   └── Comment.java            # Comment entity
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── TicketRepository.java
│       │   └── CommentRepository.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── TicketService.java
│       │   └── UserDetailsServiceImpl.java
│       └── dto/
│           └── Dtos.java
│
└── frontend/                    # React SPA
    ├── package.json
    └── src/
        ├── App.js               # Routes
        ├── index.css            # Global styles
        ├── context/
        │   └── AuthContext.js   # Auth state + JWT storage
        ├── services/
        │   └── api.js           # Axios API client
        ├── components/
        │   └── Layout.js        # Sidebar layout
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── TicketsPage.js
            ├── NewTicketPage.js
            └── TicketDetailPage.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** and **npm**

---

### ▶️ Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**

> H2 Console available at: http://localhost:8080/h2-console
> (JDBC URL: `jdbc:h2:mem:helpdeskdb`, username: `sa`, password: empty)

---

### ▶️ Run the Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🧪 Demo Accounts (auto-created on startup)

| Role  | Username | Password  | Capabilities |
|-------|----------|-----------|-------------|
| Admin | `admin`  | `admin123`| Full access, manage all tickets |
| Agent | `agent1` | `agent123`| Assign, update, resolve tickets |
| User  | `user1`  | `user123` | Raise and view own tickets |
| User  | `user2`  | `user123` | Raise and view own tickets |

---

## ✨ Features

### For Users
- ✅ Register / Login with JWT authentication
- ✅ Raise new support tickets with title, description, priority, category
- ✅ View all their own tickets with status tracking
- ✅ Filter and search tickets
- ✅ View ticket details and add comments

### For Agents / Admins
- ✅ View ALL tickets across all users
- ✅ Filter by status, priority, category, keyword
- ✅ Assign tickets to agents
- ✅ Update ticket status (Open → In Progress → Resolved → Closed)
- ✅ Change priority
- ✅ Add internal notes (visible only to agents)
- ✅ Add resolution notes when closing/resolving
- ✅ Dashboard with stats (total, open, in-progress, critical)

### Ticket Properties
- **Priority**: LOW | MEDIUM | HIGH | CRITICAL
- **Status**: OPEN | IN_PROGRESS | PENDING | RESOLVED | CLOSED
- **Category**: HARDWARE | SOFTWARE | NETWORK | ACCESS | EMAIL | OTHER

---

## 🔌 REST API Reference

### Auth Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login` | Login → returns JWT token |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user info |

### Ticket Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/tickets` | List tickets (filtered, paginated) |
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets/{id}` | Get ticket by ID |
| PUT | `/api/tickets/{id}` | Update ticket (agents/admins) |
| GET | `/api/tickets/{id}/comments` | Get ticket comments |
| POST | `/api/tickets/{id}/comments` | Add comment |
| GET | `/api/tickets/stats/dashboard` | Dashboard stats (agents only) |
| GET | `/api/tickets/agents/list` | List agents for assignment |

### Query Parameters for GET /api/tickets
```
?status=OPEN&priority=HIGH&category=NETWORK&keyword=vpn&page=0&size=10
```

---

## 🗄️ Production Database (MySQL)

1. Create database:
```sql
CREATE DATABASE helpdeskdb;
```

2. In `application.properties`, comment out H2 config and uncomment MySQL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/helpdeskdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 🔐 Security Notes

- JWT tokens expire in 24 hours (configurable via `app.jwt.expiration`)
- Change the JWT secret in `app.jwt.secret` before production deployment
- Passwords are hashed with BCrypt
- CORS restricted to `http://localhost:3000` (update `app.cors.allowed-origins` for production)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, react-hot-toast |
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (jjwt 0.11.5) |
| Database | H2 (dev) / MySQL (prod) |
| ORM | Spring Data JPA / Hibernate |
| Build | Maven (backend), npm (frontend) |
