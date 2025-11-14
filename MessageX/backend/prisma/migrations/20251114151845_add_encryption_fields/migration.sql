-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "encryptedKey" TEXT,
ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text';
