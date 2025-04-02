import prisma from ".";

export const getUserSkills = async (params: any, query: any) => {
  const { id } = params;
  const { page, take, notUser } = query;
  let skip = (Number(page) - 1) * Number(take);
  let where: any = {};
  if (notUser) {
    where = { user_id: { not: notUser } };
  }
  const userSkills = await prisma.user_skill.findMany({
    where: { skill_id: Number(id), ...where },
    skip: Number(skip),
    take: Number(take),
    include: {
      proficiency_levels: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
  const count = await prisma.user_skill.count({
    where: { skill_id: Number(id), ...where },
  });
  return { items: userSkills, count };
};

export const skillAddedFlag = async (params: any) => {
  const { user_id, id } = params;
  const relationshipRecord = await prisma.user_skill.findFirst({
    where: { user_id, skill_id: Number(id) },
    include: {
      proficiency_levels: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          proficiency_levels: true,
        },
      },
    },
  });
  return { skill_added: relationshipRecord };
};

export const updateUserSkill = async (params: any, data: any) => {
  const { id } = params;
  const relationshipRecord = await prisma.user_skill.update({
    where: { id: Number(id) },
    data: data,
  });

  return { ...relationshipRecord };
};

export const addSkillToUser = async (data: any) => {
  const relationshipRecord = await prisma.user_skill.upsert({
    where: { skill_user: data },
    update: data,
    create: data,
    include: {
      proficiency_levels: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          proficiency_levels: true,
        },
      },
    },
  });

  return { ...relationshipRecord };
};

/** Bulk proficiency and user_skill insert 
 * 
 * 
 * Sample data:
  {
    "user_id": "141554",
    "skill_id": 1225,
    "proficiency_levels": {
      "createMany": {
        "data": [
          { "createdAt": "2021-04-12T12:19:57.609Z", "level": 75 },
          { "createdAt": "2021-04-15T03:31:44.261Z", "level": 55 },
          { "createdAt": "2021-04-15T03:32:08.354Z", "level": 75 }
        ],
        "skipDuplicates": true
      }
    }
  },
*/
export const addBulkProficencyToUserSkill = async (data: any) => {
  const relationshipRecord = await prisma.user_skill.upsert({
    where: { skill_user: { user_id: data.user_id, skill_id: data.skill_id } },
    update: data,
    create: data,
    include: {
      proficiency_levels: true,
    },
  });

  return { ...relationshipRecord };
};

export const removeSkillFromUser = async (params: any) => {
  const { id } = params;

  await prisma.user_skill.delete({ where: { id: Number(id) } });
  return null;
};
