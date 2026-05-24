import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('[Seed] Seeding default EUDI Attributes...');
    
    // Default subject reference used in the pilot
    const subjectRef = "did:key:user";

    // Clear existing
    await prisma.eUDIAttribute.deleteMany({
        where: { subject_ref: subjectRef }
    });

    // 1. Identity Credential
    await prisma.eUDIAttribute.create({
        data: {
            subject_ref: subjectRef,
            type: 'IdentityCredential',
            issuer: 'did:web:france.identite.gouv.fr',
            format: 'jwt_vc_json',
            payload: JSON.stringify({
                given_name: 'Alice',
                family_name: 'Dupont',
                birthdate: '1990-05-14',
                nationality: 'FR'
            }),
            zkp_capable: false,
            status: 'ACTIVE'
        }
    });

    // 2. Age Proof (ZKP capable)
    await prisma.eUDIAttribute.create({
        data: {
            subject_ref: subjectRef,
            type: 'AgeProof',
            issuer: 'did:web:france.identite.gouv.fr',
            format: 'sd_jwt',
            payload: JSON.stringify({
                age_over_18: true,
                age_over_16: true
            }),
            sd_jwt: 'mocked_sd_jwt_age_proof',
            zkp_capable: true,
            status: 'ACTIVE'
        }
    });

    // 3. Driving License
    await prisma.eUDIAttribute.create({
        data: {
            subject_ref: subjectRef,
            type: 'DrivingLicense',
            issuer: 'did:web:ants.gouv.fr',
            format: 'sd_jwt',
            payload: JSON.stringify({
                document_number: '12DD34567',
                categories: ['AM', 'A1', 'B', 'B1'],
                active: true
            }),
            sd_jwt: 'mocked_sd_jwt_driving_license',
            zkp_capable: true,
            status: 'ACTIVE'
        }
    });

    // 4. Student Card
    await prisma.eUDIAttribute.create({
        data: {
            subject_ref: subjectRef,
            type: 'StudentCard',
            issuer: 'did:web:universite-paris-saclay.fr',
            format: 'jwt_vc_json',
            payload: JSON.stringify({
                student_id: '2023-A-87391',
                faculty: 'Computer Science',
                status: 'is_student',
                valid_until: '2027-08-31'
            }),
            zkp_capable: false,
            status: 'ACTIVE'
        }
    });

    // 5. Cinema Ticket
    await prisma.eUDIAttribute.create({
        data: {
            subject_ref: subjectRef,
            type: 'CinemaTicket',
            issuer: 'did:web:ugc.fr',
            format: 'jwt_vc_json',
            payload: JSON.stringify({
                ticket_id: 'TKT-991A-2026',
                movie: 'Dune: Part Three',
                date: '2026-04-22T21:00:00Z',
                seat: 'G-12',
                ticket_ref_cinema: true
            }),
            zkp_capable: false,
            status: 'ACTIVE'
        }
    });

    console.log('[Seed] Creation successful.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
