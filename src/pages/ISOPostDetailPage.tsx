import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  MapPin, 
  Shield, 
  Crown, 
  Edit, 
  Trash2,
  Loader2,
  Send
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { isoPostService, ISOPost, ISOComment, ISOLike } from '@/services/isoPostService';
import { CreateISOPostModal } from '@/components/CreateISOPostModal';
import { useToast } from '@/hooks/useToast';

export const ISOPostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<ISOPost | null>(null);
  const [comments, setComments] = useState<ISOComment[]>([]);
  const [likes, setLikes] = useState<ISOLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [commentLikedByUser, setCommentLikedByUser] = useState<Record<string, boolean>>({});
  const [commentReplies, setCommentReplies] = useState<Record<string, any[]>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPostDetails();
    }
  }, [postId]);

  const loadPostDetails = async () => {
    if (!postId) return;
    
    setIsLoading(true);
    try {
      const [postData, commentsData, likesData] = await Promise.all([
        isoPostService.getPostById(postId),
        isoPostService.getPostComments(postId),
        isoPostService.getPostLikes(postId)
      ]);

      if (!postData) {
        navigate('/iso');
        return;
      }

      setPost(postData);
      setComments(commentsData);
      setLikes(likesData);

      // Check if current user has liked the post
      if (user) {
        const userLiked = await isoPostService.hasUserLikedPost(postId, user.id);
        setIsLiked(userLiked);
        
        // Load comment likes and replies for each comment
        const likesMap: Record<string, number> = {};
        const likedMap: Record<string, boolean> = {};
        const repliesMap: Record<string, any[]> = {};
        
        for (const comment of commentsData) {
          const [likesCount, userLiked, replies] = await Promise.all([
            isoPostService.getCommentLikesCount(comment.id),
            isoPostService.hasUserLikedComment(comment.id, user.id),
            isoPostService.getCommentReplies(comment.id)
          ]);
          
          likesMap[comment.id] = likesCount;
          likedMap[comment.id] = userLiked;
          repliesMap[comment.id] = replies;
        }
        
        setCommentLikes(likesMap);
        setCommentLikedByUser(likedMap);
        setCommentReplies(repliesMap);
      }
    } catch (error) {
      console.error('Error loading post details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !postId) return;

    try {
      if (isLiked) {
        await isoPostService.unlikePost(postId, user.id);
        setIsLiked(false);
        setLikes(likes.filter(like => like.user_id !== user.id));
      } else {
        await isoPostService.likePost(postId, user.id);
        setIsLiked(true);
        // Reload likes to get the full data
        const likesData = await isoPostService.getPostLikes(postId);
        setLikes(likesData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !postId || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await isoPostService.addComment(postId, user.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditPost = async (data: {
    title: string;
    content: string;
    location: string;
    tags: string[];
    seeking_type: string[];
  }) => {
    if (!user || !postId) return;

    try {
      await isoPostService.updatePost(postId, user.id, data);
      await loadPostDetails(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleDeletePost = async () => {
    if (!user || !postId || !post) {
      toast({
        title: 'Error',
        description: 'Unable to delete post. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await isoPostService.deletePost(postId, user.id);
      
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
        variant: 'success'
      });
      
      // Navigate after a short delay to let the user see the success message
      setTimeout(() => {
        navigate('/iso');
      }, 500);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      
      // Show detailed error message to user
      const errorMessage = error?.message || 'Failed to delete post. Please try again.';
      toast({
        title: 'Deletion Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return;

    try {
      const isLiked = commentLikedByUser[commentId];
      
      if (isLiked) {
        await isoPostService.unlikeComment(commentId, user.id);
        setCommentLikedByUser({ ...commentLikedByUser, [commentId]: false });
        setCommentLikes({ ...commentLikes, [commentId]: (commentLikes[commentId] || 1) - 1 });
      } else {
        await isoPostService.likeComment(commentId, user.id);
        setCommentLikedByUser({ ...commentLikedByUser, [commentId]: true });
        setCommentLikes({ ...commentLikes, [commentId]: (commentLikes[commentId] || 0) + 1 });
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const reply = await isoPostService.addCommentReply(commentId, user.id, replyContent.trim());
      
      // Update replies state
      setCommentReplies({
        ...commentReplies,
        [commentId]: [...(commentReplies[commentId] || []), reply]
      });
      
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies({
      ...showReplies,
      [commentId]: !showReplies[commentId]
    });
  };

  const handleAuthorClick = () => {
    if (post?.author_id) {
      navigate(`/user/${post.author_id}`);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const getDisplayName = () => {
    if (!post) return '';
    if (post.account_type === 'couple' && post.display_name2) {
      return `${post.display_name || 'User'} & ${post.display_name2}`;
    }
    return post.display_name || 'User';
  };

  const getAuthorDetails = () => {
    if (!post) return '';
    const details = [];
    
    if (post.age) {
      if (post.account_type === 'couple' && post.age2) {
        details.push(`${post.age} & ${post.age2}`);
      } else {
        details.push(`${post.age}`);
      }
    }
    
    if (post.gender) {
      if (post.account_type === 'couple' && post.gender2) {
        details.push(`${post.gender}/${post.gender2}`);
      } else {
        details.push(post.gender);
      }
    }
    
    if (post.orientation) {
      if (post.account_type === 'couple' && post.orientation2) {
        details.push(`${post.orientation}/${post.orientation2}`);
      } else {
        details.push(post.orientation);
      }
    }
    
    return details.join(' • ');
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

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <Spinner />
      </SpiceBackground>
    );
  }

  if (!post) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Post not found</h2>
          <Button onClick={() => navigate('/iso')} className={spiceTheme.components.button.primary}>
            Back to ISO Posts
          </Button>
        </div>
      </SpiceBackground>
    );
  }

  const isAuthor = user?.id === post.author_id;

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={`${spiceTheme.components.header} flex items-center justify-between`}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-pink-400 hover:bg-pink-500/10 p-2"
          data-testid="back-button"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        
        {isAuthor && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className={spiceTheme.components.button.secondary}
              size="sm"
              data-testid="edit-post-button"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDeletePost}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              disabled={isDeleting}
              data-testid="delete-post-button"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Post Card */}
        <Card className={spiceTheme.components.card}>
          <div className="p-6 space-y-4">
            {/* Author */}
            <button
              onClick={handleAuthorClick}
              className="flex items-start space-x-3 hover:opacity-80 transition-opacity w-full text-left"
              data-testid="author-profile-link"
            >
              <div className="relative">
                <img
                  src={post.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400'}
                  alt={getDisplayName()}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {post.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold text-lg ${spiceTheme.components.text.gradient}`}>
                    {getDisplayName()}
                  </h3>
                  {post.membership_tier === 'vip' && (
                    <Crown className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Badge className={`text-xs ${spiceTheme.components.badge.pink}`}>
                      {post.account_type === 'couple' ? 'Couple' : 'Single'}
                    </Badge>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                  {getAuthorDetails() && (
                    <div className="text-sm text-white/50">
                      {getAuthorDetails()}
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Seeking Type Badges */}
            {post.seeking_type && post.seeking_type.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.seeking_type.map((type) => (
                  <Badge
                    key={type}
                    className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-white">{post.title}</h1>

            {/* Content */}
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-pink-500/10 text-pink-300 border-pink-500/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-white/70">
              <MapPin className="h-4 w-4 mr-2 text-pink-400" />
              <span>{post.location}</span>
            </div>

            {/* Like/Comment Stats */}
            <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
              <button
                onClick={handleLikeToggle}
                className="flex items-center space-x-2 text-white/60 hover:text-pink-400 transition-colors"
                data-testid="like-button"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                <span className="font-semibold">{likes.length}</span>
              </button>
              <div className="flex items-center space-x-2 text-white/60">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">{comments.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Likes Section */}
        {likes.length > 0 && (
          <Card className={spiceTheme.components.card}>
            <div className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-400" />
                Liked by {likes.length} {likes.length === 1 ? 'person' : 'people'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {likes.map((like) => (
                  <button
                    key={like.id}
                    onClick={() => handleUserClick(like.user_id)}
                    className="flex items-center space-x-2 bg-white/5 rounded-full pr-4 hover:bg-white/10 transition-all"
                    data-testid={`like-user-${like.user_id}`}
                  >
                    <img
                      src={like.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100'}
                      alt={like.display_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-white text-sm">
                      {like.account_type === 'couple' && like.display_name2
                        ? `${like.display_name} & ${like.display_name2}`
                        : like.display_name || 'User'}
                    </span>
                    {like.is_verified && <Shield className="h-4 w-4 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Comments Section */}
        <Card className={spiceTheme.components.card}>
          <div className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-pink-400" />
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            {user && (
              <div className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40 mb-3"
                  rows={3}
                  maxLength={500}
                  data-testid="comment-input"
                />
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-xs">{newComment.length}/500</span>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className={spiceTheme.components.button.gradient}
                    data-testid="submit-comment-button"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-white/50 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white/5 rounded-lg p-4" data-testid={`comment-${comment.id}`}>
                    <div className="flex items-start space-x-3">
                      <button onClick={() => handleUserClick(comment.user_id)}>
                        <img
                          src={comment.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100'}
                          alt={comment.display_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-pink-400 transition-all"
                        />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={() => handleUserClick(comment.user_id)}
                            className="font-semibold text-white hover:text-pink-400 transition-colors"
                          >
                            {comment.account_type === 'couple' && comment.display_name2
                              ? `${comment.display_name} & ${comment.display_name2}`
                              : comment.display_name || 'User'}
                          </button>
                          {comment.is_verified && <Shield className="h-4 w-4 text-blue-400" />}
                          <Badge className="text-xs bg-pink-500/20 text-pink-400 border-pink-500/30">
                            {comment.account_type === 'couple' ? 'Couple' : 'Single'}
                          </Badge>
                        </div>
                        <p className="text-white/80 leading-relaxed mb-2">{comment.content}</p>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-white/50">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                          
                          {user && (
                            <>
                              <button
                                onClick={() => handleCommentLike(comment.id)}
                                className="flex items-center space-x-1 text-white/60 hover:text-pink-400 transition-colors"
                                data-testid={`like-comment-${comment.id}`}
                              >
                                <Heart className={`h-4 w-4 ${commentLikedByUser[comment.id] ? 'fill-pink-400 text-pink-400' : ''}`} />
                                <span>{commentLikes[comment.id] || 0}</span>
                              </button>
                              
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-white/60 hover:text-pink-400 transition-colors"
                                data-testid={`reply-comment-${comment.id}`}
                              >
                                Reply
                              </button>
                              
                              {commentReplies[comment.id] && commentReplies[comment.id].length > 0 && (
                                <button
                                  onClick={() => toggleReplies(comment.id)}
                                  className="text-white/60 hover:text-pink-400 transition-colors"
                                >
                                  {showReplies[comment.id] ? 'Hide' : 'Show'} {commentReplies[comment.id].length} {commentReplies[comment.id].length === 1 ? 'reply' : 'replies'}
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/5"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyContent.trim()}
                                size="sm"
                                className={spiceTheme.components.button.gradient}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies List */}
                        {showReplies[comment.id] && commentReplies[comment.id] && commentReplies[comment.id].length > 0 && (
                          <div className="mt-3 ml-6 space-y-3 border-l-2 border-pink-500/30 pl-4">
                            {commentReplies[comment.id].map((reply: any) => (
                              <div key={reply.id} className="bg-black/40 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <button onClick={() => handleUserClick(reply.user_id)}>
                                    <img
                                      src={reply.photos?.[0] || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100'}
                                      alt={reply.display_name || 'User'}
                                      className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-pink-400 transition-all"
                                    />
                                  </button>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <button
                                        onClick={() => handleUserClick(reply.user_id)}
                                        className="font-semibold text-white text-sm hover:text-pink-400 transition-colors"
                                      >
                                        {reply.account_type === 'couple' && reply.display_name2
                                          ? `${reply.display_name} & ${reply.display_name2}`
                                          : reply.display_name || 'User'}
                                      </button>
                                      {reply.is_verified && <Shield className="h-3 w-3 text-blue-400" />}
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{reply.content}</p>
                                    <span className="text-white/50 text-xs mt-1 block">
                                      {formatTimeAgo(reply.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {isAuthor && (
        <CreateISOPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditPost}
          initialData={post}
          mode="edit"
        />
      )}

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
