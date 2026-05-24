---
name: sports-center-helper
description: |
  Hỗ trợ phát triển, xây dựng, khởi chạy và bảo trì dự án D-Sport Center (Spring Boot backend + React frontend).
  Sử dụng skill này khi được yêu cầu thêm tính năng mới, kiểm tra cấu trúc thư mục, chạy thử nghiệm dự án, xử lý di chuyển cơ sở dữ liệu (Liquibase), thiết lập Docker, hoặc tích hợp API của PayPal, Cloudinary, và Google Gemini.
version: 1.0.0
tags: [sports-center, spring-boot, react, docker, maven, npm, liquibase]
---

# 🏟️ D-Sport Center Agent Skill

Skill này giúp AI Agent hiểu sâu sắc cấu trúc, quy trình phát triển và các quy tắc thiết kế của dự án **D-Sport Center** (Hệ thống quản lý và đặt lịch sân thể thao trực tuyến).

---

## 📅 Tổng Quan Dự Án & Các Công Nghệ Cốt Lõi

Hệ thống được thiết kế theo mô hình Client-Server phân tách:
*   **Backend (Spring Boot 4.0.2 & Java 21)**: Chịu trách nhiệm nghiệp vụ đặt sân, xử lý xung đột thời gian (overlap check), thanh toán PayPal, gửi mã QR check-in qua Mail, tích hợp Gemini AI và quản lý dữ liệu với Liquibase.
*   **Frontend (React 19 & Vite 8)**: Giao diện người dùng hiện đại, sử dụng Tailwind CSS v4, Shadcn UI, quản lý state bằng Redux Toolkit và tối ưu hóa API caching bằng TanStack React Query v5.

---

## 🗂️ Cấu Trúc Thư Mục Dự Án (Project Structure)

Khi làm việc với dự án này, Agent cần tuân theo sơ đồ tổ chức thư mục sau:

```text
sports-center/
├── be/                       # Backend Spring Boot Project
│   ├── src/main/java/com/devduong/be/
│   │   ├── controllers/      # REST API Controllers (endpoints)
│   │   ├── services/         # Business Logic (AIChatService, CourtService, BookingService,...)
│   │   ├── repositories/     # Spring Data JPA Repositories
│   │   ├── entities/         # JPA Entities (User, Court, Booking, Review,...)
│   │   ├── dtos/             # Data Transfer Objects (request/response models)
│   │   └── config/           # Security, WebSocket, PayPal, Cloudinary Config
│   └── src/main/resources/
│       ├── application.yml   # Spring Boot Configuration File
│       └── db/changelog/     # Liquibase Migration Files
├── fe/                       # Frontend React Project
│   ├── src/
│   │   ├── components/       # Reusable components (AIChatWidget, Layout,...)
│   │   ├── pages/            # Page components (admin/CourtsPage, user/BookingPage,...)
│   │   ├── redux/            # Redux Toolkit Slices (auth, cart,...)
│   │   └── hooks/            # Custom hooks (TanStack Query hooks)
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite config
├── docker-compose.yml        # Docker orchestration (PostgreSQL container setup)
└── README.md                 # Project Overview & Setup Instructions
```

---

## ⚡ Các Lệnh Phát Triển Quan Trọng (Key Dev Commands)

Agent có thể chạy các lệnh sau để khởi động, chạy thử hoặc quản lý môi trường phát triển:

### 1. Cơ Sở Dữ Liệu (PostgreSQL via Docker)
Đảm bảo cơ sở dữ liệu luôn chạy trước khi chạy backend.
*   **Khởi động DB container**:
    ```bash
    docker run --name sports-db -e POSTGRES_DB=sportsdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -p 5432:5432 -d postgres:16-alpine
    ```
*   **Hoặc chạy toàn bộ dịch vụ thông qua Docker Compose**:
    ```bash
    docker-compose up --build -d
    ```

### 2. Khởi Chạy Backend (be)
*   **Tải thư viện & build code**:
    ```bash
    cd be
    ./mvnw clean install
    ```
*   **Chạy server Spring Boot**:
    ```bash
    cd be
    ./mvnw spring-boot:run
    ```

### 3. Khởi Chạy Frontend (fe)
*   **Cài đặt các packages**:
    ```bash
    cd fe
    npm install
    ```
