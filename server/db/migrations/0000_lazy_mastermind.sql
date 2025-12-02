CREATE TABLE "proficiency_level" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_skill_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"level" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_skill_id" integer NOT NULL,
	"target_skill_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" text,
	"recommended" boolean DEFAULT true NOT NULL,
	"importance" integer DEFAULT 30 NOT NULL,
	CONSTRAINT "skill_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_skill" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"skill_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proficiency_level" ADD CONSTRAINT "proficiency_level_user_skill_id_user_skill_id_fk" FOREIGN KEY ("user_skill_id") REFERENCES "public"."user_skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_source_skill_id_skill_id_fk" FOREIGN KEY ("source_skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_target_skill_id_skill_id_fk" FOREIGN KEY ("target_skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "source_target" ON "relationship" USING btree ("source_skill_id","target_skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_user" ON "user_skill" USING btree ("user_id","skill_id");