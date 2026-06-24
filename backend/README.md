# SLIIT Online Library Management System - Spring Boot Backend

A comprehensive RESTful API for the SLIIT Online Library Management System (OLMS), built with Spring Boot 3, Spring Security, JWT authentication, and MySQL.

## Tech Stack

| Technology | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.0 |
| Spring Security | 6.x |
| Spring Data JPA | 3.2.0 |
| MySQL | 8.0+ |
| JWT (JJWT) | 0.12.3 |
| Maven | 3.9+ |
| Lombok | 1.18.x |
| OpenAPI/Swagger | 2.3.0 |

## Project Structure

```
com.sliit.library
|-- OlmsApplication.java          # Main entry point
|-- config/
|   |-- SecurityConfig.java       # Spring Security + JWT filter chain
|   |-- OpenApiConfig.java        # Swagger/OpenAPI configuration
|-- controller/                   # REST API controllers
|   |-- AuthController.java       # Authentication endpoints
|   |-- BookController.java       # Book catalogue endpoints
|   |-- LoanController.java       # Loan & circulation endpoints
|   |-- ReservationController.java # Reservation endpoints
|   |-- UserController.java       # User management endpoints
|   |-- FineController.java       # Fine management endpoints
|   |-- DashboardController.java  # User dashboard data
|   |-- AdminController.java      # Admin dashboard & reports
|-- service/                      # Business logic layer
|   |-- AuthService.java          # Authentication & JWT
|   |-- BookService.java          # Book CRUD & search
|   |-- LoanService.java          # Issue, return, renew
|   |-- ReservationService.java   # Queue management
|   |-- UserService.java          # User management
|   |-- FineService.java          # Fine calculation & payment
|-- repository/                   # Spring Data JPA repositories
|-- entity/                       # JPA entity classes
|   |-- enums/                    # Enum definitions
|-- dto/                          # Data Transfer Objects
|-- security/                     # JWT utilities & filters
|   |-- JwtUtil.java              # JWT token generation & validation
|   |-- JwtAuthenticationFilter.java # Request filter
|   |-- UserDetailsServiceImpl.java  # Spring Security user details
|-- exception/                    # Global exception handling
|   |-- LibraryException.java     # Custom exception
|   |-- GlobalExceptionHandler.java # REST error handler
```

## Prerequisites

- Java 17 or higher
- Maven 3.9+
- MySQL 8.0+
- (Optional) MySQL Workbench or DBeaver for database management

## Quick Start

### 1. Create the Database

```sql
CREATE DATABASE sliit_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the schema script:
```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 2. Configure Database Credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sliit_library?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Colombo&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Build & Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### 4. Access API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Books (Catalogue/OPAC)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/books` | List all books (paginated) | No |
| GET | `/api/books/{id}` | Get book by ID | No |
| GET | `/api/books/isbn/{isbn}` | Get book by ISBN | No |
| GET | `/api/books/search?query=` | Search books | No |
| GET | `/api/books/category/{id}` | Books by category | No |
| POST | `/api/books` | Create book | Admin/Librarian |
| PUT | `/api/books/{id}` | Update book | Admin/Librarian |
| DELETE | `/api/books/{id}` | Deactivate book | Admin/Librarian |

### Loans & Circulation
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/loans/my-loans` | Current user's loans | Yes |
| POST | `/api/loans/{id}/renew` | Renew a loan | Yes |
| POST | `/api/circulation/issue` | Issue book (librarian) | Admin/Librarian |
| POST | `/api/circulation/return/{id}` | Process return | Admin/Librarian |

### Reservations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reservations/my-reservations` | User's reservations | Yes |
| POST | `/api/reservations/book/{bookId}` | Create reservation | Yes |
| POST | `/api/reservations/{id}/cancel` | Cancel reservation | Yes |

### Fines
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fines/my-fines` | User's fines | Yes |
| POST | `/api/fines/{id}/pay` | Pay a fine | Yes |
| POST | `/api/fines/{id}/waive` | Waive a fine | Admin only |

### Users (Admin)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List all users | Admin/Librarian |
| POST | `/api/users` | Create user | Admin only |
| PUT | `/api/users/{id}` | Update user | Admin only |
| GET | `/api/users/me` | Current user profile | Yes |

### Admin Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/overview` | Dashboard statistics | Admin/Librarian |
| GET | `/api/admin/fine-stats` | Fine statistics | Admin/Librarian |

## Authentication

The API uses JWT Bearer token authentication:

1. **Login** to get a token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "IT20234567", "password": "password"}'
```

2. **Use** the token in subsequent requests:
```bash
curl http://localhost:8080/api/loans/my-loans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Default Configuration

| Parameter | Default Value |
|-----------|---------------|
| Server Port | 8080 |
| JWT Expiration | 8 hours |
| JWT Refresh | 7 days |
| Fine Rate | LKR 5.00/day |
| Fine Block Threshold | LKR 500 |
| Max Renewals | 2 |
| Reservation Hold | 48 hours |

## Environment Variables

You can override configuration using environment variables:

| Variable | Description |
|----------|-------------|
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |

## Database Schema

The complete MySQL schema is defined in `src/main/resources/schema.sql`. Key tables:

- **users** - Students, faculty, librarians, admins
- **categories** - Book categories (Fiction, Technology, Science, etc.)
- **books** - Bibliographic records (title, author, ISBN, etc.)
- **book_copies** - Individual physical items with barcodes
- **loans** - Book lending transactions
- **reservations** - FIFO reservation queue
- **fines** - Overdue/lost/damaged fines
- **notifications** - Email/SMS notification log
- **announcements** - Library-wide announcements
- **audit_logs** - Immutable audit trail
- **system_config** - Configurable policies & rules

## Features Implemented

- **FR-01/02/03**: Authentication with RBAC (5 roles) + MFA support
- **FR-06/07/08**: Full OPAC search with filters + catalogue management
- **FR-10/11/12**: Loan processing with role-based policies
- **FR-13/14**: Return processing + self-service renewal (max 2)
- **FR-16/17/18**: FIFO reservation queue with auto-notification
- **FR-19/20/21**: Automated fine calculation + payment + waiver
- **FR-22/23**: Inventory lifecycle management
- **FR-25/26/27**: Operational + executive dashboards + reports
- **FR-32**: Multi-channel notification system
- **NFR-11/12/13**: TLS, encryption, OWASP Top 10 protection
- **NFR-14**: Immutable audit logging

## SRS Compliance

This backend implements **33 Functional Requirements** and **31 Non-Functional Requirements** from the SLIIT OLMS SRS v1.0 document, including:

- Role-Based Access Control (5 tiers)
- Multi-Factor Authentication (TOTP)
- Loan policy enforcement by role
- Automated fine calculation (LKR 5/day)
- FIFO reservation queue
- Due date notifications (3-day, 1-day, same-day)
- Executive analytics dashboard
- Standard and custom report generation
- Multi-channel notification service

## License

Internal Use Only - Sri Lanka Institute of Information Technology
