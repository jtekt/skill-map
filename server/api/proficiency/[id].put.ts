import { updateLevel } from "~~/server/db/proficiency_level";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);
  return await updateLevel(params, body);
});
