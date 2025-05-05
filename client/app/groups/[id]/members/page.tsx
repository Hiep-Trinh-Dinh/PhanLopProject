import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import MainLayout from "@/components/layout/main-layout";
import GroupHeader from "@/components/groups/group-header";
import GroupTabs from "@/components/groups/group-tabs";
import GroupMembers from "@/components/groups/group-members";
import { groupApi, GroupDto } from "@/app/lib/groupApi";

interface GroupMembersPageProps {
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
    return group;
  } catch (error: any) {
    console.error("Lỗi khi lấy nhóm:", error);
    throw error;
  }
}

export default async function GroupMembersPage({ params }: GroupMembersPageProps) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    console.error("Invalid group ID:", id);
    notFound();
  }

  let group: GroupDto;
  try {
    group = await getGroup(id);
  } catch (error: any) {
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

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <GroupHeader groupId={group.id} />
        <GroupTabs groupId={group.id} />
        <GroupMembers groupId={group.id} privacy={group.privacy} isAdmin={group.isAdmin ?? false} />
      </div>
    </MainLayout>
  );
}