import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const skill = pgTable("skill", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  image: text("image"),
  recommended: boolean("recommended").notNull().default(true),
  importance: integer("importance").notNull().default(30),
  description: text("description"),
});

export const user_skill = pgTable(
  "user_skill",
  {
    id: serial("id").primaryKey(),
    user_id: varchar("user_id", { length: 100 }).notNull(),
    skill_id: integer("skill_id")
      .notNull()
      .references(() => skill.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
  },
  (table) => ({
    skill_user: unique("skill_user").on(table.user_id, table.skill_id),
  }),
);

export const proficiency_level = pgTable("proficiency_level", {
  id: serial("id").primaryKey(),
  user_skill_id: integer("user_skill_id")
    .notNull()
    .references(() => user_skill.id, {
      onDelete: "cascade",
      onUpdate: "no action",
    }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date(),
  ),
  level: integer("level").notNull().default(0),
});

export const relationship = pgTable(
  "relationship",
  {
    id: serial("id").primaryKey(),
    source_skill_id: integer("source_skill_id")
      .notNull()
      .references(() => skill.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
    target_skill_id: integer("target_skill_id")
      .notNull()
      .references(() => skill.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
  },
  (table) => ({
    source_target: unique("source_target").on(
      table.source_skill_id,
      table.target_skill_id,
    ),
  }),
);

export const skillRelations = relations(skill, ({ many }) => ({
  parents: many(relationship, { relationName: "source_skill" }),
  children: many(relationship, { relationName: "target_skill" }),
  user_skill: many(user_skill),
}));

export const relationshipRelations = relations(relationship, ({ one }) => ({
  source_skill: one(skill, {
    fields: [relationship.source_skill_id],
    references: [skill.id],
    relationName: "source_skill",
  }),
  target_skill: one(skill, {
    fields: [relationship.target_skill_id],
    references: [skill.id],
    relationName: "target_skill",
  }),
}));

export const user_skillRelations = relations(user_skill, ({ one, many }) => ({
  skill: one(skill, {
    fields: [user_skill.skill_id],
    references: [skill.id],
  }),
  proficiency_levels: many(proficiency_level),
}));

export const proficiency_levelRelations = relations(
  proficiency_level,
  ({ one }) => ({
    user_skill: one(user_skill, {
      fields: [proficiency_level.user_skill_id],
      references: [user_skill.id],
    }),
  }),
);

export type Skill = typeof skill.$inferSelect;
export type SkillInsert = typeof skill.$inferInsert;

export type UserSkill = typeof user_skill.$inferSelect;
export type UserSkillInsert = typeof user_skill.$inferInsert;

export type ProficiencyLevel = typeof proficiency_level.$inferSelect;
export type ProficiencyLevelInsert = typeof proficiency_level.$inferInsert;

export type Relationship = typeof relationship.$inferSelect;
export type RelationshipInsert = typeof relationship.$inferInsert;
