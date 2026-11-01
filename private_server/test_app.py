"""Security checks for private Flask app; uses a temporary data directory."""
import importlib
import os
import pathlib
import tempfile
import unittest
from werkzeug.security import generate_password_hash

class PrivateAppTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        os.environ["R36S_DATA_DIR"] = cls.tmp.name
        os.environ["R36S_DEV_HTTP"] = "1"
        cls.mod = importlib.import_module("private_server.app")
        cls.app = cls.mod.create_app()
        cls.app.config.update(TESTING=True, WTF_CSRF_ENABLED=False)
        with cls.mod.db_connect() as db:
            db.execute("INSERT INTO admin(id,password_hash,version) VALUES (1,?,1)", (generate_password_hash("test-only-long-password", method="scrypt"),))
            db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def setUp(self):
        self.client = self.app.test_client()

    def test_public_routes_require_login(self):
        self.assertEqual(self.client.get("/").status_code,302)
        self.assertEqual(self.client.get("/api/audit").status_code,401)
        self.assertEqual(self.client.get("/src/app.js").status_code,302)
        self.assertEqual(self.client.get("/README.md").status_code,302)

    def test_login_and_event_log(self):
        self.assertEqual(self.client.post("/login",data={"password":"test-only-long-password"}).status_code,302)
        self.assertEqual(self.client.get("/").status_code,200)
        self.assertEqual(self.client.get("/README.md").status_code,404)
        self.assertEqual(self.client.post("/api/audit", json={"action":"theme_updated","details":{"system":"gba","filename":"private.zip"}}).status_code,201)
        response=self.client.get("/api/audit").get_json()
        self.assertTrue(any(x["action"] == "theme_updated" for x in response["events"]))
        self.assertFalse(any("filename" in x["details"] for x in response["events"]))
        self.assertEqual(self.client.post("/api/audit",json={"action":"exec_shell"}).status_code,400)
        self.assertEqual(self.client.post("/logout").status_code,302)
        self.assertEqual(self.client.get("/api/audit").status_code,401)

if __name__ == "__main__":
    unittest.main()
