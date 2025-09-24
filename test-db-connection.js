#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    await prisma.$connect()
    console.log('✅ Connected to database successfully!\n')

    // Check if tables exist
    console.log('2. Checking tables...')
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `
    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`))
    console.log()

    // Check StatusTL data
    console.log('3. Checking StatusTL reference data...')
    const statusTL = await prisma.statusTL.findMany()
    console.log(`✅ Found ${statusTL.length} StatusTL records`)

    // Check StatusVerifikasi data
    console.log('4. Checking StatusVerifikasi reference data...')
    const statusVer = await prisma.statusVerifikasi.findMany()
    console.log(`✅ Found ${statusVer.length} StatusVerifikasi records\n`)

    // Test creating sample data
    console.log('5. Testing data operations...')

    // Check if test pemda exists
    const testPemda = await prisma.pemda.findFirst({
      where: { kdPemda: 'TEST01' }
    })

    if (!testPemda) {
      console.log('   Creating test Pemda...')
      await prisma.pemda.create({
        data: {
          kdPemda: 'TEST01',
          code: 'TEST-PEMDA',
          name: 'Test Pemda',
          level: 'KABUPATEN'
        }
      })
    }

    // Check if test village exists
    const testVillage = await prisma.village.findFirst({
      where: { kdDesa: 'TESTDESA01' }
    })

    if (!testVillage) {
      console.log('   Creating test Village...')
      const pemda = await prisma.pemda.findFirst({
        where: { kdPemda: 'TEST01' }
      })

      await prisma.village.create({
        data: {
          kdDesa: 'TESTDESA01',
          code: 'TEST-DESA',
          name: 'Test Desa',
          pemdaId: pemda.id,
          kdKec: 'TEST01'
        }
      })
    }

    console.log('✅ Data operations working correctly!\n')

    console.log('🎉 All database tests passed successfully!')
    console.log('Your database is ready to use with the application.\n')

  } catch (error) {
    console.error('❌ Database connection test failed:')
    console.error(error)
    console.error('\nTroubleshooting tips:')
    console.error('1. Make sure Docker container is running: docker ps | grep cacmdesa-mssql')
    console.error('2. Check your .env file has the correct DATABASE_URL')
    console.error('3. Verify SQL Server is accepting connections on port 1433')
    console.error('4. Run migrations if needed: npx prisma migrate deploy')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()