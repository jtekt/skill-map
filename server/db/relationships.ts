import { db } from "./index";
import { relationship, skill } from "./schema";
import { eq, sql } from "drizzle-orm";

export const createRelationship = async (data: any) => {
  const { source_skill_id, target_skill_id } = data;

  const relData = {
    source_skill_id: Number(source_skill_id),
    target_skill_id: Number(target_skill_id),
  };

  const [relationshipRecord] = await db
    .insert(relationship)
    .values(relData)
    .onConflictDoUpdate({
      target: [relationship.source_skill_id, relationship.target_skill_id],
      set: relData,
    })
    .returning();

  if (!relationshipRecord) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save relationship between skills ${source_skill_id} and ${target_skill_id}`,
    });
  }
  return { items: relationshipRecord };
};

export const readRelationships = async () => {
  const items = await db.select().from(relationship);
  return { items };
};

export const readRelationship = async (params: any) => {
  const { id } = params;

  const [item] = await db
    .select()
    .from(relationship)
    .where(eq(relationship.id, Number(id)))
    .limit(1);

  return item ?? null;
};

export const deleteRelationship = async (params: any) => {
  const { id } = params;

  const [result] = await db
    .delete(relationship)
    .where(eq(relationship.id, Number(id)))
    .returning();

  return { result };
};

export const readSkillRelationShip = async (query: any) => {
  const { page = 1, take = 10, source_skill_id, target_skill_id } = query;

  const pageNum = Number(page) || 1;
  const takeNum = Number(take) || 10;
  const skip = (pageNum - 1) * takeNum;

  let whereExpr: any = undefined;
  let mode: "none" | "fromSourceSkill" | "fromTargetSkill" = "none";

  if (source_skill_id) {
    whereExpr = eq(relationship.source_skill_id, Number(source_skill_id));
    mode = "fromSourceSkill";
  }

  if (target_skill_id) {
    // note: this overwrites previous where if both are passed
    whereExpr = eq(relationship.target_skill_id, Number(target_skill_id));
    mode = "fromTargetSkill";
  }

  const relRows = await db
    .select()
    .from(relationship)
    .where(whereExpr)
    .limit(takeNum)
    .offset(skip);

  let items: any[] = [];

  if (mode === "fromSourceSkill") {
    items = await Promise.all(
      relRows.map(async (rel) => {
        const [targetSkillRow] = await db
          .select()
          .from(skill)
          .where(eq(skill.id, rel.target_skill_id))
          .limit(1);

        return {
          ...rel,
          target_skill: targetSkillRow ?? null,
        };
      }),
    );
  } else if (mode === "fromTargetSkill") {
    items = await Promise.all(
      relRows.map(async (rel) => {
        const [sourceSkillRow] = await db
          .select()
          .from(skill)
          .where(eq(skill.id, rel.source_skill_id))
          .limit(1);

        return {
          ...rel,
          source_skill: sourceSkillRow ?? null,
        };
      }),
    );
  } else {
    items = relRows;
  }

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(relationship)
    .where(whereExpr);

  const count = result[0]?.count ?? 0;

  return {
    items,
    count: Number(count ?? 0),
  };
};
