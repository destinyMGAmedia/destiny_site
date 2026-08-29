const { PrismaClient } = require('@prisma/client');

async function fixGrowthEnum() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Fixing GrowthLevel enum step by step...');
    
    // Step 1: Clear growth tracking tables first
    console.log('🧹 Clearing growth tracking tables...');
    await prisma.$executeRaw`DELETE FROM "MemberProgress"`;
    await prisma.$executeRaw`DELETE FROM "GrowthQuestion"`;
    await prisma.$executeRaw`DELETE FROM "GrowthContent"`;
    await prisma.$executeRaw`DELETE FROM "GrowthStage"`;
    
    // Step 2: Remove default constraint from Member.growthLevel
    console.log('🔧 Removing default constraint...');
    await prisma.$executeRaw`
      ALTER TABLE "Member" 
      ALTER COLUMN "growthLevel" DROP DEFAULT
    `;
    
    // Step 3: Update existing invalid enum values
    console.log('👥 Updating member growth levels...');
    
    // Set all invalid values to NEW_COMER first
    await prisma.$executeRaw`
      UPDATE "Member" 
      SET "growthLevel" = 'NEW_COMER'
      WHERE "growthLevel"::text NOT IN (
        'NEW_COMER', 'FOUNDATIONAL_CLASS', 'DESTINY_CULTURE', 
        'MINISTRY_CLASS', 'LEADERSHIP_CLASS', 'PASTORAL_CLASS', 
        'ADVANCED_LEADERSHIP_2', 'ADVANCED_LEADERSHIP_3'
      )
    `;
    
    console.log('✅ Member table cleaned up successfully!');
    
    // Step 4: Now regenerate Prisma and push schema
    console.log('📦 Regenerating Prisma client...');
    
    console.log('\n✅ Database cleanup completed!');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Run: npm run db:push --accept-data-loss');
    console.log('   3. Run: node seed-growth-stages.js');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    
    // Try basic cleanup
    try {
      console.log('🔄 Attempting basic cleanup...');
      await prisma.$executeRaw`UPDATE "Member" SET "growthLevel" = 'NEW_COMER'`;
      console.log('✓ Set all members to NEW_COMER');
    } catch (cleanupError) {
      console.error('❌ Basic cleanup failed:', cleanupError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixGrowthEnum();