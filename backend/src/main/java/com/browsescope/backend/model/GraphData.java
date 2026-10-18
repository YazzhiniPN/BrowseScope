package com.browsescope.backend.model;

import java.util.List;

public class GraphData {
    private List<Node> nodes;
    private List<Edge> edges;

    public GraphData() {}

    public GraphData(List<Node> nodes, List<Edge> edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    public List<Node> getNodes() { return nodes; }
    public void setNodes(List<Node> nodes) { this.nodes = nodes; }

    public List<Edge> getEdges() { return edges; }
    public void setEdges(List<Edge> edges) { this.edges = edges; }

    public static class Node {
        private String id;      // urlId as string
        private String label;   // domain
        private String category;
        private long visitCount;

        public Node() {}

        public Node(String id, String label, String category, long visitCount) {
            this.id = id;
            this.label = label;
            this.category = category;
            this.visitCount = visitCount;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public long getVisitCount() { return visitCount; }
        public void setVisitCount(long visitCount) { this.visitCount = visitCount; }
    }

    public static class Edge {
        private String source; // urlId as string
        private String target; // urlId as string
        private long weight;   // number of times this transition happened

        public Edge() {}

        public Edge(String source, String target, long weight) {
            this.source = source;
            this.target = target;
            this.weight = weight;
        }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public long getWeight() { return weight; }
        public void setWeight(long weight) { this.weight = weight; }
    }
}
