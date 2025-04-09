import prisma from ".";

export const createRelationship = async (data: any) => {
  const { source_skill_id, target_skill_id } = data;

  const relationship = {
    source_skill_id,
    target_skill_id,
  };

  const relationshipRecord = await prisma.relationship.upsert({
    where: { source_target: relationship },
    update: relationship,
    create: relationship,
  });
  return { items: relationshipRecord };
};

export const readRelationships = async () => {
  const relationships = await prisma.relationship.findMany({});
  return { items: relationships };
};

export const readRelationship = async (params: any) => {
  const { id } = params;
  const item = await prisma.relationship.findUnique({
    where: { id: Number(id) },
  });
  return item;
};

export const deleteRelationship = async (params: any) => {
  const { id } = params;
  const result = await prisma.relationship.delete({
    where: { id: Number(id) },
  });
  return { result };
};

export const readSkillRelationShip = async (query: any) => {
  const { page, take, source_skill_id, target_skill_id } = query;
  let where: any = {};
  let include: any = {};

  let skip = (Number(page) - 1) * Number(take);
  if (source_skill_id) {
    where = { source_skill_id: Number(source_skill_id) };
    include = {
      target_skill: true,
    };
  }

  if (target_skill_id) {
    where = {
      target_skill_id: Number(target_skill_id),
    };
    include = {
      source_skill: true,
    };
  }

  const skills = await prisma.relationship.findMany({
    where,
    skip: Number(skip),
    take: Number(take),
    include,
  });

  const count = await prisma.relationship.count({
    where,
  });
  return { items: skills, count };
};
