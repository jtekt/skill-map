import { getLevels } from "~/db/proficiency_level";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const query = getQuery(event);

  return await getLevels(params, query);
});
