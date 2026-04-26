const { PrismaClient } = require('@prisma/client');

async function cleanupGrowthData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting growth data cleanup...');
    
    // First, let's see what invalid data exists
    const invalidGrowthStages = await prisma.$queryRaw`
      SELECT level FROM "GrowthStage" WHERE level NOT IN (
        'NEW_COMER', 'FOUNDATIONAL_CLASS', 'DESTINY_CULTURE', 
        'MINISTRY_CLASS', 'LEADERSHIP_CLASS', 'PASTORAL_CLASS', 
        'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'
      )
    `;
    
    const invalidMembers = await prisma.$queryRaw`
      SELECT "growthLevel" FROM "Member" WHERE "growthLevel" NOT IN (
        'NEW_COMER', 'FOUNDATIONAL_CLASS', 'DESTINY_CULTURE', 
        'MINISTRY_CLASS', 'LEADERSHIP_CLASS', 'PASTORAL_CLASS', 
        'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'
      )
    `;
    
    console.log('Invalid GrowthStage records:', invalidGrowthStages);
    console.log('Invalid Member growth levels:', invalidMembers);
    
    // Update invalid growth stages
    // Map old values to new ones
    const mapping = {
      'MEMBERSHIP_CLASS': 'DESTINY_CULTURE',
      'DISCIPLESHIP_CLASS': 'FOUNDATIONAL_CLASS', 
      'LEADERS_CLASS': 'LEADERSHIP_CLASS',
      'DEACON': 'LEADERSHIP_CLASS',
      'PASTOR': 'PASTORAL_CLASS'
    };
    
    // Update GrowthStage records
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      await prisma.$executeRaw`
        UPDATE "GrowthStage" SET level = ${newValue}::"GrowthLevel" 
        WHERE level = ${oldValue}
      `;
      console.log(`Updated GrowthStage: ${oldValue} -> ${newValue}`);
    }
    
    // Update Member records
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      await prisma.$executeRaw`
        UPDATE "Member" SET "growthLevel" = ${newValue}::"GrowthLevel" 
        WHERE "growthLevel" = ${oldValue}
      `;
      console.log(`Updated Member growthLevel: ${oldValue} -> ${newValue}`);
    }
    
    console.log('Growth data cleanup completed!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    
    // If the enum conversion fails, we need to delete invalid records
    console.log('Attempting to delete invalid records...');
    
    try {
      await prisma.$executeRaw`DELETE FROM "GrowthStage" WHERE level NOT IN (
        'NEW_COMER', 'FOUNDATIONAL_CLASS', 'DESTINY_CULTURE', 
        'MINISTRY_CLASS', 'LEADERSHIP_CLASS', 'PASTORAL_CLASS', 
        'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'
      )`;
      
      await prisma.$executeRaw`UPDATE "Member" SET "growthLevel" = 'NEW_COMER' WHERE "growthLevel" NOT IN (
        'NEW_COMER', 'FOUNDATIONAL_CLASS', 'DESTINY_CULTURE', 
        'MINISTRY_CLASS', 'LEADERSHIP_CLASS', 'PASTORAL_CLASS', 
        'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'
      )`;
      
      console.log('Invalid records cleaned up!');
    } catch (deleteError) {
      console.error('Failed to delete invalid records:', deleteError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

cleanupGrowthData();