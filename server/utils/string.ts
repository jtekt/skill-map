export const parseStrToArray = (fields: any) => {
  if (Array.isArray(fields)) return fields;
  else {
    try {
      const parsed = JSON.parse(fields);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [fields];
    }
  }
};
