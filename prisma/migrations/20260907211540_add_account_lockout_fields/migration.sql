-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLogin" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3);
