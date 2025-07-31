# Postman Testing Guide & Redis Monitoring

## Overview

This guide explains how to use the Postman collection for testing the Course Management Platform API and how to monitor Redis for notifications.

## Postman Collection Setup

### 1. Import the Collection

1. Open Postman
2. Click "Import" 
3. Select the `Course_Management_Platform_API.postman_collection.json` file
4. The collection will be imported with all endpoints organized by module

### 2. Environment Variables

The collection uses these variables that you need to set:

- `base_url`: `http://localhost:5000`
- `auth_token`: Will be set automatically after login
- `manager_token`: Token for manager user
- `facilitator_token`: Token for facilitator user  
- `student_token`: Token for student user
- `manager_id`: ID of created manager
- `facilitator_id`: ID of created facilitator
- `class_id`: ID of created class
- `cohort_id`: ID of created cohort
- `module_id`: ID of created module
- `mode_id`: ID of created mode
- `allocation_id`: ID of created allocation
- `log_id`: ID of created activity log

### 3. Testing Workflow

#### Step 1: Authentication Setup

1. **Register Manager**
   - Run "Register Manager" request
   - Copy the returned token to `manager_token` variable
   - Copy the manager ID to `manager_id` variable

2. **Register Facilitator**
   - Run "Register Facilitator" request (uses `manager_id`)
   - Copy the returned token to `facilitator_token` variable
   - Copy the facilitator ID to `facilitator_id` variable

3. **Register Student**
   - First create a class and cohort using manager token
   - Run "Register Student" request
   - Copy the returned token to `student_token` variable

#### Step 2: Module 1 Testing (Course Allocation)

1. **Create Supporting Data**
   - Create Module, Class, Cohort, Mode using manager token
   - Copy IDs to respective variables

2. **Test Allocations**
   - Create allocation using manager token
   - Test filtering and facilitator access

#### Step 3: Module 2 Testing (Activity Logs)

1. **Create Activity Log**
   - Use facilitator token to create log
   - Copy log ID to `log_id` variable

2. **Test Manager Access**
   - Use manager token to view all logs
   - Test filtering and overdue logs

## Redis Monitoring

### Redis Queue Structure

The system uses Bull queues with these Redis keys:

```
bull:reminder-queue:wait      # Jobs waiting to be processed
bull:reminder-queue:active    # Jobs currently being processed
bull:reminder-queue:completed # Successfully completed jobs
bull:reminder-queue:failed    # Failed jobs
bull:reminder-queue:delayed   # Delayed jobs
```

### Monitoring Commands

If you have Redis CLI installed:

```bash
# Connect to Redis
redis-cli

# List all Bull-related keys
KEYS bull:*

# Check queue lengths
LLEN bull:reminder-queue:wait
LLEN bull:reminder-queue:active
LLEN bull:reminder-queue:completed
LLEN bull:reminder-queue:failed

# Monitor real-time operations
MONITOR

# Get specific job details
HGETALL bull:reminder-queue:1
```

### Queue Job Types

The system processes these job types:

1. **log-submission**: When a facilitator submits an activity log
2. **grading-update**: When grading status is updated
3. **overdue-reminder**: For facilitators with overdue logs
4. **weekly-reminder**: Weekly reminders sent to facilitators

### Email Configuration

