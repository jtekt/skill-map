import { createRelationship } from "~/server/db/relationships";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);

  return await createRelationship(data);
});
