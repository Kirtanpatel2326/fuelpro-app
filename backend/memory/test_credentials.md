# FuelPro Test Credentials

## Admin Account
- Email: admin@fuelpro.com
- Password: admin123
- Role: admin
- Access: /admin (all admin pages), /scanner

## Test Customer Account
- Email: alex@fuelpro.com
- Password: test123
- Role: user
- Access: /  (customer mobile app)

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/refresh

## Notes
- JWT tokens delivered via httpOnly cookies (access_token, refresh_token)
- Frontend must use `withCredentials: true` (axios) / `credentials: 'include'` (fetch)
- CORS origins are whitelisted (no wildcard)
