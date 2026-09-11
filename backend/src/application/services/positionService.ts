import { Position } from '../../domain/models/Position';
import { NotFoundError } from '../errors/AppError';

/** Una fila de `GET /positions/:id/candidates`, tal y como la declara el contrato. */
export interface PositionCandidate {
    applicationId: number;
    candidateId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number | null;
}

/**
 * Media de las notas de las entrevistas de una candidatura.
 *
 * Devuelve `null` cuando no hay nada que promediar —ni una sola entrevista
 * puntuada—, nunca 0: un 0 se leería en el Kanban como el peor candidato
 * posible, y "todavía no lo sabemos" no es eso.
 *
 * Las entrevistas sin puntuar se descartan, no cuentan como 0.
 */
export const calculateAverageScore = (scores: (number | null)[]): number | null => {
    const scored = scores.filter((score): score is number => score !== null);

    if (scored.length === 0) {
        return null;
    }

    const average = scored.reduce((total, score) => total + score, 0) / scored.length;

    return Math.round(average * 10) / 10;
};

/**
 * Los candidatos que han aplicado a una posición, con su fase actual y su media.
 *
 * Lanza `NotFoundError` si la posición no existe. Una posición que existe pero
 * a la que no ha aplicado nadie devuelve `[]`, no un 404: la diferencia entre
 * "esta oferta no existe" y "todavía no ha aplicado nadie" le importa a quien
 * pinta el Kanban.
 */
export const getCandidatesForPosition = async (
    positionId: number,
): Promise<PositionCandidate[]> => {
    const position = await Position.findWithApplications(positionId);

    if (position === null) {
        throw new NotFoundError(`No existe ninguna posición con id ${positionId}`);
    }

    return position.applications.map(application => ({
        applicationId: application.id,
        candidateId: application.candidateId,
        fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        currentInterviewStep: application.interviewStep.name,
        averageScore: calculateAverageScore(application.interviews.map(({ score }) => score)),
    }));
};
