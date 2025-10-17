import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, MapPin, Heart, Clock, ArrowLeft, Crown, Shield } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

// Mock ISO posts data
const mockISOPosts = [
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

interface ISOPostCardProps {
  post: typeof mockISOPosts[0];
}

function ISOPostCard({ post }: ISOPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className={`${spiceTheme.components.card} p-5 animate-fade-in hover:border-pink-500/50 transition-all duration-300`}>
      {/* Author Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={post.authorImage}
              alt={post.author}
              className="w-12 h-12 rounded-full object-cover"
            />
            {post.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${spiceTheme.components.text.gradient}`}>{post.author}</h3>
              {post.isPremium && <Crown className="h-4 w-4 text-yellow-400 fill-current" />}
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <Badge className={`text-xs ${spiceTheme.components.badge.pink}`}>
                {post.accountType}
              </Badge>
              <span>•</span>
              <span>{post.postedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold text-lg">{post.title}</h4>
        <p className="text-white/80 text-sm leading-relaxed">{post.content}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-pink-500/10 text-pink-300 border-pink-500/30 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-white/60">
          <MapPin className="h-4 w-4 mr-1 text-pink-400" />
          <span>{post.location}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center space-x-1 text-sm text-white/60 hover:text-pink-400 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
            <span>{post.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <div className="flex items-center space-x-1 text-sm text-white/60">
            <MessageSquare className="h-4 w-4" />
            <span>{post.responses} responses</span>
          </div>
        </div>
        <Button className={`${spiceTheme.components.button.gradient} text-sm px-4 py-2`}>
          Respond
        </Button>
      </div>
    </Card>
  );
}

export const ISOPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SpiceBackground className="min-h-screen flex flex-col pb-20">
      {/* Header with Back Button */}
      <div className={`${spiceTheme.components.header} flex items-center justify-between`}>
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="mr-3 text-pink-400 hover:bg-pink-500/10 p-2"
            data-testid="back-to-community-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>ISO Posts</h1>
            <p className={spiceTheme.components.text.subtitle}>In Search Of - Connect with what you're looking for</p>
          </div>
        </div>
        <Button className={spiceTheme.components.button.gradient}>
          Create Post
        </Button>
      </div>

      {/* ISO Posts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockISOPosts.map((post, index) => (
          <div 
            key={post.id} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ISOPostCard post={post} />
          </div>
        ))}

        {/* Empty State (if no posts) */}
        {mockISOPosts.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No ISO Posts Yet</h3>
            <p className="text-white/60 mb-4">Be the first to share what you're looking for!</p>
            <Button className={spiceTheme.components.button.gradient}>
              Create First Post
            </Button>
          </div>
        )}
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
