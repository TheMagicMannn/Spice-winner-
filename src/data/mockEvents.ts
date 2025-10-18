// Shared mock events data
export interface User {
  id: string;
  name: string;
  image: string;
  isVerified: boolean;
  accountType: 'Single' | 'Couple';
  age?: number;
  location?: string;
  bio?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  attendees: number;
  maxCapacity: number;
  isVipOnly: boolean;
  price: number;
  description: string;
  category: string;
  attendeeList?: User[];
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Luxury Rooftop Mixer',
    date: '2025-08-22',
    time: '8:00 PM - 12:00 AM',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600',
    attendees: 45,
    maxCapacity: 80,
    isVipOnly: true,
    price: 75,
    description: 'Join us for an exclusive evening of sophisticated connections at one of Manhattan\'s premier rooftop venues. Experience breathtaking city views, premium cocktails, and an intimate atmosphere perfect for making meaningful connections.',
    category: 'Social Mixer',
  },
  {
    id: '2',
    title: 'Wine & Dine Experience',
    date: '2025-08-25',
    time: '7:00 PM - 10:00 PM',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
    attendees: 28,
    maxCapacity: 40,
    isVipOnly: false,
    price: 50,
    description: 'An intimate dinner experience featuring fine wines and gourmet cuisine in a private setting. Our sommelier will guide you through a curated wine tasting paired with artisanal dishes.',
    category: 'Dining',
  },
  {
    id: '3',
    title: 'Lifestyle Lounge Weekend',
    date: '2025-08-29',
    time: '9:00 PM - 2:00 AM',
    location: 'Queens, NY',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    attendees: 62,
    maxCapacity: 100,
    isVipOnly: true,
    price: 100,
    description: 'Our signature weekend event featuring multiple themed rooms, live entertainment, and exclusive play areas. A safe, welcoming environment for exploring your lifestyle journey.',
    category: 'Lifestyle Party',
  },
  {
    id: '4',
    title: 'Beach Club Day Party',
    date: '2025-09-01',
    time: '12:00 PM - 6:00 PM',
    location: 'Long Island, NY',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    attendees: 35,
    maxCapacity: 60,
    isVipOnly: false,
    price: 60,
    description: 'Summer vibes with cocktails, music, and mingling by the water at an exclusive beach club. Enjoy poolside lounging, water activities, and sunset views.',
    category: 'Outdoor',
  },
  {
    id: '5',
    title: 'Masquerade Ball',
    date: '2025-09-05',
    time: '8:00 PM - 1:00 AM',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
    attendees: 88,
    maxCapacity: 120,
    isVipOnly: true,
    price: 125,
    description: 'An elegant masked ball featuring live music, champagne, and mystery connections in a stunning ballroom. Dress code: formal attire with masks required.',
    category: 'Formal Event',
  },
  {
    id: '6',
    title: 'Speed Dating Night',
    date: '2025-09-08',
    time: '7:30 PM - 10:00 PM',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
    attendees: 22,
    maxCapacity: 30,
    isVipOnly: false,
    price: 35,
    description: 'Fast-paced, fun evening of quick connections with like-minded singles and couples. Multiple rounds of 5-minute dates followed by mixer time.',
    category: 'Speed Dating',
  },
];
