// Required env for modules that assert on it at import time.
process.env.NEXTAUTH_SECRET ||= "test-secret-not-for-production";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";
// Prisma needs a valid DATABASE_URL even in test (queries are mocked at the test level).
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/taskflow_test";
process.env.DIRECT_URL ||= "postgresql://test:test@localhost:5432/taskflow_test";
