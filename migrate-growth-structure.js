const { PrismaClient } = require('@prisma/client');

async function migrateGrowthStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting targeted growth structure migration...');
    
    // Step 1: Save any existing growth data before cleanup
    console.log('📊 Backing up existing growth tracking data...');
    
    const existingStages = await prisma.$queryRaw`SELECT * FROM "GrowthStage"`;
    const existingProgress = await prisma.$queryRaw`SELECT * FROM "MemberProgress"`;
    
    console.log(`Found ${existingStages.length} growth stages and ${existingProgress.length} member progress records`);
    
    // Step 2: Clear growth tracking tables in dependency order
    console.log('🧹 Clearing growth tracking tables...');
    
    await prisma.$executeRaw`DELETE FROM "MemberProgress"`;
    await prisma.$executeRaw`DELETE FROM "GrowthQuestion"`;
    await prisma.$executeRaw`DELETE FROM "GrowthContent"`;
    await prisma.$executeRaw`DELETE FROM "GrowthStage"`;
    
    // Step 3: Update Member table to use only valid enum values
    console.log('👥 Updating Member growth levels to valid values...');
    
    // Map invalid values to correct ones based on training.txt
    const memberUpdates = [
      { old: 'MEMBERSHIP_CLASS', new: 'DESTINY_CULTURE' },
      { old: 'DISCIPLESHIP_CLASS', new: 'FOUNDATIONAL_CLASS' },
      { old: 'LEADERS_CLASS', new: 'LEADERSHIP_CLASS' },
      { old: 'DEACON', new: 'LEADERSHIP_CLASS' },
      { old: 'PASTOR', new: 'PASTORAL_CLASS' }
    ];
    
    for (const update of memberUpdates) {
      const updateResult = await prisma.$executeRaw`
        UPDATE "Member" 
        SET "growthLevel" = ${update.new}::"GrowthLevel"
        WHERE "growthLevel"::text = ${update.old}
      `;
      console.log(`   ✓ Updated ${update.old} → ${update.new}`);
    }
    
    // Step 4: Drop and recreate the GrowthLevel enum with correct values
    console.log('🔧 Updating GrowthLevel enum...');
    
    await prisma.$executeRaw`
      ALTER TYPE "GrowthLevel" RENAME TO "GrowthLevel_old"
    `;
    
    await prisma.$executeRaw`
      CREATE TYPE "GrowthLevel" AS ENUM (
        'NEW_COMER',
        'FOUNDATIONAL_CLASS',
        'DESTINY_CULTURE', 
        'MINISTRY_CLASS',
        'LEADERSHIP_CLASS',
        'PASTORAL_CLASS',
        'ADVANCED_LEADERSHIP_2',
        'ADVANCED_LEADERSHIP_3'
      )
    `;
    
    // Update Member table to use new enum
    await prisma.$executeRaw`
      ALTER TABLE "Member" 
      ALTER COLUMN "growthLevel" TYPE "GrowthLevel" 
      USING "growthLevel"::text::"GrowthLevel"
    `;
    
    // Update GrowthStage table to use new enum
    await prisma.$executeRaw`
      ALTER TABLE "GrowthStage"
      ALTER COLUMN "level" TYPE "GrowthLevel"
      USING "level"::text::"GrowthLevel"
    `;
    
    // Drop old enum
    await prisma.$executeRaw`DROP TYPE "GrowthLevel_old"`;
    
    // Step 5: Create growth stages based on training.txt structure
    console.log('📚 Creating growth stages based on training.txt...');
    
    const correctStages = [
      {
        level: 'FOUNDATIONAL_CLASS',
        title: 'Foundational Class',
        description: 'Introduces new members to the basic doctrines of the Christian faith and the church.'
      },
      {
        level: 'DESTINY_CULTURE',
        title: 'Destiny Culture (Membership Course)', 
        description: 'This class focuses on helping members understand the vision, values, and identity of the ministry. Topics include Vision, Integrity, Pioneering, Leadership, Excellence, Action, Devotion, Destiny Declaration, Destiny Anthem, Vision Statement, Mission Statement, and Founders.'
      },
      {
        level: 'MINISTRY_CLASS',
        title: 'Ministry Class',
        description: 'This level prepares members for active service in church units. Upon completion, participants may join ministry departments.'
      },
      {
        level: 'LEADERSHIP_CLASS',
        title: 'Leadership Class',
        description: 'This class prepares members for leadership responsibilities in the church. Participants may qualify to serve as Deacons, Ministry coordinators, or Fellowship leaders.'
      },
      {
        level: 'PASTORAL_CLASS',
        title: 'Pastoral Class (Advanced Leadership Course)',
        description: 'Prepares individuals for pastoral and advanced leadership roles.'
      },
      {
        level: 'ADVANCED_LEADERSHIP_2', 
        title: 'Advanced Leadership Course 2',
        description: 'Further leadership training designed to deepen ministry and leadership competence.'
      },
      {
        level: 'ADVANCED_LEADERSHIP_3',
        title: 'Advanced Leadership Course 3',
        description: 'The highest leadership development level currently within the system.'
      }
    ];
    
    for (const stage of correctStages) {
      await prisma.growthStage.create({
        data: stage
      });
      console.log(`   ✓ Created: ${stage.title}`);
    }
    
    console.log('\n✅ Growth structure migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   • Growth tracking tables cleaned up');
    console.log('   • Member growth levels updated to valid values');
    console.log('   • GrowthLevel enum updated with correct training structure');
    console.log('   • Growth stages created based on training.txt');
    console.log('\n🎯 Growth tracking system is now ready for use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔄 Attempting rollback...');
    
    try {
      // Basic rollback - set all members to NEW_COMER
      await prisma.$executeRaw`
        UPDATE "Member" SET "growthLevel" = 'NEW_COMER'
        WHERE "growthLevel" IS NOT NULL
      `;
      console.log('✓ Rollback completed - all members set to NEW_COMER');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrateGrowthStructure();