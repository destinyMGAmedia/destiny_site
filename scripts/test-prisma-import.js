const prisma = require('./src/lib/prisma').default
async function test() {
  try {
    const assemblyCount = await prisma.assembly.count()
    console.log('Total assemblies:', assemblyCount)
  } catch (err) {
    console.error('Prisma test failed:', err.message)
  }
}
test()
