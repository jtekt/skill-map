import { readSkillCategories } from "~/server/db/skills";

export default defineEventHandler(async (event) => {
  return await readSkillCategories();
});
