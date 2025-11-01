import { PrismaClient, Prisma, UserRole, ProductType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:13000'

async function seedUsers() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { id: 'user-admin-root' },
    update: {
      email: 'admin@ital-cafe.jp',
      name: 'Ital Cafe 管理者',
      password: hashedPassword,
      role: UserRole.admin,
      isActive: true,
    },
    create: {
      id: 'user-admin-root',
      email: 'admin@ital-cafe.jp',
      name: 'Ital Cafe 管理者',
      password: hashedPassword,
      role: UserRole.admin,
      isActive: true,
    },
  })

  const staffPassword = await bcrypt.hash('CafeStaff123!', 10)

  await prisma.user.upsert({
    where: { id: 'user-staff-nakamura' },
    update: {
      email: 'staff@ital-cafe.jp',
      name: '中村 スタッフ',
      password: staffPassword,
      role: UserRole.staff,
      isActive: true,
    },
    create: {
      id: 'user-staff-nakamura',
      email: 'staff@ital-cafe.jp',
      name: '中村 スタッフ',
      password: staffPassword,
      role: UserRole.staff,
      isActive: true,
    },
  })
}

async function seedTables() {
  const tables = [
    { id: 'table-terrace-1', number: 'A1', name: 'テラス席 1', token: 'ital-terrace-1' },
    { id: 'table-terrace-2', number: 'A2', name: 'テラス席 2', token: 'ital-terrace-2' },
    { id: 'table-window-1', number: 'B1', name: '窓側席 1', token: 'ital-window-1' },
    { id: 'table-window-2', number: 'B2', name: '窓側席 2', token: 'ital-window-2' },
    { id: 'table-counter-1', number: 'C1', name: 'カウンター 1', token: 'ital-counter-1' },
    { id: 'table-counter-2', number: 'C2', name: 'カウンター 2', token: 'ital-counter-2' },
  ]

  for (const table of tables) {
    await prisma.table.upsert({
      where: { id: table.id },
      update: {
        number: table.number,
        name: table.name,
        isActive: true,
        qrUrl: `${FRONTEND_BASE_URL}/t/${table.token}`,
      },
      create: {
        id: table.id,
        number: table.number,
        name: table.name,
        tableToken: table.token,
        qrUrl: `${FRONTEND_BASE_URL}/t/${table.token}`,
        isActive: true,
      },
    })
  }
}

async function seedToppings() {
  const toppings = [
    { id: 'top-extra-shot', name: 'エスプレッソショット', priceTaxIncl: '80.00' },
    { id: 'top-oat-milk', name: 'オートミルク変更', priceTaxIncl: '60.00' },
    { id: 'top-honey', name: '森のはちみつ', priceTaxIncl: '70.00' },
    { id: 'top-gelato', name: '自家製ジェラート', priceTaxIncl: '120.00' },
  ]

  for (const topping of toppings) {
    await prisma.topping.upsert({
      where: { id: topping.id },
      update: {
        name: topping.name,
        priceTaxIncl: new Prisma.Decimal(topping.priceTaxIncl),
        isAvailable: true,
      },
      create: {
        id: topping.id,
        name: topping.name,
        priceTaxIncl: new Prisma.Decimal(topping.priceTaxIncl),
        isAvailable: true,
      },
    })
  }
}

async function seedProducts() {
  const products = [
    {
      id: 'prod-espresso',
      name: '森のエスプレッソ',
      description: '深煎り豆を使用した香り高いエスプレッソ。',
      priceTaxIncl: '480.00',
      imageUrl: '/images/products/espresso.jpg',
      category: 'coffee',
      productType: ProductType.single,
      displayOrder: 10,
    },
    {
      id: 'prod-latte',
      name: '若葉ラテ',
      description: '自家製ハーブシロップで香り付けしたラテ。',
      priceTaxIncl: '580.00',
      imageUrl: '/images/products/latte.jpg',
      category: 'coffee',
      productType: ProductType.single,
      displayOrder: 20,
    },
    {
      id: 'prod-herb-tea',
      name: '森のハーブティー',
      description: 'カモミールとレモングラスのブレンドティー。',
      priceTaxIncl: '520.00',
      imageUrl: '/images/products/herb-tea.jpg',
      category: 'tea',
      productType: ProductType.single,
      displayOrder: 30,
    },
    {
      id: 'prod-panini',
      name: '薪火パニーニ',
      description: '季節野菜とモッツァレラを挟んだ温かいパニーニ。',
      priceTaxIncl: '760.00',
      imageUrl: '/images/products/panini.jpg',
      category: 'food',
      productType: ProductType.single,
      displayOrder: 40,
    },
    {
      id: 'prod-salad',
      name: '森の恵みサラダ',
      description: 'オーガニックリーフと季節の果物を使ったサラダ。',
      priceTaxIncl: '680.00',
      imageUrl: '/images/products/salad.jpg',
      category: 'food',
      productType: ProductType.single,
      displayOrder: 50,
    },
    {
      id: 'prod-brunch-set',
      name: '彩りブランチセット',
      description: 'ドリンクとフードを選べる人気のセットメニュー。',
      priceTaxIncl: '1280.00',
      imageUrl: '/images/products/brunch-set.jpg',
      category: 'set',
      productType: ProductType.set,
      displayOrder: 5,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        priceTaxIncl: new Prisma.Decimal(product.priceTaxIncl),
        imageUrl: product.imageUrl,
        category: product.category,
        productType: product.productType,
        isAvailable: true,
        displayOrder: product.displayOrder,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        priceTaxIncl: new Prisma.Decimal(product.priceTaxIncl),
        imageUrl: product.imageUrl,
        category: product.category,
        productType: product.productType,
        isAvailable: true,
        displayOrder: product.displayOrder,
      },
    })
  }
}

