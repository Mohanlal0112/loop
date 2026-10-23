import json
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Maps team_id -> set of WebSockets
        self.team_connections: Dict[str, Set[WebSocket]] = {}
        # Set of Organizer WebSockets
        self.organizer_connections: Set[WebSocket] = set()
        # General connected WebSockets
        self.all_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, role: str = "guest", identifier: str = None):
        await websocket.accept()
        self.all_connections.add(websocket)
        if role == "organizer":
            self.organizer_connections.add(websocket)
        elif role == "team" and identifier:
            if identifier not in self.team_connections:
                self.team_connections[identifier] = set()
            self.team_connections[identifier].add(websocket)

    def disconnect(self, websocket: WebSocket, role: str = "guest", identifier: str = None):
        self.all_connections.discard(websocket)
        if role == "organizer":
            self.organizer_connections.discard(websocket)
        elif role == "team" and identifier and identifier in self.team_connections:
            self.team_connections[identifier].discard(websocket)
            if not self.team_connections[identifier]:
                del self.team_connections[identifier]

    async def broadcast_all(self, event_type: str, data: dict = None):
        message = json.dumps({"event": event_type, "data": data or {}})
        dead_conns = []
        for conn in list(self.all_connections):
            try:
                await conn.send_text(message)
            except Exception:
                dead_conns.append(conn)
        for dead in dead_conns:
            self.all_connections.discard(dead)
            self.organizer_connections.discard(dead)

    async def broadcast_organizers(self, event_type: str, data: dict = None):
        message = json.dumps({"event": event_type, "data": data or {}})
        dead_conns = []
        for conn in list(self.organizer_connections):
            try:
                await conn.send_text(message)
            except Exception:
                dead_conns.append(conn)
        for dead in dead_conns:
            self.organizer_connections.discard(dead)

    async def send_to_team(self, team_id: str, event_type: str, data: dict = None):
        message = json.dumps({"event": event_type, "data": data or {}})
        if team_id in self.team_connections:
            dead_conns = []
            for conn in list(self.team_connections[team_id]):
                try:
                    await conn.send_text(message)
                except Exception:
                    dead_conns.append(conn)
            for dead in dead_conns:
                self.team_connections[team_id].discard(dead)

ws_manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, role: str = "guest", identifier: str = None):
    await ws_manager.connect(websocket, role, identifier)
    try:
        while True:
            # Keep-alive heartbeat & client messages
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, role, identifier)
    except Exception:
        ws_manager.disconnect(websocket, role, identifier)
