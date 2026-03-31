import { addNewLevel } from "~~/server/db/proficiency_level";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await addNewLevel(body);
});
