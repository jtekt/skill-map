import { readSkill } from "~/server/db/skills";
import { skillAddedFlag } from "~/server/db/userSkills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  let skill = await readSkill(params);
  let skill_added = await skillAddedFlag(params);
  return { ...skill, ...skill_added };
});
