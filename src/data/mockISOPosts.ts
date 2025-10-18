// Shared mock ISO posts data
export interface ISOPost {
  id: string;
  author: string;
  authorImage: string;
  accountType: 'Single' | 'Couple';
  isVerified: boolean;
  isPremium: boolean;
  location: string;
  postedAt: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  responses: number;
}

export const mockISOPosts: ISOPost[] = [
  {
    id: '1',
    author: 'Alex & Jordan',
    authorImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
    accountType: 'Couple',
    isVerified: true,
    isPremium: true,
    location: 'Manhattan, NY',
    postedAt: '2 hours ago',
    title: 'Seeking adventurous couple for weekend getaway',
    content: 'Experienced lifestyle couple looking to connect with like-minded couples for a fun weekend trip to the Hamptons. We enjoy wine tasting, beach activities, and good conversation. Must be verified and within 30-45 age range.',
    tags: ['Couples', 'Travel', 'Social', 'Experienced'],
    likes: 24,
    responses: 12,
  },
  {
    id: '2',
    author: 'Emma',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    accountType: 'Single',
    isVerified: true,
    isPremium: false,
    location: 'Brooklyn, NY',
    postedAt: '5 hours ago',
    title: 'ISO: Couples for friendly connections',
    content: 'Single bi-curious female new to the lifestyle. Looking to meet respectful couples for social meetups first. Love dining out, art galleries, and meaningful conversations. Safety and respect are paramount.',
    tags: ['Singles', 'New', 'Social', 'Couples'],
    likes: 18,
    responses: 8,
  },
  {
    id: '3',
    author: 'Mike & Sarah',
    authorImage: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400',
    accountType: 'Couple',
    isVerified: true,
    isPremium: true,
    location: 'Queens, NY',
    postedAt: '1 day ago',
    title: 'Looking for lifestyle party friends',
    content: 'Fun, fit couple in our early 30s seeking other couples to attend lifestyle events with. We love the party scene and are looking to build a regular group. Must be drama-free and into having a good time!',
    tags: ['Parties', 'Social', 'Couples', 'Events'],
    likes: 31,
    responses: 15,
  },
  {
    id: '4',
    author: 'David',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    accountType: 'Single',
    isVerified: false,
    isPremium: false,
    location: 'Manhattan, NY',
    postedAt: '3 hours ago',
    title: 'Single male ISO couples or single females',
    content: 'Athletic professional looking for casual connections. Open to couples who are seeking a third or single women interested in no-strings fun. Clean, respectful, and very discreet.',
    tags: ['Singles', 'Casual', 'Discreet'],
    likes: 9,
    responses: 3,
  },
  {
    id: '5',
    author: 'Jessica & Tom',
    authorImage: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400',
    accountType: 'Couple',
    isVerified: true,
    isPremium: true,
    location: 'Long Island, NY',
    postedAt: '8 hours ago',
    title: 'ISO: Poly-friendly couples or singles',
    content: 'Open-minded couple exploring polyamory. We\'re looking for genuine connections with individuals or couples interested in building meaningful relationships. We value communication, honesty, and emotional connection alongside physical chemistry.',
    tags: ['Poly', 'Relationships', 'Couples', 'Singles'],
    likes: 22,
    responses: 11,
  },
  {
    id: '6',
    author: 'Rachel',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    accountType: 'Single',
    isVerified: true,
    isPremium: true,
    location: 'Brooklyn, NY',
    postedAt: '12 hours ago',
    title: 'Seeking sugar daddy arrangement',
    content: 'Attractive, intelligent woman seeking generous gentleman for mutually beneficial arrangement. I enjoy fine dining, travel, and intellectual conversation. Looking for someone who appreciates quality time and discretion.',
    tags: ['Sugar Daddy', 'Arrangement', 'Upscale'],
    likes: 15,
    responses: 21,
  },
];
