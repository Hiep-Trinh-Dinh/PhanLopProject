package com.example.server.mapper;

import com.example.server.dto.GroupDto;
import com.example.server.dto.GroupMemberDto;
import com.example.server.dto.MembershipRequestDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Group;
import com.example.server.models.GroupMember;
import com.example.server.models.MembershipRequest;
import com.example.server.models.User;
import com.example.server.repositories.GroupMemberRepository;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
public class GroupDtoMapper {

    private final GroupMemberRepository groupMemberRepository;

    public GroupDtoMapper(GroupMemberRepository groupMemberRepository) {
        this.groupMemberRepository = groupMemberRepository;
    }

    public GroupDto toGroupDto(Group group, User reqUser) {
        GroupDto groupDto = new GroupDto();
        groupDto.setId(group.getId());
        groupDto.setName(group.getName());
        groupDto.setDescription(group.getDescription());
        groupDto.setAvatar(group.getAvatar());
        groupDto.setCover(group.getCover());
        groupDto.setPrivacy(group.getPrivacy().toString());
        groupDto.setMemberCount(group.getMemberCount());
        groupDto.setPostCount(group.getPostCount());
        groupDto.setMediaCount(group.getMediaCount());
        groupDto.setCreatedById(group.getCreatedBy() != null ? group.getCreatedBy().getId() : null);
        groupDto.setRules(group.getRules());
    
        // Kiểm tra isMember và isAdmin
        if (reqUser != null) {
            Long userId = reqUser.getId();
            Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupIdAndUserId(group.getId(), userId);
            
            if (memberOpt.isPresent()) {
                GroupMember member = memberOpt.get();
                groupDto.setIsMember(true);
                // Người dùng là admin nếu vai trò là ADMIN hoặc là người tạo nhóm
                boolean isAdmin = member.getRole().equals(GroupMember.Role.ADMIN) ||
                                 (group.getCreatedBy() != null && group.getCreatedBy().getId().equals(userId));
                groupDto.setIsAdmin(isAdmin);
            } else {
                groupDto.setIsMember(false);
                groupDto.setIsAdmin(false);
            }
        } else {
            groupDto.setIsMember(false);
            groupDto.setIsAdmin(false);
        }
    
        return groupDto;
    }

    public GroupMemberDto toGroupMemberDto(GroupMember member, User requester) {
        UserDto userDto = toUserDto(member.getUser());
        GroupMemberDto memberDto = new GroupMemberDto();
        memberDto.setUser(userDto);
        memberDto.setRole(member.getRole().toString());
        memberDto.setJoinedAt(member.getJoinedAt());
        return memberDto;
    }

    public MembershipRequestDto toMembershipRequestDto(MembershipRequest request) {
        MembershipRequestDto requestDto = new MembershipRequestDto();
        requestDto.setId(request.getId());
        requestDto.setGroup(toGroupDto(request.getGroup(), null));
        requestDto.setUser(toUserDto(request.getUser()));
        requestDto.setStatus(request.getStatus().toString());
        requestDto.setCreatedAt(request.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return requestDto;
    }

    private UserDto toUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setUsername(user.getFirstName() + " " + user.getLastName());
        userDto.setImage(user.getImage());
        return userDto;
    }
}