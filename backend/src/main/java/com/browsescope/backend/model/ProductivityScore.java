package com.browsescope.backend.model;

import java.util.Map;

public class ProductivityScore {
    private double overallScore; // 0-100
    private Map<String, Long> visitsByCategory;
    private Map<String, Double> weightByCategory;

    public ProductivityScore() {}

    public ProductivityScore(double overallScore, Map<String, Long> visitsByCategory,
                              Map<String, Double> weightByCategory) {
        this.overallScore = overallScore;
        this.visitsByCategory = visitsByCategory;
        this.weightByCategory = weightByCategory;
    }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

    public Map<String, Long> getVisitsByCategory() { return visitsByCategory; }
    public void setVisitsByCategory(Map<String, Long> visitsByCategory) { this.visitsByCategory = visitsByCategory; }

    public Map<String, Double> getWeightByCategory() { return weightByCategory; }
    public void setWeightByCategory(Map<String, Double> weightByCategory) { this.weightByCategory = weightByCategory; }
}
