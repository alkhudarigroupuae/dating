# Security Best Practices

## 1. Authentication & Authorization
- **JWT**: Use short-lived access tokens (15min) and HTTP-only cookies for refresh tokens.
- **Passwords**: Always hash passwords with `bcrypt` (salt rounds >= 12).
- **OAuth**: Validate state parameters to prevent CSRF.

## 2. API Security
- **Rate Limiting**: Use `express-rate-limit` to prevent abuse.
- **Helmet**: Use `helmet` middleware to set secure HTTP headers.
- **CORS**: Restrict `Access-Control-Allow-Origin` to your frontend domain only.
- **Input Validation**: Validate all inputs using `zod` or `joi` before processing.

## 3. WebRTC & Sockets
- **Signaling**: Authenticate socket connections using JWT middleware.
- **Turn Servers**: Use a secure TURN server (e.g., Coturn) with authentication to prevent unauthorized usage.

## 4. Data Protection
- **Sanitization**: Sanitize user inputs to prevent XSS (Cross-Site Scripting).
- **NoSQL Injection**: Use Mongoose schemas strictly and avoid passing raw user input to queries.

## 5. Infrastructure
- **HTTPS**: Enforce SSL/TLS for all connections.
- **Firewall**: Configure UFW on VPS to allow only necessary ports (22, 80, 443).
- **Monitoring**: Use tools like Sentry for error tracking and logging.
