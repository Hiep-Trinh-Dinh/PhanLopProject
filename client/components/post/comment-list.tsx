"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Heart, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PostApi } from "@/app/lib/api";
import type { CommentDto } from "@/app/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại từ cookie hoặc local storage
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("Thông tin người dùng hiện tại:", userData);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await PostApi.comments.getByPostId(postId);
        console.log("Danh sách comments nhận được:", fetchedComments);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLikeComment = async (commentId: number) => {
    try {
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const updatedComments = [...comments];
      const comment = updatedComments[commentIndex];
      
      // Optimistic update
      const wasLiked = comment.liked;
      updatedComments[commentIndex] = {
        ...comment,
        liked: !wasLiked,
        totalLikes: wasLiked ? comment.totalLikes - 1 : comment.totalLikes + 1
      };
      setComments(updatedComments);

      // API call
      if (wasLiked) {
        // Gọi API unlike comment
      } else {
        // Gọi API like comment
      }
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const newReply = await PostApi.comments.createReply(postId, commentId, replyText);
      
      // Cập nhật state
      const updatedComments = [...comments];
      const parentCommentIndex = updatedComments.findIndex(c => c.id === commentId);
      
      if (parentCommentIndex !== -1) {
        if (!updatedComments[parentCommentIndex].replies) {
          updatedComments[parentCommentIndex].replies = [];
        }
        
        updatedComments[parentCommentIndex].replies!.push(newReply);
        updatedComments[parentCommentIndex].replyCount = (updatedComments[parentCommentIndex].replyCount || 0) + 1;
        setComments(updatedComments);
      }
      
      setReplyText("");
      setReplyingTo(null);
      toast({
        title: "Đã gửi phản hồi",
        description: "Phản hồi của bạn đã được đăng thành công.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Reply error:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi phản hồi",
        variant: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditComment = (comment: CommentDto) => {
    console.log("Bắt đầu chỉnh sửa comment với ID:", comment.id);
    console.log("Nội dung comment hiện tại:", comment.content);
    setEditingComment(comment.id);
    setEditText(comment.content);
    setShowDropdown(null);
  };

  const handleSubmitEdit = async (commentId: number) => {
    if (!editText.trim()) return;

    setIsSubmittingEdit(true);
    try {
      // Log thông tin chi tiết khi bắt đầu thực hiện edit
      console.log("=== Bắt đầu quá trình edit comment ===");
      console.log("Comment ID:", commentId, "- Kiểu:", typeof commentId);
      console.log("Nội dung mới:", editText);
      console.log("Current user:", currentUser);
      console.log("Current user ID:", currentUser?.id, "- Kiểu:", typeof currentUser?.id);
      
      // Chuyển đổi ID sang string rõ ràng
      const commentIdStr = String(commentId);
      console.log("Comment ID (string):", commentIdStr);
      
      // Gửi request lên server để cập nhật comment
      const updatedComment = await PostApi.comments.update(commentId, editText);
      console.log("Kết quả cập nhật từ server:", updatedComment);
      
      // Cập nhật state của bình luận gốc hoặc bình luận phản hồi
      // Vì cấu trúc comments có thể bao gồm cả replies nên cần xử lý đệ quy
      const updateCommentInList = (commentsList: CommentDto[]): CommentDto[] => {
        return commentsList.map(c => {
          // In thông tin cho debugging
          console.log(`Đang kiểm tra comment ${c.id} (${typeof c.id}) so với ${commentId} (${typeof commentId})`);
          
          // So sánh dạng string để đảm bảo không có vấn đề về kiểu dữ liệu
          const isMatchingComment = String(c.id) === String(commentId);
          console.log(`  - Khớp: ${isMatchingComment}`);
          
          // Nếu là bình luận đang cập nhật
          if (isMatchingComment) {
            console.log(`  - Cập nhật comment ${c.id}`);
            return {
              ...c,
              content: updatedComment.content,
              updatedAt: updatedComment.updatedAt
            };
          }
          
          // Nếu bình luận có replies, kiểm tra và cập nhật trong replies
          if (c.replies && c.replies.length > 0) {
            console.log(`  - Kiểm tra ${c.replies.length} replies của comment ${c.id}`);
            return {
              ...c,
              replies: updateCommentInList(c.replies)
            };
          }
          
          return c;
        });
      };
      
      setComments(prevComments => updateCommentInList(prevComments));
      setEditText("");
      setEditingComment(null);
      toast({
        title: "Đã cập nhật bình luận",
        description: "Bình luận của bạn đã được cập nhật thành công.",
        duration: 3000,
      });
    } catch (error) {
      console.error("=== Lỗi khi edit comment ===");
      console.error("Edit comment error:", error);
      // Hiển thị chi tiết lỗi để debug
      if (error instanceof Error) {
        console.error("Chi tiết lỗi:", error.message, error.stack);
      } else {
        console.error("Chi tiết lỗi không xác định:", error);
      }
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật bình luận",
        variant: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      // Log thông tin chi tiết khi bắt đầu thực hiện delete
      console.log("=== Bắt đầu quá trình xóa comment ===");
      console.log("Comment ID:", commentId, "- Kiểu:", typeof commentId);
      console.log("Current user:", currentUser);
      console.log("Current user ID:", currentUser?.id, "- Kiểu:", typeof currentUser?.id);
      
      // Chuyển đổi ID sang string rõ ràng
      const commentIdStr = String(commentId);
      console.log("Comment ID (string):", commentIdStr);
      
      // Tìm thông tin comment trước khi xóa để log
      const findComment = (comments: CommentDto[]): CommentDto | undefined => {
        for (const comment of comments) {
          if (String(comment.id) === commentIdStr) {
            return comment;
          }
          if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies);
            if (found) return found;
          }
        }
        return undefined;
      };
      
      const commentToDelete = findComment(comments);
      console.log("Comment sẽ bị xóa:", commentToDelete);
      
      if (commentToDelete) {
        console.log("Owner ID:", commentToDelete.user.id, "- Current user ID:", currentUser?.id);
        console.log("Là chủ sở hữu:", String(commentToDelete.user.id) === String(currentUser?.id));
      }
      
      // Gửi request lên server để xóa comment
      console.log("Đang gửi request xóa comment:", commentId);
      await PostApi.comments.delete(commentId);
      console.log("Xóa bình luận thành công, cập nhật UI");
      
      // Cập nhật state để xóa comment
      // Xử lý đệ quy để xóa comment ở cả danh sách gốc và trong replies
      const removeCommentFromList = (commentsList: CommentDto[]): CommentDto[] => {
        // Log thông tin chi tiết
        console.log(`Xử lý danh sách ${commentsList.length} comments để xóa comment ${commentId}`);
        
        // Loại bỏ comment khỏi danh sách hiện tại
        const filteredList = commentsList.filter(c => {
          const matches = String(c.id) === String(commentId);
          console.log(`Kiểm tra comment ${c.id} - trùng khớp: ${matches}`);
          return !matches;
        });
        
        console.log(`Còn lại ${filteredList.length} comments sau khi lọc`);
        
        // Kiểm tra và xử lý trong replies của từng comment còn lại
        return filteredList.map(c => {
          if (c.replies && c.replies.length > 0) {
            console.log(`Xử lý ${c.replies.length} replies của comment ${c.id}`);
            const filteredReplies = c.replies.filter(r => String(r.id) !== String(commentId));
            console.log(`Còn lại ${filteredReplies.length} replies sau khi lọc`);
            return {
              ...c,
              replies: filteredReplies,
              replyCount: filteredReplies.length
            };
          }
          return c;
        });
      };
      
      setComments(prevComments => removeCommentFromList(prevComments));
      
      toast({
        title: "Đã xóa bình luận",
        description: "Bình luận đã được xóa thành công.",
        duration: 3000,
      });
    } catch (error) {
      console.error("=== Lỗi khi xóa comment ===");
      console.error("Delete comment error:", error);
      // Hiển thị chi tiết lỗi để debug
      if (error instanceof Error) {
        console.error("Chi tiết lỗi xóa comment:", error.message, error.stack);
      } else {
        console.error("Chi tiết lỗi xóa comment không xác định:", error);
      }
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa bình luận",
        variant: "error",
        duration: 3000,
      });
    }
  };

  // Đảm bảo so sánh ID đúng định dạng
  const isSameUser = (commentUserId: number, currentUserId?: number): boolean => {
    if (!currentUserId) return false;
    // So sánh cả hai dưới dạng string để tránh vấn đề về kiểu dữ liệu
    return String(commentUserId) === String(currentUserId);
  };

  const renderComment = (comment: CommentDto, isReply = false) => {
    const isEdited = comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt);
    const isOwnComment = isSameUser(comment.user.id, currentUser?.id);
    
    // Thêm log để debug
    console.log(`Comment ID: ${comment.id}, content: "${comment.content.substring(0, 20)}..."`, 
                `User ID: ${comment.user.id}, Current User ID: ${currentUser?.id}`, 
                `Is own comment: ${isOwnComment}`, 
                `Is reply: ${isReply}`);

    return (
      <div key={comment.id} className={`space-y-3 ${isReply ? 'ml-8 mt-3' : ''}`}>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full">
              <Image
                src={comment.user.image || "/placeholder-user.jpg"}
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                // onError={(e) => {
                //   const target = e.target as HTMLImageElement;
                //   target.src = "/placeholder-user.jpg";
                // }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {editingComment === comment.id ? (
                <div className="mt-1">
                  <textarea
                    className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                      onClick={() => setEditingComment(null)}
                    >
                      Hủy
                    </button>
                    <button
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => handleSubmitEdit(comment.id)}
                      disabled={!editText.trim() || isSubmittingEdit}
                    >
                      {isSubmittingEdit ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/profile/${comment.user.username}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {comment.user.firstName} {comment.user.lastName}
                      </Link>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                        className="rounded-md p-1 hover:bg-gray-800"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {renderDropdownMenu(comment, isOwnComment)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                    <span>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      {isEdited && <span className="ml-1">(đã chỉnh sửa)</span>}
                    </span>
                    <button
                      className={`flex items-center space-x-1 ${comment.liked ? "text-blue-500" : "text-gray-400"}`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart className={`h-4 w-4 ${comment.liked ? "fill-blue-500" : ""}`} />
                      <span>{comment.totalLikes} Likes</span>
                    </button>
                    <button
                      className="flex items-center space-x-1 text-gray-400"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-4 w-4" />
                      <span>Trả lời</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className="ml-10 flex items-start space-x-2">
            <div className="h-7 w-7 flex-shrink-0 rounded-full">
              <Image
                src={currentUser?.profilePicture || "/placeholder-user.jpg"}
                alt="Your avatar"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
                // onError={(e) => {
                //   const target = e.target as HTMLImageElement;
                //   target.src = "/placeholder-user.jpg";
                // }}
              />
            </div>
            <div className="flex-1">
              <textarea
                placeholder={`Trả lời ${comment.user.firstName}...`}
                className="min-h-[60px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                  onClick={() => setReplyingTo(null)}
                >
                  Hủy
                </button>
                <button
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim() || isSubmittingReply}
                >
                  {isSubmittingReply ? "Đang gửi..." : "Trả lời"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị các replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const renderDropdownMenu = (comment: CommentDto, isOwnComment: boolean) => {
    if (showDropdown !== comment.id) return null;
    
    return (
      <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-800 bg-gray-900 shadow-lg">
        {isOwnComment && (
          <>
            <button 
              onClick={() => {
                console.log("Bắt đầu chỉnh sửa comment:", comment);
                handleEditComment(comment);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-800 hover:text-blue-400 transition-colors"
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa bình luận
            </button>
            <button 
              onClick={() => {
                console.log("Bắt đầu xóa comment:", comment);
                if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
                  handleDeleteComment(comment.id);
                  setShowDropdown(null);
                }
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-800 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa bình luận
            </button>
            <hr className="border-gray-800" />
          </>
        )}
        <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 transition-colors">
          Báo cáo bình luận
        </button>
      </div>
    );
  };

  const reloadComments = async () => {
    try {
      setLoading(true);
      console.log("Đang tải lại danh sách bình luận...");
      const fetchedComments = await PostApi.comments.getByPostId(postId);
      console.log("Danh sách comments đã tải lại:", fetchedComments);
      setComments(fetchedComments);
      toast({
        title: "Đã tải lại bình luận",
        description: "Danh sách bình luận đã được cập nhật.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Lỗi khi tải lại bình luận:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lại bình luận",
        variant: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Đang tải bình luận...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
        <p className="text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Bình luận ({comments.length})</h3>
        <button 
          onClick={reloadComments}
          className="rounded-md bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-700"
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Tải lại bình luận"}
        </button>
      </div>
      
      {/* Hiển thị các comment gốc và phản hồi */}
      <div className="space-y-4">
        {comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))}
      </div>
    </div>
  );
}