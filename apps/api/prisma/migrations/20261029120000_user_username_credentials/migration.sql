-- Add globally unique username and forced password-change flag
ALTER TABLE "User" ADD COLUMN "username" TEXT;

ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Google-only accounts may not have a user-chosen password yet
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
