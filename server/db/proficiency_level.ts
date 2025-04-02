import prisma from ".";

export const updateLevel = async (params: any, data: any) => {
  const { id } = params;
  const level = await prisma.proficiency_level.update({
    where: { id: Number(id) },
    data: data,
  });

  return level;
};

export const getLevels = async (params: any, query: any) => {
  const { id } = params;
  const { page, take } = query;
  let pagination: any = {};
  let where: any = { user_skill_id: Number(id) };
  if (take > -1) {
    let skip = (Number(page) - 1) * Number(take);
    pagination = { skip, take: Number(take) };
  }
  const levels = await prisma.proficiency_level.findMany({
    where,
    ...pagination,
    select: { createdAt: true, level: true, id: true, user_skill: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.proficiency_level.count({
    where,
  });
  return { items: levels, count };
};

export const addNewLevel = async (data: any) => {
  const level = await prisma.proficiency_level.create({ data });

  return level;
};

export const removeLevel = async (params: any) => {
  const { id } = params;

  await prisma.proficiency_level.delete({ where: { id: Number(id) } });
  return { id };
};
