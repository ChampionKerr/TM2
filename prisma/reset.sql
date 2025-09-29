-- Drop all tables in the correct order to handle foreign key constraints
DROP TABLE IF EXISTS "LeaveRequest" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Employee" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
-- Drop any existing enums
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "LeaveType" CASCADE;
DROP TYPE IF EXISTS "LeaveStatus" CASCADE;