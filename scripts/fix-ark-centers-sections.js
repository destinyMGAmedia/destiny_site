const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const assemblies = await prisma.assembly.findMany({
    include: { sections: true }
  })

  for (const assembly of assemblies) {
    const hasArkCenter = assembly.sections.some(s => s.type === 'ARK_CENTERS')
    if (!hasArkCenter) {
      console.log(`Adding ARK_CENTERS section to ${assembly.name}`)
      await prisma.assemblySection.create({
        data: {
          assemblyId: assembly.id,
          type: 'ARK_CENTERS',
          title: 'Ark Centers',
          position: 35,
          isVisible: true
        }
      })
      // Add a small delay between requests to be safe with connections
      await new Promise(resolve => setTimeout(resolve, 200))
    } else {
      console.log(`${assembly.name} already has ARK_CENTERS section`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
