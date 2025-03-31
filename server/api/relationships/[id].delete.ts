import { deleteRelationship } from "~/db/relationships";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  return await deleteRelationship(params);
});
