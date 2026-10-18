import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { getGraph } from '../api.js';

const CATEGORY_COLORS = {
  productive: '#22c55e',
  educational: '#38bdf8',
  news: '#a78bfa',
  shopping: '#fbbf24',
  social: '#f472b6',
  entertainment: '#f87171',
  other: '#6b7280'
};

export default function NavigationGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    getGraph().then(setGraph);
  }, []);

  const { flowNodes, flowEdges } = useMemo(() => layout(graph), [graph]);

  return (
    <div className="card" style={{ height: 560 }}>
      <h3>Navigation Graph — your browsing "rabbit holes"</h3>
      <p style={{ color: '#999', fontSize: '0.85rem', marginTop: -6 }}>
        Each node is a site you visited; an arrow means you navigated from one to the
        other. Thicker/more frequent transitions mean you made that jump more often.
      </p>
      <div style={{ height: 460 }}>
        <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
          <Background color="#2a2d3a" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

// Simple radial/grid layout since the backend only returns raw nodes+edges,
// not positions - a force-directed layout library (e.g. dagre) could replace
// this if the graph gets large.
function layout(graph) {
  const cols = Math.ceil(Math.sqrt(graph.nodes.length || 1));
  const spacingX = 180;
  const spacingY = 120;

  const flowNodes = graph.nodes.map((n, i) => ({
    id: n.id,
    data: { label: `${n.label} (${n.visitCount})` },
    position: { x: (i % cols) * spacingX, y: Math.floor(i / cols) * spacingY },
    style: {
      background: CATEGORY_COLORS[n.category] || '#6b7280',
      color: '#0f1117',
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 600,
      border: 'none',
      padding: 6
    }
  }));

  const flowEdges = graph.edges.map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.weight > 1 ? String(e.weight) : undefined,
    animated: e.weight > 3,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#3b82f6', strokeWidth: Math.min(1 + e.weight / 3, 5) }
  }));

  return { flowNodes, flowEdges };
}
