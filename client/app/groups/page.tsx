import MainLayout from "@/components/layout/main-layout";
import GroupsList from "@/components/groups/groups-list";
<<<<<<< HEAD
=======
import GroupSuggestions from "@/components/groups/group-suggestions";
>>>>>>> 69c6d7991f4607d0c5fdd64960007e06e9065ac4
import CreateGroupButton from "@/components/groups/create-group-button";

export default function GroupsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Groups</h1>
          <CreateGroupButton />
        </div>

        <div>
          <GroupsList />
        </div>
      </div>
    </MainLayout>
  );
}