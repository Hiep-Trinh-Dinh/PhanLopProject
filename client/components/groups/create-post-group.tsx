"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
import { useUserData } from "../../app/api/auth/me/useUserData";
import { PostApi } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/app/context/post-context";
import toast from "react-hot-toast";

interface MediaFile {
  file?: File;
  url: string;
  type: "IMAGE" | "VIDEO";
  fileName?: string;
}

interface CreatePostCardProps {
  groupId?: number; // Thêm prop groupId
}

export default function CreatePostCard({ groupId }: CreatePostCardProps) {
  const router = useRouter();
  const { triggerRefresh } = usePostContext();
  const [postText, setPostText] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "FRIENDS" | "ONLY_ME">("PUBLIC");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { userData, isLoading, error: userError } = useUserData();
  const maxLength = 500;
  const maxFiles = 4;
  const maxVideoSize = 100 * 1024 * 1024;

  const CLOUDINARY_CLOUD_NAME = "dv30m7ogs";
  const CLOUDINARY_UPLOAD_PRESET = "Thời trang";

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", "453473243322931");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Không thể upload ảnh lên Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (mediaFiles.length + files.length > maxFiles) {
      setError(`Bạn chỉ có thể thêm tối đa ${maxFiles} file.`);
      toast.error(`Bạn chỉ có thể thêm tối đa ${maxFiles} file.`);
      return;
    }

    const newMedia: MediaFile[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        try {
          const imageUrl = await uploadImageToCloudinary(file);
          newMedia.push({
            url: imageUrl,
            type: "IMAGE",
          });
        } catch (err) {
          setError("Lỗi khi upload ảnh lên Cloudinary");
          toast.error("Lỗi khi upload ảnh");
          return;
        }
      } else if (file.type.startsWith("video/")) {
        if (!file.type.match(/video\/(mp4|webm|ogg)/)) {
          setError("Chỉ hỗ trợ định dạng video MP4, WebM, hoặc OGG.");
          toast.error("Chỉ hỗ trợ định dạng video MP4, WebM, hoặc OGG.");
          return;
        }
        if (file.size > maxVideoSize) {
          setError(`Video ${file.name} quá lớn (${(file.size / (1024 * 1024)).toFixed(2)}MB). Kích thước tối đa là 100MB.`);
          toast.error(`Video quá lớn. Kích thước tối đa là 100MB.`);
          return;
        }
        newMedia.push({
          file,
          url: URL.createObjectURL(file),
          type: "VIDEO",
          fileName: file.name,
        });
      } else {
        setError("File không được hỗ trợ. Vui lòng chọn hình ảnh hoặc video.");
        toast.error("File không được hỗ trợ.");
        return;
      }
    }

    setMediaFiles((prev) => [...prev, ...newMedia]);
    setError(null);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (prev[index].type === "VIDEO") {
        URL.revokeObjectURL(prev[index].url);
      }
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && mediaFiles.length === 0) {
      setError("Vui lòng nhập nội dung hoặc thêm media.");
      toast.error("Vui lòng nhập nội dung hoặc thêm media.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      const postDto = {
        content: postText,
        privacy,
        media: mediaFiles
          .filter((media) => media.type === "IMAGE")
          .map((media) => ({
            mediaType: media.type,
            url: media.url,
          })),
        groupId: groupId || null,
      };

      formData.append("post", JSON.stringify(postDto));

      const videoFiles = mediaFiles.filter((m) => m.type === "VIDEO" && m.file);
      videoFiles.forEach((media, index) => {
        if (media.file) {
          formData.append(`media[${index}]`, media.file);
        }
      });

      const createdPost = await PostApi.create(formData);
      console.log("Post created:", createdPost);

      setPostText("");
      setMediaFiles([]);
      setPrivacy("PUBLIC");
      triggerRefresh();
      toast.success("Bài viết đã được đăng thành công!");
      router.refresh();
    } catch (err: any) {
      console.error("Error creating post:", err);
      let errorMessage = "Có lỗi xảy ra khi đăng bài";
      if (err.message) {
        if (err.message.includes("401")) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
          router.push("/login");
        } else if (err.message.includes("400")) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra nội dung hoặc media.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-white">Đang tải thông tin người dùng...</div>;
  }

  if (userError || !userData) {
    return (
      <div className="text-red-500">
        Lỗi khi tải thông tin người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-4">
          <div className="flex gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              {userData.image ? (
                <Image
                  src={userData.image}
                  alt={userData.username || "User"}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-700 text-white">
                  {userData.firstName?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white">
                  {userData.firstName} {userData.lastName} (@{userData.username})
                </span>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as "PUBLIC" | "FRIENDS" | "ONLY_ME")}
                  className="rounded-md border border-gray-800 bg-gray-800 px-2 py-1 text-sm text-white"
                  disabled={isSubmitting}
                  hidden
                >
                  <option value="PUBLIC">Công khai</option>
                </select>
              </div>
              <textarea
                placeholder="Bạn đang nghĩ gì?"
                className="min-h-[80px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={postText}
                onChange={(e) => setPostText(e.target.value.slice(0, maxLength))}
                disabled={isSubmitting}
              />
              <div className="mt-1 text-right text-sm text-gray-400">
                {postText.length}/{maxLength}
              </div>
            </div>
          </div>

          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaFiles.map((media, index) => (
                <div key={index} className="relative">
                  {media.type === "IMAGE" ? (
                    <Image
                      src={media.url}
                      alt="Preview"
                      width={150}
                      height={150}
                      className="h-24 w-full rounded-md object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="h-24 w-full rounded-md object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
                disabled={isSubmitting || mediaFiles.length >= maxFiles}
              >
                <ImageIcon className="mr-1 h-5 w-5" />
                Ảnh
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
                disabled={isSubmitting || mediaFiles.length >= maxFiles}
              >
                <Video className="mr-1 h-5 w-5" />
                Video
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/mp4,video/webm,video/ogg"
                multiple
                className="hidden"
                onChange={handleMediaChange}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                isSubmitting || (!postText.trim() && mediaFiles.length === 0)
                  ? "bg-gray-600 opacity-50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isSubmitting || (!postText.trim() && mediaFiles.length === 0)}
            >
              {isSubmitting ? (
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Đăng"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}