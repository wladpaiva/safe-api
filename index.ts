type LooseAutocomplete<T extends string> = T | Omit<string, T>;

const fetchWithQueryData = async (
  url: string,
  input: Record<string, string> = {},
  opts?: RequestInit
) => {
  return fetch(`${url}?${new URLSearchParams(input).toString()}`, opts);
};

const fetchWithJsonData = async (
  url: string,
  input: Record<string, string> = {},
  opts?: RequestInit
) => {
  return fetch(url, {
    body: JSON.stringify(input),
    ...opts,
  });
};

export interface HTTPResponseError<T extends number, Data> {
  status: T;
  data: Data;
}

// Client errors
export interface BadRequest<Data = any> extends HTTPResponseError<400, Data> {}
export interface Unauthorized<Data = any>
  extends HTTPResponseError<401, Data> {}
export interface Forbidden<Data = any> extends HTTPResponseError<403, Data> {}
export interface NotFound<Data = any> extends HTTPResponseError<404, Data> {}
export interface MethodNotAllowed<Data = any>
  extends HTTPResponseError<405, Data> {}

// Server errors
export interface InternalServerError<Data = any>
  extends HTTPResponseError<500, Data> {}
export interface BadGateway<Data = any> extends HTTPResponseError<502, Data> {}
export interface ServiceUnavailable<Data = any>
  extends HTTPResponseError<503, Data> {}

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult<T> {
  success: false;
  error: T;
}

type Result<T, Error> = Promise<SuccessResult<T> | ErrorResult<Error>>;

export type CreateAPIMethod = <
  TInput extends Record<string, string> | undefined = undefined,
  TOutput extends Record<string, string> | void = void,
  TError extends HTTPResponseError<number, any> = HTTPResponseError<number, any>
>(
  endpoint: {
    url: string;
    method: LooseAutocomplete<"GET" | "POST">;
  } & Omit<RequestInit, "body">
) => TInput extends undefined
  ? () => Result<TOutput, TError>
  : (input?: TInput) => Result<TOutput, TError>;

/**
 * Creates an API method that makes an HTTP request.
 *
 * @param url - The URL to make the request to.
 * @param method - The HTTP method to use for the request.
 * @param opts - Additional options for the request.
 * @returns A function that can be used to make the API request.
 */
export const createAPIMethod: CreateAPIMethod =
  ({ url, method, ...opts }) =>
  // @ts-ignore - I don't know how to fix this
  async (input = {}) => {
    const fetch = method === "GET" ? fetchWithQueryData : fetchWithJsonData;

    const result = await fetch(url, input, {
      method: method,
      ...opts,
      // Maybe we want to add some headers here
      // headers: {
      //   "Content-Type": "application/json",
      //   ...opts?.headers,
      // },
    });

    if (!result.ok) {
      return {
        success: false as const,
        error: {
          status: result.status,
          data: await result.json(),
        },
      };
    }

    return {
      success: true as const,
      data: await result.json(),
    };
  };
