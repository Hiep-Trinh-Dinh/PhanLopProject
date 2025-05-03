import MainLayout from "@/components/layout/main-layout";
import GroupsList from "@/components/groups/groups-list";
import GroupSuggestions from "@/components/groups/group-suggestions";
import CreateGroupButton from "@/components/groups/create-group-button";

export default function GroupsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Groups</h1>
          <CreateGroupButton />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <GroupsList />
          </div>
          <div>
            <GroupSuggestions />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}