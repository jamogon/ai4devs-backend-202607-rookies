/**
 * Error base de la aplicación: lleva el status code con el que debe responderse.
 *
 * Ojo con el `Object.setPrototypeOf`: `tsconfig.json` compila a `es5`, y al
 * extender `Error` en ese target la cadena de prototipos se pierde, así que
 * `instanceof` devolvería `false`. Cada subclase tiene que restaurar el suyo.
 */
export class AppError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/** La petición viene mal formada: el cliente tiene que corregirla y reintentar. */
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