*   **Chạy development server (Vite)**:
    ```bash
    cd fe
    npm run dev
    ```

---

## 🛡️ Hướng Dẫn Phát Triển (Development Runbook & Best Practices)

Khi sửa đổi hoặc thêm mới tính năng, Agent phải nghiêm túc tuân thủ các quy tắc sau:

### 💾 1. Quản Lý Cơ Sở Dữ Liệu & Schema (Liquibase First)
*   **Không bao giờ** thay đổi cấu trúc DB trực tiếp trong code hoặc qua `ddl-auto: update`. Luôn giữ `spring.jpa.hibernate.ddl-auto: validate` để đảm bảo tính toàn vẹn.
*   Mọi thay đổi cấu trúc bảng, thêm cột, hoặc thêm bảng mới phải được thực hiện thông qua **Liquibase changeset** đặt trong: `be/src/main/resources/db/changelog/changes/`.
*   Đặt tên file di chuyển theo cấu trúc thứ tự tăng dần: `xxx-description.xml` hoặc `xxx-description.sql` (ví dụ: `009-add-discount-to-bookings.xml`).
*   Đăng ký file changeset mới vào file master: `be/src/main/resources/db/changelog/db.changelog-master.xml`.

### 🔑 2. Quản Lý Bảo Mật & Biến Môi Trường (Security)
*   **Tuyệt đối KHÔNG** lưu trữ thông tin nhạy cảm (API Keys, Mật khẩu DB, PayPal Secrets) trực tiếp vào code hoặc commit file `.env` lên Git.
*   Sử dụng biến môi trường dạng `${VARIABLE_NAME}` trong `application.yml` và khai báo chúng trong file local `.env` của backend hoặc frontend.
*   Đảm bảo file `.gitignore` ở root luôn chặn tất cả các file `*.env`.

### 📅 3. Thuật Toán Kiểm Tra Trùng Khớp Khung Giờ (Time Overlap Validation)
*   Khi khách hàng đặt sân, bắt buộc phải kiểm tra xung đột thời gian (overlap) để tránh tình trạng xếp chồng lịch đặt sân.
*   Giải thuật kiểm tra overlap chuẩn trong cơ sở dữ liệu hoặc logic dịch vụ:
    $$\text{Overlap} \iff (\text{BookingStart} < \text{RequestedEnd}) \land (\text{BookingEnd} > \text{RequestedStart})$$
*   Luôn xác thực tính hợp lệ của giờ mở cửa/đóng cửa của sân trước khi tiến hành đặt chỗ.

### 🤖 4. Tích Hợp Trợ Lý Gemini AI
*   Dự án sử dụng Gemini API thông qua `GeminiService` để giao tiếp với mô hình `gemini-2.0-flash`.
*   Khi phát triển hoặc cải tiến chatbot, hệ thống prompt được định cấu hình tại `AIChatService.java` bằng cách thu thập dữ liệu realtime (Real-time DB Context) bao gồm danh sách các sân đang hoạt động và bảng giá tương ứng để đưa vào System Prompt. Việc này giúp AI trả lời chính xác, tránh hiện tượng "ảo giác" (hallucination).
*   Luôn duy trì cơ chế **Fallback Response** trong trường hợp API Key hết hạn hoặc dịch vụ Gemini không khả dụng.

---

## 🔍 Quy Trình Kiểm Tra & Xác Minh (Verification Checklist)

Trước khi xác nhận hoàn thành một tác vụ phát triển, Agent cần tự kiểm tra các điểm sau:

- [ ] **Lints & Build**: Backend build thành công (`./mvnw clean compile`), frontend không có lỗi cú pháp hoặc lỗi build.
- [ ] **Database Migration**: Chạy ứng dụng Spring Boot thành công và Liquibase hoàn thành tất cả các thay đổi mà không gây ra lỗi khởi động.
- [ ] **API Standards**: Các REST endpoints mới tuân thủ đúng chuẩn (sử dụng DTOs, trả về ResponseEntity có cấu trúc, xử lý lỗi tập trung thông qua `@RestControllerAdvice`).
- [ ] **Environment**: Biến môi trường mới (nếu có) được tài liệu hóa rõ ràng trong file `.env.example` hoặc hướng dẫn thiết lập.
