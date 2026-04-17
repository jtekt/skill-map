import { sql, eq, and, inArray } from "drizzle-orm";
import { db } from ".";
import { skill, user_skill } from "./schema";
import { getAllRelatedSkills } from "../utils/getAllRelatedSkills";

/**
 * Reset sequence for a given table (Postgres)
 * Same behavior as your Prisma version.
 */
export const resetSequence = async (tableName: string, idField: string) => {
  try {
    await db.execute(
      sql.raw(`
        SELECT setval(
          pg_get_serial_sequence('${tableName}', '${idField}'),
          (SELECT MAX(${idField}) FROM ${tableName})
        );
      `),
    );
    console.log(`Sequence for ${tableName} reset successfully.`);
  } catch (error) {
    console.log(error);
  }
};

export const createSkill = async (data: any) => {
  const [record] = await db.insert(skill).values(data).returning();

  if (!record) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save skill with name "${data.name}"`,
    });
  }
  return record;
};

export const readSkillCategories = async () => {
  const items = await db.query.skill.findMany({
    where: (s, { isNull }) => isNull(s.image),
  });
  return { items };
};

export const readSkills = async (params: any, query?: any) => {
  const { user_id } = params;
  const {
    page = 1,
    take = -1,
    skills: skillsStr,
    fields,
    recommended,
    importance,
  } = query || {};

  let limit: number | undefined;
  let offset: number | undefined;
  if (take > -1) {
    limit = Number(take);
    offset = (Number(page) - 1) * Number(take);
  }

  let skillIdsForUser: number[] | undefined = undefined;
  if (user_id) {
    const rows = await db
      .select({ skill_id: user_skill.skill_id })
      .from(user_skill)
      .where(eq(user_skill.user_id, user_id));

    const set = new Set<number>();
    for (const row of rows) {
      if (row.skill_id != null) set.add(row.skill_id);
    }
    skillIdsForUser = Array.from(set);

    // If user has no skills at all, Prisma's `some` would return empty set
    if (skillIdsForUser.length === 0) {
      return { items: [], count: 0 };
    }
  }

  const whereFn = (s: typeof skill, op: any) => {
    const {
      and: andOp,
      or: orOp,
      ilike: ilikeOp,
      gte: gteOp,
      eq: eqOp,
      isNotNull: isNotNullOp,
      inArray: inArrayOp,
    } = op;
    const conds: any[] = [];

    // skills name search
    if (skillsStr) {
      const searchTerms = parseStrToArray(skillsStr);
      if (searchTerms.length > 0) {
        const ors = searchTerms.map(
          (term: string) =>
            term.length > 1
              ? ilikeOp(s.name, `${term}%`) // startsWith (case-insensitive)
              : ilikeOp(s.name, term), // equals (case-insensitive-ish)
        );
        conds.push(orOp(...ors));
      }
    }

    // importance => image NOT NULL AND importance >= value
    if (importance) {
      const val = JSON.parse(importance);
      conds.push(andOp(isNotNullOp(s.image), gteOp(s.importance, val)));
    }

    // recommended
    if (recommended !== undefined && recommended !== "-1") {
      const val = JSON.parse(recommended);
      conds.push(eqOp(s.recommended, val));
    }

    // user_id filter (Prisma: user_skill.some.user_id = user_id)
    if (skillIdsForUser && skillIdsForUser.length > 0) {
      conds.push(inArrayOp(s.id, skillIdsForUser));
    }

    return conds.length ? andOp(...conds) : undefined;
  };

  // ---------- main query ----------
  let items: any[] = [];

  if (fields) {
    const selectedFields = parseStrToArray(fields);

    const queryOpts: any = {
      where: whereFn,
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    };

    const rows = await db.query.skill.findMany(queryOpts);

    // emulate Prisma select by trimming keys
    items = rows.map((row) => {
      const obj: any = {};
      for (const f of selectedFields) {
        if (f in row) {
          obj[f] = (row as any)[f];
        }
      }
      return obj;
    });
  } else {
    // include mode (only when no fields)
    const queryOpts: any = {
      where: whereFn,
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    };

    if (user_id) {
      queryOpts.with = {
        user_skill: {
          where: (us: any, { eq }: any) => eq(us.user_id, user_id),
          with: {
            proficiency_levels: {
              orderBy: (pl: any, { desc }: any) => [desc(pl.createdAt)],
            },
          },
        },
      };
    }

    items = await db.query.skill.findMany(queryOpts);
  }

  const queryOpts: any = {
    where: whereFn,
  };
  const allMatching = await db.query.skill.findMany(queryOpts);
  const count = allMatching.length;

  return { items, count };
};

export const readSkillsForGraph = async (params: any, query?: any) => {
  const { user_id } = params;
  const { filter, recommended } = query || {};

  const whereConditions: any[] = [];

  // filter: limit to related skills
  if (filter !== undefined && filter !== "-1") {
    const relatedSkillIds = await getAllRelatedSkills(Number(filter));
    const idList = [...relatedSkillIds.values()];

    if (idList.length) {
      whereConditions.push(inArray(skill.id, idList));
    } else {
      // no related skills – force empty result
      whereConditions.push(eq(skill.id, -1));
    }
  }

  // recommended filter
  if (recommended !== undefined && recommended !== "-1") {
    const recommendedVal = JSON.parse(recommended);
    whereConditions.push(eq(skill.recommended, recommendedVal));
  }

  const whereExpr =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const withRelations: any = {
    parents: true,
    children: true,
  };

  if (user_id) {
    // load only this user's user_skill rows
    withRelations.user_skill = {
      where: (us: any, { eq }: any) => eq(us.user_id, user_id),
      with: {
        proficiency_levels: {
          orderBy: (pl: any, { desc }: any) => [desc(pl.createdAt)],
        },
      },
    };
  }

  const skillsRes = await db.query.skill.findMany({
    where: whereExpr,
    with: withRelations,
  });

  // 👉 Emulate Prisma's:
  // where: { user_skill: { some: { user_id } } }
  let filteredSkills = skillsRes;
  if (user_id) {
    filteredSkills = skillsRes.filter(
      (s: any) => s.user_skill && s.user_skill.length > 0,
    );
  }

  // Prisma: `_count.children`
  const items = filteredSkills.map((s: any) => ({
    ...s,
    _count: {
      children: s.children ? s.children.length : 0,
    },
  }));

  return { items };
};

export const readSkillsByName = async (oldSkills: any) => {
  const names = oldSkills.map(({ name }: any) => name);
  const items = await db.query.skill.findMany({
    where: (s, { inArray }) => inArray(s.name, names),
  });
  return { items };
};

export const readSkill = async (params: any) => {
  const { id, user_id } = params;

  const skillRow = await db.query.skill.findFirst({
    where: (s, { eq }) => eq(s.id, Number(id)),
    with: {
      parents: {
        with: {
          target_skill: true,
        },
        limit: 10,
      },
      children: {
        with: {
          source_skill: true,
        },
        limit: 10,
      },
      user_skill: {
        with: {
          proficiency_levels: {
            orderBy: (pl, { desc }) => [desc(pl.createdAt)],
            limit: 1,
          },
        },
        limit: 10,
      },
    },
  });

  if (!skillRow) return null;

  let filteredUserSkill = skillRow.user_skill;
  if (user_id) {
    filteredUserSkill = skillRow.user_skill.filter(
      (us: any) => us.user_id !== user_id,
    );
  }

  const result = {
    ...skillRow,
    user_skill: filteredUserSkill,
    _count: {
      parents: skillRow.parents.length,
      children: skillRow.children.length,
      user_skill: filteredUserSkill.length,
    },
  };

  return result;
};

export const updateSkill = async (params: any, data: any) => {
  const { id } = params;
  const { name, image, importance = 30, recommended = true } = data || {};

  const [record] = await db
    .update(skill)
    .set({ name, image, importance, recommended })
    .where(eq(skill.id, Number(id)))
    .returning();

  return record;
};

export const deleteSkill = async (params: any) => {
  const { id } = params;
  await db.delete(skill).where(eq(skill.id, Number(id)));
  return { id };
};

export const compareSkillsForGraph = async (params: any, query: any) => {
  const { user_id } = params;
  const { compareTo, filter, recommended } = query || {};

  if (!user_id) {
    throw new Error("User ID is required for comparison");
  }

  const whereConditions: any[] = [];

  if (filter !== undefined && filter !== "-1") {
    const relatedSkillIds = await getAllRelatedSkills(Number(filter));
    const idList = [...relatedSkillIds.values()];
    if (idList.length) {
      whereConditions.push(inArray(skill.id, idList));
    } else {
      whereConditions.push(eq(skill.id, -1));
    }
  }

  if (recommended !== undefined && recommended === "true") {
    const recommendedVal = JSON.parse(recommended);
    whereConditions.push(eq(skill.recommended, recommendedVal));
  }

  const whereExpr =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const baseWith: any = {
    parents: true,
    children: true,
  };

  let skillsRes: any[] = [];

  if (compareTo === "all") {
    baseWith.user_skill = {
      where: (us, { eq }) => eq(us.user_id, user_id),
    };

    skillsRes = await db.query.skill.findMany({
      where: whereExpr,
      with: baseWith,
    });

    const processedSkills = skillsRes.map((s) => {
      const userHasSkill = s.user_skill && s.user_skill.length > 0;
      return {
        ...s,
        userHasSkill,
        comparisonStatus: userHasSkill ? "has-skill" : "missing-skill",
      };
    });

    return { items: processedSkills };
  }

  baseWith.user_skill = {
    where: (us, { or, eq }) =>
      or(eq(us.user_id, user_id), eq(us.user_id, compareTo)),
  };

  skillsRes = await db.query.skill.findMany({
    where: whereExpr,
    with: baseWith,
  });

  const processedSkills = skillsRes.map((s) => {
    const userSkillRow = s.user_skill.find((us: any) => us.user_id === user_id);
    const comparisonUserSkillRow = s.user_skill.find(
      (us: any) => us.user_id === compareTo,
    );

    const userHasSkill = !!userSkillRow;
    const comparisonUserHasSkill = !!comparisonUserSkillRow;

    let comparisonStatus: string;
    if (userHasSkill && !comparisonUserHasSkill) {
      comparisonStatus = "only-user-has-skill";
    } else if (!userHasSkill && comparisonUserHasSkill) {
      comparisonStatus = "only-comparison-user-has-skill";
    } else if (userHasSkill && comparisonUserHasSkill) {
      comparisonStatus = "both-have-skill";
    } else {
      comparisonStatus = "neither-has-skill";
    }

    return {
      ...s,
      userHasSkill,
      comparisonUserHasSkill,
      comparisonStatus,
    };
  });

  return { items: processedSkills };
};
