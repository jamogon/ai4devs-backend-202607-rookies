import { Request, Response } from 'express';

import { AppError, ValidationError } from '../../application/errors/AppError';
import { getCandidatesForPosition } from '../../application/services/positionService';

/**
 * `GET /positions/:id/candidates`
 *
 * Sin lógica de negocio: extrae el id, lo valida, llama al servicio y traduce
 * el error de dominio a un status. El cálculo de la media vive en el servicio.
 */
export const getCandidatesByPositionId = async (req: Request, res: Response) => {
    try {
        const positionId = parsePositionId(req.params.id);

        res.json(await getCandidatesForPosition(positionId));
    } catch (error: unknown) {
        // Cada AppError ya sabe con qué status debe responderse.
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        // Lo que no es un error de dominio es un fallo nuestro, y su mensaje
        // puede llevar dentro el host y el puerto de la base de datos. Al log,
        // no al cliente.
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * `req.params` siempre son strings. `Number` deja pasar decimales, negativos y
 * el 0, y ninguno de los tres puede ser un id: sin este filtro llegarían a
 * Prisma y saldrían como un 500 en vez de como el 400 que son.
 */
const parsePositionId = (raw: string): number => {
    const positionId = Number(raw);

    if (!Number.isInteger(positionId) || positionId < 1) {
        throw new ValidationError('El id de la posición debe ser un entero positivo');
    }

    return positionId;
};
