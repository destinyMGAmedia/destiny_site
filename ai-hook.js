const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * AI Hook: A validation script to ensure AI tools follow the project's rule book.
 * Mandated in AI_RULES.md.
 */

function checkRules() {
  console.log('🤖 Starting AI Hook Validation...');
  let hasErrors = false;

  // 1. Check for Mandatory Testing
  console.log('\n--- Checking Mandatory Tests ---');
  try {
    const gitStatus = execSync('git status --short').toString();
    const untrackedFiles = gitStatus
      .split('\n')
      .filter(line => line.startsWith('?? ') || line.startsWith('A  '))
      .map(line => line.substring(3).trim());

    if (untrackedFiles.length === 0) {
      console.log('✅ No new untracked/added files detected.');
    } else {
      for (const file of untrackedFiles) {
        if (file.includes('src/app/api/') && file.endsWith('route.js') && !file.includes('.test.')) {
          const testFile = file.replace('route.js', 'route.test.js');
          if (!fs.existsSync(path.join(process.cwd(), testFile))) {
            console.error(`❌ Missing test for new API endpoint: ${file}`);
            console.error(`   Required: ${testFile}`);
            hasErrors = true;
          } else {
            console.log(`✅ Test found for: ${file}`);
          }
        } else if (file.includes('src/components/') && 
                   (file.endsWith('.js') || file.endsWith('.jsx')) && 
                   !file.includes('.test.')) {
          const testFile = file.endsWith('.jsx') ? file.replace('.jsx', '.test.jsx') : file.replace('.js', '.test.js');
          // Also check for .test.js regardless of .jsx
          const altTestFile = file.replace(/\.jsx?$/, '.test.js');
          if (!fs.existsSync(path.join(process.cwd(), testFile)) && !fs.existsSync(path.join(process.cwd(), altTestFile))) {
            console.error(`❌ Missing test for new frontend component/feature: ${file}`);
            console.error(`   Required: ${testFile}`);
            hasErrors = true;
          } else {
            console.log(`✅ Test found for: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Failed to run git checks: ${error.message}`);
    // If not in a git repo, skip this check
  }

  // 2. Check for Prohibited DB Commands (if script is used in a CI/CD or pre-commit)
  // This is mostly handled by the AI's internal instruction following AI_RULES.md

  if (hasErrors) {
    console.error('\n⚠️ AI Hook Validation FAILED!');
    console.error('Please ensure all new features and endpoints have corresponding tests as per AI_RULES.md.');
    process.exit(1);
  } else {
    console.log('\n✅ AI Hook Validation PASSED!');
    process.exit(0);
  }
}

checkRules();
