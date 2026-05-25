export type ActionFailure = {
  success: false;
  error: string;
  code?: string;
};

export type ActionSuccess<T = void> = T extends void
  ? { success: true; error?: undefined }
  : { success: true; data: T; error?: undefined };

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export function fail(error: string, code?: string): ActionFailure {
  return { success: false, error, code };
}

export function ok(): ActionSuccess<void>;
export function ok<T>(data: T): ActionSuccess<T>;
export function ok<T>(data?: T) {
  if (data === undefined) {
    return { success: true };
  }

  return { success: true, data };
}
