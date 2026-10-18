package com.browsescope.backend.service;

import com.browsescope.backend.model.VisitRecord;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses a Chromium-family "History" SQLite file (Chrome, Edge, Brave all use the
 * same schema: urls + visits tables).
 *
 * IMPORTANT: Chrome locks its live History file while running, so the user must
 * either close the browser first or upload a COPY of the file. The parser opens
 * the file read-only and never writes back to it.
 *
 * Chrome timestamps are stored as microseconds since 1601-01-01 (the WebKit/Chrome
 * epoch), so every timestamp is converted to standard Unix epoch millis here, once,
 * so the rest of the app never has to think about it again.
 */
@Service
public class HistoryParserService {

    private static final long CHROME_EPOCH_DIFF_MICROS = 11_644_473_600_000_000L;

    private final CategorizationService categorizationService;

    public HistoryParserService(CategorizationService categorizationService) {
        this.categorizationService = categorizationService;
    }

    public List<VisitRecord> parse(String sqliteFilePath) {
        List<VisitRecord> results = new ArrayList<>();

        String jdbcUrl = "jdbc:sqlite:file:" + sqliteFilePath + "?immutable=1";

        String sql = """
                SELECT v.id            AS visit_id,
                       v.visit_time    AS visit_time,
                       v.from_visit    AS from_visit,
                       u.id            AS url_id,
                       u.url           AS url,
                       u.title         AS title
                FROM visits v
                JOIN urls u ON v.url = u.id
                ORDER BY v.visit_time ASC
                """;

        try (Connection conn = DriverManager.getConnection(jdbcUrl);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                long visitId = rs.getLong("visit_id");
                long chromeTimeMicros = rs.getLong("visit_time");
                long fromVisit = rs.getLong("from_visit");
                long urlId = rs.getLong("url_id");
                String url = rs.getString("url");
                String title = rs.getString("title");

                String domain = extractDomain(url);
                String category = categorizationService.categorize(domain);
                long epochMillis = chromeTimeToEpochMillis(chromeTimeMicros);

                results.add(new VisitRecord(visitId, urlId, url, title, domain, category, epochMillis, fromVisit));
            }

        } catch (SQLException e) {
            throw new RuntimeException(
                    "Could not read the History file. Make sure the browser is closed " +
                    "(or you uploaded a copy), and that the path points to a valid " +
                    "Chromium 'History' SQLite file.", e);
        }

        return results;
    }

    private long chromeTimeToEpochMillis(long chromeMicros) {
        if (chromeMicros == 0) return 0;
        long unixMicros = chromeMicros - CHROME_EPOCH_DIFF_MICROS;
        return unixMicros / 1000;
    }

    private String extractDomain(String url) {
        try {
            String host = URI.create(url).getHost();
            return host == null ? "unknown" : host.toLowerCase();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
