import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Crear Roles
  const roles = [
    { nombre: 'Admin', descripcion: 'Administrador del sistema' },
    { nombre: 'Médico', descripcion: 'Personal médico (Oftalmólogos)' },
    { nombre: 'Recepción', descripcion: 'Personal de recepción y caja' },
    { nombre: 'Paciente', descripcion: 'Pacientes de la clínica' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: { nombre: rol.nombre, descripcion: rol.descripcion },
    });
  }
  console.log('Roles seeded successfully. No test users were created.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
