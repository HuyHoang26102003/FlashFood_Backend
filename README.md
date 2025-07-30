# FlashFood Management System - Backend

## Overview

FlashFood Management System is a comprehensive food delivery platform built with NestJS. This system handles the administrative operations, customer support, and business logic for a food delivery service. The backend is shared between multiple developers, with this portion focusing on **Admin Management** and **Customer Care** functionalities.

## 🏗️ Architecture

This backend is built using:

- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Socket.io** - Real-time communication
- **JWT** - Authentication and authorization

## 👥 User Roles & Access Control

### Admin Roles

1. **Super Admin** - Full system access and control
2. **Companion Admin** - Restaurant and order management
3. **Finance Admin** - Financial operations and reporting

### Customer Care

- Dedicated support team for customer inquiries and issue resolution

## 🔧 Core Modules Handled

### 1. Admin Management (`/admin`)

**Location**: `src/admin/`

**Key Features**:

- Multi-role admin authentication and authorization
- Admin profile management
- Role-based access control
- Real-time admin dashboard via WebSocket
- Admin activity logging and monitoring

**Main Components**:

- `admin.controller.ts` - REST API endpoints
- `admin.service.ts` - Business logic (549 lines)
- `admin.gateway.ts` - Real-time WebSocket communication
- `admin.repository.ts` - Database operations

### 2. Admin Chatbot (`/admin_chatbot`)

**Location**: `src/admin_chatbot/`

**Key Features**:

- AI-powered chatbot for admin support
- Automated responses to common admin queries
- Integration with admin workflow
- Data seeding and startup services

**Main Components**:

- `admin_chatbot.service.ts` - Core chatbot logic (718 lines)
- `admin_chatbot.gateway.ts` - WebSocket communication (292 lines)
- `data-seeding.service.ts` - Initial data setup (499 lines)

### 3. Customer Care (`/customer_cares`)

**Location**: `src/customer_cares/`

**Key Features**:

- Customer support ticket management
- Real-time customer chat support
- Issue tracking and resolution
- Customer inquiry handling

**Main Components**:

- `customer_cares.service.ts` - Support logic (457 lines)
- `customer_cares.gateway.ts` - Real-time chat
- `customer_cares.repository.ts` - Data persistence

### 4. Customer Care Inquiries (`/customer_cares_inquires`)

**Location**: `src/customer_cares_inquires/`

**Key Features**:

- Detailed inquiry management
- Customer feedback processing
- Support ticket categorization
- Response tracking

**Main Components**:

- `customer_cares_inquires.service.ts` - Inquiry processing (470 lines)
- `customer_cares_inquires.repository.ts` - Data operations (530 lines)

### 5. Admin Charts & Analytics (`/admin_chart`)

**Location**: `src/admin_chart/`

**Key Features**:

- Business intelligence and analytics
- Performance metrics dashboard
- Revenue and order analytics
- Custom chart generation

**Main Components**:

- `admin_chart.service.ts` - Analytics engine (997 lines)
- `admin_chart.controller.ts` - Chart data endpoints

### 6. Finance Rules (`/finance_rules`)

**Location**: `src/finance_rules/`

**Key Features**:

- Financial policy management
- Commission and fee calculations
- Payment rule configurations
- Financial reporting

**Main Components**:

- `finance_rules.service.ts` - Financial logic (216 lines)
- `finance_rules.repository.ts` - Financial data (163 lines)

### 7. Promotions (`/promotions`)

**Location**: `src/promotions/`

**Key Features**:

- Promotional campaign management
- Discount code generation
- Marketing campaign tracking
- Promotion analytics

**Main Components**:

- `promotions.service.ts` - Campaign logic (530 lines)
- `promotions.repository.ts` - Promotion data (153 lines)

### 8. Notifications (`/notifications`)

**Location**: `src/notifications/`

**Key Features**:

- Multi-channel notification system
- Push notifications
- Email notifications
- SMS notifications
- Notification preferences management

**Main Components**:

- `notifications.service.ts` - Notification logic (217 lines)
- `notifications.repository.ts` - Notification data (359 lines)

### 9. FAQ Management (`/faq`)

**Location**: `src/faq/`

**Key Features**:

- Frequently Asked Questions management
- Dynamic FAQ content
- Category-based FAQ organization
- Search functionality

**Main Components**:

- `faq.service.ts` - FAQ logic (148 lines)
- `faq.repository.ts` - FAQ data (58 lines)

### 10. Banned Account Management (`/banned-account`)

**Location**: `src/banned-account/`

**Key Features**:

- Account suspension management
- Violation tracking
- Appeal process handling
- Account restoration

**Main Components**:

- `banned-account.service.ts` - Account management logic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Redis server
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd FlashFood_Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/flashfood

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret

# Other configurations...
```

4. **Database Migration**

```bash
npm run migration:run
```

5. **Start the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📊 API Documentation

### Admin Endpoints

- `POST /admin/login` - Admin authentication
- `GET /admin/profile` - Get admin profile
- `PUT /admin/profile` - Update admin profile
- `GET /admin/dashboard` - Admin dashboard data

### Customer Care Endpoints

- `POST /customer-cares/ticket` - Create support ticket
- `GET /customer-cares/tickets` - List support tickets
- `PUT /customer-cares/ticket/:id` - Update ticket status

### Analytics Endpoints

- `GET /admin-chart/revenue` - Revenue analytics
- `GET /admin-chart/orders` - Order analytics
- `GET /admin-chart/users` - User analytics

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control:

- **Super Admin**: Full system access
- **Companion Admin**: Restaurant and order management
- **Finance Admin**: Financial operations only
- **Customer Care**: Support and inquiry management

## 📈 Key Features

### Real-time Communication

- WebSocket-based real-time chat for customer support
- Live admin dashboard updates
- Real-time notification delivery

### Analytics & Reporting

- Comprehensive business intelligence
- Custom chart generation
- Performance metrics tracking

### Multi-role Support

- Granular permission system
- Role-based feature access
- Audit trail for admin actions

### Customer Support

- Ticket-based support system
- Real-time chat support
- FAQ management
- Inquiry tracking

## 📝 Testing

```bash
# Unit tests
npm run test

```

## 📦 Deployment

The application is configured for deployment on Vercel with the provided `vercel.json` configuration.

## 📝 Contributing

This backend is shared between multiple developers. Please ensure:

- Follow the existing code structure
- Add proper documentation for new features
- Include tests for new functionality
- Coordinate with team members for shared modules

---

**Note**: This README focuses on the Admin Management and Customer Care modules handled by this developer. The complete FlashFood system includes additional modules handled by other team members for a comprehensive food delivery platform.
