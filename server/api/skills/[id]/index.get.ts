import { readSkill } from "~/server/db/skills";

export default defineEventHandler(async (event) => {
  let params: any = getRouterParams(event);

  return await readSkill(params);
});
