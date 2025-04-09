import { removeSkillFromUser } from "~/server/db/userSkills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  return await removeSkillFromUser(params);
});
