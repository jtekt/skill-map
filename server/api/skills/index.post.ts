import { createSkill } from "~/server/db/skills";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await createSkill(body);
});
