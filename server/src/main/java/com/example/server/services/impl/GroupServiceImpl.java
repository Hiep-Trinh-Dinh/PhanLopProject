package com.example.server.services.impl;

import com.example.server.dto.GroupDto;
import com.example.server.dto.GroupMemberDto;
import com.example.server.dto.MembershipRequestDto;
import com.example.server.dto.SerializablePagedGroupMembersDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.GroupDtoMapper;
import com.example.server.models.Group;
import com.example.server.models.GroupMember;
import com.example.server.models.MembershipRequest;
import com.example.server.models.User;
import com.example.server.repositories.GroupMemberRepository;
import com.example.server.repositories.GroupRepository;
import com.example.server.repositories.MembershipRequestRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.GroupService;
import com.example.server.services.NotificationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private static final Logger logger = LoggerFactory.getLogger(GroupServiceImpl.class);

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRequestRepository membershipRequestRepository;

    @Autowired
    private GroupDtoMapper groupDtoMapper;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Group findGroupById(Long groupId) throws UserException {
        logger.info("Lay nhom voi id: {}", groupId);
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, allEntries = true)
    public GroupDto createGroup(GroupDto groupDto, Long userId) throws UserException {
        logger.info("Tao nhom cho userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Khong tim thay nguoi dung voi id: " + userId));

        if (groupDto.getName() == null || groupDto.getName().trim().isEmpty()) {
            throw new UserException("Ten nhom la bat buoc");
        }

        Group.Privacy privacy;
        try {
            privacy = groupDto.getPrivacy() != null ? Group.Privacy.valueOf(groupDto.getPrivacy()) : Group.Privacy.PUBLIC;
        } catch (IllegalArgumentException e) {
            throw new UserException("Gia tri quyen rieng tu khong hop le: " + groupDto.getPrivacy());
        }

        Group group = new Group();
        group.setName(groupDto.getName());
        group.setDescription(groupDto.getDescription());
        group.setAvatar(groupDto.getAvatar());
        group.setCover(groupDto.getCover());
        group.setRules(groupDto.getRules());
        group.setPrivacy(privacy);
        group.setCreatedBy(user);
        group.setMemberCount(1);

        Group savedGroup = groupRepository.save(group);
        logger.debug("Da luu nhom voi id: {}", savedGroup.getId());

        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUser(user);
        member.setRole(GroupMember.Role.ADMIN);
        groupMemberRepository.save(member);
        logger.debug("Da luu thanh vien nhom cho userId: {} trong groupId: {}", user.getId(), savedGroup.getId());

        logger.info("Nhom duoc tao thanh cong voi id: {}", savedGroup.getId());
        return groupDtoMapper.toGroupDto(savedGroup, user);
    }

    @Override
    //@Cacheable(value = "groups", key = "#groupId + ':' + (#userId != null ? #userId : 'anonymous')")
    public GroupDto getGroupById(Long groupId, Long userId) throws UserException {
        logger.info("Lấy nhóm {} với userId: {}", groupId, userId);
    
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Không tìm thấy nhóm với id: " + groupId));
    
        logger.info("Nhom: {}, Quyen rieng tu: {}, Nguoi tao: {}", 
                    group.getId(), group.getPrivacy(), group.getCreatedBy().getId());
    
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
    
        // Cho phép truy cập nhóm công khai hoặc thông tin cơ bản của nhóm riêng tư
        if (group.getPrivacy() == Group.Privacy.PUBLIC) {
            return groupDtoMapper.toGroupDto(group, reqUser);
        }
    
        // Xử lý nhóm riêng tư
        if (group.getPrivacy() == Group.Privacy.PRIVATE) {
            boolean isMember = reqUser != null && groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
            boolean isCreator = reqUser != null && group.getCreatedBy().getId().equals(userId);
    
            logger.info("Là thanh vien: {}, La nguoi tao: {}", isMember, isCreator);
    
            if (!isMember && !isCreator) {
                // Trả về thông tin cơ bản cho người dùng không có quyền
                GroupDto limitedDto = new GroupDto();
                limitedDto.setId(group.getId());
                limitedDto.setName(group.getName());
                limitedDto.setDescription(group.getDescription());
                limitedDto.setAvatar(group.getAvatar());
                limitedDto.setCover(group.getCover());
                limitedDto.setPrivacy(group.getPrivacy().toString());
                limitedDto.setMemberCount(group.getMemberCount());
                limitedDto.setCreatedById(group.getCreatedBy() != null ? group.getCreatedBy().getId() : null);
                limitedDto.setRules(group.getRules());
                limitedDto.setIsMember(false);
                limitedDto.setIsAdmin(false);
                return limitedDto;
            }
        }
    
        // Trả về thông tin đầy đủ cho thành viên hoặc người tạo
        return groupDtoMapper.toGroupDto(group, reqUser);
    }

    @Override
    public PagedModel<?> getAllGroups(Long userId, Pageable pageable) throws UserException {
        logger.info("Lay tat ca nhom voi userId: {}, trang: {}, kich thuoc: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
    
        Page<Group> groups = groupRepository.findAll(pageable);;
        // if (userId != null) {
        //     // Fetch all groups where the user is a member or all groups
        //     groups = groupRepository.findByMembers_IdOrAll(userId, pageable);
        // } else {
        //     // Fetch all groups without privacy filter
        //     groups = groupRepository.findAll(pageable);
        // }
    
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        List<GroupDto> groupDtos = groups.getContent().stream()
                .map(group -> groupDtoMapper.toGroupDto(group, reqUser))
                .collect(Collectors.toList());
    
        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                groups.getSize(),
                groups.getNumber(),
                groups.getTotalElements(),
                groups.getTotalPages()
        );
    
        PagedModel<?> pagedModel = PagedModel.of(groupDtos, metadata);
    
        Link selfLink = Link.of(String.format("/api/groups?page=%d&size=%d", groups.getNumber(), groups.getSize())).withSelfRel();
        pagedModel.add(selfLink);
    
        if (groups.hasNext()) {
            Link nextLink = Link.of(String.format("/api/groups?page=%d&size=%d", groups.getNumber() + 1, groups.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }
    
        if (groups.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/groups?page=%d&size=%d", groups.getNumber() - 1, groups.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }
    
        logger.debug("Tra ve mo hinh phan trang voi {} nhom", groupDtos.size());
        return pagedModel;
    }

    @Override
    public PagedModel<?> getUserGroups(Long userId, Pageable pageable) throws UserException {
        logger.info("Lay danh sach nhom cua userId: {}, trang: {}, kich thuoc: {}", userId, pageable.getPageNumber(), pageable.getPageSize());

        if (userId == null) {
            throw new UserException("Yeu cau ID nguoi dung de lay danh sach nhom");
        }

        Page<Group> groups = groupRepository.findByMembers_Id(userId, pageable);
        User reqUser = userRepository.findById(userId).orElse(null);
        List<GroupDto> groupDtos = groups.getContent().stream()
                .map(group -> groupDtoMapper.toGroupDto(group, reqUser))
                .collect(Collectors.toList());

        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                groups.getSize(),
                groups.getNumber(),
                groups.getTotalElements(),
                groups.getTotalPages()
        );

        PagedModel<?> pagedModel = PagedModel.of(groupDtos, metadata);

        Link selfLink = Link.of(String.format("/api/users/%d/groups?page=%d&size=%d", userId, groups.getNumber(), groups.getSize())).withSelfRel();
        pagedModel.add(selfLink);

        if (groups.hasNext()) {
            Link nextLink = Link.of(String.format("/api/users/%d/groups?page=%d&size=%d", userId, groups.getNumber() + 1, groups.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }

        if (groups.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/users/%d/groups?page=%d&size=%d", userId, groups.getNumber() - 1, groups.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }

        logger.debug("Tra ve mo hinh phan trang voi {} nhom cua nguoi dung", groupDtos.size());
        return pagedModel;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public GroupDto updateGroup(Long groupId, GroupDto groupDto, Long userId) throws UserException {
        logger.info("Cap nhat nhom voi id: {} cho userId: {}", groupId, userId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UserException("Nguoi dung khong phai la thanh vien cua nhom"));
        if (!requester.getRole().equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Chi quan tri vien nhom moi co the cap nhat thong tin nhom");
        }

        if (groupDto.getName() != null && !groupDto.getName().trim().isEmpty()) {
            group.setName(groupDto.getName());
        }

        if (groupDto.getDescription() != null) {
            group.setDescription(groupDto.getDescription());
        }

        if (groupDto.getAvatar() != null) {
            group.setAvatar(groupDto.getAvatar());
        }

        if (groupDto.getCover() != null) {
            group.setCover(groupDto.getCover());
        }

        if (groupDto.getPrivacy() != null) {
            try {
                group.setPrivacy(Group.Privacy.valueOf(groupDto.getPrivacy()));
            } catch (IllegalArgumentException e) {
                throw new UserException("Gia tri quyen rieng tu khong hop le: " + groupDto.getPrivacy());
            }
        }

        if (groupDto.getRules() != null) {
            group.setRules(groupDto.getRules());
        }

        Group updatedGroup = groupRepository.save(group);

        return groupDtoMapper.toGroupDto(updatedGroup, requester.getUser());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public void deleteGroup(Long groupId, Long userId) throws UserException {
        logger.info("Xoa nhom voi id: {} cho userId: {}", groupId, userId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        if (!group.getCreatedBy().getId().equals(userId)) {
            throw new UserException("Chi nguoi tao nhom moi co the xoa nhom");
        }

        groupRepository.delete(group);
        logger.info("Nhom da duoc xoa thanh cong voi id: {}", groupId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public GroupDto addMember(Long groupId, Long userId, Long requesterId) throws UserException {
        logger.info("Them userId: {} vao groupId: {} boi requesterId: {}", userId, groupId, requesterId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Khong tim thay nguoi dung voi id: " + userId));

        // Doi voi nhom PUBLIC, bat ky nguoi dung nao cung co the tham gia
        if (group.getPrivacy() == Group.Privacy.PUBLIC) {
            // Khong yeu cau quyen quan tri vien, chi can nguoi yeu cau la nguoi dung hop le
            if (!userId.equals(requesterId)) {
                throw new UserException("Chi nguoi dung tu yeu cau moi co the tham gia nhom cong khai");
            }
        } else {
            // Doi voi nhom PRIVATE, chi quan tri vien hoac nguoi kiem duyet co the them thanh vien
            GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, requesterId)
                    .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
            if (!requester.getRole().equals(GroupMember.Role.ADMIN) && !requester.getRole().equals(GroupMember.Role.MODERATOR)) {
                throw new UserException("Chi quan tri vien hoac nguoi kiem duyet nhom moi co the them thanh vien vao nhom rieng tu");
            }
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new UserException("Nguoi dung da la thanh vien cua nhom");
        }

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setRole(GroupMember.Role.MEMBER);
        groupMemberRepository.save(member);
        group.setMemberCount(group.getMemberCount() + 1);

        Group updatedGroup = groupRepository.save(group);

        logger.info("Nguoi dung {} da duoc them vao nhom {}", userId, groupId);
        return groupDtoMapper.toGroupDto(updatedGroup, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public void createMembershipRequest(Long groupId, Long userId, Long requesterId) throws UserException {
        logger.info("Tao yeu cau tham gia nhom cho userId: {} vao groupId: {} boi requesterId: {}", userId, groupId, requesterId);
    
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Không tìm thấy nhóm với id: " + groupId));
    
        if (group.getPrivacy() != Group.Privacy.PRIVATE) {
            throw new UserException("Yêu cầu tham gia chỉ áp dụng cho nhóm riêng tư");
        }
    
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Không tìm thấy người dùng với id: " + userId));
    
        if (!userId.equals(requesterId)) {
            throw new UserException("Chỉ người dùng tự yêu cầu mới có thể gửi yêu cầu tham gia");
        }
    
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new UserException("Người dùng đã là thành viên của nhóm");
        }
    
        if (membershipRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, MembershipRequest.Status.PENDING)) {
            throw new UserException("Yêu cầu tham gia nhóm đã tồn tại và đang chờ xử lý");
        }
    
        MembershipRequest request = new MembershipRequest();
        request.setGroup(group);
        request.setUser(user);
        request.setStatus(MembershipRequest.Status.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        membershipRequestRepository.save(request);

        List<GroupMember> admins = groupMemberRepository.findByGroupIdAndRole(groupId, GroupMember.Role.ADMIN);
        for (GroupMember admin : admins) {
            notificationService.createMembershipRequestNotification(user, admin.getUser(), groupId);
        }
    
        logger.info("Yeu cau tham gia nhom da duoc tao cho userId: {} trong groupId: {}", userId, groupId);
    }

    @Override
    public PagedModel<?> getUserMembershipRequests(Long userId, Pageable pageable) throws UserException {
        logger.info("Lấy danh sách yêu cầu tham gia của userId: {}, trang: {}, kích thước: {}", userId, pageable.getPageNumber(), pageable.getPageSize());

        userRepository.findById(userId).orElseThrow(() -> new UserException("Không tìm thấy người dùng với id: " + userId));

        Page<MembershipRequest> requests = membershipRequestRepository.findByUserId(userId, pageable);
        List<MembershipRequestDto> requestDtos = requests.getContent().stream()
                .map(request -> groupDtoMapper.toMembershipRequestDto(request))
                .collect(Collectors.toList());

        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                requests.getSize(),
                requests.getNumber(),
                requests.getTotalElements(),
                requests.getTotalPages()
        );

        PagedModel<?> pagedModel = PagedModel.of(requestDtos, metadata);

        Link selfLink = Link.of(String.format("/api/users/%d/membership-requests?page=%d&size=%d", userId, requests.getNumber(), requests.getSize())).withSelfRel();
        pagedModel.add(selfLink);

        if (requests.hasNext()) {
            Link nextLink = Link.of(String.format("/api/users/%d/membership-requests?page=%d&size=%d", userId, requests.getNumber() + 1, requests.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }

        if (requests.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/users/%d/membership-requests?page=%d&size=%d", userId, requests.getNumber() - 1, requests.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }

        return pagedModel;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public GroupDto approveMembershipRequest(Long groupId, Long requestId, Long adminId) throws UserException {
        logger.info("Phe duyet yeu cau tham gia nhom requestId: {} cho groupId: {} boi adminId: {}", requestId, groupId, adminId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        if (group.getPrivacy() != Group.Privacy.PRIVATE) {
            throw new UserException("Phe duyet yeu cau chi ap dung cho nhom rieng tu");
        }

        GroupMember admin = groupMemberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
        if (!admin.getRole().equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Chi quan tri vien nhom moi co the phe duyet yeu cau tham gia");
        }

        MembershipRequest request = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("Khong tim thay yeu cau tham gia voi id: " + requestId));

        if (!request.getGroup().getId().equals(groupId)) {
            throw new UserException("Yeu cau tham gia khong thuoc ve nhom nay");
        }

        if (request.getStatus() != MembershipRequest.Status.PENDING) {
            throw new UserException("Yeu cau tham gia khong o trang thai cho xu ly");
        }

        User user = request.getUser();
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new UserException("Nguoi dung da la thanh vien cua nhom");
        }

        // Them thanh vien vao nhom
        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setRole(GroupMember.Role.MEMBER);
        member.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(member);
        group.setMemberCount(group.getMemberCount() + 1);

        // Cap nhat trang thai yeu cau
        request.setStatus(MembershipRequest.Status.APPROVED);
        membershipRequestRepository.save(request);

        Group updatedGroup = groupRepository.save(group);

        // Gui thong bao den nguoi yeu cau
        notificationService.createMembershipRequestAcceptedOrNottification(admin.getUser(), user, groupId);

        logger.info("Yeu cau tham gia nhom requestId: {} da duoc phe duyet cho userId: {} trong groupId: {}", requestId, user.getId(), groupId);
        return groupDtoMapper.toGroupDto(updatedGroup, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public void rejectMembershipRequest(Long groupId, Long requestId, Long adminId) throws UserException {
        logger.info("Tu choi yeu cau tham gia nhom requestId: {} cho groupId: {} boi adminId: {}", requestId, groupId, adminId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        if (group.getPrivacy() != Group.Privacy.PRIVATE) {
            throw new UserException("Tu choi yeu cau chi ap dung cho nhom rieng tu");
        }

        GroupMember admin = groupMemberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
        if (!admin.getRole().equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Chi quan tri vien nhom moi co the tu choi yeu cau tham gia");
        }

        MembershipRequest request = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("Khong tim thay yeu cau tham gia voi id: " + requestId));

        if (!request.getGroup().getId().equals(groupId)) {
            throw new UserException("Yeu cau tham gia khong thuoc ve nhom nay");
        }

        if (request.getStatus() != MembershipRequest.Status.PENDING) {
            throw new UserException("Yeu cau tham gia khong o trang thai cho xu ly");
        }

        // Cap nhat trang thai yeu cau
        request.setStatus(MembershipRequest.Status.REJECTED);
        membershipRequestRepository.save(request);

        // Gui thong bao den nguoi yeu cau
        notificationService.createMembershipRequestAcceptedOrNottification(admin.getUser(), request.getUser(), groupId);

        logger.info("Yeu cau tham gia nhom requestId: {} da bi tu choi cho userId: {} trong groupId: {}", requestId, request.getUser().getId(), groupId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public GroupDto removeMember(Long groupId, Long userId, Long requesterId) throws UserException {
        logger.info("Xoa userId: {} khoi groupId: {} boi requesterId: {}", userId, groupId, requesterId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
        if (!requester.getRole().equals(GroupMember.Role.ADMIN) && !requester.getRole().equals(GroupMember.Role.MODERATOR)) {
            throw new UserException("Chi quan tri vien hoac nguoi kiem duyet nhom moi co the xoa thanh vien");
        }

        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UserException("Nguoi dung khong phai la thanh vien cua nhom"));

        if (group.getCreatedBy().getId().equals(userId)) {
            throw new UserException("Khong the xoa nguoi tao nhom");
        }

        groupMemberRepository.delete(member);
        group.setMemberCount(group.getMemberCount() - 1);

        Group updatedGroup = groupRepository.save(group);

        logger.info("Nguoi dung {} da bi xoa khoi nhom {}", userId, groupId);
        return groupDtoMapper.toGroupDto(updatedGroup, requester.getUser());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"groups", "groupMembers"}, key = "#groupId")
    public GroupDto updateMemberRole(Long groupId, Long userId, String role, Long requesterId) throws UserException {
        logger.info("Cap nhat vai tro cho userId: {} trong groupId: {} thanh {} boi requesterId: {}", userId, groupId, role, requesterId);

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
        if (!requester.getRole().equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Chi quan tri vien nhom moi co the cap nhat vai tro thanh vien");
        }

        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UserException("Nguoi dung khong phai la thanh vien cua nhom"));

        GroupMember.Role newRole;
        try {
            newRole = GroupMember.Role.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new UserException("Gia tri vai tro khong hop le: " + role);
        }

        if (group.getCreatedBy().getId().equals(userId) && !newRole.equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Khong the thay doi vai tro cua nguoi tao nhom");
        }

        member.setRole(newRole);
        groupMemberRepository.save(member);

        logger.info("Da cap nhat vai tro cho nguoi dung {} trong nhom {} thanh {}", userId, groupId, role);
        return groupDtoMapper.toGroupDto(group, requester.getUser());
    }

    @Override
    @Cacheable(value = "groupMembers", key = "#groupId + ':' + (#userId != null ? #userId : 'anonymous')")
    public SerializablePagedGroupMembersDto getGroupMembers(Long groupId, Long userId, Pageable pageable) throws UserException {
        logger.info("Lay danh sach thanh vien cho groupId: {}, userId: {}, trang: {}, kich thuoc: {}", 
                    groupId, userId, pageable.getPageNumber(), pageable.getPageSize());

        // Validate group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        // Check access for private groups
        if (group.getPrivacy() == Group.Privacy.PRIVATE && 
            (userId == null || 
            (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId) && 
            !group.getCreatedBy().getId().equals(userId)))) {
            throw new UserException("Khong co quyen xem danh sach thanh vien cua nhom rieng tu nay");
        }

        // Fetch members with pagination
        Page<GroupMember> members = groupMemberRepository.findByGroupId(groupId, pageable);

        // Convert to DTOs
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        List<GroupMemberDto> memberDtos = members.getContent().stream()
                .map(member -> groupDtoMapper.toGroupMemberDto(member, reqUser))
                .collect(Collectors.toList());

        // Create serializable DTO
        return new SerializablePagedGroupMembersDto(
                memberDtos,
                members.getSize(),
                members.getNumber(),
                members.getTotalElements(),
                members.getTotalPages()
        );
    }

    @Override
    public PagedModel<?> getMembershipRequests(Long groupId, Long adminId, Pageable pageable) throws UserException {
        logger.info("Lay danh sach yeu cau tham gia cho groupId: {}, adminId: {}, trang: {}, kich thuoc: {}", 
                    groupId, adminId, pageable.getPageNumber(), pageable.getPageSize());

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Khong tim thay nhom voi id: " + groupId));

        if (group.getPrivacy() != Group.Privacy.PRIVATE) {
            throw new UserException("Yeu cau tham gia chi ap dung cho nhom rieng tu");
        }

        GroupMember admin = groupMemberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new UserException("Nguoi yeu cau khong phai la thanh vien cua nhom"));
        if (!admin.getRole().equals(GroupMember.Role.ADMIN)) {
            throw new UserException("Chi quan tri vien nhom moi co the xem yeu cau tham gia");
        }

        Page<MembershipRequest> requests = membershipRequestRepository.findByGroupIdAndStatus(groupId, MembershipRequest.Status.PENDING, pageable);

        List<MembershipRequestDto> requestDtos = requests.getContent().stream()
                .map(request -> groupDtoMapper.toMembershipRequestDto(request))
                .collect(Collectors.toList());

        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                requests.getSize(),
                requests.getNumber(),
                requests.getTotalElements(),
                requests.getTotalPages()
        );

        PagedModel<?> pagedModel = PagedModel.of(requestDtos, metadata);

        Link selfLink = Link.of(String.format("/api/groups/%d/membership-requests?page=%d&size=%d", 
                                            groupId, requests.getNumber(), requests.getSize())).withSelfRel();
        pagedModel.add(selfLink);

        if (requests.hasNext()) {
            Link nextLink = Link.of(String.format("/api/groups/%d/membership-requests?page=%d&size=%d", 
                                                groupId, requests.getNumber() + 1, requests.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }

        if (requests.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/groups/%d/membership-requests?page=%d&size=%d", 
                                                groupId, requests.getNumber() - 1, requests.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }

        logger.debug("Tra ve mo hinh phan trang voi {} yeu cau tham gia", requestDtos.size());
        return pagedModel;
    }

    @Override
    @Cacheable(value = "groupMembersSearch", key = "#groupId + ':' + #query + ':' + (#userId != null ? #userId : 'anonymous')")
    public SerializablePagedGroupMembersDto searchGroupMembers(Long groupId, String query, Long userId, Pageable pageable) throws UserException {
        logger.info("Tìm kiếm thành viên trong groupId: {}, từ khóa: {}, userId: {}, trang: {}, kích thước: {}", 
                    groupId, query, userId, pageable.getPageNumber(), pageable.getPageSize());

        // Validate group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Không tìm thấy nhóm với id: " + groupId));

        // Check access for private groups
        if (group.getPrivacy() == Group.Privacy.PRIVATE && 
            (userId == null || 
            (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId) && 
            !group.getCreatedBy().getId().equals(userId)))) {
            throw new UserException("Không có quyền xem danh sách thành viên của nhóm riêng tư này");
        }

        Page<GroupMember> members = groupMemberRepository.findByGroupIdAndUserFirstOrLastNameContaining(groupId, query, pageable);

        // Convert to DTOs
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        List<GroupMemberDto> memberDtos = members.getContent().stream()
                .map(member -> groupDtoMapper.toGroupMemberDto(member, reqUser))
                .collect(Collectors.toList());

        // Create serializable DTO
        return new SerializablePagedGroupMembersDto(
                memberDtos,
                members.getSize(),
                members.getNumber(),
                members.getTotalElements(),
                members.getTotalPages()
        );
    }
}