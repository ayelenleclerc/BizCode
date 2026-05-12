import '@testing-library/jest-dom'

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = 'postgresql://bizcode_test@localhost:5432/bizcode_test_placeholder'
}
if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = 'test-jwt-secret'
}
if (!process.env.NODE_ENV?.trim()) {
  process.env.NODE_ENV = 'test'
}
