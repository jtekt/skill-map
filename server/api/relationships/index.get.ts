import { readRelationships } from "~~/server/db/relationships";

export default defineEventHandler(async (event) => {
  return await readRelationships();
});
