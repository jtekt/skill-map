import prisma from ".";
const memoCache = new Map<number, Set<number>>();

const resetSequence = async (tableName: string, idField: string) => {
  try {
    await prisma.$queryRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('${tableName}', '${idField}'),
        (SELECT MAX(${idField}) FROM ${tableName})
      );`);
    console.log(`Sequence for ${tableName} reset successully.`);
  } catch (error) {
    console.log(error);
  } finally {
    prisma.$disconnect();
  }

  // NOTE: when need to reset sequence
  // resetSequence("skill", "id")
  //   .then(() => process.exit(0))
  //   .catch((error) => {
  //     console.log(error);
  //     process.exit(1);
  //   });
};

export const createSkill = async (data: any) => {
  const skill = await prisma.skill.create({ data });
  return skill;
};

export const readSkillCategories = async () => {
  const skills = await prisma.skill.findMany({
    where: {
      image: null,
    },
  });
  return { items: skills };
};

const getAllRelatedSkills = async (
  skillId: number,
  collectedSkills: Set<number> = new Set()
): Promise<Set<number>> => {
  if (memoCache.has(skillId)) {
    const cachedSkills = memoCache.get(skillId) || new Set();
    cachedSkills.forEach((skill) => collectedSkills.add(skill));
    return cachedSkills;
  }
  // Add the current skill to the collected set
  collectedSkills.add(skillId);

  // Fetch the immediate children of the current skill
  const relationships = await prisma.relationship.findMany({
    where: { target_skill_id: skillId },
    include: { source_skill: true, target_skill: true },
  });

  for (const relation of relationships) {
    const childSkillId = relation.source_skill_id;

    // Check if the skill is already collected to avoid infinite loops
    if (!collectedSkills.has(childSkillId)) {
      // Recursively collect skills
      await getAllRelatedSkills(childSkillId, collectedSkills);
    }
  }

  memoCache.set(skillId, new Set(collectedSkills));
  return collectedSkills;
};

export const readSkills = async (params: any, query?: any) => {
  const { user_id } = params;
  const { page, take, skills, fields, recommended, importance } = query;
  let pagination: any = {};
  if (take > -1) {
    let skip = (Number(page) - 1) * Number(take);
    pagination = { skip, take: Number(take) };
  }
  let where: any = {};
  let include: any = {};
  let select: any;
  let count = 0;

  if (fields) {
    let searchTerms = parseStrToArray(fields);
    select = searchTerms.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }
  if (skills) {
    const searchTerms = parseStrToArray(skills);
    where = {
      OR: searchTerms.map((term) =>
        term.length > 1
          ? {
            name: {
              startsWith: term,
              mode: "insensitive",
            },
          }
          : {
            name: {
              equals: term,
              mode: "insensitive",
            },
          }
      ),
    };
  }
  if (user_id) {
    where.user_skill = {
      some: {
        user_id: user_id,
      },
    };
    include.user_skill = {
      where: {
        user_id: user_id,
      },
      include: {
        proficiency_levels: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    };
  }

  if (importance) {
    where = { ...where, image: { not: null }, importance: { gte: JSON.parse(importance) } };
  }

  if (recommended !== undefined && recommended !== "-1") {
    where = { ...where, recommended: JSON.parse(recommended) };
  }
  // prioritize select over include
  const selectOrInclude = select ? { select } : { include };
  const result = await prisma.skill.findMany({
    where,
    ...pagination,
    ...selectOrInclude,
  });
  count = await prisma.skill.count({
    where,
  });
  return { items: result, count };
};

export const readSkillsForGraph = async (params: any, query?: any) => {
  const { user_id } = params;
  const { filter, recommended } = query;
  let where: any = {};
  const include: any = {};

  if (filter !== undefined && filter !== "-1") {
    const relatedSkillIds = await getAllRelatedSkills(Number(filter));
    where = {
      id: {
        in: [...relatedSkillIds.values()],
      },
    };
  }

  if (recommended !== undefined && recommended !== "-1") {
    where = { ...where, recommended: JSON.parse(recommended) };
  }

  if (user_id) {
    where.user_skill = {
      some: {
        user_id: user_id,
      },
    };
    include.user_skill = {
      where: {
        user_id: user_id,
      },
      include: {
        proficiency_levels: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    };
  }

  const skills = await prisma.skill.findMany({
    where,
    include: {
      parents: true,
      _count: {
        select: {
          children: true,
        },
      },
      ...include,
    },
  });
  return { items: skills };
};

/***
 * Note: Used to get skill_id by name to migrate old user proficiency level from mongodb to postgres
 */
export const readSkillsByName = async (oldSkills: any) => {
  const skills = await prisma.skill.findMany({
    where: { name: { in: [...oldSkills.map(({ name }) => name)] } },
  });
  return { items: skills };
};

export const readSkill = async (params: any) => {
  const { id, user_id } = params;
  let where: any = {};

  if (user_id) {
    where = { user_id: { not: user_id } };
  }
  const skill = await prisma.skill.findUnique({
    where: { id: Number(id) },
    include: {
      parents: {
        include: {
          target_skill: true,
        },
        take: 10,
      },
      children: {
        include: {
          source_skill: true,
        },
        take: 10,
      },
      user_skill: {
        include: {
          proficiency_levels: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        where,
        take: 10,
      },
      _count: {
        select: {
          parents: true,
          children: true,
          user_skill: {
            where,
          },
        },
      },
    },
  });
  return skill;
};

export const updateSkill = async (params: any, data: any) => {
  const { id } = params;
  const { name, image, importance = 30, recommended = true } = data;
  const record = await prisma.skill.update({
    where: { id: Number(id) },
    data: { name, image, importance, recommended },
  });
  return record;
};

export const deleteSkill = async (params: any) => {
  const { id } = params;
  await prisma.skill.delete({ where: { id: Number(id) } });
  return { id };
};

export const compareSkillsForGraph = async (params: any, query: any) => {
  const { user_id } = params;
  const { compareTo, filter, recommended } = query;

  if (!user_id) {
    throw new Error("User ID is required for comparison");
  }

  let include: any = {};
  let where: any = {};
  if (filter !== undefined && filter !== "-1") {
    const relatedSkillIds = await getAllRelatedSkills(Number(filter));
    where = {
      id: {
        in: [...relatedSkillIds.values()],
      },
    };
  }

  if (recommended !== undefined && recommended === "true") {
    where = { ...where, recommended: JSON.parse(recommended) };
  }

  // Base include object
  include = {
    parents: true,
    _count: {
      select: {
        children: true,
      },
    },
  };

  // If comparing to all skills
  if (compareTo === "all") {
    // Include user's skills
    include.user_skill = {
      where: {
        user_id,
      }
    };

    const skills = await prisma.skill.findMany({
      where,
      include,
    });

    // Process skills to add comparison data
    const processedSkills = skills.map(skill => {
      const userHasSkill = skill.user_skill && skill.user_skill.length > 0;

      return {
        ...skill,
        userHasSkill,
        comparisonStatus: userHasSkill ? 'has-skill' : 'missing-skill',
      };
    });

    return { items: processedSkills };
  }

  // If comparing to another user
  if (compareTo !== "all") {
    // Include both users' skills
    include.user_skill = {
      where: {
        OR: [
          { user_id },
          { user_id: compareTo }
        ]
      },
    };

    const skills = await prisma.skill.findMany({
      where,
      include,
    });

    // Process skills to add comparison data
    const processedSkills = skills.map(skill => {
      const userSkill = skill.user_skill.find((us: any) => us.user_id === user_id);
      const comparisonUserSkill = skill.user_skill.find((us: any) => us.user_id === compareTo);

      const userHasSkill = !!userSkill;
      const comparisonUserHasSkill = !!comparisonUserSkill;

      let comparisonStatus;
      if (userHasSkill && !comparisonUserHasSkill) {
        comparisonStatus = 'only-user-has-skill';
      } else if (!userHasSkill && comparisonUserHasSkill) {
        comparisonStatus = 'only-comparison-user-has-skill';
      } else if (userHasSkill && comparisonUserHasSkill) {
        comparisonStatus = 'both-have-skill';
      } else {
        comparisonStatus = 'neither-has-skill';
      }

      return {
        ...skill,
        userHasSkill,
        comparisonUserHasSkill,
        comparisonStatus,
      };
    });

    return { items: processedSkills };
  }
}