import { deleteSkill } from "~/server/db/skills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  return await deleteSkill(params);
});
