import { useHistory, useLocation } from "react-router-dom";

// function setQueryParam(
//   location: ReturnType<typeof useLocation>,
//   history: ReturnType<typeof useHistory>,
//   param: { name: string; value: string },
// ) {
//   const x = window.location.origin.toString();
// }

export function setQuery(
  location: ReturnType<typeof useLocation>,
  history: ReturnType<typeof useHistory>,
  params: any,
) {
  if ("URLSearchParams" in window) {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has(params.name)) {
      searchParams.delete(params.name);
    }
    if (Array.isArray(params.value)) {
      params.value.forEach((param: string) => {
        searchParams.append(params.name, param);
      });
    } else {
      searchParams.set(params.name, params.value);
    }
    history.push(`${location.pathname}?${searchParams.toString()}`);
  }
}
