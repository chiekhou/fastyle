'use strict';

const FREE_SHIPPING_THRESHOLD = 60;

const CARRIERS = {
  mondial_relay: {
    name: 'Mondial Relay',
    description: 'Livraison en point relais (3–5 jours ouvrés)',
    tiers: [
      { maxGrams: 250,  price: 5.50 },
      { maxGrams: 500,  price: 5.80 },
      { maxGrams: 1000, price: 6.50 },
      { maxGrams: 2000, price: 7.50 },
      { maxGrams: 5000, price: 9.50 },
    ],
  },
  colissimo: {
    name: 'Colissimo',
    description: 'Livraison à domicile (2–3 jours ouvrés)',
    tiers: [
      { maxGrams: 250,  price: 6.05 },
      { maxGrams: 500,  price: 6.55 },
      { maxGrams: 1000, price: 7.25 },
      { maxGrams: 2000, price: 8.50 },
      { maxGrams: 5000, price: 11.20 },
    ],
  },
};

const calculateShipping = (carrier, totalWeightGrams, subtotal) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const config = CARRIERS[carrier];
  if (!config) throw new Error(`Transporteur invalide : ${carrier}`);
  const tier =
    config.tiers.find((t) => totalWeightGrams <= t.maxGrams) ||
    config.tiers[config.tiers.length - 1];
  return tier.price;
};

module.exports = { CARRIERS, FREE_SHIPPING_THRESHOLD, calculateShipping };
