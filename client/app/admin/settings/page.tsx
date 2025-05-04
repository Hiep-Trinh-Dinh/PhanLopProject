"use client";

import React, { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "PhanLop Social",
    siteDescription: "Mạng xã hội kết nối mọi người",
    logo: "/logo.png",
    contactEmail: "admin@phanlop.com",
    postsPerPage: 20,
    allowNewRegistrations: true,
    maintenanceMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "admin@phanlop.com",
    smtpPassword: "********",
    fromEmail: "no-reply@phanlop.com",
    fromName: "PhanLop Social",
  });

  const [contentSettings, setContentSettings] = useState({
    allowedFileTypes: ".jpg, .jpeg, .png, .gif, .mp4, .avi, .mov",
    maxFileSize: 50,
    allowComments: true,
    moderateComments: false,
    profanityFilter: true,
    bannedWords: "từ_cấm_1, từ_cấm_2, từ_cấm_3",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cài đặt hệ thống</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "general"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("general")}
        >
          Cài đặt chung
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "email"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("email")}
        >
          Email
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "content"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("content")}
        >
          Nội dung
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "security"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("security")}
        >
          Bảo mật
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tên trang web
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={generalSettings.siteName}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    siteName: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mô tả trang web
              </label>
              <textarea
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={generalSettings.siteDescription}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    siteDescription: e.target.value,
                  })
                }
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email liên hệ
              </label>
              <input
                type="email"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={generalSettings.contactEmail}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    contactEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Số bài viết mỗi trang
              </label>
              <input
                type="number"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={generalSettings.postsPerPage}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    postsPerPage: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow-registrations"
                className="w-4 h-4 mr-2"
                checked={generalSettings.allowNewRegistrations}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    allowNewRegistrations: e.target.checked,
                  })
                }
              />
              <label htmlFor="allow-registrations" className="text-white">
                Cho phép đăng ký mới
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance-mode"
                className="w-4 h-4 mr-2"
                checked={generalSettings.maintenanceMode}
                onChange={(e) =>
                  setGeneralSettings({
                    ...generalSettings,
                    maintenanceMode: e.target.checked,
                  })
                }
              />
              <label htmlFor="maintenance-mode" className="text-white">
                Chế độ bảo trì
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === "email" && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.smtpServer}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpServer: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.smtpPort}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPort: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.smtpUsername}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpUsername: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.smtpPassword}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPassword: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                From Email
              </label>
              <input
                type="email"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.fromEmail}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                From Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={emailSettings.fromName}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromName: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mr-4">
              Kiểm tra kết nối
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Content Settings */}
      {activeTab === "content" && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Loại file cho phép
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={contentSettings.allowedFileTypes}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    allowedFileTypes: e.target.value,
                  })
                }
              />
              <p className="text-sm text-gray-400 mt-1">
                Phân cách bằng dấu phẩy (,)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Kích thước file tối đa (MB)
              </label>
              <input
                type="number"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={contentSettings.maxFileSize}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    maxFileSize: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow-comments"
                className="w-4 h-4 mr-2"
                checked={contentSettings.allowComments}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    allowComments: e.target.checked,
                  })
                }
              />
              <label htmlFor="allow-comments" className="text-white">
                Cho phép bình luận
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="moderate-comments"
                className="w-4 h-4 mr-2"
                checked={contentSettings.moderateComments}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    moderateComments: e.target.checked,
                  })
                }
              />
              <label htmlFor="moderate-comments" className="text-white">
                Kiểm duyệt bình luận trước khi đăng
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="profanity-filter"
                className="w-4 h-4 mr-2"
                checked={contentSettings.profanityFilter}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    profanityFilter: e.target.checked,
                  })
                }
              />
              <label htmlFor="profanity-filter" className="text-white">
                Bật bộ lọc từ ngữ cấm
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Danh sách từ ngữ cấm
              </label>
              <textarea
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={contentSettings.bannedWords}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    bannedWords: e.target.value,
                  })
                }
              ></textarea>
              <p className="text-sm text-gray-400 mt-1">
                Phân cách bằng dấu phẩy (,)
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Cài đặt bảo mật</h3>
            <p className="text-gray-400">
              Các cài đặt bảo mật sẽ được thêm ở đây, bao gồm: cấu hình 2FA, quy
              tắc mật khẩu, chính sách khóa tài khoản, v.v.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium mb-4">Cấu hình JWT</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  JWT Secret Key
                </label>
                <input
                  type="password"
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value="************************"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Thời hạn token (giây)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value="86400"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 