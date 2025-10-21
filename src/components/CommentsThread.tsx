import { useState } from 'react';
import { Send, Trash2, CornerDownRight, MessageSquare } from 'lucide-react';
import { Comment } from '../types/comment';
import { User } from '../types/user';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useIsMobile } from './ui/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CommentsThreadProps {
  comments: Comment[];
  currentUser: User;
  onAddComment: (content: string, parentId?: string) => void;
  onDeleteComment: (id: string) => void;
}

export function CommentsThread({
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
}: CommentsThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      onDeleteComment(deletingId);
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRootComments = () => {
    return comments.filter((c) => !c.parentId);
  };

  const getReplies = (parentId: string) => {
    return comments.filter((c) => c.parentId === parentId);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const replies = getReplies(comment.id);
    const canDelete =
      comment.authorId === currentUser.id || currentUser.role === 'admin';
    const maxDepth = 3;

    return (
      <div key={comment.id} className={depth > 0 ? 'ml-4 sm:ml-6 mt-2 sm:mt-3' : 'mt-3 sm:mt-4'}>
        <div className="flex gap-2">
          <Avatar className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback className="text-xs">
              {getInitials(comment.authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm truncate">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 flex-shrink-0"
                    onClick={() => setDeletingId(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>

            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-6 text-xs px-2"
                onClick={() => setReplyingTo(comment.id)}
              >
                <CornerDownRight className="w-3 h-3 mr-1" />
                Responder
              </Button>
            )}

            {replyingTo === comment.id && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="min-h-[60px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply(comment.id);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Comentar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-2 space-y-2">
                {replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const rootComments = getRootComments();
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'w-full' : 'w-96'} bg-white border-l flex flex-col h-full`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="text-sm">
            Comentários {comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="p-3 sm:p-4 border-b">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="w-full"
            size="sm"
          >
            <Send className="w-3 h-3 mr-2" />
            {isMobile ? 'Comentar' : 'Adicionar comentário'}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {rootComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-blue-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                Seja a primeira pessoa a contribuir com a campanha
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rootComments.map((comment) => renderComment(comment))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Comentário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
