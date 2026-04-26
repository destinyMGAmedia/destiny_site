const { PrismaClient } = require('@prisma/client');

async function resetGrowthTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Resetting growth tracking tables...');
    
    // Delete all growth tracking data to start fresh
    console.log('1. Deleting MemberProgress...');
    await prisma.memberProgress.deleteMany();
    
    console.log('2. Deleting GrowthQuestion...');  
    await prisma.growthQuestion.deleteMany();
    
    console.log('3. Deleting GrowthContent...');
    await prisma.growthContent.deleteMany();
    
    console.log('4. Deleting GrowthStage...');
    await prisma.growthStage.deleteMany();
    
    console.log('5. Updating Member growthLevel to NEW_COMER...');
    await prisma.member.updateMany({
      data: { growthLevel: 'NEW_COMER' }
    });
    
    console.log('Growth tracking tables reset successfully!');
    console.log('You can now run: npm run db:push --accept-data-loss');
    
  } catch (error) {
    console.error('Error during reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetGrowthTables();