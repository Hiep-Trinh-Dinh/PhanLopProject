package com.example.server.dto;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SerializablePagedGroupMembersDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<GroupMemberDto> members;
    private long pageSize;
    private long pageNumber;
    private long totalElements;
    private long totalPages;
}