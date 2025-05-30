import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import MainLayout from "@/components/layout/main-layout";
import GroupHeader from "@/components/groups/group-header";
import GroupTabs from "@/components/groups/group-tabs";
import { groupApi, GroupDto } from "@/app/lib/groupApi";
import CreatePostCard from "@/components/groups/create-post-group";
import GroupPostFeed from "@/components/groups/group-posts";

interface GroupPageProps {
  params: { id: string };
}

async function getGroup(id: string): Promise<GroupDto> {
  try {
    const groupId = Number.parseInt(id, 10);
    if (isNaN(groupId)) {
      throw new Error("ID nhóm không hợp lệ");
    }
    console.log(`Fetching group with ID: ${groupId}`);

    // Lấy cookie auth_token từ request
    const cookieStore = cookies();
    const authToken = (await cookieStore).get("auth_token")?.value;

    const group = await groupApi.getGroupById(groupId, authToken);
    console.log("Group data received:", group);
    return group;
  } catch (error: any) {
    console.error("Lỗi khi lấy nhóm:", error);
    throw error;
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    console.error("Invalid group ID:", id);
    notFound();
  }

  try {
    const group: GroupDto = await getGroup(id);
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl">
          <GroupHeader groupId={group.id} />
          <GroupTabs groupId={group.id} />
          <div className="mb-6">
            <CreatePostCard groupId={group.id} />
          </div>
          <GroupPostFeed groupId={group.id} />
        </div>
      </MainLayout>
    );
  } catch (error: any) {
    console.error("Error in GroupPage:", error);
    if (error.message.includes("403")) {
      return (
        <MainLayout>
          <div className="mx-auto max-w-5xl">
            <p className="text-red-500">
              Bạn không có quyền xem nhóm này vì đây là nhóm riêng tư. Vui lòng đăng nhập hoặc tham gia nhóm.
            </p>
          </div>
        </MainLayout>
      );
    }
    if (error.message.includes("404")) {
      notFound();
    }
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl">
          <p className="text-red-500">
            Đã xảy ra lỗi khi tải nhóm: {error.message || "Vui lòng thử lại sau."}
          </p>
        </div>
      </MainLayout>
    );
  }
}