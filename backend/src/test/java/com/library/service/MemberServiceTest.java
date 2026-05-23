package com.library.service;

import com.library.dto.MemberDto;
import com.library.dto.MemberRequest;
import com.library.enums.MemberStatus;
import com.library.exception.DuplicateResourceException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MemberServiceTest {

    @Autowired private MemberService memberService;

    @Test
    void createDefaultsToActive() {
        MemberDto m = memberService.create(MemberRequest.builder()
                .name("Grace Hopper").email("Grace@Example.com").build());
        assertThat(m.getStatus()).isEqualTo(MemberStatus.ACTIVE);
        assertThat(m.getEmail()).isEqualTo("grace@example.com");
    }

    @Test
    void duplicateEmailRejected() {
        memberService.create(MemberRequest.builder().name("A").email("dup@example.com").build());
        assertThatThrownBy(() -> memberService.create(
                MemberRequest.builder().name("B").email("DUP@example.com").build()))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void deactivateSetsInactive() {
        MemberDto m = memberService.create(MemberRequest.builder()
                .name("Linus").email("linus@example.com").build());
        MemberDto deactivated = memberService.deactivate(m.getId());
        assertThat(deactivated.getStatus()).isEqualTo(MemberStatus.INACTIVE);
    }
}
