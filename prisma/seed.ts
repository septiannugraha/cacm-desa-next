import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed StatusTL (Tindak Lanjut)
  console.log('Creating StatusTL records...')
  const statusTLData = [
    { statusTL: 1, keterangan: 'Belum Ditindaklanjuti' },
    { statusTL: 2, keterangan: 'Dalam Proses' },
    { statusTL: 3, keterangan: 'Perlu Koordinasi' },
    { statusTL: 4, keterangan: 'Menunggu Verifikasi' },
    { statusTL: 5, keterangan: 'Dikembalikan' },
    { statusTL: 6, keterangan: 'Dibatalkan' },
    { statusTL: 7, keterangan: 'Selesai' }
  ]

  for (const status of statusTLData) {
    await prisma.statusTL.upsert({
      where: { statusTL: status.statusTL },
      update: {},
      create: status
    })
  }

  // Seed StatusVerifikasi
  console.log('Creating StatusVerifikasi records...')
  const statusVerData = [
    { statusVer: 1, keterangan: 'Belum Diverifikasi' },
    { statusVer: 2, keterangan: 'Sedang Diverifikasi' },
    { statusVer: 3, keterangan: 'Terverifikasi' },
    { statusVer: 4, keterangan: 'Ditolak' },
    { statusVer: 5, keterangan: 'Perlu Perbaikan' }
  ]

  for (const status of statusVerData) {
    await prisma.statusVerifikasi.upsert({
      where: { statusVer: status.statusVer },
      update: {},
      create: status
    })
  }

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Administrator',
      permissions: JSON.stringify(['all']),
    },
  })

  const inspectorRole = await prisma.role.upsert({
    where: { code: 'INSPECTOR' },
    update: {},
    create: {
      code: 'INSPECTOR',
      name: 'Inspektur',
      permissions: JSON.stringify(['view_atensi', 'create_atensi', 'update_atensi', 'create_response']),
    },
  })

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      code: 'USER',
      name: 'User',
      permissions: JSON.stringify(['view_atensi', 'create_atensi']),
    },
  })

  console.log('Roles created:', { adminRole, inspectorRole, userRole })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@cacmdesa.id',
      password: hashedPassword,
      name: 'Administrator',
      roleId: adminRole.id,
      active: true,
    },
  })

  console.log('Admin user created:', { username: adminUser.username })

  // Create Atensi Categories with original jnsAtensi codes
  console.log('Creating Atensi categories...')
  const categories = [
    { code: 'KRG', name: 'Keuangan', jnsAtensi: 1, color: '#3b82f6', icon: 'DollarSign' },
    { code: 'AST', name: 'Aset', jnsAtensi: 2, color: '#10b981', icon: 'Building' },
    { code: 'ADM', name: 'Administrasi', jnsAtensi: 3, color: '#f59e0b', icon: 'FileText' },
    { code: 'PJK', name: 'Perpajakan', jnsAtensi: 4, color: '#dc2626', icon: 'Receipt' },
    { code: 'LYN', name: 'Pelayanan', jnsAtensi: 5, color: '#8b5cf6', icon: 'Users' }
  ]

  for (const cat of categories) {
    await prisma.atensiCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    })
  }

  console.log('Categories created')

  // Create sample Pemda with original kdPemda codes
  console.log('Creating sample Pemda...')
  const pemdaData = [
    { kdPemda: '3201', code: 'KAB-BOGOR', name: 'Kabupaten Bogor', level: 'KABUPATEN' },
    { kdPemda: '3202', code: 'KAB-SUKABUMI', name: 'Kabupaten Sukabumi', level: 'KABUPATEN' },
    { kdPemda: '3203', code: 'KAB-CIANJUR', name: 'Kabupaten Cianjur', level: 'KABUPATEN' }
  ]

  for (const pemda of pemdaData) {
    await prisma.pemda.upsert({
      where: { kdPemda: pemda.kdPemda },
      update: {},
      create: pemda
    })
  }

  // Create sample villages with original kdDesa codes
  console.log('Creating sample Villages...')
  const villageData = [
    { kdDesa: '3201010001', code: 'V001-WATES', name: 'Desa Wates Jaya', pemdaId: '', kdKec: '320101' },
    { kdDesa: '3201010002', code: 'V002-CIBURAYUT', name: 'Desa Ciburayut', pemdaId: '', kdKec: '320101' },
    { kdDesa: '3201010003', code: 'V003-CIADEG', name: 'Desa Ciadeg', pemdaId: '', kdKec: '320101' },
    { kdDesa: '3202010001', code: 'V004-CIAMBAR', name: 'Desa Ciambar', pemdaId: '', kdKec: '320201' },
    { kdDesa: '3202010002', code: 'V005-GIRIMUKTI', name: 'Desa Girimukti', pemdaId: '', kdKec: '320201' }
  ]

  for (const village of villageData) {
    const pemda = await prisma.pemda.findFirst({
      where: { kdPemda: village.kdDesa.substring(0, 4) }
    })

    await prisma.village.upsert({
      where: { kdDesa: village.kdDesa },
      update: {},
      create: {
        ...village,
        pemdaId: pemda?.id || ''
      }
    })
  }

  // Get first village for sample data
  const firstVillage = await prisma.village.findFirst({
    where: { kdDesa: '3201010001' }
  })
  const firstPemda = await prisma.pemda.findFirst({
    where: { kdPemda: '3201' }
  })
  const financeCategory = await prisma.atensiCategory.findFirst({
    where: { code: 'KRG' }
  })

  // Create sample Atensi master record
  console.log('Creating sample Atensi records...')
  const currentYear = new Date().getFullYear()

  const atensi = await prisma.atensi.create({
    data: {
      noAtensi: `AT-${currentYear}-001`,
      code: `AT${currentYear}001`,
      title: 'Laporan Keuangan Desa Q1',
      description: 'Temuan pada laporan keuangan desa kuartal 1',
      categoryId: financeCategory?.id || '',
      villageId: firstVillage?.id || '',
      pemdaId: firstPemda?.id || '',
      fiscalYear: currentYear,
      reportedById: adminUser.id
    }
  })

  // Create sample AtensiDesa
  const atensiDesa = await prisma.atensiDesa.create({
    data: {
      idAtensiDesa: `AD-${Date.now()}`,
      tahun: currentYear,
      kdPemda: '3201',
      kdDesa: '3201010001',
      noAtensi: atensi.noAtensi,
      atensiId: atensi.id,
      jlhRF: 5,
      jlhTL: 2
    }
  })

  // Create sample AtensiDesaRinc (detail items)
  console.log('Creating sample Atensi detail items...')
  const rincItems = [
    {
      noBukti: 'BKT-001',
      tglBukti: new Date('2024-01-15'),
      ketBukti: 'Pembayaran honor tanpa bukti yang memadai',
      nilai: 5000000,
      satuan: 'Rupiah'
    },
    {
      noBukti: 'BKT-002',
      tglBukti: new Date('2024-01-20'),
      ketBukti: 'Pengadaan barang melebihi pagu anggaran',
      nilai: 15000000,
      satuan: 'Rupiah'
    },
    {
      noBukti: 'BKT-003',
      tglBukti: new Date('2024-02-10'),
      ketBukti: 'SPJ tidak lengkap untuk kegiatan pelatihan',
      nilai: 8000000,
      satuan: 'Rupiah'
    }
  ]

  for (const item of rincItems) {
    await prisma.atensiDesaRinc.create({
      data: {
        idAtensiDesa: atensiDesa.idAtensiDesa,
        tahun: currentYear,
        kdPemda: '3201',
        kdDesa: '3201010001',
        noAtensi: atensi.noAtensi,
        jnsAtensi: financeCategory?.code || 'KRG',
        ...item,
        statusTL: 1,
        statusVer: 1
      }
    })
  }

  console.log('\n✅ Database seeded successfully!')
  console.log('Sample data created:')
  console.log('  - StatusTL: 7 records')
  console.log('  - StatusVerifikasi: 5 records')
  console.log('  - Roles: 3 records')
  console.log('  - Pemda: 3 records')
  console.log('  - Villages: 5 records')
  console.log('  - Atensi Categories: 5 records')
  console.log('  - Admin User: admin / admin123')
  console.log('  - Sample Atensi with detail items')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })