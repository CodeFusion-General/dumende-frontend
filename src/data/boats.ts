
export const boatListingData = [
  {
    id: 1,
    name: 'Azimut 42',
    type: 'Motorlu Yat',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.8,
    reviewCount: 36,
    capacity: 8,
    cabins: 3,
    price: 4500,
    priceUnit: 'günlük',
    location: 'Bodrum',
    features: ['Klima', 'Flybridge', 'Snorkel Ekipmanı', 'Wi-Fi'],
    year: 2019
  },
  {
    id: 2,
    name: 'Delphia 47',
    type: 'Yelkenli',
    image: 'https://images.unsplash.com/photo-1560507074-a0430992918b?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1560507074-a0430992918b?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1545566328-513ae14177c6?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.7,
    reviewCount: 29,
    capacity: 10,
    cabins: 4,
    price: 3800,
    priceUnit: 'günlük',
    location: 'Göcek',
    features: ['Klima', 'Snorkel Ekipmanı', 'Wi-Fi', 'Balık Tutma Ekipmanı'],
    year: 2020
  },
  {
    id: 3,
    name: 'Lagoon 42',
    type: 'Katamaran',
    image: 'https://images.unsplash.com/photo-1609436132311-e4b0c9220241?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1609436132311-e4b0c9220241?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1563290443-4e9beaff3ed4?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.9,
    reviewCount: 42,
    capacity: 12,
    cabins: 4,
    price: 5200,
    priceUnit: 'günlük',
    location: 'Fethiye',
    features: ['Klima', 'Jakuzi', 'Snorkel Ekipmanı', 'Wi-Fi'],
    year: 2021
  },
  {
    id: 4,
    name: 'Kaya Guneri V',
    type: 'Gulet',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1589469526983-0fdb7e38eff7?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.6,
    reviewCount: 31,
    capacity: 16,
    cabins: 6,
    price: 7800,
    priceUnit: 'günlük',
    location: 'Marmaris',
    features: ['Klima', 'Flybridge', 'Jet Ski', 'Wi-Fi'],
    year: 2018
  },
  {
    id: 5,
    name: 'Ferretti 680',
    type: 'Lüks Yat',
    image: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1614332686665-8406c61a4c59?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 5.0,
    reviewCount: 48,
    capacity: 12,
    cabins: 4,
    price: 12500,
    priceUnit: 'günlük',
    location: 'Bodrum',
    features: ['Klima', 'Jakuzi', 'Jet Ski', 'Wi-Fi'],
    year: 2022
  },
  {
    id: 6,
    name: 'Sea Ray 290',
    type: 'Sürat Teknesi',
    image: 'https://images.unsplash.com/photo-1575375767154-d7c4a71a0454?w=800&auto=format&fit=crop&q=60',
    images: [
      'https://images.unsplash.com/photo-1575375767154-d7c4a71a0454?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1592437111271-239fa8dcb553?w=800&auto=format&fit=crop&q=60'
    ],
    rating: 4.5,
    reviewCount: 22,
    capacity: 8,
    cabins: 1,
    price: 3500,
    priceUnit: 'günlük',
    location: 'Çeşme',
    features: ['Wi-Fi', 'Balık Tutma Ekipmanı', 'Snorkel Ekipmanı'],
    year: 2021
  }
];

export const boatTypes = [
  { value: 'Motorlu Yat', label: 'Motorlu Yat' },
  { value: 'Yelkenli', label: 'Yelkenli' },
  { value: 'Katamaran', label: 'Katamaran' },
  { value: 'Gulet', label: 'Gulet' },
  { value: 'Lüks Yat', label: 'Lüks Yat' },
  { value: 'Sürat Teknesi', label: 'Sürat Teknesi' }
];

export const locations = [
  'Bodrum', 'Göcek', 'Fethiye', 'Marmaris', 'Çeşme', 'Antalya', 'Kaş'
];

export const features = [
  'Klima',
  'Jakuzi',
  'Flybridge',
  'Snorkel Ekipmanı',
  'Jet Ski',
  'Balık Tutma Ekipmanı',
  'Wi-Fi'
];
