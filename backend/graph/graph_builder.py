import networkx as nx
from typing import List, Dict

def build_graph(transactions: List[Dict]) -> nx.DiGraph:
    G = nx.DiGraph()
    for tx in transactions:
        G.add_edge(
            tx["sender_hash"],
            tx["receiver_hash"],
            amount=tx["amount"],
            timestamp=tx["timestamp"],
            currency=tx.get("currency", "USD")
        )
    return G

def graph_to_json(G: nx.DiGraph) -> Dict:
    return {
        "nodes": [{"id": n} for n in G.nodes()],
        "edges": [
            {"source": u, "target": v, **d}
            for u, v, d in G.edges(data=True)
        ]
    }
