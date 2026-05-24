import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMandates() {
    const subjectRef = "C_VON_N";

    // Clear legacy mandates
    await prisma.delegationMandate.deleteMany({});
    
    // Create Tabac Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:retail:age_restricted',
            status: 'ACTIVE',
            max_amount: 50.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            sca_timestamp: new Date()
        }
    });

    // Create Hotel Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:travel:hotel',
            status: 'ACTIVE',
            max_amount: 500.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            sca_timestamp: new Date()
        }
    });

    // Create Car Rental Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:mobility:rental',
            status: 'ACTIVE',
            max_amount: 2000.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sca_timestamp: new Date()
        }
    });

    // Create IT Services Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:tech:it',
            status: 'ACTIVE',
            max_amount: 100.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sca_timestamp: new Date()
        }
    });

    // Create Infrastructure Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:tech:infrastructure',
            status: 'ACTIVE',
            max_amount: 50.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sca_timestamp: new Date()
        }
    });

    // Create Entertainment Tickets Mandate
    await prisma.delegationMandate.create({
        data: {
            subject_ref: subjectRef,
            scope: 'urn:atos:pilot:entertainment:tickets',
            status: 'ACTIVE',
            max_amount: 250.0,
            currency: 'EUR',
            authorized_rails: 'SEPA',
            auto_execute: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sca_timestamp: new Date()
        }
    });

    console.log('[Seed] Re-seeded specific Mandates successfully.');
}

addMandates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
