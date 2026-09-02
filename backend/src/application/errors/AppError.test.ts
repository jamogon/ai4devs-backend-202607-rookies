import { AppError, NotFoundError } from './AppError';

describe('AppError', () => {
    it('expone el statusCode con el que se construye', () => {
        const error = new AppError('la posición no se pudo leer', 503);

        expect(error.statusCode).toBe(503);
    });

    it('conserva el mensaje para poder devolverlo al cliente', () => {
        const error = new AppError('la posición no se pudo leer', 503);

        expect(error.message).toBe('la posición no se pudo leer');
    });

    it('se identifica por su nombre en los logs', () => {
        const error = new AppError('lo que sea', 500);

        expect(error.name).toBe('AppError');
    });

    // Este test parece trivial y no lo es. `tsconfig.json` compila a `es5`, y en
    // ese target extender `Error` rompe la cadena de prototipos. Sin el
    // `Object.setPrototypeOf` de AppError.ts estos `instanceof` devuelven
    // `false`, un controller deja de reconocer el error y TODOS los 404 se
    // convierten en 500 sin que nada avise. Si alguien borra esa línea por
    // parecer ruido, este test es lo único que lo detecta.
    it('sigue siendo reconocible con instanceof a pesar del target es5', () => {
        const error = new AppError('lo que sea', 500);

        expect(error instanceof AppError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('NotFoundError', () => {
    it('responde siempre con un 404', () => {
        const error = new NotFoundError('Position not found');

        expect(error.statusCode).toBe(404);
    });

    it('se reconoce tanto como NotFoundError como como AppError', () => {
        const error = new NotFoundError('Position not found');

        expect(error instanceof NotFoundError).toBe(true);
        expect(error instanceof AppError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('se distingue de su clase base en los logs', () => {
        const error = new NotFoundError('Position not found');

        expect(error.name).toBe('NotFoundError');
    });
});
