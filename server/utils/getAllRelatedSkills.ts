import { LRUCache } from "lru-cache";
import { db } from "../db";

const getTTLUntilEOD = () => {
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const endOfDayJST = new Date(jstNow);
  endOfDayJST.setHours(23, 59, 59, 999);

  return endOfDayJST.getTime() - jstNow.getTime();
};

const cache = new LRUCache<number, Set<number>>({
  max: 200,
  ttlAutopurge: true,
});

const inFlight = new Map<number, Promise<Set<number>>>();

export const getAllRelatedSkills = async (
  skillId: number,
): Promise<Set<number>> => {
  // ----- 1. Cache hit -----
  const cached = cache.get(skillId);
  if (cached) {
    return new Set(cached);
  }

  // ----- 2. Deduplicate concurrent requests -----
  if (inFlight.has(skillId)) {
    const result = await inFlight.get(skillId)!;
    return new Set(result);
  }

  // ----- 3. Compute -----
  const promise = (async () => {
    const collected = new Set<number>();
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
        const childSet = await getAllRelatedSkills(childId);
        childSet.forEach((id) => collected.add(id));
      }
    }

    const result = new Set(collected);

    cache.set(skillId, result, {
      ttl: getTTLUntilEOD(),
    });

    return result;
  })();

  inFlight.set(skillId, promise);

  try {
    const result = await promise;
    return new Set(result);
  } finally {
    inFlight.delete(skillId);
  }
};
