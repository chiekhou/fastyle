export const FREE_THRESHOLD = 60;

export const CARRIERS = {
  mondial_relay: {
    id: 'mondial_relay',
    name: 'Mondial Relay',
    description: 'Point relais — 3 à 5 jours ouvrés',
    note: 'Vous serez contacté pour choisir votre point relais.',
    tiers: [
      { maxGrams: 250,  price: 5.50 },
      { maxGrams: 500,  price: 5.80 },
      { maxGrams: 1000, price: 6.50 },
      { maxGrams: 2000, price: 7.50 },
      { maxGrams: 5000, price: 9.50 },
    ],
  },
  colissimo: {
    id: 'colissimo',
    name: 'Colissimo',
    description: 'Livraison à domicile — 2 à 3 jours ouvrés',
    note: null,
    tiers: [
      { maxGrams: 250,  price: 6.05 },
      { maxGrams: 500,  price: 6.55 },
      { maxGrams: 1000, price: 7.25 },
      { maxGrams: 2000, price: 8.50 },
      { maxGrams: 5000, price: 11.20 },
    ],
  },
};

export const getShippingCost = (carrierId, totalWeightGrams, subtotal) => {
  if (subtotal >= FREE_THRESHOLD) return 0;
  const carrier = CARRIERS[carrierId];
  if (!carrier) return 0;
  const tier =
    carrier.tiers.find((t) => totalWeightGrams <= t.maxGrams) ||
    carrier.tiers[carrier.tiers.length - 1];
  return tier.price;
};
