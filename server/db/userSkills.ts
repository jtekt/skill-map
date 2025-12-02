import { eq } from "drizzle-orm";
import { db } from ".";
import {
  user_skill,
  proficiency_level,
} from "./schema";

export const getUserSkills = async (params: any, query: any) => {
  const { id } = params;
  const { page = 1, take = 10, notUser } = query;

  const limit = Number(take);
  const offset = (Number(page) - 1) * limit;

  const whereFn = (us: typeof user_skill, { and, eq, not }: any) => {
    const conds: any[] = [eq(us.skill_id, Number(id))];

    if (notUser) {
      conds.push(not(eq(us.user_id, notUser)));
    }

    return and(...conds);
  };

  const queryOpts: any = {
    where: whereFn,
    limit,
    offset,
    with: {
      proficiency_levels: {
        orderBy: (pl, { desc }) => [desc(pl.createdAt)],
        limit: 1,
      },
    },
  }
  const userSkills = await db.query.user_skill.findMany(queryOpts);

  // count (no pagination)
  const queryCount: any = {
    where: whereFn,
  }
  const allMatching = await db.query.user_skill.findMany(queryCount);

  const count = allMatching.length;

  return { items: userSkills, count };
};

export const skillAddedFlag = async (params: any) => {
  const { user_id, id } = params;

  const row = await db.query.user_skill.findFirst({
    where: (us, { and, eq }) =>
      and(eq(us.user_id, user_id), eq(us.skill_id, Number(id))),
    with: {
      proficiency_levels: {
        orderBy: (pl, { desc }) => [desc(pl.createdAt)],
      },
    },
  });

  if (!row) {
    return { skill_added: null };
  }

  const skill_added = {
    ...row,
    _count: {
      proficiency_levels: row.proficiency_levels.length,
    },
  };

  return { skill_added };
};

export const updateUserSkill = async (params: any, data: any) => {
  const { id } = params;

  const [record] = await db
    .update(user_skill)
    .set(data)
    .where(eq(user_skill.id, Number(id)))
    .returning();

  return { ...record };
};

export const addSkillToUser = async (data: any) => {
  const { user_id, skill_id } = data;

  await db
    .insert(user_skill)
    .values({ user_id, skill_id })
    .onConflictDoUpdate({
      target: [user_skill.user_id, user_skill.skill_id],
      set: data,
    });

  const relationshipRecord = await db.query.user_skill.findFirst({
    where: (us, { and, eq }) =>
      and(eq(us.user_id, user_id), eq(us.skill_id, skill_id)),
    with: {
      proficiency_levels: {
        orderBy: (pl, { desc }) => [desc(pl.createdAt)],
      },
    },
  });

  if (!relationshipRecord) {
    return null;
  }

  const result = {
    ...relationshipRecord,
    _count: {
      proficiency_levels: relationshipRecord.proficiency_levels.length,
    },
  };

  return { ...result };
};

export const addBulkProficencyToUserSkill = async (data: any) => {
  const { user_id, skill_id } = data;

  const createManyData =
    data.proficiency_levels?.createMany?.data ?? [];
  const [usRow] = await db
    .insert(user_skill)
    .values({ user_id, skill_id })
    .onConflictDoUpdate({
      target: [user_skill.user_id, user_skill.skill_id],
      set: { user_id, skill_id },
    })
    .returning();

  if (createManyData.length > 0) {
    const rowsToInsert = createManyData.map((pl: any) => ({
      user_skill_id: usRow.id,
      createdAt: pl.createdAt ? new Date(pl.createdAt) : undefined,
      level: pl.level ?? 0,
    }));

    await db.insert(proficiency_level).values(rowsToInsert);
  }

  const relationshipRecord = await db.query.user_skill.findFirst({
    where: (us, { eq }) => eq(us.id, usRow.id),
    with: {
      proficiency_levels: true,
    },
  });

  return { ...(relationshipRecord ?? {}) };
};

export const removeSkillFromUser = async (params: any) => {
  const { id } = params;

  await db
    .delete(user_skill)
    .where(eq(user_skill.id, Number(id)));

  return null;
};