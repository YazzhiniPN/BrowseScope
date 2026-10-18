package com.browsescope.backend.service;

import com.browsescope.backend.model.VisitRecord;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Holds the most recently parsed history in memory for this session.
 * BrowseScope is a single-user, local-first tool - nothing here is
 * persisted to a database or sent anywhere, by design (see the abstract's
 * privacy-first requirement). Swap this for a PostgreSQL-backed repository
 * later if you want visits to persist across restarts.
 */
@Service
public class HistoryStoreService {

    private List<VisitRecord> currentVisits = new ArrayList<>();

    public synchronized void setVisits(List<VisitRecord> visits) {
        this.currentVisits = visits;
    }

    public synchronized List<VisitRecord> getVisits() {
        return Collections.unmodifiableList(currentVisits);
    }

    public synchronized boolean hasData() {
        return !currentVisits.isEmpty();
    }
}
