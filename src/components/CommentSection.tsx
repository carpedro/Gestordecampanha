import { useState } from 'react';
import { Send, Trash2, CornerDownRight } from 'lucide-react';
import { Comment } from '../types/comment';
import { User } from '../types/user';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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

interface CommentSectionProps {
  comments: Comment[];
  currentUser: User;
  onAddComment: (content: string, parentId?: string) => void;
  onDeleteComment: (id: string) => void;
}

export function CommentSection({ comments, currentUser, onAddComment, onDeleteComment }: CommentSectionProps) {
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
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Organize comments into threads
  const getRootComments = () => {
    return comments.filter(c => !c.parentId);
  };

  const getReplies = (parentId: string) => {
    return comments.filter(c => c.parentId === parentId);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const replies = getReplies(comment.id);
    const canDelete = comment.authorId === currentUser.id || currentUser.role === 'admin';
    const maxDepth = 3; // Maximum nesting level

    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mt-4'}>
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.authorAvatar} />
            <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setDeletingId(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>

            {/* Reply button */}
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-7 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <CornerDownRight className="w-3 h-3 mr-1" />
                Responder
              </Button>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-2 flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply(comment.id);
                    }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {replies.length > 0 && (
              <div className="mt-2">
                {replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* New comment form */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser.avatarUrl} />
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-2">
        {getRootComments().length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          getRootComments().map(comment => renderComment(comment))
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Comentário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
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
