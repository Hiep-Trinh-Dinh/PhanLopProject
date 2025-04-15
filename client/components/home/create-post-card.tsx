"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, Smile, Video, X } from "lucide-react";
import { useUserData } from "../../app/api/auth/me/useUserData";
import { PostApi } from "@/app/lib/api";

interface MediaFile {
  file?: File; // Dùng cho video trước khi gửi lên server
  url: string; // URL từ Cloudinary (ảnh) hoặc object URL (video, để preview)
  type: "IMAGE" | "VIDEO";
  fileName?: string; // Lưu tên file cho video
}

export default function CreatePostCard() {
  const [postText, setPostText] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE" | "FRIENDS">("PUBLIC");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { userData, isLoading, error: userError } = useUserData();
  const maxLength = 500;

  const CLOUDINARY_CLOUD_NAME = "dv30m7ogs"; // Nên lưu trong .env
  const CLOUDINARY_UPLOAD_PRESET = "Thời trang"; // Nên lưu trong .env

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", "453473243322931"); // Lưu ý: Nên dùng proxy backend để bảo mật

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
          setError("Lỗi khi upload ảnh");
          return;
        }
      } else if (file.type.startsWith("video/")) {
        newMedia.push({
          file,
          url: URL.createObjectURL(file), // Tạm thời để preview
          type: "VIDEO",
          fileName: file.name,
        });
      }
    }

    setMediaFiles((prev) => [...prev, ...newMedia].slice(0, 4));
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && mediaFiles.length === 0) {
      setError("Vui lòng nhập nội dung hoặc thêm media.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      // Gửi PostDto dưới dạng JSON string
      const postDto = {
        content: postText,
        privacy: privacy,
        media: mediaFiles
          .filter((media) => media.type === "IMAGE") // Chỉ gửi URL cho ảnh
          .map((media) => ({
            mediaType: media.type,
            url: media.url,
          })),
      };
      console.log("PostDto being sent:", postDto);
      formData.append("post", JSON.stringify(postDto));

      // Gửi file video
      mediaFiles
        .filter((media) => media.type === "VIDEO" && media.file)
        .forEach((media, index) => {
          formData.append(`media[${index}]`, media.file!);
        });

      const createdPost = await PostApi.create(formData);
      console.log("Post created:", createdPost);

      // Reset form
      setPostText("");
      setMediaFiles([]);
      setPrivacy("PUBLIC");
    } catch (err: any) {
      console.error("Error creating post:", err);
      if (err.message.includes("401")) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.message.includes("400")) {
        setError("Nội dung không hợp lệ: " + err.message);
      } else {
        setError("Lỗi khi đăng bài: " + err.message);
      }
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
                  onError={() => (
                    <div className="flex h-full w-full items-center justify-center bg-gray-700 text-white">
                      {userData.firstName?.charAt(0) || "?"}
                    </div>
                  )}
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
                  onChange={(e) => setPrivacy(e.target.value as "PUBLIC" | "PRIVATE" | "FRIENDS")}
                  className="rounded-md border border-gray-800 bg-gray-800 px-2 py-1 text-sm text-white"
                  disabled={isSubmitting}
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="FRIENDS">Bạn bè</option>
                  <option value="PRIVATE">Chỉ mình tôi</option>
                </select>
              </div>
              <textarea
                placeholder="Bạn đang nghĩ gì?"
                className="min-h-[80px] w-full resize-none rounded-md border border-gray-800 bg-gray-800 p-2 text-white placeholder-gray-400"
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
                disabled={isSubmitting || mediaFiles.length >= 4}
              >
                <ImageIcon className="mr-1 h-5 w-5" />
                Ảnh
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
                disabled={isSubmitting || mediaFiles.length >= 4}
              >
                <Video className="mr-1 h-5 w-5" />
                Video
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaChange}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={(!postText.trim() && mediaFiles.length === 0) || isSubmitting}
            >
              {isSubmitting ? "Đang đăng..." : "Đăng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}