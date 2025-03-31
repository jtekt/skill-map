export const parseStrToArray = (str: string) => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [str];
  }
};
