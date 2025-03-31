import { addSkillToUser } from "~/db/userSkills";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await addSkillToUser(body);
});
