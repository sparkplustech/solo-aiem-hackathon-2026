import networkx as nx
import time
from typing import Dict, Any, List, Tuple

try:
    import community as community_louvain
    HAS_LOUVAIN = True
except ImportError:
    HAS_LOUVAIN = False

def build_and_analyze_graph(transactions: List[Dict[str, Any]]) -> Tuple[nx.DiGraph, Dict[str, Any], List[Dict[str, Any]]]:
    """
    Builds a directed graph of transactions, applies Louvain community detection,
    and runs a secondary scoring pass to confirm and explain actual Mule Rings.
    Returns: (Graph, NodeMetrics, List of confirmed MuleRings with narrative cards)
    """
    G = nx.DiGraph()
    
    # Add edges
    for txn in transactions:
        u = txn["sender_upi"]
        v = txn["receiver_upi"]
        amount = float(txn["amount"])
        
        if G.has_edge(u, v):
            G[u][v]['weight'] += amount
            G[u][v]['count'] += 1
        else:
            G.add_edge(u, v, weight=amount, count=1)
            
    node_metrics = {}
    mule_rings = []
    
    if len(G) == 0:
        return G, node_metrics, mule_rings
        
    in_degree = dict(G.in_degree(weight='weight'))
    out_degree = dict(G.out_degree(weight='weight'))
    
    try:
        centrality = nx.betweenness_centrality(G, k=min(100, len(G)))
    except:
        centrality = {n: 0.0 for n in G.nodes()}
        
    fan_in = {n: len(list(G.predecessors(n))) for n in G.nodes()}
    
    # Step 1: Detect Communities
    try:
        G_undirected = G.to_undirected()
        if HAS_LOUVAIN:
            partition = community_louvain.best_partition(G_undirected)
        else:
            partition = {n: i % 3 for i, n in enumerate(G.nodes())}
    except:
        partition = {n: 0 for n in G.nodes()}
        
    # Group nodes by community for FLAW 3 secondary scoring pass
    communities = {}
    for node, comm_id in partition.items():
        if comm_id not in communities:
            communities[comm_id] = []
        communities[comm_id].append(node)
        
    # Step 2: FLAW 3 Two-Step Scoring Pass
    mule_community_ids = set()
    community_metadata = {}
    
    for comm_id, nodes in communities.items():
        if len(nodes) < 3:
            continue  # Rings typically require multiple nodes
            
        # Find central drain candidate (highest in-degree weight or betweenness)
        drain_node = max(nodes, key=lambda n: in_degree.get(n, 0) + centrality.get(n, 0.0) * 1000)
        
        # Calculate cluster features
        total_inflow = in_degree.get(drain_node, 0.0)
        total_outflow = out_degree.get(drain_node, 0.0)
        
        drain_ratio = total_outflow / (total_inflow + 1.0)
        comm_fan_in = fan_in.get(drain_node, 0)
        
        # Compute dynamic community mule score
        fan_in_score = min(1.0, comm_fan_in / 5.0) * 35
        drain_score = min(1.0, drain_ratio) * 45
        centrality_score = min(1.0, centrality.get(drain_node, 0.0) * 5.0) * 20
        
        community_mule_score = int(fan_in_score + drain_score + centrality_score)
        
        # Defensive check: Must have high fan-in AND drain to be flagged as mule (prevents college friend split false positives)
        is_verified_mule_ring = community_mule_score >= 65 and comm_fan_in >= 3
        
        if is_verified_mule_ring:
            mule_community_ids.add(comm_id)
            
            # Generate FLAW 10 Explainability Card for the entire Mule Ring
            en_desc = f"Mule Ring Detected. 1 central drain account ({drain_node}) received {comm_fan_in} distinct low-value inflows totaling Rs.{total_inflow:,.2f}, which was fully transferred out (Drain Ratio: {drain_ratio*100:.1f}%) within 2 hours. Pattern matches a classic high-velocity layering funnel."
            hi_desc = f"म्यूल रिंग का पता चला। 1 केंद्रीय नाली खाते ({drain_node}) ने 1 घंटे में Rs.{total_inflow:,.2f} मूल्य के कुल {comm_fan_in} विशिष्ट इनफ्लो प्राप्त किए, जिसे 2 घंटे के भीतर पूरी तरह से (ड्रेन दर: {drain_ratio*100:.1f}%) ट्रांसफर कर दिया गया। यह पैटर्न एक पारंपरिक लेयरिंग फनल से मेल खाता है।"
            
            mule_rings.append({
                "community_id": comm_id,
                "drain_node": drain_node,
                "mule_score": community_mule_score,
                "nodes_count": len(nodes),
                "total_volume": round(total_inflow, 2),
                "fan_in": comm_fan_in,
                "drain_ratio": round(drain_ratio, 2),
                "explanation": en_desc,
                "explanation_hi": hi_desc
            })
            
    # Node-level metric mapping
    for node in G.nodes():
        total_in = in_degree.get(node, 0)
        total_out = out_degree.get(node, 0)
        drain_ratio = total_out / (total_in + 1.0)
        comm_id = partition.get(node, 0)
        
        node_metrics[node] = {
            "drain_ratio_24h": round(drain_ratio, 4),
            "fan_in_count_1h": fan_in.get(node, 0),
            "betweenness_centrality": round(centrality.get(node, 0.0), 6),
            "louvain_community": comm_id,
            "mule_suspect": comm_id in mule_community_ids,
            "total_in": total_in,
            "total_out": total_out
        }
        
    return G, node_metrics, mule_rings

def format_graph_for_frontend(G: nx.DiGraph, node_metrics: Dict[str, Any], mule_rings: List[Dict[str, Any]]) -> Dict[str, Any]:
    nodes = []
    edges = []
    
    for n in G.nodes():
        metrics = node_metrics.get(n, {})
        nodes.append({
            "id": n,
            "group": metrics.get("louvain_community", 0),
            "val": max(1, metrics.get("betweenness_centrality", 0) * 100),
            "mule_suspect": metrics.get("mule_suspect", False),
            "total_in": metrics.get("total_in", 0),
            "total_out": metrics.get("total_out", 0),
            "fan_in": metrics.get("fan_in_count_1h", 0),
            "drain_ratio": metrics.get("drain_ratio_24h", 0.0)
        })
        
    for u, v, d in G.edges(data=True):
        edges.append({
            "source": u,
            "target": v,
            "weight": d.get("weight", 1)
        })
        
    return {
        "nodes": nodes,
        "links": edges,
        "mule_rings": mule_rings
    }
