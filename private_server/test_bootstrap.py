"""Integration tests for first-deploy provisioning on a persistent disk."""
import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CloudBootstrapTests(unittest.TestCase):
    def invoke(self, data_dir, password=None):
        env = os.environ.copy()
        env.update({"R36S_DATA_DIR": str(data_dir), "R36S_REQUIRE_ADMIN_ON_START": "1"})
        env.pop("R36S_DEV_HTTP", None)
        if password is not None:
            env["R36S_INITIAL_PASSWORD"] = password
        else:
            env.pop("R36S_INITIAL_PASSWORD", None)
        return subprocess.run(
            [sys.executable, "-c", "from private_server.app import create_app; create_app()"],
            cwd=ROOT, env=env, capture_output=True, text=True, timeout=15
        )

    def test_requires_admin_secret_on_first_boot_only(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            self.assertNotEqual(self.invoke(folder).returncode, 0)
            self.assertNotEqual(self.invoke(folder, "short").returncode, 0)
            initial="Unique-testing-only-secret-1234567890!"
            seeded=self.invoke(folder, initial)
            self.assertEqual(seeded.returncode, 0, seeded.stderr[-800:])
            with sqlite3.connect(folder / "lab.sqlite3") as db:
                stored=db.execute("SELECT password_hash FROM admin").fetchone()[0]
                self.assertNotEqual(stored, initial)
                self.assertIn("scrypt:", stored)
                self.assertEqual(db.execute("SELECT count(*) FROM admin").fetchone()[0], 1)
            restarted=self.invoke(folder)
            self.assertEqual(restarted.returncode, 0, restarted.stderr[-800:])
            with sqlite3.connect(folder / "lab.sqlite3") as db:
                self.assertEqual(db.execute("SELECT count(*) FROM admin").fetchone()[0], 1)


if __name__ == "__main__":
    unittest.main()
