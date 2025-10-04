/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Bookstore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Bookstore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Bookstore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bookstore_slug_key" ON "public"."Bookstore"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Bookstore_phone_key" ON "public"."Bookstore"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Bookstore_email_key" ON "public"."Bookstore"("email");
