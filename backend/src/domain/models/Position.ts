import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Position {
    id?: number;
    companyId: number;
    interviewFlowId: number;
    title: string;
    description: string;
    status: string;
    isVisible: boolean;
    location: string;
    jobDescription: string;
    requirements?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
    benefits?: string;
    companyDescription?: string;
    applicationDeadline?: Date;
    contactInfo?: string;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status ?? 'Draft';
        this.isVisible = data.isVisible ?? false;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;
        this.contactInfo = data.contactInfo;
    }

    async save() {
        const positionData: any = {
            companyId: this.companyId,
            interviewFlowId: this.interviewFlowId,
            title: this.title,
            description: this.description,
            status: this.status,
            isVisible: this.isVisible,
            location: this.location,
            jobDescription: this.jobDescription,
            requirements: this.requirements,
            responsibilities: this.responsibilities,
            salaryMin: this.salaryMin,
            salaryMax: this.salaryMax,
            employmentType: this.employmentType,
            benefits: this.benefits,
            companyDescription: this.companyDescription,
            applicationDeadline: this.applicationDeadline,
            contactInfo: this.contactInfo,
        };

        if (this.id) {
            return await prisma.position.update({
                where: { id: this.id },
                data: positionData,
            });
        } else {
            return await prisma.position.create({
                data: positionData,
            });
        }
    }

    static async findOne(id: number): Promise<Position | null> {
        const data = await prisma.position.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Position(data);
    }

    /**
     * La posición con sus candidaturas, la fase en la que está cada una y las
     * notas de sus entrevistas.
     *
     * Un único `select` anidado: traerse las candidaturas y luego pedir las
     * entrevistas de cada una sería un bucle con `await` dentro y N+1 consultas.
     *
     * Ordenado por id de candidatura para que dos llamadas seguidas devuelvan
     * lo mismo; sin `orderBy` explícito Postgres no garantiza ningún orden.
     *
     * Devuelve `null` si la posición no existe, que no es lo mismo que una
     * posición sin candidaturas: esa devuelve `applications: []`.
     */
    static async findWithApplications(id: number): Promise<PositionWithApplications | null> {
        return await prisma.position.findUnique({
            where: { id: id },
            select: {
                id: true,
                applications: {
                    orderBy: { id: 'asc' },
                    select: {
                        id: true,
                        candidateId: true,
                        candidate: { select: { firstName: true, lastName: true } },
                        interviewStep: { select: { name: true } },
                        interviews: { select: { score: true } },
                    },
                },
            },
        });
    }
}

export interface ApplicationWithInterviews {
    id: number;
    candidateId: number;
    candidate: { firstName: string; lastName: string };
    interviewStep: { name: string };
    interviews: { score: number | null }[];
}

export interface PositionWithApplications {
    id: number;
    applications: ApplicationWithInterviews[];
}

