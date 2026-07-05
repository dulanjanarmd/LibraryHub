# SLIIT Library Management System - Backend

## Overview
Spring Boot REST API for the Online Library Management System at SLIIT University.

## Tech Stack
- Java 17 + Spring Boot 3.2.0
- Spring Security + JWT Authentication
- JPA/Hibernate + MySQL
- Lombok, Maven
- Scheduled tasks for notifications

## Database Configuration
The database and tables are **auto-generated** on first run:
- Database: `sliit_library_db` (auto-created via `createDatabaseIfNotExist=true`)
- Tables: Auto-created via `spring.jpa.hibernate.ddl-auto=update`

## Prerequisites
- Java 17+
- MySQL 8.0+
- Maven 3.8+

## Setup & Run

### 1. Configure MySQL
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sliit_library_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 2. Build & Run
```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

### 3. API Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | User registration | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/books` | GET | List all books | Public |
| `/api/books/{id}` | GET | Get book details | Public |
| `/api/books/search` | GET | Search books | Public |
| `/api/books/advanced-search` | GET | Advanced search | Public |
| `/api/categories` | GET | List categories | Public |
| `/api/ebooks/public/all` | GET | List eBooks | Public |
| `/api/user/profile` | GET/PUT | User profile | Authenticated |
| `/api/borrow/user/{id}` | GET | User borrow history | Authenticated |
| `/api/borrow/renew/{id}` | POST | Renew book | Authenticated |
| `/api/reservations` | POST | Create reservation | Authenticated |
| `/api/fines/user/{id}` | GET | User fines | Authenticated |
| `/api/fines/pay` | POST | Pay fine | Authenticated |
| `/api/librarian/books` | POST/PUT/DELETE | Manage books | Librarian/Admin |
| `/api/librarian/borrow/issue` | POST | Issue book | Librarian/Admin |
| `/api/librarian/borrow/return/{id}` | POST | Return book | Librarian/Admin |
| `/api/admin/dashboard/stats` | GET | Dashboard stats | Librarian/Admin |
| `/api/admin/reports/**` | GET | Various reports | Admin |

## Default Loan Policies
- **Students**: 4 books, 14 days
- **Faculty**: 10 books, 30 days
- **Librarians/Admin**: 15/20 books, 30 days
- **Fine Rate**: LKR 5.00 per day per item
- **Max Renewals**: 2 per loan
- **Max Reservations**: 3 per user

## Scheduled Jobs
- **Due Date Reminders**: Daily at 8:00 AM (3 days before, 1 day before)
- **Overdue Notifications**: Daily at 8:00 AM
- **Reservation Expiry**: Every hour (48-hour hold expiry)