async function seedProductToppings() {
  const mappings = [
    { productId: 'prod-espresso', toppingId: 'top-extra-shot' },
    { productId: 'prod-latte', toppingId: 'top-extra-shot' },
    { productId: 'prod-latte', toppingId: 'top-oat-milk' },
    { productId: 'prod-herb-tea', toppingId: 'top-honey' },
    { productId: 'prod-panini', toppingId: 'top-gelato' },
  ]

  await prisma.productTopping.createMany({
    data: mappings,
    skipDuplicates: true,
  })
}

async function seedSetComponents() {
  const components = [
    {
      id: 'setcomp-brunch-drink-latte',
      setProductId: 'prod-brunch-set',
      componentProductId: 'prod-latte',
      slotName: 'ドリンク',
      required: true,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      extraPrice: '0.00',
      displayOrder: 1,
    },
    {
      id: 'setcomp-brunch-drink-herb',
      setProductId: 'prod-brunch-set',
      componentProductId: 'prod-herb-tea',
      slotName: 'ドリンク',
      required: true,
      minQty: 1,
      maxQty: 1,
      defaultQty: 0,
      extraPrice: '0.00',
      displayOrder: 2,
    },
    {
      id: 'setcomp-brunch-food-panini',
      setProductId: 'prod-brunch-set',
      componentProductId: 'prod-panini',
      slotName: 'メインプレート',
      required: true,
      minQty: 1,
      maxQty: 1,
      defaultQty: 1,
      extraPrice: '0.00',
      displayOrder: 1,
    },
    {
      id: 'setcomp-brunch-food-salad',
      setProductId: 'prod-brunch-set',
      componentProductId: 'prod-salad',
      slotName: 'メインプレート',
      required: true,
      minQty: 1,
      maxQty: 1,
      defaultQty: 0,
      extraPrice: '50.00',
      displayOrder: 2,
    },
  ]

  await prisma.setComponent.deleteMany({
    where: {
      setProductId: 'prod-brunch-set',
    },
  })

  for (const component of components) {
    await prisma.setComponent.create({
      data: {
        id: component.id,
        setProductId: component.setProductId,
        componentProductId: component.componentProductId,
        slotName: component.slotName,
        required: component.required,
        minQty: component.minQty,
        maxQty: component.maxQty,
        defaultQty: component.defaultQty,
        extraPrice: new Prisma.Decimal(component.extraPrice),
        displayOrder: component.displayOrder,
      },
    })
  }
}

async function seedTaxRates() {
  const taxRates = [
    {
      id: 'tax-2024-standard',
      rate: '10.00',
      effectiveFrom: new Date('2024-04-01T00:00:00+09:00'),
      createdBy: 'system',
    },
    {
      id: 'tax-2026-revision',
      rate: '11.00',
      effectiveFrom: new Date('2026-04-01T00:00:00+09:00'),
      createdBy: 'system',
    },
  ]

  for (const taxRate of taxRates) {
    await prisma.taxRateSchedule.upsert({
      where: { id: taxRate.id },
      update: {
        rate: new Prisma.Decimal(taxRate.rate),
        effectiveFrom: taxRate.effectiveFrom,
        createdBy: taxRate.createdBy,
      },
      create: {
        id: taxRate.id,
        rate: new Prisma.Decimal(taxRate.rate),
        effectiveFrom: taxRate.effectiveFrom,
        createdBy: taxRate.createdBy,
      },
    })
  }
}

async function main() {
  console.log('🌱 Seeding Ital Cafe database...')

  await seedUsers()
  await seedTables()
  await seedToppings()
  await seedProducts()
  await seedProductToppings()
  await seedSetComponents()
  await seedTaxRates()

  console.log('✅ Seeding completed successfully')
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
