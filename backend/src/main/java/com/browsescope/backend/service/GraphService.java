package com.browsescope.backend.service;

import com.browsescope.backend.model.GraphData;
import com.browsescope.backend.model.VisitRecord;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Reconstructs browsing "rabbit holes" from Chrome's from_visit chain.
 * Each visit optionally points to the visit it came from; chaining these
 * together reproduces the navigation path even though Chrome only stores a
 * flat visits table.
 *
 * Nodes are collapsed per-URL (not per-visit) so repeated visits to the same
 * page strengthen one node/edge instead of creating duplicates - this is what
 * makes the graph readable instead of an unreadable timeline of every click.
 */
@Service
public class GraphService {

    public GraphData buildGraph(List<VisitRecord> visits) {
        Map<Long, VisitRecord> visitById = new HashMap<>();
        for (VisitRecord v : visits) {
            visitById.put(v.getVisitId(), v);
        }

        Map<Long, GraphData.Node> nodesByUrlId = new LinkedHashMap<>();
        Map<String, GraphData.Edge> edgesByKey = new LinkedHashMap<>();

        for (VisitRecord v : visits) {
            nodesByUrlId.compute(v.getUrlId(), (id, existing) -> {
                if (existing == null) {
                    return new GraphData.Node(String.valueOf(id), v.getDomain(), v.getCategory(), 1);
                }
                existing.setVisitCount(existing.getVisitCount() + 1);
                return existing;
            });

            if (v.getFromVisitId() != 0 && visitById.containsKey(v.getFromVisitId())) {
                VisitRecord fromVisit = visitById.get(v.getFromVisitId());
                String sourceId = String.valueOf(fromVisit.getUrlId());
                String targetId = String.valueOf(v.getUrlId());

                if (sourceId.equals(targetId)) continue; // skip self-loops (reloads)

                String key = sourceId + "->" + targetId;
                edgesByKey.compute(key, (k, existing) -> {
                    if (existing == null) {
                        return new GraphData.Edge(sourceId, targetId, 1);
                    }
                    existing.setWeight(existing.getWeight() + 1);
                    return existing;
                });
            }
        }

        return new GraphData(new ArrayList<>(nodesByUrlId.values()), new ArrayList<>(edgesByKey.values()));
    }
}
