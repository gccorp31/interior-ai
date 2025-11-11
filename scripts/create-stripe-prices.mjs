import Stripe from 'stripe'

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('Missing STRIPE_SECRET_KEY')
    process.exit(1)
  }
  const stripe = new Stripe(key, { apiVersion: '2024-06-20' })

  // Create products
  const product10 = await stripe.products.create({ name: 'Pack Découverte (50 crédits)' })
  const product29 = await stripe.products.create({ name: 'Pack Pro (200 crédits)' })

  // Create prices (one-time)
  const price10 = await stripe.prices.create({
    currency: 'eur',
    unit_amount: 1000,
    product: product10.id,
  })
  const price29 = await stripe.prices.create({
    currency: 'eur',
    unit_amount: 2900,
    product: product29.id,
  })

  console.log('STRIPE_PRICE_10_EUR=', price10.id)
  console.log('STRIPE_PRICE_29_EUR=', price29.id)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})



