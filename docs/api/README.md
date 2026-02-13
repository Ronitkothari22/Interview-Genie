# API Documentation

This directory contains documentation for all API endpoints in Interview Genie.

## Authentication

- [Login](/api/auth/login)
- [Signup](/api/auth/signup)
- [Password Reset](/api/auth/reset-password)
- [Email Verification](/api/auth/verify)

## User Management

- [User Profile](/api/users/profile)
- [Update Profile](/api/users/update)
- [Credits Management](/api/users/credits)

## Interview Features

- [Mock Interviews](/api/interviews/mock)
- [Interview History](/api/interviews/history)
- [Interview Feedback](/api/interviews/feedback)

## Document Management

- [Resume Upload](/api/documents/resume/upload)
- [Resume Analysis](/api/documents/resume/analyze)
- [LinkedIn Profile](/api/documents/linkedin)

## API Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null,
  "meta": {
    "timestamp": string,
    "requestId": string
  }
}
```

## Error Handling

Common error status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- 3 attempts per 5 minutes for authentication
- 100 requests per minute for authenticated endpoints
- 50 requests per day for AI-powered features

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Environment Variables

Required environment variables for API functionality are documented in `.env.example`
