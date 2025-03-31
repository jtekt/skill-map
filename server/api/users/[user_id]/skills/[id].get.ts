import { readSkill } from "~/db/skills";
import { skillAddedFlag } from "~/db/userSkills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  let skill = await readSkill(params);
  let skill_added = await skillAddedFlag(params);
  return { ...skill, ...skill_added };
});
