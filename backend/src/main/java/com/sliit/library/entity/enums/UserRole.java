package com.sliit.library.entity.enums;

import lombok.Getter;

@Getter
public enum UserRole {
    UNDERGRADUATE("Undergraduate Student", 4, 14),
    POSTGRADUATE("Postgraduate Student", 6, 21),
    FACULTY("Faculty Member", 10, 30),
    LIBRARIAN("Librarian", 20, 30),
    ADMIN("Library Administrator", 50, 60);

    private final String displayName;
    private final int defaultMaxLoans;
    private final int defaultLoanPeriod;

    UserRole(String displayName, int defaultMaxLoans, int defaultLoanPeriod) {
        this.displayName = displayName;
        this.defaultMaxLoans = defaultMaxLoans;
        this.defaultLoanPeriod = defaultLoanPeriod;
    }
}
