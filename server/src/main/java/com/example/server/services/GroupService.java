package com.example.server.services;

import com.example.server.dto.GroupDto;
import com.example.server.dto.SerializablePagedGroupMembersDto;
import com.example.server.exception.UserException;
import com.example.server.models.Group;

import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;

public interface GroupService {
    public Group findGroupById(Long groupId) throws UserException;
    GroupDto createGroup(GroupDto groupDto, Long userId) throws UserException;
    GroupDto getGroupById(Long groupId, Long userId) throws UserException;
    PagedModel<?> getAllGroups(Long userId, Pageable pageable) throws UserException;
    PagedModel<?> getUserGroups(Long userId, Pageable pageable) throws UserException;
    GroupDto updateGroup(Long groupId, GroupDto groupDto, Long userId) throws UserException;
    void deleteGroup(Long groupId, Long userId) throws UserException;
    GroupDto addMember(Long groupId, Long userId, Long requesterId) throws UserException;
    GroupDto removeMember(Long groupId, Long userId, Long requesterId) throws UserException;
    GroupDto updateMemberRole(Long groupId, Long userId, String role, Long requesterId) throws UserException;
    public SerializablePagedGroupMembersDto getGroupMembers(Long groupId, Long userId, Pageable pageable) throws UserException;
    public void createMembershipRequest(Long groupId, Long userId, Long requesterId) throws UserException;
    public PagedModel<?> getUserMembershipRequests(Long userId, Pageable pageable) throws UserException;
    public GroupDto approveMembershipRequest(Long groupId, Long requestId, Long adminId) throws UserException;
    public void rejectMembershipRequest(Long groupId, Long requestId, Long adminId) throws UserException;
    public PagedModel<?> getMembershipRequests(Long groupId, Long adminId, Pageable pageable) throws UserException;
    public SerializablePagedGroupMembersDto searchGroupMembers(Long groupId, String query, Long userId, Pageable pageable) throws UserException;
}