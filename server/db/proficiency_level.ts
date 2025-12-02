import { db } from './index';
import { proficiency_level, user_skill } from './schema';
import { eq, sql, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);
  return await updateLevel(params, body);
});

export const updateLevel = async (params: any, data: any) => {
  const { id } = params;

  const [level] = await db
    .update(proficiency_level)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(proficiency_level.id, Number(id)))
    .returning();

  return level ?? null;
};

export const getLevels = async (params: any, query: any) => {
  const { id } = params;
  const { page = 1, take = 10 } = query;

  const userSkillId = Number(id);

  let limit: number | undefined;
  let offset: number | undefined;

  if (take > -1) {
    limit = Number(take);
    offset = (Number(page) - 1) * Number(take);
  }


  let sqlQuery = db
    .select()
    .from(proficiency_level)
    .where(eq(proficiency_level.user_skill_id, userSkillId))
    .orderBy(desc(proficiency_level.createdAt));

  // Only apply when we actually have values
  if (typeof limit === 'number') {
    sqlQuery.limit(limit);
  }
  if (typeof offset === 'number') {
    sqlQuery.offset(offset);
  }

  const rows = await sqlQuery;

  // Attach user_skill like Prisma's `select: { ..., user_skill: true }`
  const items = await Promise.all(
    rows.map(async (row) => {
      const [us] = await db
        .select()
        .from(user_skill)
        .where(eq(user_skill.id, row.user_skill_id))
        .limit(1);

      // Match Prisma select keys
      return {
        id: row.id,
        createdAt: row.createdAt,
        level: row.level,
        user_skill: us ?? null,
      };
    }),
  );

  // Count
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(proficiency_level)
    .where(eq(proficiency_level.user_skill_id, userSkillId));

  return {
    items,
    count: Number(count ?? 0),
  };
};

export const addNewLevel = async (data: any) => {
  const [level] = await db
    .insert(proficiency_level)
    .values(data)
    .returning();

  return level;
};

export const removeLevel = async (params: any) => {
  const { id } = params;

  await db
    .delete(proficiency_level)
    .where(eq(proficiency_level.id, Number(id)));

  return { id };
};