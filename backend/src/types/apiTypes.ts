export type APIResponseFormat<T, E = any> =
  | { message: string; data: T; error?: undefined }
  | { message: string; data?: undefined; error: E };
