-- ============================================
-- SLIIT Online Library Management System (OLMS)
-- MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS sliit_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sliit_library;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         VARCHAR(20) NOT NULL UNIQUE COMMENT 'Student/Staff ID from SIS',
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    phone           VARCHAR(15),
    role            ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'FACULTY', 'LIBRARIAN', 'ADMIN') NOT NULL DEFAULT 'UNDERGRADUATE',
    faculty         VARCHAR(50),
    programme       VARCHAR(100),
    max_loans       INT NOT NULL DEFAULT 4,
    loan_period_days INT NOT NULL DEFAULT 14,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_mfa_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret      VARCHAR(255),
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    -- Membership fields
    is_member       BOOLEAN NOT NULL DEFAULT FALSE,
    membership_id   VARCHAR(50) UNIQUE,
    membership_status ENUM('NONE','PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'NONE',
    last_login      DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255),
    ddc_range       VARCHAR(20) COMMENT 'Dewey Decimal Classification range',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKS TABLE (Bibliographic Records)
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    isbn            VARCHAR(20) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255) NOT NULL,
    publisher       VARCHAR(100),
    publication_year INT,
    edition         VARCHAR(20),
    description     TEXT,
    ddc_number      VARCHAR(20) COMMENT 'Dewey Decimal Classification number',
    language        VARCHAR(20) NOT NULL DEFAULT 'English',
    format          ENUM('PHYSICAL', 'EBOOK', 'JOURNAL', 'THESIS', 'MULTIMEDIA') NOT NULL DEFAULT 'PHYSICAL',
    category_id     BIGINT UNSIGNED NOT NULL,
    cover_image_url VARCHAR(500),
    page_count      INT,
    total_copies    INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    shelf_location  VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_isbn (isbn),
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category_id),
    INDEX idx_format (format),
    FULLTEXT INDEX ft_title_author (title, author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOK COPIES TABLE (Individual Physical Items)
-- ============================================
CREATE TABLE IF NOT EXISTS book_copies (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id         BIGINT UNSIGNED NOT NULL,
    accession_number VARCHAR(30) NOT NULL UNIQUE COMMENT 'Unique barcode/accession number',
    condition_status ENUM('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'UNDER_REPAIR', 'LOST', 'WITHDRAWN') NOT NULL DEFAULT 'NEW',
    acquisition_date DATE,
    cost_lkr        DECIMAL(10,2),
    shelf_location  VARCHAR(20),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_accession (accession_number),
    INDEX idx_condition (condition_status),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LOANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loans (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    book_copy_id    BIGINT UNSIGNED NOT NULL,
    book_id         BIGINT UNSIGNED NOT NULL,
    issue_date      DATETIME NOT NULL,
    due_date        DATETIME NOT NULL,
    return_date     DATETIME,
    renewal_count   INT NOT NULL DEFAULT 0,
    status          ENUM('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED') NOT NULL DEFAULT 'ACTIVE',
    issued_by       BIGINT UNSIGNED,
    notes           TEXT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (book_copy_id) REFERENCES book_copies(id) ON DELETE RESTRICT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_active_loan (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RESERVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    book_id         BIGINT UNSIGNED NOT NULL,
    queue_position  INT NOT NULL DEFAULT 1,
    status          ENUM('PENDING', 'AVAILABLE', 'HELD', 'FULFILLED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    request_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    available_date  DATETIME,
    expiry_date     DATETIME,
    fulfilled_date  DATETIME,
    cancelled_date  DATETIME,
    cancel_reason   VARCHAR(255),
    notified        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_res (user_id, status),
    INDEX idx_book_queue (book_id, queue_position),
    INDEX idx_pending (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fines (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id         BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL,
    amount_lkr      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount_lkr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance_lkr     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fine_type       ENUM('OVERDUE', 'LOST', 'DAMAGED') NOT NULL DEFAULT 'OVERDUE',
    days_overdue    INT,
    rate_per_day    DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date    DATETIME,
    payment_method  ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'WAIVER') DEFAULT NULL,
    receipt_number  VARCHAR(50),
    waiver_reason   TEXT,
    waived_by       BIGINT UNSIGNED,
    waived_at       DATETIME,
    notes           TEXT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (waived_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_fine (user_id, is_paid),
    INDEX idx_unpaid (is_paid, balance_lkr)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- READING LISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reading_lists (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(100) NOT NULL,
    visibility      ENUM('PRIVATE', 'SHARED', 'COURSE_LINKED') NOT NULL DEFAULT 'PRIVATE',
    course_code     VARCHAR(20),
    share_url       VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_lists (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- READING LIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reading_list_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reading_list_id BIGINT UNSIGNED NOT NULL,
    book_id         BIGINT UNSIGNED NOT NULL,
    added_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,
    FOREIGN KEY (reading_list_id) REFERENCES reading_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_list_book (reading_list_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    type            ENUM('DUE_DATE', 'OVERDUE', 'RESERVATION_AVAILABLE', 'FINE_REMINDER', 'ANNOUNCEMENT', 'LOAN_CONFIRMATION', 'RETURN_CONFIRMATION') NOT NULL,
    channel         ENUM('EMAIL', 'SMS', 'IN_APP') NOT NULL DEFAULT 'EMAIL',
    subject         VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at         DATETIME,
    delivery_status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    retry_count     INT NOT NULL DEFAULT 0,
    related_loan_id BIGINT UNSIGNED,
    related_book_id BIGINT UNSIGNED,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_loan_id) REFERENCES loans(id) ON DELETE SET NULL,
    FOREIGN KEY (related_book_id) REFERENCES books(id) ON DELETE SET NULL,
    INDEX idx_user_notif (user_id, is_read),
    INDEX idx_type (type),
    INDEX idx_pending (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    body            TEXT NOT NULL,
    audience        ENUM('ALL', 'STUDENTS', 'FACULTY', 'STAFF') NOT NULL DEFAULT 'ALL',
    start_date      DATE NOT NULL,
    end_date        DATE,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    sent_as_email   BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_active (is_published, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED,
    action          VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc.',
    entity_type     VARCHAR(50) NOT NULL COMMENT 'Book, User, Loan, etc.',
    entity_id       VARCHAR(50) NOT NULL,
    old_values      JSON,
    new_values      JSON,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SYSTEM CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_key      VARCHAR(100) NOT NULL UNIQUE,
    config_value    TEXT NOT NULL,
    description     VARCHAR(255),
    updated_by      BIGINT UNSIGNED,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Categories
INSERT IGNORE INTO categories (name, description, ddc_range) VALUES
('Fiction', 'Novels, short stories, and creative fiction works', '800-899'),
('Technology', 'Computer science, engineering, and technology', '000-099, 600-699'),
('Science', 'Natural sciences, mathematics, and applied sciences', '500-599'),
('History', 'World history, geography, and biography', '900-999'),
('Literature', 'Literary criticism, poetry, drama, and essays', '800-899'),
('Business', 'Management, economics, finance, and accounting', '330-339, 650-659'),
('Medicine', 'Health sciences, nursing, and medical reference', '610-619'),
('Law', 'Legal studies, constitutional law, and jurisprudence', '340-349'),
('Arts', 'Fine arts, music, architecture, and design', '700-799'),
('Education', 'Pedagogy, teaching methods, and curriculum', '370-379');

-- Default System Configuration
INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES
('fine.daily_rate', '5.00', 'Daily fine rate for overdue items in LKR'),
('fine.max_cap_percent', '150', 'Maximum fine as percentage of replacement cost'),
('fine.block_threshold', '500.00', 'Fine threshold that blocks new borrowing'),
('loan.undergraduate.max_books', '4', 'Maximum books for undergraduate students'),
('loan.undergraduate.period_days', '14', 'Loan period for undergraduate students'),
('loan.postgraduate.max_books', '6', 'Maximum books for postgraduate students'),
('loan.postgraduate.period_days', '21', 'Loan period for postgraduate students'),
('loan.faculty.max_books', '10', 'Maximum books for faculty members'),
('loan.faculty.period_days', '30', 'Loan period for faculty members'),
('loan.max_renewals', '2', 'Maximum number of renewals per loan'),
('reservation.max_per_user', '3', 'Maximum simultaneous reservations per user'),
('reservation.hold_hours', '48', 'Hours to hold a reserved book'),
('notification.due_reminder_days', '3', 'Days before due date to send reminder'),
('system.institution.name', 'Sri Lanka Institute of Information Technology', 'Institution name'),
('system.currency', 'LKR', 'Local currency code');
