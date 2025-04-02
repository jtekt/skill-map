import { deleteRelationship } from "~/server/db/relationships";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  return await deleteRelationship(params);
});
