// src/app/groups/[id]/page.tsx
import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import GroupHeader from "@/components/groups/group-header";
import GroupTabs from "@/components/groups/group-tabs";
import GroupAbout from "@/components/groups/group-about";
import { groupApi, GroupDto } from "@/app/lib/groupApi";

interface GroupAboutPageProps {
  params: { id: string };
}

async function getGroup(id: string): Promise<GroupDto> {
  try {
    const group = await groupApi.getGroupById(Number.parseInt(id));
    return group;
  } catch (error: any) {
    console.error("Error fetching group:", error);
    throw new Error(error.message || "Không thể tải thông tin nhóm");
  }
}

export default async function GroupAboutPage({ params }: GroupAboutPageProps) {
  let group: GroupDto;

  try {
    group = await getGroup(params.id);
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
        <GroupAbout groupId={group.id} />
      </div>
    </MainLayout>
  );
}