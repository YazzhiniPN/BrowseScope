package com.browsescope.backend.model;

public class VisitRecord {
    private long visitId;
    private long urlId;
    private String url;
    private String title;
    private String domain;
    private String category;
    private long visitTimeEpochMillis; // normalized to standard Unix epoch millis
    private long fromVisitId;          // 0 if this was a fresh navigation (typed, bookmark, etc.)

    public VisitRecord() {}

    public VisitRecord(long visitId, long urlId, String url, String title, String domain,
                        String category, long visitTimeEpochMillis, long fromVisitId) {
        this.visitId = visitId;
        this.urlId = urlId;
        this.url = url;
        this.title = title;
        this.domain = domain;
        this.category = category;
        this.visitTimeEpochMillis = visitTimeEpochMillis;
        this.fromVisitId = fromVisitId;
    }

    public long getVisitId() { return visitId; }
    public void setVisitId(long visitId) { this.visitId = visitId; }

    public long getUrlId() { return urlId; }
    public void setUrlId(long urlId) { this.urlId = urlId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getVisitTimeEpochMillis() { return visitTimeEpochMillis; }
    public void setVisitTimeEpochMillis(long visitTimeEpochMillis) { this.visitTimeEpochMillis = visitTimeEpochMillis; }

    public long getFromVisitId() { return fromVisitId; }
    public void setFromVisitId(long fromVisitId) { this.fromVisitId = fromVisitId; }
}
