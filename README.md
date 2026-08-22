# CampusConnect 🎓

CampusConnect is a full-stack **Campus Placement Management System** designed to connect students, administrators, and placement opportunities through a centralized web platform.

The system allows students to register, explore placement opportunities, apply to companies, upload resumes, and track their applications. Administrators can manage students, companies, applications, and campus announcements from a dedicated dashboard.

---

## 🚀 Features

### 👨‍🎓 Student Features

- Student registration and login
- Secure authentication using JWT
- Student dashboard
- View available placement opportunities
- View company details
- Apply for job opportunities
- Upload resume in PDF format
- Track submitted applications
- View campus announcements
- Manage student profile

### 👨‍💼 Admin Features

- Secure admin login
- Admin dashboard
- View registered students
- Manage placement companies
- Add and manage job opportunities
- View student applications
- View uploaded resumes
- Manage campus announcements
- Monitor placement activities

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- Maven

### Database

- PostgreSQL

### Deployment

- Render
- GitHub

### 🌐 Live Demo

👉 **[Open CampusConnect](https://campusconnect-frontend-u9p7.onrender.com)**

The live application is deployed on Render and can be accessed directly from a browser.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │      Vite + JS      │
                    └──────────┬──────────┘
                               │
                               │ HTTPS / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │       Java          │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   PostgreSQL    │        │ Spring Security │
        │    Database     │        │  + JWT Auth     │
        └─────────────────┘        └─────────────────┘




Project Structure

CampusConnect-Java/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── campusconnect/
│   │   │           ├── controller/
│   │   │           ├── service/
│   │   │           ├── entity/
│   │   │           ├── repository/
│   │   │           ├── config/
│   │   │           └── util/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
├── Dockerfile
├── mvnw
├── mvnw.cmd
└── README.md
