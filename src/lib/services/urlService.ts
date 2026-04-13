/**
 * Sets a query parameter in the URL without reloading the page.
 * Pass an empty string to remove the parameter.
 */
export const setQueryParam = (key: string, value: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }

  window.history.replaceState(null, "", url);
};

/**
 * Extracts all query parameters from the current URL as a key/value object.
 */
export const getQueryParams = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const queryObject: Record<string, string> = {};

  params.forEach((value, key) => {
    queryObject[key] = value;
  });

  return queryObject;
};
