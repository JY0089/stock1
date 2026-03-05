export class ApplicationError extends Error {
    constructor(message: string, public readonly statusCode: number = 400) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class LimitExceededError extends ApplicationError {
    constructor(message: string = 'Daily post limit exceeded.') {
        super(message, 429);
    }
}

export class UnauthorizedError extends ApplicationError {
    constructor(message: string = 'Unauthorized access.') {
        super(message, 403);
    }
}

export class NotFoundError extends ApplicationError {
    constructor(message: string = 'Resource not found.') {
        super(message, 404);
    }
}
