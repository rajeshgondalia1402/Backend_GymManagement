export class BaseException extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
