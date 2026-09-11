import { Request, Response } from 'express';

import { NotFoundError } from '../../application/errors/AppError';
import { getCandidatesForPosition } from '../../application/services/positionService';
import { getCandidatesByPositionId } from './positionController';

jest.mock('../../application/services/positionService');

const getCandidates = getCandidatesForPosition as jest.MockedFunction<
    typeof getCandidatesForPosition
>;

/** Doble mínimo de `Response`: solo lo que usa el controller, y encadenable. */
const buildResponse = () => {
    const res = {
        statusCode: 200,
        body: undefined as unknown,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.body = payload;
            return this;
        },
    };
    return res as unknown as Response & { statusCode: number; body: unknown };
};

const buildRequest = (id: string) => ({ params: { id } }) as unknown as Request;

describe('getCandidatesByPositionId', () => {
    beforeEach(() => {
        getCandidates.mockReset();
    });

    it('responde 200 con lo que devuelve el servicio', async () => {
        const candidates = [
            {
                applicationId: 12,
                candidateId: 3,
                fullName: 'Jane Smith',
                currentInterviewStep: 'Initial Screening',
                averageScore: 4.7,
            },
        ];
        getCandidates.mockResolvedValue(candidates);
        const res = buildResponse();

        await getCandidatesByPositionId(buildRequest('7'), res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(candidates);
    });

    // `req.params` siempre son strings. Si el controller no convierte, el
    // servicio recibe '7' y Prisma revienta con un error de tipo en runtime.
    it('convierte el id a número antes de pasárselo al servicio', async () => {
        getCandidates.mockResolvedValue([]);

        await getCandidatesByPositionId(buildRequest('7'), buildResponse());

        expect(getCandidates).toHaveBeenCalledWith(7);
    });

    it('responde 400 si el id no es un número', async () => {
        const res = buildResponse();

        await getCandidatesByPositionId(buildRequest('abc'), res);

        expect(res.statusCode).toBe(400);
        expect(getCandidates).not.toHaveBeenCalled();
    });

    it('responde 400 si el id no es un entero positivo', async () => {
        const res = buildResponse();

        await getCandidatesByPositionId(buildRequest('0'), res);

        expect(res.statusCode).toBe(400);
        expect(getCandidates).not.toHaveBeenCalled();
    });

    it('responde con el status que lleva dentro el error de dominio', async () => {
        getCandidates.mockRejectedValue(new NotFoundError('No existe ninguna posición con id 999'));
        const res = buildResponse();

        await getCandidatesByPositionId(buildRequest('999'), res);

        expect(res.statusCode).toBe(404);
    });

    // Un fallo de conexión no es culpa del cliente y su mensaje lleva dentro
    // el host y el puerto de la base de datos. Ni 400 ni mensaje hacia fuera.
    it('responde 500 sin filtrar el mensaje de un error inesperado', async () => {
        const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
        const unexpected = new Error('connect ECONNREFUSED 127.0.0.1:5435');
        getCandidates.mockRejectedValue(unexpected);
        const res = buildResponse();

        await getCandidatesByPositionId(buildRequest('7'), res);

        expect(res.statusCode).toBe(500);
        expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
        // Fuera no sale, pero al log sí: si no, el fallo es invisible.
        expect(logged).toHaveBeenCalledWith(unexpected);

        logged.mockRestore();
    });
});
