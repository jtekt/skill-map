import { updateSkill } from "~/db/skills";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const params = getRouterParams(event);
  return await updateSkill(params, body);
});
