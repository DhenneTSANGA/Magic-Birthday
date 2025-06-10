-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_eventId_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_eventId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_eventId_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_eventId_fkey";

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
