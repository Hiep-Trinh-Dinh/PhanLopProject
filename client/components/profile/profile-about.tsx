"use client"

import { Briefcase, GraduationCap, Heart, Home, MapPin, Edit2, Save, X, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileAboutProps {
  userId: number
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

export default function ProfileAbout({ userId }: ProfileAboutProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Đảm bảo cookie được gửi cùng request
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        } else if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setUserData(data);
      // Deep clone để tránh thay đổi trực tiếp userData
      setEditData(JSON.parse(JSON.stringify(data)));
    } catch (err:any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      if (err.message.includes('Unauthorized')) {
        // Có thể thêm logic để redirect về trang login nếu cần
        console.log('Redirecting to login...');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(JSON.parse(JSON.stringify(userData)));
  };
  
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/update', {
        method: 'PUT',
        credentials: 'include', // Gửi cookie chứa JWT
        headers: {
          'Content-Type': 'application/json', // Thêm header để server biết đây là JSON
        },
        body: JSON.stringify(editData),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json(); // Lấy thông tin lỗi từ server nếu có
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        } else if (response.status === 400) {
          throw new Error(errorData.errorMessage || 'Invalid data provided');
        } else if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
      }
  
      const updatedData = await response.json();
      setUserData(updatedData);
      setEditData(JSON.parse(JSON.stringify(updatedData)));
      setIsEditing(false);
      setError(null); // Xóa lỗi cũ nếu có
    } catch (err:any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      if (err.message.includes('Unauthorized')) {
        // Có thể thêm logic để redirect về trang login nếu cần
        console.log('Redirecting to login...');
      }
    }
  };

  const handleChange = (field: keyof UserData, value: any) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    setEditData(prev => {
      if (!prev?.workExperiences) return prev;
      const newWorkExperiences = [...prev.workExperiences];
      newWorkExperiences[index] = { ...newWorkExperiences[index], [field]: value };
      return { ...prev, workExperiences: newWorkExperiences };
    });
  };

  const addWorkExperience = () => {
    setEditData(prev => ({
      ...prev,
      workExperiences: [...(prev?.workExperiences || []), {
        id: Date.now(), // Chỉ dùng ID tạm cho entry mới
        position: "",
        company: "",
        current: false,
        startYear: new Date().getFullYear(),
        endYear: null
      }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setEditData(prev => {
      if (!prev?.workExperiences) return prev;
      return { ...prev, workExperiences: prev.workExperiences.filter((_, i) => i !== index) };
    });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    setEditData(prev => {
      if (!prev?.educations) return prev;
      const newEducations = [...prev.educations];
      newEducations[index] = { ...newEducations[index], [field]: value };
      return { ...prev, educations: newEducations };
    });
  };

  const addEducation = () => {
    setEditData(prev => ({
      ...prev,
      educations: [...(prev?.educations || []), {
        id: Date.now(), // Chỉ dùng ID tạm cho entry mới
        school: "",
        degree: "",
        current: false,
        startYear: new Date().getFullYear(),
        endYear: null
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setEditData(prev => {
      if (!prev?.educations) return prev;
      return { ...prev, educations: prev.educations.filter((_, i) => i !== index) };
    });
  };

  const formatRelationshipStatus = (status?: UserData["relationshipStatus"]) => {
    if (!status) return "Not specified";
    switch (status) {
      case "SINGLE": return "Single";
      case "IN_RELATIONSHIP": return "In a relationship";
      case "MARRIED": return "Married";
      case "COMPLICATED": return "It's complicated";
      default: return "Not specified";
    }
  };

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!userData) return <div className="p-4 text-gray-400">No user data found</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <div>
            Last Update: {userData.updatedAt ? 
              new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).format(new Date(userData.updatedAt)) : 
              "No"}
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
              <h3 className="text-sm font-medium text-gray-400">Work</h3>
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
                          placeholder="Position"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={job.company}
                          onChange={(e) => handleWorkExperienceChange(index, "company", e.target.value)}
                          placeholder="Company"
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
                            onChange={(e) => handleWorkExperienceChange(index, "endYear", e.target.value ? parseInt(e.target.value) : null)}
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
                            Current
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
                    <Plus className="h-4 w-4 mr-1" /> Add Work Experience
                  </button>
                </>
              ) : (
                userData.workExperiences?.length ? (
                  userData.workExperiences.map((job) => (
                    <div key={job.id} className="flex items-start space-x-3">
                      <Briefcase className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">{job.position} at {job.company}</p>
                        <p className="text-sm text-gray-400">
                          {job.startYear} - {job.current ? "Present" : job.endYear}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No work experience added</p>
                )
              )}
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Education</h3>
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
                          placeholder="School"
                          className="w-full bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          placeholder="Degree"
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
                            onChange={(e) => handleEducationChange(index, "endYear", e.target.value ? parseInt(e.target.value) : null)}
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
                            Currently studying
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
                    <Plus className="h-4 w-4 mr-1" /> Add Education
                  </button>
                </>
              ) : (
                userData.educations?.length ? (
                  userData.educations.map((edu) => (
                    <div key={edu.id} className="flex items-start space-x-3">
                      <GraduationCap className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-white">{edu.degree} from {edu.school}</p>
                        <p className="text-sm text-gray-400">
                          {edu.startYear} - {edu.current ? "Present" : edu.endYear}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No education information added</p>
                )
              )}
            </div>

            {/* Places */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Places</h3>
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
                  <p className="font-medium text-white">Lives in {userData.currentCity || "Not specified"}</p>
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
                  <p className="font-medium text-white">From {userData.hometown || "Not specified"}</p>
                )}
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Relationship</h3>
              <div className="flex items-start space-x-3">
                <Heart className="mt-0.5 h-5 w-5 text-gray-500" />
                {isEditing ? (
                  <select
                    value={editData?.relationshipStatus || ""}
                    onChange={(e) => handleChange("relationshipStatus", e.target.value || null)}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="">Not specified</option>
                    <option value="SINGLE">Single</option>
                    <option value="IN_RELATIONSHIP">In a relationship</option>
                    <option value="MARRIED">Married</option>
                    <option value="COMPLICATED">It's complicated</option>
                  </select>
                ) : (
                  <p className="font-medium text-white">
                    {formatRelationshipStatus(userData.relationshipStatus)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Contact Information</h2>
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
                <span className="font-medium text-white">{userData.email_contact || "Not specified"}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Phone</span>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData?.phone_contact || ""}
                  onChange={(e) => handleChange("phone_contact", e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
                />
              ) : (
                <span className="font-medium text-white">{userData.phone_contact || "Not specified"}</span>
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
                  <a href={userData.website} target="_blank" rel="noopener noreferrer"
                    className="font-medium text-blue-400 hover:underline">
                    {userData.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="font-medium text-white">Not specified</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}