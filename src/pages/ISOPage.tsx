import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, MapPin, Heart, ArrowLeft, Crown, Shield, Plus, Search } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { isoPostService, ISOPost, SEEKING_TYPE_OPTIONS } from '@/services/isoPostService';
import { CreateISOPostModal } from '@/components/CreateISOPostModal';

interface ISOPostCardProps {
  post: ISOPost;
  onClick: () => void;
  onAuthorClick: (authorId: string) => void;
}

function ISOPostCard({ post, onClick, onAuthorClick }: ISOPostCardProps) {
  const getDisplayName = () => {
    if (post.account_type === 'couple' && post.display_name2) {
      return `${post.display_name || 'User'} & ${post.display_name2}`;
    }
    return post.display_name || 'User';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className={`${spiceTheme.components.card} p-5 animate-fade-in hover:border-pink-500/50 transition-all duration-300 cursor-pointer`}
      data-testid={`iso-post-${post.id}`}
    >
      {/* Author Info */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAuthorClick(post.author_id);
          }}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          data-testid={`author-link-${post.id}`}
        >
          <div className="relative">
            <img
              src={post.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400'}
              alt={getDisplayName()}
              className="w-12 h-12 rounded-full object-cover"
            />
            {post.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${spiceTheme.components.text.gradient}`}>
                {getDisplayName()}
              </h3>
              {post.membership_tier === 'vip' && <Crown className="h-4 w-4 text-yellow-400 fill-current" />}
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <Badge className={`text-xs ${spiceTheme.components.badge.pink}`}>
                {post.account_type === 'couple' ? 'Couple' : 'Single'}
              </Badge>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Post Content - Clickable */}
      <div className="space-y-3" onClick={onClick}>
        <h4 className="text-white font-semibold text-lg">{post.title}</h4>
        <p className="text-white/80 text-sm leading-relaxed line-clamp-3">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                className="bg-pink-500/10 text-pink-300 border-pink-500/30 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > 4 && (
              <Badge className="bg-white/5 text-white/60 border-white/20 text-xs">
                +{post.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-sm text-white/60">
          <MapPin className="h-4 w-4 mr-1 text-pink-400" />
          <span>{post.location}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10" onClick={onClick}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-white/60">
            <Heart className="h-4 w-4" />
            <span>{post.likes_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-white/60">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count || 0} comments</span>
          </div>
        </div>
        <Button 
          className={`${spiceTheme.components.button.gradient} text-sm px-4 py-2`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Post
        </Button>
      </div>
    </Card>
  );
}

export const ISOPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ISOPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const postsData = await isoPostService.getAllPosts();
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading ISO posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    content: string;
    location: string;
    tags: string[];
  }) => {
    if (!user) return;

    try {
      await isoPostService.createPost(user.id, data);
      await loadPosts(); // Reload posts
    } catch (error) {
      console.error('Error creating ISO post:', error);
      throw error;
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/iso/${postId}`);
  };

  const handleAuthorClick = (authorId: string) => {
    navigate(`/user/${authorId}`);
  };

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <Spinner />
      </SpiceBackground>
    );
  }

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
        {user && (
          <Button 
            className={spiceTheme.components.button.gradient}
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="create-iso-post-button"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create
          </Button>
        )}
      </div>

      {/* ISO Posts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-16 w-16 text-pink-400/50 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No ISO Posts Yet</h3>
            <p className="text-white/60 mb-4">Be the first to share what you're looking for!</p>
            {user && (
              <Button 
                className={spiceTheme.components.button.gradient}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          posts.map((post, index) => (
            <div 
              key={post.id} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ISOPostCard 
                post={post} 
                onClick={() => handlePostClick(post.id)}
                onAuthorClick={handleAuthorClick}
              />
            </div>
          ))
        )}
      </div>

      {/* Create ISO Post Modal */}
      {user && (
        <CreateISOPostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
          mode="create"
        />
      )}

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
