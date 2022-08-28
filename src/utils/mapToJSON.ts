export const mapToJSON = (map: Map<any, any>): string => {
  const jsObj = Array.from(map).reduce((obj: {[key:string]:any}, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
  return JSON.stringify(jsObj);
};
