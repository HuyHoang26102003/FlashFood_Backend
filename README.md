<p align="center">
  <img src="https://via.placeholder.com/200x100/FF6B35/FFFFFF?text=FlashFood" width="200" alt="FlashFood Logo" />
</p>

# FlashFood Backend System

A comprehensive food delivery platform backend built with NestJS, featuring advanced admin management, customer care systems, and real-time communication capabilities.

## 🚀 Project Overview

FlashFood is a full-featured food delivery application backend that handles multiple user roles including customers, drivers, restaurants, and administrators. This repository specifically focuses on the **admin management system**, **customer care operations**, and **real-time communication features**.

## 🏗️ System Architecture

### Core Responsibilities Implemented:

- **Admin Management System** with Role-Based Access Control (RBAC)
- **Customer Care & Support System** with inquiry management
- **Real-time Chat System** with chatbot integration
- **WebSocket Notifications** for live updates
- **CRUD Operations** for various entities

## 🔑 Key Features

### 1. Advanced Admin Management System (`/src/admin/`)

- **Role-Based Access Control (RBAC)** implementation
- **Permission Guards** and decorators for secure access
- **Multiple Admin Types**:
  - Finance Admin for financial operations
  - Companion Admin for general management
- **Real-time Admin Gateway** for live updates
- **Comprehensive CRUD operations** for admin entities

### 2. Customer Care System (`/src/customer_cares/`, `/src/customer_cares_inquires/`)

- **Customer Support Chat** integration
- **Inquiry Management System** with CRUD operations
- **Real-time Customer Care Gateway** for instant communication
- **Support ticket tracking** and resolution

### 3. Real-time Chat System (`/src/FChat/`)

- **WebSocket-based Chat Gateway** (2000+ lines of implementation)
- **AI Chatbot Service** with intelligent responses
- **Support Chat Service** for customer assistance
- **Chat Room Management** with persistent message storage
- **Real-time message delivery** and status tracking

### 4. Notification & Real-time Updates

- **WebSocket integration** for live notifications
- **Real-time data synchronization** across admin panels
- **Event-driven architecture** for instant updates
- **Fake data simulation** for testing and demonstration

### 5. Additional Systems Integration

- **FAQ Management** for customer self-service
- **Penalty System** with automated rule enforcement
- **Finance Rules** management for transaction handling
- **Promotion System** for marketing campaigns
- **Rating & Review System** for quality assurance

## 🛠️ Technical Implementation

### Technologies Used:

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **WebSocket** - Real-time communication
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Socket.IO** - WebSocket implementation

### Security Features:

- **JWT Authentication** for secure API access
- **Role-Based Permission System** with granular controls
- **Guard Implementation** for route protection
- **Decorator-based Authorization** for method-level security

### Real-time Features:

- **Live Chat System** with multi-user support
- **Admin Notifications** for system events
- **Order Status Updates** via WebSocket
- **Customer Care Real-time Support**

## 📁 Project Structure

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## 🚀 Installation & Setup

```bash
# Install dependencies
$ npm install

# Database setup
$ npm run migration:run

# Start development server
$ npm run start:dev

# Start production server
$ npm run start:prod
```

## 🔧 Development Scripts

```bash
# Development
$ npm run start:dev

# Build for production
$ npm run build

# Run tests
$ npm run test

# Run e2e tests
$ npm run test:e2e

# Database migrations
$ npm run migration:generate
$ npm run migration:run
```

## 📊 Admin Dashboard Features

### Dashboard Analytics

- **Real-time Statistics** for orders, users, revenue
- **Chart Integration** for data visualization
- **Performance Metrics** tracking
- **System Health Monitoring**

### User Management

- **Customer Account Management** with banning capabilities
- **Driver Performance Tracking** with statistics
- **Restaurant Management** with approval workflows
- **Admin Role Assignment** with permission controls

### Financial Operations

- **Transaction Monitoring** with detailed records
- **Revenue Analytics** and reporting
- **Penalty Management** with automated enforcement
- **Promotion Campaign** management

## 🎯 Customer Care Integration

### Support Channels

- **Live Chat Support** with real-time responses
- **FAQ System** for common questions
- **Inquiry Ticketing** with priority management
- **AI Chatbot** for 24/7 basic support

### Communication Features

- **Multi-channel Support** (chat, tickets, FAQ)
- **Real-time Messaging** with read receipts
- **File Upload Support** for issue documentation
- **Automated Responses** for common inquiries

## 🔐 Security & Permissions

### RBAC Implementation

- **Granular Permission Control** at endpoint level
- **Role-based Route Guards** for secure access
- **Dynamic Permission Assignment** for flexibility
- **Audit Trail** for admin actions

### Authentication & Authorization

- **JWT-based Authentication** with refresh tokens
- **Session Management** with Redis storage
- **Password Security** with bcrypt hashing
- **Account Protection** with ban management

## 📈 Performance & Scalability

### Optimization Features

- **Redis Caching** for frequently accessed data
- **Database Indexing** for query optimization
- **Connection Pooling** for database efficiency
- **Rate Limiting** for API protection

### Real-time Capabilities

- **WebSocket Connections** for instant updates
- **Event-driven Architecture** for scalability
- **Queue Management** for background processing
- **Load Balancing Ready** architecture

## 🧪 Testing & Quality

### Testing Implementation

- **Unit Tests** with Jest framework
- **E2E Testing** for complete workflows
- **API Testing** with comprehensive coverage
- **WebSocket Testing** for real-time features

### Code Quality

- **TypeScript Strict Mode** for type safety
- **ESLint Configuration** for code consistency
- **Prettier Formatting** for code style
- **Git Hooks** for quality enforcement

## 📚 API Documentation

### Admin Endpoints

- `GET /admin` - Admin management operations
- `POST /admin/create` - Create new admin users
- `PUT /admin/permissions` - Update role permissions
- `GET /admin/analytics` - Dashboard analytics data

### Customer Care Endpoints

- `GET /customer-cares` - Support chat management
- `POST /customer-cares/inquiry` - Create support tickets
- `GET /customer-cares/faq` - FAQ management
- `WebSocket /chat` - Real-time chat gateway

### Real-time Events

- `admin:notification` - Admin system alerts
- `chat:message` - Chat message events
- `order:update` - Order status changes
- `system:alert` - System-wide notifications

## 🌟 Key Achievements

### Technical Excellence

- **2000+ lines** of WebSocket gateway implementation
- **Comprehensive RBAC** system with granular controls
- **Multi-service Architecture** with clean separation
- **Real-time Communication** across all user roles

### Business Impact

- **Enhanced Admin Efficiency** with streamlined workflows
- **Improved Customer Support** with instant chat capabilities
- **System Reliability** with robust error handling
- **Scalable Architecture** ready for production deployment

## 🔮 Future Enhancements

- **AI-powered Analytics** for predictive insights
- **Mobile App Integration** for admin operations
- **Advanced Reporting** with export capabilities
- **Multi-language Support** for global deployment

## 👨‍💻 Development Team

**Backend Developer - Admin & Customer Care Systems**

- Admin Management System Implementation
- Customer Care & Support Integration
- Real-time Chat System Development
- RBAC & Security Implementation

## 📞 Support & Contact

For technical support or inquiries about the admin and customer care systems:

- **Documentation**: Available in `/docs` folder
- **Issue Tracking**: GitHub Issues
- **Support Chat**: Integrated customer care system

---

**FlashFood Backend** - Delivering exceptional food delivery experiences through robust technology and superior customer care.
