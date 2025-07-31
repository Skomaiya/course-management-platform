# Course Management Platform API

A comprehensive REST API for managing course allocations, facilitators, students, and activity tracking in an educational institution.

**Presentation video:**
https://youtu.be/2MGQJA_vzeg

**Reflection Page:**
https://course-management-platform-frontend.onrender.com/


## Features

### Module 1: Course Allocation System
- **Academic Managers** can perform CRUD operations on course allocations
- **Facilitators** can view their assigned modules
- Course offerings defined by module, class, trimester, cohort, intake period, and mode
- Advanced filtering by trimester, cohort, intake, facilitator, and mode
- Secure access control with role-based permissions

### Module 2: Facilitator Activity Tracker (FAT)
- **Facilitators** submit and update weekly activity logs
- **Managers** monitor submissions and receive automated alerts
- Comprehensive tracking including:
  - Attendance marking (array of boolean values)
  - Formative One/Two grading status
  - Summative grading status
  - Course moderation status
  - Intranet sync status
  - Gradebook status
- Redis-backed notification system with automated reminders
- Advanced filtering and reporting capabilities

### Additional Features
- **Student Self-Update**: Students can update their own profile information
- **Role-based Access Control**: Secure endpoints with JWT authentication
- **Comprehensive Testing**: 131+ tests covering all functionality
- **Swagger Documentation**: Complete API documentation

## Environment Variables

The application uses environment variables for configuration. Copy `env.example` to `.env` and modify the values as needed:

```bash
cp env.example .env
```

### Required Environment Variables

#### Database Configuration
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database username (default: root)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: course_dev_schema)
- `DB_DIALECT` - Database dialect (default: mysql)
- `DB_LOGGING` - Enable SQL logging (default: false)

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: 1d)

#### Email Configuration
- `EMAIL_USER` - Email username (default: s.komaiya@alustudent.com)
- `EMAIL_PASS` - Email password
- `EMAIL_SERVICE` - Email service provider (default: gmail)
- `EMAIL_FROM_NAME` - Sender name (default: Course Platform)

#### Redis Configuration
- `REDIS_HOST` - Redis host (default: 127.0.0.1)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `REDIS_MONITOR_INTERVAL` - Redis monitor interval in ms (default: 5000)

#### API Configuration
- `API_BASE_URL` - Base URL for API documentation (default: http://localhost:5000)

#### Application Configuration
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 5000)

### Production Considerations

For production deployment, make sure to:
1. Set a strong `JWT_SECRET`
2. Use secure database credentials
3. Configure proper email credentials

## API Documentation

### Accessing Swagger Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Authentication requirements
- Schema definitions
- Error codes and messages

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new users
- `POST /api/auth/login` - User login

#### Students
- `GET /api/students` - Get all students (managers only)
- `GET /api/students/:id` - Get student by ID (managers only)
- `PUT /api/students/:id` - Update student (managers only)
- `DELETE /api/students/:id` - Delete student (managers only)
- `GET /api/students/profile` - Get own profile (students only)
- `PUT /api/students/profile` - Update own profile (students only)

#### Facilitators
- `POST /api/facilitators` - Create facilitator (managers only)
- `GET /api/facilitators` - Get all facilitators (managers only)
- `GET /api/facilitators/:id` - Get facilitator by ID
- `PUT /api/facilitators/:id` - Update facilitator
- `DELETE /api/facilitators/:id` - Delete facilitator (managers only)

#### Allocations (Module 1)
- `POST /api/allocations` - Create allocation (managers only)
- `GET /api/allocations` - Get all allocations (managers only)
- `GET /api/allocations/filter` - Filter allocations (managers only)
- `GET /api/allocations/facilitator/:facilitatorId` - Get facilitator's allocations
- `GET /api/allocations/:id` - Get allocation by ID (managers only)
- `PUT /api/allocations/:id` - Update allocation (managers only)
- `DELETE /api/allocations/:id` - Delete allocation (managers only)

#### Activity Logs (Module 2)
- `POST /api/logs` - Create activity log (facilitators only)
- `GET /api/logs` - Get all logs with filtering (managers only)
- `GET /api/logs/overdue/all` - Get overdue logs (managers only)
- `GET /api/logs/:id` - Get log by ID
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log (managers only)

#### Modules
- `POST /api/modules` - Create module (facilitators/managers)
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID (facilitators/managers)
- `PUT /api/modules/:id` - Update module (facilitators/managers)
- `DELETE /api/modules/:id` - Delete module (facilitators/managers)

#### Classes
- `POST /api/classes` - Create class (facilitators/managers)
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID (facilitators/managers)
- `PUT /api/classes/:id` - Update class (facilitators/managers)
- `DELETE /api/classes/:id` - Delete class (facilitators/managers)

#### Managers
- `POST /api/managers` - Create manager
- `GET /api/managers` - Get all managers
- `GET /api/managers/:id` - Get manager by ID
- `PUT /api/managers/:id` - Update manager
- `DELETE /api/managers/:id` - Delete manager

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Redis server (for notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Skomaiya/course-management-platform.git
   cd Course_Management_Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Run database setup
   node setup-db.js
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## Testing

Run all tests:
```bash
npm test
```

Run specific test files:
```bash
npm test tests/auth.test.js
npm test tests/allocation.test.js
npm test tests/activityLog.test.js
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **Student**: Can view and update their own profile
- **Facilitator**: Can manage their own activity logs and view their allocations
- **Manager**: Full access to all resources and can manage allocations

## Database Schema

### Core Models
- **User**: Base user model with authentication
- **Student**: Student profiles with class/cohort associations
- **Facilitator**: Facilitator profiles with qualifications and manager associations
- **Manager**: Manager profiles
- **Module**: Course modules with academic periods
- **Class**: Academic classes with start/graduation dates
- **Cohort**: Student cohorts
- **Mode**: Teaching modes (Online, In-Person, Hybrid)
- **Allocation**: Course allocations linking modules, classes, facilitators, and modes
- **ActivityLog**: Weekly activity tracking for facilitators

## Notification System

The platform includes a Redis-backed notification system that:
- Sends reminders to facilitators for overdue logs
- Alerts managers when logs are submitted or missed
- Provides weekly reminders for upcoming deadlines
- Tracks notification delivery status

## API Statistics

- **Total Endpoints**: 21 documented endpoints
- **Authentication**: JWT-based with role-based access
- **Documentation**: Complete Swagger/OpenAPI 3.0 documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: s.komaiya@alustudent.com
- Documentation: http://localhost:5000/api-docs
- Issues: Create an issue in the repository
