DROP INDEX "source_target";--> statement-breakpoint
DROP INDEX "skill_user";--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "source_target" UNIQUE("source_skill_id","target_skill_id");--> statement-breakpoint
ALTER TABLE "user_skill" ADD CONSTRAINT "skill_user" UNIQUE("user_id","skill_id");