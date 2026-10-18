package com.browsescope.backend.service;

import com.browsescope.backend.model.ProductivityScore;
import com.browsescope.backend.model.VisitRecord;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

/**
 * Maps domains to categories (productive / educational / social / entertainment /
 * shopping / news / other) and turns a set of visits into a productivity score.
 *
 * The mapping lives in categories.json so it can be edited without touching code -
 * e.g. to add your own frequently visited sites.
 */
@Service
public class CategorizationService {

    private final Map<String, String> domainToCategory = new HashMap<>();
    private final Map<String, Double> categoryWeights = new HashMap<>();

    @PostConstruct
    public void loadCategories() {
        try (InputStream is = new ClassPathResource("categories.json").getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(is);

            JsonNode categories = root.get("categories");
            Iterator<String> catNames = categories.fieldNames();
            while (catNames.hasNext()) {
                String category = catNames.next();
                for (JsonNode domainNode : categories.get(category)) {
                    domainToCategory.put(domainNode.asText().toLowerCase(), category);
                }
            }

            JsonNode weights = root.get("categoryWeights");
            Iterator<String> weightNames = weights.fieldNames();
            while (weightNames.hasNext()) {
                String category = weightNames.next();
                categoryWeights.put(category, weights.get(category).asDouble());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load categories.json", e);
        }
    }

    public String categorize(String domain) {
        if (domain == null) return "other";
        String normalized = domain.toLowerCase().replaceFirst("^www\\.", "");
        return domainToCategory.getOrDefault(normalized, "other");
    }

    /**
     * Weighted productivity score, scaled to 0-100.
     * Each visit contributes its category's weight; the raw sum is normalized
     * against the maximum possible score (all visits in the most productive category)
     * so the result is always comparable across data sets of different sizes.
     */
    public ProductivityScore score(List<VisitRecord> visits) {
        Map<String, Long> visitsByCategory = new TreeMap<>();
        double rawScore = 0;

        for (VisitRecord v : visits) {
            visitsByCategory.merge(v.getCategory(), 1L, Long::sum);
            rawScore += categoryWeights.getOrDefault(v.getCategory(), 0.0);
        }

        double maxPossible = visits.size() * 1.0; // 1.0 is the highest weight (productive)
        double normalized = maxPossible == 0
                ? 0
                : ((rawScore / maxPossible) + 1.0) / 2.0 * 100.0; // shift [-1,1] -> [0,100]

        normalized = Math.max(0, Math.min(100, normalized));

        return new ProductivityScore(Math.round(normalized * 10.0) / 10.0, visitsByCategory, categoryWeights);
    }
}
