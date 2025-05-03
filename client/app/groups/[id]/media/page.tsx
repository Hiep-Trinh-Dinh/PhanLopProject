// src/app/groups/[id]/media/page.tsx
import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import GroupHeader from "@/components/groups/group-header";
import GroupTabs from "@/components/groups/group-tabs";
import GroupMedia from "@/components/groups/group-media";
import { groupApi, GroupDto } from "@/app/lib/groupApi";

interface GroupMediaPageProps {
  params: { id: string };
}

async function getGroup(id: string): Promise<GroupDto> {
  try {
    const groupId = Number.parseInt(id, 10);
    if (isNaN(groupId)) {
      throw new Error("ID nhóm không hợp lệ");
    }
    const group = await groupApi.getGroupById(groupId);
    return group;
  } catch (error: any) {
    console.error("Lỗi khi lấy nhóm:", error);
    throw error;
  }
}

export default async function GroupMediaPage({ params }: GroupMediaPageProps) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
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
        <GroupMedia groupId={group.id} />
      </div>
    </MainLayout>
  );
}