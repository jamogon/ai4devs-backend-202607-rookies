import { NotFoundError } from '../errors/AppError';
import { Position } from '../../domain/models/Position';
import { calculateAverageScore, getCandidatesForPosition } from './positionService';

// El modelo es la única capa que habla con Prisma, así que es la costura
// natural para probar el servicio sin levantar una base de datos.
jest.mock('../../domain/models/Position');

const findWithApplications = Position.findWithApplications as jest.MockedFunction<
    typeof Position.findWithApplications
>;

// Los casos de esta tabla son exactamente los que siembra
// `prisma/seed-edge-cases.ts`. Si cambia uno, tiene que cambiar el otro.
describe('calculateAverageScore', () => {
    it('devuelve null cuando no hay ninguna entrevista', () => {
        expect(calculateAverageScore([])).toBeNull();
    });

    it('devuelve null cuando ninguna entrevista está puntuada', () => {
        expect(calculateAverageScore([null, null])).toBeNull();
    });

    it('con una sola entrevista devuelve esa nota', () => {
        expect(calculateAverageScore([4])).toBe(4);
    });

    it('promedia varias notas', () => {
        expect(calculateAverageScore([4, 5])).toBe(4.5);
    });

    it('redondea a un decimal cuando la media es periódica', () => {
        expect(calculateAverageScore([4, 5, 5])).toBe(4.7);
    });

    // El fallo que este test caza: promediar sobre `scores.length` en vez de
    // sobre las puntuadas. Ahí [5, null] daría 2.5 en lugar de 5.
    it('descarta las entrevistas sin puntuar en vez de contarlas como 0', () => {
        expect(calculateAverageScore([5, null])).toBe(5);
    });
});

describe('getCandidatesForPosition', () => {
    beforeEach(() => {
        findWithApplications.mockReset();
    });

    it('falla con un error de 404 si no existe la posición', async () => {
        findWithApplications.mockResolvedValue(null);

        await expect(getCandidatesForPosition(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    // La distinción que pide el ticket: la oferta existe, simplemente no ha
    // aplicado nadie todavía. Eso es un 200 con lista vacía, no un 404.
    it('devuelve lista vacía si la posición existe pero no ha aplicado nadie', async () => {
        findWithApplications.mockResolvedValue({ id: 7, applications: [] });

        await expect(getCandidatesForPosition(7)).resolves.toEqual([]);
    });

    it('mapea cada candidatura a la forma que declara el contrato', async () => {
        findWithApplications.mockResolvedValue({
            id: 7,
            applications: [
                {
                    id: 12,
                    candidateId: 3,
                    candidate: { firstName: 'Jane', lastName: 'Smith' },
                    interviewStep: { name: 'Initial Screening' },
                    interviews: [{ score: 4 }, { score: 5 }, { score: 5 }],
                },
            ],
        });

        await expect(getCandidatesForPosition(7)).resolves.toEqual([
            {
                applicationId: 12,
                candidateId: 3,
                fullName: 'Jane Smith',
                currentInterviewStep: 'Initial Screening',
                averageScore: 4.7,
            },
        ]);
    });

    it('da averageScore null al candidato que aún no tiene entrevistas', async () => {
        findWithApplications.mockResolvedValue({
            id: 7,
            applications: [
                {
                    id: 13,
                    candidateId: 4,
                    candidate: { firstName: 'John', lastName: 'Doe' },
                    interviewStep: { name: 'Technical Interview' },
                    interviews: [],
                },
            ],
        });

        const [candidate] = await getCandidatesForPosition(7);

        expect(candidate.averageScore).toBeNull();
    });

    it('conserva el orden por id de candidatura que impone el modelo', async () => {
        const application = (id: number, firstName: string) => ({
            id,
            candidateId: id,
            candidate: { firstName, lastName: 'Doe' },
            interviewStep: { name: 'Initial Screening' },
            interviews: [],
        });
        findWithApplications.mockResolvedValue({
            id: 7,
            applications: [application(11, 'Ana'), application(12, 'Bruno')],
        });

        const candidates = await getCandidatesForPosition(7);

        expect(candidates.map(({ applicationId }) => applicationId)).toEqual([11, 12]);
    });
});
