/**
 * @en Typed HTTP errors mapped to `{ success: false, error: string }` by {@link ../middleware/errorHandler.js}.
 * @es Errores HTTP tipados mapeados a `{ success: false, error: string }`.
 * @pt-BR Erros HTTP tipados mapeados para `{ success: false, error: string }`.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationAppError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

export class NotFoundAppError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message)
  }
}

export class ConflictAppError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details)
  }
}
