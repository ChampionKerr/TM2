export const createRequest = (options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
}) => {
  const { method = 'GET', url = '', headers = {}, body = null } = options;

  const reqUrl = new URL(url, 'http://localhost:3000');
  const searchParams = new URLSearchParams(reqUrl.search);

  const req = {
    method,
    nextUrl: {
      ...reqUrl,
      searchParams,
      clone: () => ({ ...reqUrl, searchParams: new URLSearchParams(searchParams) }),
      pathname: reqUrl.pathname,
    },
    url,
    headers: new Headers(headers),
    json: async () => body,
  } as any;

  const json = async () => {
    return Promise.resolve(body);
  };

  req.json = json;
  return req;
};
