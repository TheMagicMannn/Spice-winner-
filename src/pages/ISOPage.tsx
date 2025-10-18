import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, MapPin, Heart, ArrowLeft, Crown, Shield } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { mockISOPosts, ISOPost } from '@/data/mockISOPosts';

interface ISOPostCardProps {
  post: ISOPost;
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
