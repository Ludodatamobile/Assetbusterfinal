/*
  Warnings:

  - A unique constraint covering the columns `[userId,title]` on the table `InvestorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_title_key" ON "InvestorProfile"("userId", "title");
