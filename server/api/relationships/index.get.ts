import { readRelationships } from "~/db/relationships";

export default defineEventHandler(async (event) => {
  return await readRelationships();
});
