/**
 * Clones an object with an optional default value to override every field's
 * value.
 *
 *
 * @param obj - Object to clone
 * @param defaultValue - Value to override every object's value
 * @returns Clone from `obj`
 */
export function clone<T extends object, U>(
  obj: T,
  defaultValue: U = undefined,
): T | Record<keyof T, U> {
  return Object.fromEntries(
    Object.keys(obj).map((field) => {
      if (typeof defaultValue !== 'undefined') {
        return [field, defaultValue];
      }

      if (Array.isArray(obj[field])) {
        return [field, [...obj[field]]];
      }

      if (
        typeof obj[field] === 'object' &&
        !Array.isArray(obj[field]) &&
        obj[field] !== null
      ) {
        return [field, { ...obj[field] }];
      }

      return [field, obj[field]];
    }),
  ) as T;
}
