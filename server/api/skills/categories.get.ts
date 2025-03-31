import { readSkillCategories } from "~/db/skills";

export default defineEventHandler(async (event) => {
  return await readSkillCategories();
});
