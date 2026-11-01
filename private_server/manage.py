"""Single-user password setup. Never supply passwords in CLI args or commits."""
import getpass
import sqlite3
import sys
from werkzeug.security import generate_password_hash
from .app import DATA_DIR, setup_data

def main():
    if sys.argv[1:] not in (["init"], ["reset-password"]):
        raise SystemExit("Uso: python -m private_server.manage init | reset-password")
    command=sys.argv[1]
    setup_data()
    with sqlite3.connect(DATA_DIR / "lab.sqlite3") as db:
        existing=db.execute("SELECT id FROM admin WHERE id=1").fetchone()
        if command=="init" and existing:
            raise SystemExit("Administrador já existe. Use reset-password para trocar a senha.")
        p1=getpass.getpass("Nova senha (mínimo 16 caracteres): ")
        p2=getpass.getpass("Repita a senha: ")
        if p1 != p2 or len(p1)<16 or len(p1)>512:
            raise SystemExit("Senhas diferentes ou fora do limite de 16 a 512 caracteres.")
        password_hash=generate_password_hash(p1, method="scrypt")
        db.execute("INSERT INTO admin(id,password_hash,version) VALUES(1,?,1) ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash,version=admin.version+1",(password_hash,))
        db.execute("INSERT INTO audit(action,details_json,origin) VALUES('password_configured','{}','server')")
        db.commit()
    print("Senha configurada. Nenhuma senha foi gravada no repositório.")
if __name__=="__main__":
    main()
