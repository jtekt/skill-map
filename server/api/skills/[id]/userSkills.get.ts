import { getUserSkills } from "~/db/userSkills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const query = getQuery(event);

  return await getUserSkills(params, query);
});
