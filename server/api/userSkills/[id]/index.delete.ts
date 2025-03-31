import { removeSkillFromUser } from "~/db/userSkills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  return await removeSkillFromUser(params);
});
