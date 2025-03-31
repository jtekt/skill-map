import { updateUserSkill } from "~/db/userSkills";
export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);

  return await updateUserSkill(params, body);
});
