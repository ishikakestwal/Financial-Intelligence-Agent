import networkx as nx
from typing import List

def detect_cycles(G: nx.DiGraph) -> List[List[str]]:
    return list(nx.simple_cycles(G))
