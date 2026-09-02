/**
 * Fixtures de los casos límite de `GET /positions/:id/candidates`.
 *
 * El seed principal (`prisma/seed.ts`) no basta para verificar este endpoint:
 * allí ningún candidato tiene más de una entrevista, así que una media bien
 * calculada y una mal calculada devuelven el mismo número.
 *
 * Crea dos posiciones de fixture:
 *   1. Una con una aplicación por cada caso de `averageScore` del contrato.
 *   2. Una sin ninguna aplicación, para el `200 []`.
 *
 * Es idempotente: borra sus propias posiciones antes de recrearlas, así que se
 * puede lanzar tantas veces como haga falta.
 *
 *   npm run seed:fixtures
 *
 * Requiere que el seed principal se haya ejecutado antes: reutiliza su empresa,
 * su flujo de entrevistas, su primera fase, un empleado y sus candidatos.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSITION_WITH_CASES = '[fixture] Casos de averageScore';
const POSITION_WITHOUT_APPLICATIONS = '[fixture] Posición sin aplicaciones';
const FIXTURE_TITLES = [POSITION_WITH_CASES, POSITION_WITHOUT_APPLICATIONS];

interface AverageScoreCase {
    label: string;
    scores: (number | null)[];
    expected: number | null;
}

const CASES: AverageScoreCase[] = [
    { label: 'sin entrevistas', scores: [], expected: null },
    { label: 'entrevistas sin puntuar', scores: [null, null], expected: null },
    { label: 'una sola nota', scores: [4], expected: 4 },
    { label: 'media exacta', scores: [4, 5], expected: 4.5 },
    { label: 'media periódica, redondea a un decimal', scores: [4, 5, 5], expected: 4.7 },
    { label: 'mezcla de puntuada y sin puntuar', scores: [5, null], expected: 5 },
];

/**
 * Borra los fixtures anteriores. En una sola transacción y en orden de claves
 * ajenas: primero las entrevistas, luego las aplicaciones, luego las posiciones.
 */
const removeFixtures = async (): Promise<void> => {
    const positions = await prisma.position.findMany({
        where: { title: { in: FIXTURE_TITLES } },
        select: {
            id: true,
            applications: { select: { id: true } },
        },
    });

    if (positions.length === 0) {
        return;
    }

    const positionIds: number[] = [];
    const applicationIds: number[] = [];
    positions.forEach(position => {
        positionIds.push(position.id);
        position.applications.forEach(application => applicationIds.push(application.id));
    });

    await prisma.$transaction([
        prisma.interview.deleteMany({ where: { applicationId: { in: applicationIds } } }),
        prisma.application.deleteMany({ where: { positionId: { in: positionIds } } }),
        prisma.position.deleteMany({ where: { id: { in: positionIds } } }),
    ]);

    console.log(`Fixtures anteriores borrados (${positionIds.length} posiciones).`);
};

const main = async (): Promise<void> => {
    const company = await prisma.company.findFirst({ select: { id: true } });
    const interviewFlow = await prisma.interviewFlow.findFirst({ select: { id: true } });
    const interviewStep = await prisma.interviewStep.findFirst({
        orderBy: { orderIndex: 'asc' },
        select: { id: true, name: true, orderIndex: true },
    });
    const employee = await prisma.employee.findFirst({ select: { id: true } });
    const candidates = await prisma.candidate.findMany({
        orderBy: { id: 'asc' },
        select: { id: true },
    });

    if (!company || !interviewFlow || !interviewStep || !employee || candidates.length === 0) {
        console.error('Faltan datos base. Lanza primero el seed principal:\n  npm run seed');
        process.exit(1);
    }

    await removeFixtures();

    const basePosition = {
        companyId: company.id,
        interviewFlowId: interviewFlow.id,
        description: 'Fixture de GET /positions/:id/candidates',
        status: 'Open',
        isVisible: false,
        location: 'Remote',
        jobDescription: 'Fixture',
    };

    // Posición + aplicaciones + entrevistas en una sola llamada anidada: es
    // atómica y no hay ningún bucle con await dentro.
    const withCases = await prisma.position.create({
        data: {
            ...basePosition,
            title: POSITION_WITH_CASES,
            applications: {
                create: CASES.map((averageScoreCase, index) => ({
                    candidateId: candidates[index % candidates.length].id,
                    applicationDate: new Date(),
                    currentInterviewStep: interviewStep.id,
                    interviews: {
                        create: averageScoreCase.scores.map(score => ({
                            interviewStepId: interviewStep.id,
                            employeeId: employee.id,
                            interviewDate: new Date(),
                            score,
                        })),
                    },
                })),
            },
        },
        select: {
            id: true,
            applications: { select: { id: true }, orderBy: { id: 'asc' } },
        },
    });

    const withoutApplications = await prisma.position.create({
        data: { ...basePosition, title: POSITION_WITHOUT_APPLICATIONS },
        select: { id: true },
    });

    console.log(`\nGET /positions/${withCases.id}/candidates`);
    console.log(
        `  fase de todas las aplicaciones: "${interviewStep.name}" (orderIndex ${interviewStep.orderIndex})\n`,
    );
    CASES.forEach((averageScoreCase, index) => {
        const applicationId = withCases.applications[index].id;
        const notas =
            averageScoreCase.scores.length > 0
                ? averageScoreCase.scores
                      .map(score => (score === null ? 'null' : String(score)))
                      .join(', ')
                : '—';
        console.log(
            `  applicationId ${String(applicationId).padEnd(4)} notas [${notas.padEnd(14)}] ` +
                `→ averageScore esperado: ${averageScoreCase.expected}   (${averageScoreCase.label})`,
        );
    });

    console.log(`\nGET /positions/${withoutApplications.id}/candidates  → esperado: []\n`);
};

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
