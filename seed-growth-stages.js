const { PrismaClient } = require('@prisma/client');

async function seedGrowthStages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Seeding growth stages based on training.txt...');
    
    const stages = [
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
    
    // Create growth stages
    for (const stage of stages) {
      await prisma.growthStage.upsert({
        where: { level: stage.level },
        update: {
          title: stage.title,
          description: stage.description
        },
        create: stage
      });
      console.log(`✓ Created/Updated: ${stage.title}`);
    }
    
    console.log('\n✅ Growth stages seeded successfully!');
    console.log('Growth tracking system is now ready for use.');
    
  } catch (error) {
    console.error('Error seeding growth stages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGrowthStages();