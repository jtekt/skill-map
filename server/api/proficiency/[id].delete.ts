import { removeLevel } from "~/server/db/proficiency_level";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  return await removeLevel(params);
});
