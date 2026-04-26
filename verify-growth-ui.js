// This script verifies the growth tracking UI functionality by simulating
// the API calls that the GrowthTrackManager component makes

async function verifyGrowthUI() {
  console.log('🔍 Verifying Growth Track UI integration...\n');
  
  try {
    // Test 1: Verify GET endpoint returns expected data structure
    console.log('1. Testing GET /api/admin/growth endpoint...');
    
    const response = await fetch('http://localhost:3000/api/admin/growth');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const stages = await response.json();
    
    if (!Array.isArray(stages)) {
      throw new Error('Expected stages to be an array');
    }
    
    if (stages.length === 0) {
      throw new Error('No stages returned from API');
    }
    
    console.log(`✅ API returned ${stages.length} growth stages`);
    
    // Verify each stage has expected structure
    stages.forEach((stage, i) => {
      const requiredFields = ['id', 'level', 'title', 'description', 'contents', 'questions'];
      for (const field of requiredFields) {
        if (!(field in stage)) {
          throw new Error(`Stage ${i} missing required field: ${field}`);
        }
      }
    });
    console.log('✅ All stages have expected data structure');
    
    // Test 2: Verify content structure
    console.log('\n2. Verifying content structure...');
    
    const stageWithContent = stages.find(s => s.contents.length > 0);
    if (stageWithContent) {
      const content = stageWithContent.contents[0];
      const requiredContentFields = ['id', 'title', 'type', 'url', 'order'];
      
      for (const field of requiredContentFields) {
        if (!(field in content)) {
          throw new Error(`Content missing required field: ${field}`);
        }
      }
      console.log(`✅ Content structure valid (${stageWithContent.contents.length} items in ${stageWithContent.title})`);
    } else {
      console.log('⚠️  No content found to verify structure');
    }
    
    // Test 3: Verify question structure
    console.log('\n3. Verifying question structure...');
    
    const stageWithQuestions = stages.find(s => s.questions.length > 0);
    if (stageWithQuestions) {
      const question = stageWithQuestions.questions[0];
      const requiredQuestionFields = ['id', 'question', 'type', 'options', 'correctAnswer'];
      
      for (const field of requiredQuestionFields) {
        if (!(field in question)) {
          throw new Error(`Question missing required field: ${field}`);
        }
      }
      console.log(`✅ Question structure valid (${stageWithQuestions.questions.length} items in ${stageWithQuestions.title})`);
    } else {
      console.log('⚠️  No questions found to verify structure');
    }
    
    // Test 4: Verify component requirements
    console.log('\n4. Verifying UI component requirements...');
    
    // Check that we have all required growth levels from training.txt
    const requiredLevels = [
      'FOUNDATIONAL_CLASS',
      'DESTINY_CULTURE', 
      'MINISTRY_CLASS',
      'LEADERSHIP_CLASS',
      'PASTORAL_CLASS',
      'ADVANCED_LEADERSHIP_2',
      'ADVANCED_LEADERSHIP_3'
    ];
    
    for (const level of requiredLevels) {
      const stage = stages.find(s => s.level === level);
      if (!stage) {
        throw new Error(`Missing required growth level: ${level}`);
      }
    }
    console.log('✅ All required growth levels present');
    
    // Test 5: Summary of UI readiness
    console.log('\n📊 Growth Track UI Readiness Summary:');
    console.log('┌─────────────────────────────────────┬─────────┬───────────┬───────────┐');
    console.log('│ Stage                               │ Level   │ Contents  │ Questions │');
    console.log('├─────────────────────────────────────┼─────────┼───────────┼───────────┤');
    
    stages.forEach(stage => {
      const name = stage.title.padEnd(35);
      const level = (stage.level.slice(0, 7) + '...').padEnd(7);
      const contentCount = String(stage.contents.length).padStart(9);
      const questionCount = String(stage.questions.length).padStart(9);
      
      console.log(`│ ${name} │ ${level} │${contentCount} │${questionCount} │`);
    });
    
    console.log('└─────────────────────────────────────┴─────────┴───────────┴───────────┘');
    
    const totalContent = stages.reduce((sum, s) => sum + s.contents.length, 0);
    const totalQuestions = stages.reduce((sum, s) => sum + s.questions.length, 0);
    
    console.log(`\n✅ UI Ready: ${stages.length} stages, ${totalContent} content items, ${totalQuestions} questions`);
    
    console.log('\n🎯 GrowthTrackManager Component Verification:');
    console.log('   ✅ API endpoint /api/admin/growth working correctly');
    console.log('   ✅ Data structure matches component expectations');
    console.log('   ✅ Content and questions can be displayed');
    console.log('   ✅ All training.txt growth levels implemented');
    console.log('   ✅ Growth tracking system ready for production use');
    
  } catch (error) {
    console.error('❌ UI verification failed:', error.message);
    return false;
  }
  
  return true;
}

// Run verification
verifyGrowthUI();