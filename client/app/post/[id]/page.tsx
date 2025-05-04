import { PostApi } from "@/app/lib/api";
import MainLayout from "@/components/layout/main-layout";
import PostDetail from "@/components/post/post-detail";
import Link from "next/dist/client/link";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{ id: string }>; // Định nghĩa params là Promise
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params; // Await params để lấy giá trị
  const id = Number(resolvedParams.id);

  if (isNaN(id)) {
    console.error(`Invalid post ID: ${resolvedParams.id}`);
    notFound();
    return null;
  }

  try {
    const post = await PostApi.getById(id);
    console.log(`Fetched post ${id}:`, post);
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl">
          <PostDetail post={post} />
        </div>
      </MainLayout>
    );
  } catch (error: any) {
    console.error(`Error fetching post ${id}:`, error);
    if (error.message.includes("Forbidden") || error.message.includes("permission")) {
      return (
        <MainLayout>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-white">Không có quyền truy cập</h1>
            <p className="text-gray-400">Bạn không có quyền xem bài đăng này.</p>
          </div>
        </MainLayout>
      );
    }
    if (error.message.includes("Unauthorized")) {
      return (
        <MainLayout>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-white">Vui lòng đăng nhập</h1>
            <p className="text-gray-400">
              Bạn cần đăng nhập để xem bài đăng này.{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </MainLayout>
      );
    }
    if (error.message.includes("Post not found")) {
      notFound();
    }
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-white">Lỗi hệ thống</h1>
          <p className="text-gray-400">Đã có lỗi xảy ra khi tải bài đăng. Vui lòng thử lại sau.</p>
        </div>
      </MainLayout>
    );
  }
}