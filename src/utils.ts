export function remove<T>(arr: Array<T>, e: T) {
  const index = arr.indexOf(e);

  if (index >= 0) {
    return arr.splice(index, 1);
  }

  return undefined;
}

/**
 * Helper functions for ease of async/await usage.
 *
 * @param {*} ms
 */
export const sleep = (ms?: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export type some = object | string | boolean | symbol | number;
