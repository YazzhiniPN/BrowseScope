package com.browsescope.backend.controller;

import com.browsescope.backend.model.*;
import com.browsescope.backend.service.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryParserService parserService;
    private final HistoryStoreService storeService;
    private final GraphService graphService;
    private final CategorizationService categorizationService;

    public HistoryController(HistoryParserService parserService,
                              HistoryStoreService storeService,
                              GraphService graphService,
                              CategorizationService categorizationService) {
        this.parserService = parserService;
        this.storeService = storeService;
        this.graphService = graphService;
        this.categorizationService = categorizationService;
    }

    /**
     * Upload a copy of the browser's SQLite "History" file.
     * On Windows it typically lives at:
     * C:\Users\<you>\AppData\Local\Google\Chrome\User Data\Default\History
     * Close the browser (or copy the file elsewhere) before uploading, since
     * Chrome locks it while running.
     */
    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        File tempFile = File.createTempFile("browsescope-history", ".sqlite");
        file.transferTo(tempFile);

        List<VisitRecord> visits = parserService.parse(tempFile.getAbsolutePath());
        storeService.setVisits(visits);

        Files.deleteIfExists(tempFile.toPath());

        Map<String, Object> response = new HashMap<>();
        response.put("visitsLoaded", visits.size());
        return response;
    }

    @GetMapping("/visits")
    public List<VisitRecord> getVisits(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return filtered(search, category);
    }

    @GetMapping("/stats/domains")
    public List<DomainStat> domainStats() {
        Map<String, DomainStat> byDomain = new LinkedHashMap<>();
        for (VisitRecord v : storeService.getVisits()) {
            byDomain.compute(v.getDomain(), (d, existing) -> {
                if (existing == null) return new DomainStat(d, v.getCategory(), 1);
                existing.setVisitCount(existing.getVisitCount() + 1);
                return existing;
            });
        }
        return byDomain.values().stream()
                .sorted((a, b) -> Long.compare(b.getVisitCount(), a.getVisitCount()))
                .collect(Collectors.toList());
    }

    @GetMapping("/stats/daily")
    public Map<String, Long> dailyActivity() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> byDay = new TreeMap<>();
        for (VisitRecord v : storeService.getVisits()) {
            String day = toZonedDateTime(v.getVisitTimeEpochMillis()).format(fmt);
            byDay.merge(day, 1L, Long::sum);
        }
        return byDay;
    }

    @GetMapping("/stats/hourly")
    public Map<Integer, Long> hourlyActivity() {
        Map<Integer, Long> byHour = new TreeMap<>();
        for (int h = 0; h < 24; h++) byHour.put(h, 0L);
        for (VisitRecord v : storeService.getVisits()) {
            int hour = toZonedDateTime(v.getVisitTimeEpochMillis()).getHour();
            byHour.merge(hour, 1L, Long::sum);
        }
        return byHour;
    }

    @GetMapping("/productivity")
    public ProductivityScore productivity() {
        return categorizationService.score(storeService.getVisits());
    }

    @GetMapping("/graph")
    public GraphData navigationGraph() {
        return graphService.buildGraph(storeService.getVisits());
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("hasData", storeService.hasData());
        response.put("visitCount", storeService.getVisits().size());
        return response;
    }

    private List<VisitRecord> filtered(String search, String category) {
        return storeService.getVisits().stream()
                .filter(v -> search == null || search.isBlank()
                        || v.getUrl().toLowerCase().contains(search.toLowerCase())
                        || (v.getTitle() != null && v.getTitle().toLowerCase().contains(search.toLowerCase())))
                .filter(v -> category == null || category.isBlank() || v.getCategory().equalsIgnoreCase(category))
                .sorted((a, b) -> Long.compare(b.getVisitTimeEpochMillis(), a.getVisitTimeEpochMillis()))
                .collect(Collectors.toList());
    }

    private ZonedDateTime toZonedDateTime(long epochMillis) {
        return Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault());
    }
}
