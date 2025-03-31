import { readSkillRelationShip } from "~/db/relationships";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await readSkillRelationShip(query);
});
