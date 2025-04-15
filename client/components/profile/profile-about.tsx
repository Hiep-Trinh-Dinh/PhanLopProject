"use client";

import { Briefcase, GraduationCap, Heart, Home, MapPin, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserData } from "../../app/api/auth/me/useUserData";

interface ProfileAboutProps {
  userId: number;
}

interface WorkExperience {
  id: number;
  position: string;
  company: string;
  current: boolean;
  startYear: number;
  endYear: number | null;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  current: boolean;
  startYear: number;
  endYear: number | null;
}

interface UserData {
  workExperiences?: WorkExperience[];
  educations?: Education[];
  email_contact?: string;
  phone_contact?: string;
  website?: string;
  currentCity?: string;
  hometown?: string;
  updatedAt?: string;
  relationshipStatus?: "SINGLE" | "IN_RELATIONSHIP" | "MARRIED" | "COMPLICATED" | null;
}

// Hàm cập nhật dữ liệu người dùng
const updateUserData = async (data: UserData): Promise<UserData> => {
  const response = await fetch("http://localhost:8080/api/users/update", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 401) throw new Error("Unauthorized: Please log in again");
    if (response.status === 400) throw new Error(errorData.errorMessage || "Invalid data provided");
    if (response.status === 404) throw new Error("User not found");
    throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function ProfileAbout({ userId }: ProfileAboutProps) {
  const [editData, setEditData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Sử dụng hook useUserData để load dữ liệu
  const { userData, isLoading, error: fetchError } = useUserData();

  // Đồng bộ editData với userData khi dữ liệu thay đổi
  useEffect(() => {
    if (userData && !isEditing) {
      setEditData(JSON.parse(JSON.stringify(userData)));
    }
  }, [userData, isEditing]);

  // Mutation để cập nhật dữ liệu
  const updateMutation = useMutation({
    mutationFn: updateUserData,
    onMutate: async (newData) => {
      // Hủy các query đang chạy để tránh xung đột
      await queryClient.cancelQueries({ queryKey: ["userData", userId] });
      const previousData = queryClient.getQueryData(["userData", userId]);

      // Optimistic update
      queryClient.setQueryData(["userData", userId], (old: UserData | undefined) => ({
        ...old,
        ...newData,
        updatedAt: new Date().toISOString(),
      }));

      return { previousData };
    },
    onError: (err, _, context) => {
      // Rollback khi có lỗi
      queryClient.setQueryData(["userData", userId], context?.previousData);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Refetch dữ liệu từ server ngay lập tức khi lỗi
      queryClient.invalidateQueries({ queryKey: ["userData", userId] });
    },
    onSuccess: (updatedData) => {
      // Cập nhật cache với dữ liệu từ server và refetch ngay lập tức
      queryClient.setQueryData(["userData", userId], updatedData);
      queryClient.invalidateQueries({ 
        queryKey: ["userData", userId],
        refetchType: "active", // Chỉ refetch các query đang active
      });
      setIsEditing(false);
      setError(null);
    },
    onSettled: () => {
      // Đảm bảo dữ liệu luôn được làm mới từ server sau khi hoàn tất
      queryClient.invalidateQueries({ 
        queryKey: ["userData", userId],
        exact: true,
      });
    },
  });

  if (updateMutation.isPending) {
    return <div className="p-4 text-blue-400">Đang lưu thay đổi...</div>;
  }

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(JSON.parse(JSON.stringify(userData)));
  };

  const handleSave = () => {
    if (editData) {
      updateMutation.mutate(editData);
    }
  };

  const handleChange = (field: keyof UserData, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    setEditData((prev) => {
      if (!prev?.workExperiences) return prev;
      const newWorkExperiences = [...prev.workExperiences];
      newWorkExperiences[index] = { ...newWorkExperiences[index], [field]: value };
      return { ...prev, workExperiences: newWorkExperiences };
    });
  };

  const addWorkExperience = () => {
    setEditData((prev) => ({
      ...prev,
      workExperiences: [
        ...(prev?.workExperiences || []),
        {
          id: Date.now(),
          position: "",
          company: "",
          current: false,
          startYear: new Date().getFullYear(),
          endYear: null,
        },
      ],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setEditData((prev) => {
      if (!prev?.workExperiences) return prev;
      return { ...prev, workExperiences: prev.workExperiences.filter((_, i) => i !== index) };
    });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    setEditData((prev) => {
      if (!prev?.educations) return prev;
      const newEducations = [...prev.educations];
      newEducations[index] = { ...newEducations[index], [field]: value };
      return { ...prev, educations: newEducations };
    });
  };

  const addEducation = () => {
    setEditData((prev) => ({
      ...prev,
      educations: [
        ...(prev?.educations || []),
        {
          id: Date.now(),
          school: "",
          degree: "",
          current: false,
          startYear: new Date().getFullYear(),
          endYear: null,
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setEditData((prev) => {
      if (!prev?.educations) return prev;
      return { ...prev, educations: prev.educations.filter((_, i) => i !== index) };
    });
  };

  const formatRelationshipStatus = (status?: UserData["relationshipStatus"]) => {
    if (!status) return "Not specified";
    switch (status) {
      case "SINGLE":
        return "Single";
      case "IN_RELATIONSHIP":
        return "In a relationship";
      case "MARRIED":
        return "Married";
      case "COMPLICATED":
        return "It's complicated";
      default:
        return "Not specified";
    }
  };

  if (isLoading) return <div className="p-4 text-gray-400">Đang tải...</div>;
  if (fetchError || error) return <div className="p-4 text-red-500">Lỗi: {(fetchError || error)?.toString()}</div>;
  if (!userData) return <div className="p-4 text-gray-400">Không tìm thấy dữ liệu người dùng</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Tổng quan</h2>
          <div>
            Cập nhật lần cuối: {userData.updatedAt ? 
              new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).format(new Date(userData.updatedAt)) : 
              "Chưa có"}
          </div>
          {!isEditing ? (
            <button onClick={handleEdit} className="text-blue-400 hover:text-blue-300">
              <Edit2 className="h-5 w-5" />
            </button>
          ) : (
            <div className="space-x-2">
              <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                <Save className="h-5 w-5" />
              </button>
              <button onClick={handleCancel} className="text-red-400 hover:text-red-300">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {/* Work Experience */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Công việc</h3>
              {isEditing ? (
                <>
                  {editData?.workExperiences?.map((job, index) => (
                    <div key={job.id} className="flex items-start space-x-3 mb-2">
                      <Briefcase className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={job.position}
                          onChange={(e) => handleWorkExperienceChange(index, "position", e.target.value)}
                          placeholder="Vị trí"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={job.company}
                          onChange={(e) => handleWorkExperienceChange(index, "company", e.target.value)}
                          placeholder="Công ty"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={job.startYear}
                            onChange={(e) => handleWorkExperienceChange(index, "startYear", parseInt(e.target.value))}
                            className="w-24 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            value={job.endYear || ""}
                            onChange={(e) =>
                              handleWorkExperienceChange(index, "endYear", e.target.value ? parseInt(e.target.value) : null)
                            }
                            disabled={job.current}
                            className="w-24 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={job.current}
                              onChange={(e) => handleWorkExperienceChange(index, "current", e.target.checked)}
                              className="mr-1"
                            />
                            Hiện tại
                          </label>
                        </div>
                        <button
                          onClick={() => removeWorkExperience(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addWorkExperience}
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm kinh nghiệm làm việc
                  </button>
                </>
              ) : (
                userData.workExperiences?.length ? (
                  userData.workExperiences.map((job: any) => (
                    <div key={job.id} className="flex items-start space-x-3">
                      <Briefcase className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">
                          {job.position} tại {job.company}
                        </p>
                        <p className="text-sm text-gray-400">
                          {job.startYear} - {job.current ? "Hiện tại" : job.endYear}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Chưa thêm kinh nghiệm làm việc</p>
                )
              )}
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Học vấn</h3>
              {isEditing ? (
                <>
                  {editData?.educations?.map((edu, index) => (
                    <div key={edu.id} className="flex items-start space-x-3 mb-2">
                      <GraduationCap className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                          placeholder="Trường học"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          placeholder="Bằng cấp"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={edu.startYear}
                            onChange={(e) => handleEducationChange(index, "startYear", parseInt(e.target.value))}
                            className="w-24 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            value={edu.endYear || ""}
                            onChange={(e) =>
                              handleEducationChange(index, "endYear", e.target.value ? parseInt(e.target.value) : null)
                            }
                            disabled={edu.current}
                            className="w-24 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) => handleEducationChange(index, "current", e.target.checked)}
                              className="mr-1"
                            />
                            Đang học
                          </label>
                        </div>
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addEducation}
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm học vấn
                  </button>
                </>
              ) : (
                userData.educations?.length ? (
                  userData.educations.map((edu: any) => (
                    <div key={edu.id} className="flex items-start space-x-3">
                      <GraduationCap className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">
                          {edu.degree} tại {edu.school}
                        </p>
                        <p className="text-sm text-gray-400">
                          {edu.startYear} - {edu.current ? "Hiện tại" : edu.endYear}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Chưa thêm thông tin học vấn</p>
                )
              )}
            </div>

            {/* Places */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Địa điểm</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.currentCity || ""}
                    onChange={(e) => handleChange("currentCity", e.target.value)}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  />
                ) : (
                  <p className="font-medium text-white">Sống tại {userData.currentCity || "Chưa xác định"}</p>
                )}
              </div>
              <div className="flex items-start space-x-3">
                <Home className="mt-0.5 h-5 w-5 text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.hometown || ""}
                    onChange={(e) => handleChange("hometown", e.target.value)}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  />
                ) : (
                  <p className="font-medium text-white">Quê quán {userData.hometown || "Chưa xác định"}</p>
                )}
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Tình trạng quan hệ</h3>
              <div className="flex items-start space-x-3">
                <Heart className="mt-0.5 h-5 w-5 text-gray-500" />
                {isEditing ? (
                  <select
                    value={editData?.relationshipStatus || ""}
                    onChange={(e) => handleChange("relationshipStatus", e.target.value || null)}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="">Chưa xác định</option>
                    <option value="SINGLE">Độc thân</option>
                    <option value="IN_RELATIONSHIP">Đang hẹn hò</option>
                    <option value="MARRIED">Đã kết hôn</option>
                    <option value="COMPLICATED">Phức tạp</option>
                  </select>
                ) : (
                  <p className="font-medium text-white">{formatRelationshipStatus(userData.relationshipStatus)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Thông tin liên hệ</h2>
          {!isEditing && (
            <button onClick={handleEdit} className="text-blue-400 hover:text-blue-300">
              <Edit2 className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email</span>
              {isEditing ? (
                <input
                  type="email"
                  value={editData?.email_contact || ""}
                  onChange={(e) => handleChange("email_contact", e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                />
              ) : (
                <span className="font-medium text-white">{userData.email_contact || "Chưa xác định"}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Số điện thoại</span>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData?.phone_contact || ""}
                  onChange={(e) => handleChange("phone_contact", e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                />
              ) : (
                <span className="font-medium text-white">{userData.phone_contact || "Chưa xác định"}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Website</span>
              {isEditing ? (
                <input
                  type="url"
                  value={editData?.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                />
              ) : (
                userData.website ? (
                  <a
                    href={userData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-400 hover:underline"
                  >
                    {userData.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="font-medium text-white">Chưa xác định</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}