# IT Help Desk Ticket Raising System

**Spring Boot · React.js · MySQL · REST APIs · Spring Security**

---

## Overview

A full-stack IT Help Desk application that allows employees to raise, track, and manage support tickets. Built with Spring Boot on the backend, React.js on the frontend, and MySQL as the database, with role-based access for Users, IT Agents, and Admins.

---

## Tech Stack

* **Backend:** Spring Boot, Spring Security, Spring Data JPA
* **Frontend:** React.js, React Router, Axios
* **Database:** MySQL
* **Authentication:** JWT (JSON Web Tokens)
* **Other:** Lombok, BCrypt, Hibernate, Bean Validation

---

## Features

* User registration and login with JWT-based authentication
* Raise new IT support tickets with title, description, category, and priority
* Track ticket status in real time (Open, In Progress, Resolved, Closed)
* IT Agents can view assigned tickets and update their status
* Admins can manage users, agents, and all tickets
* Role-based access control (User, IT Agent, Admin)
* Comment or notes section on each ticket for communication
* Filter and search tickets by status, priority, and category
* Full audit trail of ticket status changes
* Global exception handling and server-side input validation

---

## Roles

| Role         | Permissions                                         |
| ------------ | --------------------------------------------------- |
| **User**     | Raise tickets, view own tickets, add comments       |
| **IT Agent** | View assigned tickets, update status, add notes     |
| **Admin**    | Full access — manage users, agents, and all tickets |

---

## Project Structure

```text
it-helpdesk/
├── backend/
│   └── src/main/java/com/helpdesk/
│       ├── config/            # Security configuration, CORS
│       ├── controller/        # AuthController, TicketController, UserController
│       ├── dto/               # Request and response DTOs
│       ├── entity/            # User, Ticket, Comment, AuditLog
│       ├── exception/         # Custom exceptions, GlobalExceptionHandler
│       ├── repository/        # Spring Data JPA repositories
│       ├── security/          # JWT utils, AuthTokenFilter, UserDetailsImpl
│       └── service/           # TicketService, UserService, CommentService
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/          # Login, Register
        │   ├── tickets/       # TicketList, TicketDetail, CreateTicket, TicketCard
        │   ├── dashboard/     # Dashboard, Navbar, Sidebar
        │   └── admin/         # UserManagement, AgentAssignment
        ├── context/           # AuthContext (global auth state)
        └── services/          # Axios API service, authService, ticketService
```

---

## Setup and Installation

### Prerequisites

* Java 17+
* Node.js 16+
* MySQL 8+
* Maven 3.8+

### Backend

```bash
cd backend
```

Open `src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/helpdesk_db?createDatabaseIfNotExist=true
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

Then run:

```bash
mvn clean install
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`. Hibernate will auto-create all tables on first run.

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at `http://localhost:3000`.

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Register a new user         |
| POST   | `/api/auth/login`    | Login and receive JWT token |

### Tickets

| Method | Endpoint                   | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| GET    | `/api/tickets`             | Get all tickets (Admin/Agent)        |
| GET    | `/api/tickets/my`          | Get tickets raised by logged-in user |
| POST   | `/api/tickets`             | Raise a new ticket                   |
| GET    | `/api/tickets/{id}`        | Get ticket details by ID             |
| PUT    | `/api/tickets/{id}/status` | Update ticket status                 |
| PUT    | `/api/tickets/{id}/assign` | Assign ticket to an agent            |

### Comments

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/api/tickets/{id}/comments` | Get all comments on a ticket |
| POST   | `/api/tickets/{id}/comments` | Add a comment to a ticket    |

### Users (Admin only)

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/users`           | Get all users    |
| PUT    | `/api/users/{id}/role` | Update user role |
| DELETE | `/api/users/{id}`      | Delete a user    |

All endpoints except `/api/auth/**` require a valid JWT token in the Authorization header:

```text
Authorization: Bearer <token>
```

---

## Ticket Lifecycle

```text
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

* **OPEN** — Ticket raised by user, awaiting assignment
* **IN_PROGRESS** — Assigned to an IT agent, being worked on
* **RESOLVED** — Agent has resolved the issue, pending user confirmation
* **CLOSED** — Ticket closed after resolution is confirmed

---

## Security

* Passwords hashed using BCrypt
* JWT tokens expire after 24 hours (configurable in application.properties)
* Stateless session management via Spring Security
* Role-based access control enforced at the API level
* Users can only access their own tickets; agents see assigned tickets; admins have full access

---

## Database Schema

Tables are auto-generated by Hibernate:

* **users** — stores user credentials, profile info, and role
* **tickets** — all support tickets with status, priority, category, and assignment
* **comments** — messages and notes attached to a ticket
* **audit_logs** — history of all status changes and actions performed on tickets

---

## Author

**KOVURU LAKSHMAIAH**

GitHub: [kovuru-13](https://github.com/kovuru-13)