To enable email sending, add to your `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password in Google Account settings
3. Use App Password instead of regular password

### Testing Email Notifications

1. **Create an activity log** (triggers log-submission notification)
2. **Update grading status** (triggers grading-update notification)
3. **Check Redis queue** for pending jobs
4. **Monitor server logs** for email sending status

## API Testing Scenarios

### Authentication Tests

1. **Valid Registration**
   - Register users with valid data
   - Verify token is returned
   - Check user is created in database

2. **Invalid Registration**
   - Try duplicate email
   - Try missing required fields
   - Verify appropriate error responses

3. **Login Tests**
   - Login with correct credentials
   - Login with wrong password
   - Login with non-existent user

### Authorization Tests

1. **Role-based Access**
   - Test manager-only endpoints with facilitator token
   - Test facilitator-only endpoints with student token
   - Verify 403 responses

2. **Self-access Tests**
   - Students accessing their own profile
   - Facilitators accessing their own logs
   - Verify 403 when accessing others' data

### Business Logic Tests

1. **Allocation Validation**
   - Try creating duplicate allocations
   - Try invalid foreign keys
   - Test trimester validation

2. **Activity Log Validation**
   - Test status enum values
   - Test attendance array format
   - Test week number validation

## Common Issues & Solutions

### 1. Authentication Errors

**Problem**: 401 Unauthorized
**Solution**: 
- Check token is valid and not expired
- Verify Authorization header format: `Bearer <token>`
- Ensure user exists in database

### 2. Authorization Errors

**Problem**: 403 Forbidden
**Solution**:
- Verify user has correct role for endpoint
- Check if user is accessing their own data
- Ensure proper role-based middleware

### 3. Validation Errors

**Problem**: 400 Bad Request
**Solution**:
- Check required fields are provided
- Verify data types and formats
- Ensure foreign keys exist

### 4. Redis Connection Issues

**Problem**: Redis connection failed
**Solution**:
- Ensure Redis server is running
- Check Redis URL in environment
- Verify Redis port (default: 6379)

### 5. Email Sending Issues

**Problem**: Emails not being sent
**Solution**:
- Check email credentials in .env
- Verify Gmail App Password setup
- Check server logs for SMTP errors

## Performance Testing

### Load Testing Scenarios

1. **Concurrent User Registration**
   - Test multiple simultaneous registrations
   - Monitor database performance

2. **Bulk Allocation Creation**
   - Create multiple allocations quickly
   - Test filtering performance

3. **Activity Log Submission**
   - Submit logs from multiple facilitators
   - Monitor Redis queue performance

### Monitoring Metrics

1. **Response Times**
   - Track API response times
   - Identify slow endpoints

2. **Queue Performance**
   - Monitor Redis queue lengths
   - Track job processing times

3. **Database Performance**
   - Monitor query execution times
   - Check for slow queries

## Security Testing

### Input Validation

1. **SQL Injection**
   - Test with malicious input
   - Verify proper escaping

2. **XSS Prevention**
   - Test with script tags
   - Verify content sanitization

3. **Authentication Bypass**
   - Test with invalid tokens
   - Test with expired tokens

### Authorization Testing

1. **Privilege Escalation**
   - Try accessing admin endpoints
   - Test role manipulation

2. **Data Access Control**
   - Test accessing others' data
   - Verify proper isolation

## Troubleshooting Guide

### Server Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill process
   taskkill /PID <process_id> /F
   ```

2. **Database Connection**
   ```bash
   # Check MySQL service
   net start mysql
   # Test connection
   mysql -u root -p
   ```

3. **Redis Connection**
   ```bash
   # Start Redis server
   redis-server
   # Test connection
   redis-cli ping
   ```

### Test Failures

1. **Database Cleanup**
   ```bash
   # Reset test database
   npm run test:reset
   ```

2. **Token Issues**
   - Clear all tokens in Postman
   - Re-authenticate users
   - Check token expiration

3. **Environment Variables**
   - Verify .env file exists
   - Check variable names
   - Restart server after changes

## Best Practices

### Testing Strategy

1. **Start with Authentication**
   - Always test auth first
   - Verify tokens work

2. **Test Happy Path**
   - Test successful operations
   - Verify expected responses

3. **Test Error Cases**
   - Test invalid inputs
   - Verify error messages

4. **Test Authorization**
   - Test role-based access
   - Verify proper restrictions

### Data Management

1. **Use Test Data**
   - Create specific test users
   - Use predictable data

2. **Clean Up**
   - Delete test data after tests
   - Reset database state

3. **Isolate Tests**
   - Don't depend on other tests
   - Use unique identifiers

### Monitoring

1. **Check Logs**
   - Monitor server logs
   - Check Redis logs

2. **Verify Emails**
   - Check email delivery
   - Monitor queue status

3. **Performance**
   - Track response times
   - Monitor resource usage 