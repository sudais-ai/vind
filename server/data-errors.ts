export const DATA_ERROR_TYPES = [
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "CONFLICT",
  "DATABASE_ERROR",
  "INTEGRATION_ERROR",
] as const;

export type DataErrorType = (typeof DATA_ERROR_TYPES)[number];

export class DataLayerError extends Error {
  constructor(
    public readonly type: DataErrorType,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "DataLayerError";
  }
}
