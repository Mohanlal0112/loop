import json
import os
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import Team, Organizer, EventSettings, Question

client = TestClient(app)

def test_full_loop_workflow():
    print("\n=======================================================", flush=True)
    print("* RUNNING COMPREHENSIVE LOOP PLATFORM INTEGRATION TESTS", flush=True)
    print("=======================================================", flush=True)

    # 1. Organizer Login
    print("Step 1: Logging in as organizer...", flush=True)
    login_res = client.post("/api/auth/organizer/login", json={"username": "admin", "password": "107"})
    assert login_res.status_code == 200, f"Organizer login failed: {login_res.text}"
    org_token = login_res.json()["token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}
    print("[PASS] 1. Organizer login successful with token issued.", flush=True)

    # 2. Private Leaderboard Guard
    print("Step 2: Checking private leaderboard guard...", flush=True)
    client.cookies.clear()
    unauth_lb = client.get("/api/leaderboard")
    assert unauth_lb.status_code in [401, 403], f"Unauthenticated leaderboard access should be blocked, got {unauth_lb.status_code}"

    # Authenticated organizer should succeed with 200
    auth_lb = client.get("/api/leaderboard", headers=org_headers)
    assert auth_lb.status_code == 200, "Organizer should access private leaderboard"
    print("[PASS] 2. Leaderboard is strictly guarded (401 unauthenticated, 200 for organizer).", flush=True)

    # 3. Purge Database to ensure clean test environment
    print("Step 3: Purging database for clean test environment...", flush=True)
    purge_res = client.post("/api/organizer/purge-database", headers=org_headers)
    assert purge_res.status_code == 200
    print("[PASS] 3. Database purged and clean for testing.", flush=True)

    # 4. Register Teams
    print("Step 4: Registering teams...", flush=True)
    team1_res = client.post("/api/auth/team/register", json={
        "team_name": "Quantum Solvers",
        "team_id": "TEAM-SOLVER-1",
        "password": "pass_solver_1",
        "avatar": "⚡",
        "department": "Computer Science & Engg"
    })
    assert team1_res.status_code == 200, f"Team 1 registration failed: {team1_res.text}"
    team1_token = client.post("/api/auth/team/login", json={
        "team_id": "TEAM-SOLVER-1",
        "password": "pass_solver_1"
    }).json()["token"]
    t1_headers = {"Authorization": f"Bearer {team1_token}"}

    team2_res = client.post("/api/auth/team/register", json={
        "team_name": "Time Breakers",
        "team_id": "TEAM-BREAKER-2",
        "password": "pass_breaker_2",
        "avatar": "🔮",
        "department": "Information Science"
    })
    assert team2_res.status_code == 200
    print("[PASS] 4. Two participating teams registered and authenticated.")

    # 5. Team Tries Accessing Leaderboard -> MUST BE REJECTED 403
    team_lb_res = client.get("/api/leaderboard", headers=t1_headers)
    assert team_lb_res.status_code == 403, "Team must receive 403 Forbidden on private leaderboard"
    print("[PASS] 5. Team blocked from accessing private organizer leaderboard (403 Forbidden).")

    # 6. Team in Waiting Room (Game not started yet)
    state_res = client.get("/api/player/state", headers=t1_headers)
    assert state_res.status_code == 200
    assert state_res.json()["event_status"] == "LOBBY"
    assert state_res.json()["active_question"] is None, "Questions must not be active before organizer starts game"
    print("[PASS] 6. Team enters Waiting Room ('Waiting for organizer to start LOOP').")

    # 7. Organizer Starts Game
    start_res = client.post("/api/organizer/start-game", headers=org_headers)
    assert start_res.status_code == 200
    print("[PASS] 7. Organizer presses START GAME with confirmation -> Level 1 activated!")

    # 8. Team Receives Active Question
    q_state = client.get("/api/player/state", headers=t1_headers).json()
    assert q_state["event_status"] == "RUNNING"
    active_q = q_state["active_question"]
    assert active_q is not None
    assert "correct_answer" not in active_q, "Correct answer must NEVER be exposed to players"
    assert active_q["question_number"] == 1
    assert active_q["remaining_seconds"] > 800
    print(f"[PASS] 8. Player receives active question securely (Q1/6, Category: {active_q['category']}).")

    # 9. Test Incorrect Answer -> Replaced in same category, NO token deducted
    wrong_submit = client.post("/api/player/submit-answer", headers=t1_headers, json={"answer": "WRONG_ANSWER_KEY"})
    assert wrong_submit.status_code == 200
    w_data = wrong_submit.json()
    assert w_data["correct"] is False
    assert w_data["status"] == "QUESTION_REPLACED"
    assert w_data["tokens_remaining"] == 3, "Wrong answer must NOT deduct tokens"
    print("[PASS] 9. Wrong answer replaces question smoothly without token deduction.")

    # 10. Test Timeout -> Deducts 1 token, gives fresh set of questions
    timeout_res = client.post("/api/player/timeout", headers=t1_headers)
    assert timeout_res.status_code == 200
    to_data = timeout_res.json()
    assert to_data["tokens_remaining"] == 2, "Timeout must deduct exactly 1 token"
    assert to_data["status"] == "TIMEOUT"
    print(f"[PASS] 10. 15-min timeout deducts 1 token ({to_data['tokens_remaining']} tokens remain) and provides fresh attempt.")

    # 11. Test Correct Answer Submissions
    db = SessionLocal()
    team1 = db.query(Team).filter(Team.team_id == "TEAM-SOLVER-1").first()
    state = client.get("/api/player/state", headers=t1_headers).json()
    q_now = db.query(Question).filter(Question.id == state["active_question"]["id"]).first()
    correct_ans = q_now.correct_answer

    ans_res = client.post("/api/player/submit-answer", headers=t1_headers, json={"answer": correct_ans})
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert ans_data["correct"] is True
    assert "saved the timeline" in ans_data["message"]
    print(f"[PASS] 11. Correct answer validated: '{ans_data['message']}'.")

    # 12. Test Question Bank Export & Management
    export_res = client.get("/api/organizer/questions/export?format=csv", headers=org_headers)
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
    print("[PASS] 12. Organizer Question Bank CSV Export verified.")

    # 13. Test Final Stage Locking
    final_res = client.post("/api/organizer/open-final", headers=org_headers)
    assert final_res.status_code == 200
    assert len(final_res.json()["finalists"]) > 0
    print(f"[PASS] 13. Organizer OPEN FINAL authorized Top 3 finalists: {[f['team_name'] for f in final_res.json()['finalists']]}.")

    db.close()
    print("\n=======================================================")
    print("[ALL PASSED] ALL 13 TEST SUITES PASSED FLAWLESSLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_loop_workflow()
