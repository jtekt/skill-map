import { db } from "@/server/db";
const TTL_MS = 1000 * 60 * 60 * 24;

export const getAllRelatedSkills = async (
  skillId: number,
  collected: Set<number> = new Set(),
): Promise<Set<number>> => {
  const storage = useStorage("skills");

  const cacheKey = `skill:${skillId}`;

  // ----- 1. Check cache -----
  const cached = await storage.getItem<{ ids: number[]; expires: number }>(
    cacheKey,
  );

  if (cached && cached.expires > Date.now()) {
    cached.ids.forEach((id) => collected.add(id));
    return collected;
  }

  // ----- 2. Compute recursively -----
  collected.add(skillId);

  const relations = await db.query.relationship.findMany({
    where: (r, { eq }) => eq(r.target_skill_id, skillId),
    with: {
      source_skill: true,
      target_skill: true,
    },
  });

  for (const rel of relations) {
    const childId = rel.source_skill_id;
    if (!collected.has(childId)) {
      await getAllRelatedSkills(childId, collected);
    }
  }

  // ----- 3. Save to cache -----
  const idsArray = Array.from(collected);

  await storage.setItem(cacheKey, {
    ids: idsArray,
    expires: Date.now() + TTL_MS,
  });

  return collected;
};
