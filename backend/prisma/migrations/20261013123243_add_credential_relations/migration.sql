/*
  Warnings:

  - Added the required column `categoryId` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Credential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CredentialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CredentialGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
