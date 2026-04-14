const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const stages = [
    { level: 'NEW_COMER', title: 'New Comer', description: 'Welcome to our family!' },
    { level: 'MEMBERSHIP_CLASS', title: 'Membership Class', description: 'Learn about our church and how to become a member.' },
    { level: 'DISCIPLESHIP_CLASS', title: 'Discipleship Class', description: 'Deepen your walk with Christ.' },
    { level: 'LEADERS_CLASS', title: 'Leaders Class', description: 'Training for leadership in the house of God.' },
    { level: 'DEACON', title: 'Deacon', description: 'Service and ministry leadership.' },
    { level: 'PASTOR', title: 'Pastor', description: 'Shepherding the flock.' }
  ]

  for (const stage of stages) {
    await prisma.growthStage.upsert({
      where: { level: stage.level },
      update: { title: stage.title, description: stage.description },
      create: stage
    })
  }

  console.log('Growth stages seeded successfully.')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
