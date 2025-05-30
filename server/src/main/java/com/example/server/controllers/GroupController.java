package com.example.server.controllers;

import com.example.server.dto.GroupDto;
import com.example.server.dto.SerializablePagedGroupMembersDto;
import com.example.server.exception.UserException;
import com.example.server.models.Group;
import com.example.server.models.User;
import com.example.server.services.GroupService;
import com.example.server.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GroupController {

    private static final Logger logger = LoggerFactory.getLogger(GroupController.class);
    private static final String COOKIE_NAME = "auth_token"; // Đồng bộ với AuthController

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    @PostMapping(value = "/groups", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createGroup(
            @Valid @RequestBody GroupDto groupDto,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("POST /api/groups - Nhận yêu cầu tạo nhóm");
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy người dùng");
            }
            logger.info("Tạo nhóm cho người dùng: {}", user.getEmail());

            GroupDto createdGroup = groupService.createGroup(groupDto, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(createdGroup);
        } catch (UserException e) {
            logger.error("Lỗi khi tạo nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi tạo nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<?> getGroupById(
            @PathVariable Long groupId,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/groups/{} - Lấy thông tin nhóm", groupId);
        try {
            Long userId = null;
            String token = getTokenFromRequest(request);
            if (token != null) {
                ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
                if (validationResult.getStatusCode().isError()) {
                    setNoCacheHeaders(response);
                    return validationResult;
                }
    
                Object resultBody = validationResult.getBody();
                if (resultBody instanceof User) {
                    userId = ((User) resultBody).getId();
                    logger.debug("ID nguoi dung xac thuc: {}", userId);
                } else {
                    logger.error("Ket qua xac thuc null hoac sai kieu");
                    setNoCacheHeaders(response);
                    return ResponseEntity.status(401).body("Khong duoc phep: Khong tim thay nguoi dung");
                }
            } else {
                logger.debug("Khong co token, tiep tuc voi tu cach an danh");
            }
    
            GroupDto group = groupService.getGroupById(groupId, userId);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(group);
        } catch (UserException e) {
            logger.error("Loi khi lay nhom: {}", e.getMessage());
            setNoCacheHeaders(response);
            if (e.getMessage().contains("Khong tim thay nhom")) {
                return ResponseEntity.status(404).body(e.getMessage());
            }
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Loi khong mong muon khi lay nhom: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }    

    @GetMapping("/groups")
    public ResponseEntity<?> getAllGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/groups - Lay danh sach nhom, trang: {}, kich thuoc: {}", page, size);
        try {
            Long userId = null;
            String token = getTokenFromRequest(request);
            if (token != null) {
                ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
                if (validationResult.getStatusCode().isError()) {
                    setNoCacheHeaders(response);
                    return validationResult;
                }
    
                Object resultBody = validationResult.getBody();
                if (resultBody instanceof User) {
                    userId = ((User) resultBody).getId();
                    logger.debug("Nguoi dung xac thuc voi ID: {}", userId);
                } else {
                    logger.error("Xac thuc that bai hoac body null");
                    setNoCacheHeaders(response);
                    return ResponseEntity.status(401).body("Khong duoc phep: khong tim thay nguoi dung");
                }
            } else {
                logger.debug("Khong co token, dang truy cap an danh");
            }
    
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> groups = groupService.getAllGroups(userId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(groups);
        } catch (UserException e) {
            logger.error("Loi khi lay danh sach nhom: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Loi khong mong muon khi lay danh sach nhom: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @GetMapping("/users/{userId}/groups")
    public ResponseEntity<?> getUserGroups(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/users/{}/groups - Lấy danh sách nhóm của userId: {}, trang: {}, kích thước: {}", userId, userId, page, size);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user == null || !user.getId().equals(userId)) {
                logger.warn("Truy cập bị từ chối: Không thể truy cập nhóm của người dùng khác: {}", userId);
                setNoCacheHeaders(response);
                return ResponseEntity.status(403).body("Cấm: Không thể truy cập nhóm của người dùng khác");
            }

            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> groups = groupService.getUserGroups(userId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(groups);
        } catch (UserException e) {
            logger.error("Lỗi khi lấy danh sách nhóm người dùng: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi lấy danh sách nhóm người dùng: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @PutMapping(value = "/groups/{groupId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody GroupDto groupDto,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("PUT /api/groups/{} - Cập nhật nhóm", groupId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy người dùng");
            }
            GroupDto updatedGroup = groupService.updateGroup(groupId, groupDto, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedGroup);
        } catch (UserException e) {
            logger.error("Lỗi khi cập nhật nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi cập nhật nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable Long groupId,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("DELETE /api/groups/{} - Xóa nhóm", groupId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy người dùng");
            }
            groupService.deleteGroup(groupId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Lỗi khi xóa nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi xóa nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @PostMapping("/groups/{groupId}/members")
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true)
    public ResponseEntity<?> addMember(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("POST /api/groups/{}/members - Thêm userId: {} vào nhóm", groupId, userId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }
    
            User requester = (User) validationResult.getBody();
            if (requester == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy người dùng");
            }
    
            Group group = groupService.findGroupById(groupId);
            if (group.getPrivacy() == Group.Privacy.PUBLIC) {
                GroupDto updatedGroup = groupService.addMember(groupId, userId, requester.getId());
                setNoCacheHeaders(response);
                return ResponseEntity.ok(updatedGroup);
            } else {
                setNoCacheHeaders(response);
                return ResponseEntity.badRequest().body("Loại nhóm không hợp lệ.");
            }
        } catch (UserException e) {
            logger.error("Lỗi khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @PostMapping("/groups/{groupId}/membership-requests")
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true)
    public ResponseEntity<?> requestMembership(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("POST /api/groups/{}/membership-requests - Yêu cầu tham gia nhóm, userId: {}", groupId, userId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User requester = (User) validationResult.getBody();
            if (requester == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy người dùng");
            }

            if (!requester.getId().equals(userId)) {
                logger.warn("Người dùng {} cố gắng gửi yêu cầu thay cho userId {}", requester.getId(), userId);
                setNoCacheHeaders(response);
                return ResponseEntity.status(403).body("Không được phép: Chỉ người dùng chính mới có thể gửi yêu cầu tham gia");
            }

            groupService.createMembershipRequest(groupId, userId, requester.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok("Yêu cầu tham gia nhóm đã được gửi, đang chờ phê duyệt.");
        } catch (UserException e) {
            logger.error("Lỗi khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @GetMapping("/users/{userId}/membership-requests")
    public ResponseEntity<?> getUserMembershipRequests(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/users/{}/membership-requests - Lay danh sach yeu cau tham gia cua userId: {}", userId, userId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }
    
            User user = (User) validationResult.getBody();
            if (user == null || !user.getId().equals(userId)) {
                logger.warn("Truy cap bi tu choi: Khong the truy cap yeu cau tham gia cua nguoi dung khac: {}", userId);
                setNoCacheHeaders(response);
                return ResponseEntity.status(403).body("Cấm: Không thể truy cập yêu cầu tham gia của người dùng khác");
            }
    
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> requests = groupService.getUserMembershipRequests(userId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(requests);
        } catch (UserException e) {
            logger.error("Loi khi lay danh sach yeu cau tham gia: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Loi khong mong muon khi lay danh sach yeu cau tham gia: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }    

    @PostMapping("/groups/{groupId}/membership-requests/{requestId}")
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true, condition = "#approve")
    public ResponseEntity<?> handleMembershipRequest(
            @PathVariable Long groupId,
            @PathVariable Long requestId,
            @RequestParam boolean approve,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("POST /api/groups/{}/membership-requests/{} - Xử lý yêu cầu, phê duyệt: {}", groupId, requestId, approve);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User admin = (User) validationResult.getBody();
            if (admin == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy admin");
            }
            if (approve) {
                GroupDto updatedGroup = groupService.approveMembershipRequest(groupId, requestId, admin.getId());
                setNoCacheHeaders(response);
                return ResponseEntity.ok(updatedGroup);
            } else {
                groupService.rejectMembershipRequest(groupId, requestId, admin.getId());
                setNoCacheHeaders(response);
                return ResponseEntity.ok("Yêu cầu tham gia nhóm đã bị từ chối.");
            }
        } catch (UserException e) {
            logger.error("Lỗi khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi xử lý yêu cầu tham gia nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @DeleteMapping("/groups/{groupId}/members/{userId}")
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true)
    public ResponseEntity<?> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("DELETE /api/groups/{}/members/{} - Xóa người dùng khỏi nhóm", groupId, userId);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User requester = (User) validationResult.getBody();
            if (requester == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy admin");
            }

            GroupDto updatedGroup = groupService.removeMember(groupId, userId, requester.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedGroup);
        } catch (UserException e) {
            logger.error("Lỗi khi xóa thành viên: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi xóa thành viên: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @PutMapping("/groups/{groupId}/members/{userId}/role")
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true)
    public ResponseEntity<?> updateMemberRole(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestParam String role,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("PUT /api/groups/{}/members/{}/role - Cập nhật vai trò thành {}", groupId, userId, role);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User requester = (User) validationResult.getBody();

            if (requester == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy admin");
            }
            
            GroupDto updatedGroup = groupService.updateMemberRole(groupId, userId, role, requester.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedGroup);
        } catch (UserException e) {
            logger.error("Lỗi khi cập nhật vai trò thành viên: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi cập nhật vai trò thành viên: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/groups/{}/members - Lay danh sach thanh vien cua nhom: {}, trang: {}, kich thuoc: {}", groupId, groupId, page, size);
        try {
            Long userId = null;
            String token = getTokenFromRequest(request);
            if (token != null) {
                ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
                if (validationResult.getStatusCode().isError()) {
                    setNoCacheHeaders(response);
                    return validationResult;
                }
    
                Object resultBody = validationResult.getBody();
                if (resultBody instanceof User) {
                    userId = ((User) resultBody).getId();
                    logger.debug("ID nguoi dung xac thuc: {}", userId);
                } else {
                    logger.error("Xac thuc that bai hoac body null");
                    setNoCacheHeaders(response);
                    return ResponseEntity.status(401).body("Khong duoc phep: khong tim thay nguoi dung");
                }
            }
    
            Pageable pageable = PageRequest.of(page, size);
            SerializablePagedGroupMembersDto result = groupService.getGroupMembers(groupId, userId, pageable);
    
            // Chuyen doi sang PagedModel cho phan hoi
            PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                    result.getPageSize(),
                    result.getPageNumber(),
                    result.getTotalElements(),
                    result.getTotalPages()
            );
            PagedModel<?> pagedModel = PagedModel.of(result.getMembers(), metadata);
    
            // Them lien ket HATEOAS
            Link selfLink = Link.of(String.format("/api/groups/%d/members?page=%d&size=%d", 
                                                groupId, result.getPageNumber(), result.getPageSize())).withSelfRel();
            pagedModel.add(selfLink);
    
            if (result.getPageNumber() < result.getTotalPages() - 1) {
                Link nextLink = Link.of(String.format("/api/groups/%d/members?page=%d&size=%d", 
                                                    groupId, result.getPageNumber() + 1, result.getPageSize())).withRel("next");
                pagedModel.add(nextLink);
            }
    
            if (result.getPageNumber() > 0) {
                Link prevLink = Link.of(String.format("/api/groups/%d/members?page=%d&size=%d", 
                                                    groupId, result.getPageNumber() - 1, result.getPageSize())).withRel("prev");
                pagedModel.add(prevLink);
            }
    
            setNoCacheHeaders(response);
            return ResponseEntity.ok(pagedModel);
        } catch (UserException e) {
            logger.error("Loi khi lay danh sach thanh vien nhom: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.status(e.getMessage().contains("Khong co quyen") ? 403 : 404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Loi khong mong muon khi lay danh sach thanh vien nhom: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }    

    @GetMapping("/groups/{groupId}/membership-requests")
    public ResponseEntity<?> getMembershipRequests(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/groups/{}/membership-requests - Lấy danh sách yêu cầu tham gia nhóm: {}, trang: {}, kích thước: {}", groupId, groupId, page, size);
        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User admin = (User) validationResult.getBody();
            Pageable pageable = PageRequest.of(page, size);
            if (admin == null) {
                logger.error("Người dùng null sau khi xác thực token");
                setNoCacheHeaders(response);
                return ResponseEntity.status(401).body("Không được phép: Không tìm thấy admin");
            }

            PagedModel<?> requests = groupService.getMembershipRequests(groupId, admin.getId(), pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(requests);
        } catch (UserException e) {
            logger.error("Lỗi khi lấy danh sách yêu cầu tham gia nhóm: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.status(e.getMessage().contains("Không có quyền") ? 403 : 404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi lấy danh sách yêu cầu tham gia nhóm: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
        }
    }

    @GetMapping("/groups/{groupId}/members/search")
    public ResponseEntity<?> searchGroupMembers(
            @PathVariable Long groupId,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("GET /api/groups/{}/members/search - Tim kiem thanh vien trong nhom: {}, tu khoa: {}, trang: {}, kich thuoc: {}", 
                    groupId, groupId, query, page, size);
        try {
            Long userId = null;
            String token = getTokenFromRequest(request);
            if (token != null) {
                ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
                if (validationResult.getStatusCode().isError()) {
                    setNoCacheHeaders(response);
                    return validationResult;
                }

                Object resultBody = validationResult.getBody();
                if (resultBody instanceof User) {
                    userId = ((User) resultBody).getId();
                    logger.debug("ID nguoi dung xac thuc: {}", userId);
                } else {
                    logger.error("Xac thuc that bai hoac body null");
                    setNoCacheHeaders(response);
                    return ResponseEntity.status(401).body("Khong duoc phep: khong tim thay nguoi dung");
                }
            }

            Pageable pageable = PageRequest.of(page, size);
            SerializablePagedGroupMembersDto result = groupService.searchGroupMembers(groupId, query, userId, pageable);

            // Chuyen doi sang PagedModel cho phan hoi
            PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                    result.getPageSize(),
                    result.getPageNumber(),
                    result.getTotalElements(),
                    result.getTotalPages()
            );
            PagedModel<?> pagedModel = PagedModel.of(result.getMembers(), metadata);

            // Them lien ket HATEOAS
            Link selfLink = Link.of(String.format("/api/groups/%d/members/search?query=%s&page=%d&size=%d", 
                                                groupId, query, result.getPageNumber(), result.getPageSize())).withSelfRel();
            pagedModel.add(selfLink);

            if (result.getPageNumber() < result.getTotalPages() - 1) {
                Link nextLink = Link.of(String.format("/api/groups/%d/members/search?query=%s&page=%d&size=%d", 
                                                    groupId, query, result.getPageNumber() + 1, result.getPageSize())).withRel("next");
                pagedModel.add(nextLink);
            }

            if (result.getPageNumber() > 0) {
                Link prevLink = Link.of(String.format("/api/groups/%d/members/search?query=%s&page=%d&size=%d", 
                                                    groupId, query, result.getPageNumber() - 1, result.getPageSize())).withRel("prev");
                pagedModel.add(prevLink);
            }

            setNoCacheHeaders(response);
            return ResponseEntity.ok(pagedModel);
        } catch (UserException e) {
            logger.error("Loi khi tim kiem thanh vien nhom: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.status(e.getMessage().contains("Khong co quyen") ? 403 : 404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Loi khong mong muon khi tim kiem thanh vien nhom: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Loi server noi bo");
        }
    }

    private ResponseEntity<?> validateTokenAndUser(String token, HttpServletResponse response) {
        if (token == null) {
            logger.warn("Không có token xác thực được cung cấp");
            return ResponseEntity.status(401).body("Không được phép: Không có token");
        }

        try {
            User user = userService.findUserProfileByJwt(token);
            if (user == null) {
                logger.warn("Không tìm thấy người dùng cho token");
                clearJwtCookie(response);
                return ResponseEntity.status(401).body("Không được phép: Token không hợp lệ");
            }
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            logger.error("Xác thực token thất bại: {}", e.getMessage());
            clearJwtCookie(response);
            return ResponseEntity.status(401).body("Không được phép: Token không hợp lệ");
        }
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        // Chỉ lấy token từ cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    logger.debug("Tìm thấy token trong cookie");
                    return cookie.getValue();
                }
            }
        }
        logger.debug("Không tìm thấy token trong cookie");
        return null;
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
        logger.info("Đã xóa cookie auth_token");
    }

    private void setNoCacheHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
    }
}