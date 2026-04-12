/**
 * Prisma Seed Script
 * Run with: npm run db:seed
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── HQ Assembly ───────────────────────────────────
  const hq = await prisma.assembly.upsert({
    where: { slug: 'headquarters' },
    update: {
      tagline: 'The Hub of Destiny Mission Global Assembly',
      welcomeText: 'Welcome to Headquarters Assembly',
      aboutText: `Destiny Mission Global Assembly (DMGA) Headquarters is the mother church of a global family of assemblies. Founded on the vision of raising a people of destiny, we are committed to igniting faith, transforming lives, and reaching nations — one assembly at a time.\n\nLocated in Uyo, Akwa Ibom State, Nigeria, the HQ serves as the spiritual and administrative centre of DMGA worldwide.`,
      address: '96b Line Ewet Housing Estate, Uyo, Akwa Ibom State, Nigeria',
      phone: '+234 806 049 9761',
      email: 'hq@destinymissions.org',
      whatsapp: '+2348060499761',
      serviceTimes: [
        { day: 'Sunday', time: '9:00 AM – 12:00 PM', type: 'Main Service' },
        { day: 'Wednesday', time: '6:00 PM – 8:00 PM', type: 'Bible Study' },
        { day: 'Friday', time: '6:00 PM – 8:00 PM', type: 'Prayer & Praise' },
      ],
    },
    create: {
      slug: 'headquarters',
      name: 'Headquarters Assembly',
      city: 'Uyo',
      country: 'Nigeria',
      timezone: 'NIGERIA',
      tagline: 'The Hub of Destiny Mission Global Assembly',
      welcomeText: 'Welcome to Headquarters Assembly',
      aboutText: `Destiny Mission Global Assembly (DMGA) Headquarters is the mother church of a global family of assemblies. Founded on the vision of raising a people of destiny, we are committed to igniting faith, transforming lives, and reaching nations — one assembly at a time.\n\nLocated in Uyo, Akwa Ibom State, Nigeria, the HQ serves as the spiritual and administrative centre of DMGA worldwide.`,
      address: '96b Line Ewet Housing Estate, Uyo, Akwa Ibom State, Nigeria',
      phone: '+234 806 049 9761',
      email: 'hq@destinymissions.org',
      whatsapp: '+2348060499761',
      isHQ: true,
      isActive: true,
      serviceTimes: [
        { day: 'Sunday', time: '9:00 AM – 12:00 PM', type: 'Main Service' },
        { day: 'Wednesday', time: '6:00 PM – 8:00 PM', type: 'Bible Study' },
        { day: 'Friday', time: '6:00 PM – 8:00 PM', type: 'Prayer & Praise' },
      ],
    },
  })
  console.log(`✅ Assembly: ${hq.name}`)

  // ─── HQ Sections ───────────────────────────────────
  const sections = [
    { type: 'HERO',         title: 'Hero Banner',      position: 10,  isVisible: true },
    { type: 'FIND_US',      title: 'Find Us',           position: 20,  isVisible: true },
    { type: 'FELLOWSHIPS',  title: 'Fellowships',       position: 30,  isVisible: true },
    { type: 'DEPARTMENTS',  title: 'Departments',       position: 40,  isVisible: true },
    { type: 'EVENTS',       title: "What's On",         position: 50,  isVisible: true },
    { type: 'MEDIA',        title: 'Media',             position: 60,  isVisible: true },
    { type: 'GIVING',       title: 'Giving',            position: 70,  isVisible: true },
    { type: 'PRAYER',       title: 'Prayer Requests',   position: 80,  isVisible: true },
    { type: 'TESTIMONIES',  title: 'Testimonies',       position: 90,  isVisible: true },
    { type: 'CONTACT',      title: 'Contact',           position: 9999, isVisible: true },
  ]

  for (const s of sections) {
    const existing = await prisma.assemblySection.findFirst({
      where: { assemblyId: hq.id, type: s.type },
    })
    if (!existing) {
      await prisma.assemblySection.create({ data: { ...s, assemblyId: hq.id } })
    }
  }
  console.log(`✅ HQ sections seeded`)

  // ─── HQ Team Members ───────────────────────────────
  const teamMembers = [
    // PASTORS (DEPARTMENT)
    {
      name: 'Apostle Effiong Okon',
      role: 'General Overseer',
      bio: 'Apostle Effiong Okon is the founder and General Overseer of Destiny Mission Global Assembly. A man of faith and vision, he has dedicated his life to raising a people of destiny across the nations.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 1,
    },
    {
      name: 'Pastor (Mrs) Okon',
      role: 'Co-Pastor / First Lady',
      bio: 'The First Lady of DMGA, a pillar of grace and strength in the ministry.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 2,
    },
    {
      name: 'Pastor Emmanuel Etim',
      role: 'Associate Pastor',
      bio: 'Pastor Emmanuel serves as Associate Pastor at DMGA HQ, overseeing discipleship and pastoral care.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 3,
    },
    {
      name: 'Pastor Nsikak Udoh',
      role: 'Youth Pastor',
      bio: 'Pastor Nsikak leads the Destiny Defenders with passion and fire, raising champions for the next generation.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 4,
    },
    {
      name: 'Pastor Aniekan Bassey',
      role: 'Welfare Pastor',
      bio: 'Overseeing the welfare and pastoral care of every member in the DMGA family.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 5,
    },
    {
      name: 'Pastor Ekanem Obot',
      role: 'Children\'s Ministry Pastor',
      bio: 'Dedicated to nurturing the Destiny Treasures — raising children in the fear of the Lord.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 6,
    },
    {
      name: 'Pastor Ifiok Nkanta',
      role: 'Evangelism Pastor',
      bio: 'Driving the outreach and evangelism mandate of DMGA, taking the gospel to every corner.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 7,
    },
    {
      name: 'Pastor Uduak Ekpo',
      role: 'Discipleship Pastor',
      bio: 'Equipping believers to grow in the Word and walk in the fullness of their destiny.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 8,
    },
    {
      name: 'Pastor Mfon Akpan',
      role: 'Media & Communications Pastor',
      bio: 'Overseeing the broadcast, media, and communications ministry of DMGA worldwide.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 9,
    },
    {
      name: 'Pastor Etim Okon',
      role: 'Administration Pastor',
      bio: 'Coordinating the administrative and operational excellence of DMGA Headquarters.',
      category: 'DEPARTMENT',
      department: 'PASTORS',
      displayOrder: 10,
    },
    // FELLOWSHIPS
    {
      name: 'Bro. Daniel Akpan',
      role: "King's Men Fellowship Leader",
      bio: "Leading the men of DMGA into purpose and destiny.",
      category: 'FELLOWSHIP',
      fellowship: 'KINGS_MEN',
      displayOrder: 1,
    },
    {
      name: 'Sis. Grace Udoh',
      role: 'Destiny Preservers Leader',
      bio: 'Championing the women of DMGA to walk in their God-given destiny.',
      category: 'FELLOWSHIP',
      fellowship: 'DESTINY_PRESERVERS',
      displayOrder: 2,
    },
    {
      name: 'Bro. Samuel Obot',
      role: 'Destiny Defenders Leader',
      bio: 'Leading the youth to stand firm in faith and defend the truth.',
      category: 'FELLOWSHIP',
      fellowship: 'DESTINY_DEFENDERS',
      displayOrder: 3,
    },
    {
      name: 'Sis. Blessing Ntuk',
      role: 'Destiny Treasures Coordinator',
      bio: 'Nurturing the children of DMGA to grow in love and the knowledge of God.',
      category: 'FELLOWSHIP',
      fellowship: 'DESTINY_TREASURES',
      displayOrder: 4,
    },
    // OTHER DEPARTMENTS
    {
      name: 'Bro. Victor Essien',
      role: 'Choir Director',
      bio: 'Leading the DMGA choir in Spirit-filled worship.',
      category: 'DEPARTMENT',
      department: 'CHOIR',
      displayOrder: 1,
    },
    {
      name: 'Bro. Philip Udo',
      role: 'Media & Technical Head',
      bio: 'Overseeing all media, broadcast, and technical operations at DMGA.',
      category: 'DEPARTMENT',
      department: 'MEDIA_TECHNICAL',
      displayOrder: 1,
    },
  ]

  for (const member of teamMembers) {
    const existing = await prisma.teamMember.findFirst({
      where: { assemblyId: hq.id, name: member.name },
    })
    if (!existing) {
      await prisma.teamMember.create({ data: { ...member, assemblyId: hq.id } })
    }
  }
  console.log(`✅ HQ team members seeded (${teamMembers.length})`)

  // ─── HQ Giving Details ─────────────────────────────
  const existingGiving = await prisma.givingDetails.findUnique({ where: { assemblyId: hq.id } })
  if (!existingGiving) {
    await prisma.givingDetails.create({
      data: {
        assemblyId: hq.id,
        bankName: 'First Bank of Nigeria',
        accountName: 'Destiny Mission Global Assembly',
        accountNumber: '3012345678',
        instructions: 'Use your full name as the payment description. For tithes, offerings, and seed sowing. God bless your giving!',
      },
    })
    console.log('✅ HQ giving details seeded')
  }

  // ─── SUPER_ADMIN ───────────────────────────────────
  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@destinymissions.org'
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'ChangeMe@SuperAdmin1'
  const superAdminHash = await bcrypt.hash(superAdminPassword, 12)
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: superAdminHash,
      name: process.env.SEED_SUPER_ADMIN_NAME || 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: superAdminEmail,
      password: superAdminHash,
      name: process.env.SEED_SUPER_ADMIN_NAME || 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log(`✅ SUPER_ADMIN: ${superAdminEmail}`)

  // ─── GLOBAL_ADMIN ──────────────────────────────────
  const globalAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@destinymissions.org'
  const globalAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'global123'
  const globalAdminHash = await bcrypt.hash(globalAdminPassword, 12)
  await prisma.user.upsert({
    where: { email: globalAdminEmail },
    update: {
      password: globalAdminHash,
      name: process.env.SEED_ADMIN_NAME || 'Global Administrator',
      role: 'GLOBAL_ADMIN',
      isActive: true,
    },
    create: {
      email: globalAdminEmail,
      password: globalAdminHash,
      name: process.env.SEED_ADMIN_NAME || 'Global Administrator',
      role: 'GLOBAL_ADMIN',
      isActive: true,
    },
  })
  console.log(`✅ GLOBAL_ADMIN: ${globalAdminEmail}`)

  // ─── YouTube Channels ──────────────────────────────
  const channels = [
    { channelType: 'MAIN_LIVE',       channelId: 'UCH3uj1-ubXiKKhj4WZskflw', channelName: 'DMGA Live Services',   description: 'Main church live stream and sermon archive' },
    { channelType: 'CREATIVE_ARTS',   channelId: 'PLACEHOLDER_CREATIVE_ARTS', channelName: 'DMGA Creative Arts',   description: 'Faith-based skits, drama, and creative productions' },
    { channelType: 'TREASURES_KIDS',  channelId: 'PLACEHOLDER_TREASURES_KIDS',channelName: 'Destiny Treasures',    description: 'Bible animations and kids content' },
  ]
  for (const ch of channels) {
    await prisma.youtubeChannel.upsert({ where: { channelType: ch.channelType }, update: {}, create: ch })
    console.log(`✅ YouTube channel: ${ch.channelName}`)
  }

  // ─── Memory Verse ──────────────────────────────────
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  await prisma.memoryVerse.upsert({
    where: { id: 'default-memory-verse' },
    update: {},
    create: {
      id: 'default-memory-verse',
      verse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      reference: 'John 3:16 (NIV)',
      weekOf: startOfWeek,
      isActive: true,
    },
  })
  console.log('✅ Memory verse seeded')

  // ─── Hero Slide ────────────────────────────────────
  const existingSlide = await prisma.heroSlide.findFirst()
  if (!existingSlide) {
    await prisma.heroSlide.create({
      data: {
        imageUrl: 'https://placehold.co/1920x1080/2d0060/ffb300?text=Destiny+Mission+Global+Assembly',
        caption: 'Igniting Faith. Transforming Lives.',
        ctaText: 'Find Your Assembly',
        ctaLink: '/assemblies',
        displayOrder: 0,
        isActive: true,
      },
    })
    console.log('✅ Default hero slide created')
  }

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────────────')
  console.log(`SUPER_ADMIN  → ${superAdminEmail} / ${superAdminPassword}`)
  console.log(`GLOBAL_ADMIN → ${globalAdminEmail} / ${globalAdminPassword}`)
  console.log('⚠️  Change passwords immediately after first login!')
  console.log('─────────────────────────────────────────')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
