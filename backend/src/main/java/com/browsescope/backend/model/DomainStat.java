package com.browsescope.backend.model;

public class DomainStat {
    private String domain;
    private String category;
    private long visitCount;

    public DomainStat() {}

    public DomainStat(String domain, String category, long visitCount) {
        this.domain = domain;
        this.category = category;
        this.visitCount = visitCount;
    }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getVisitCount() { return visitCount; }
    public void setVisitCount(long visitCount) { this.visitCount = visitCount; }
}
