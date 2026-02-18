import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'dev.db')

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS Enquetes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_enquete TEXT,
    data_fim TEXT,
    expirada INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Opcoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_enquete INTEGER,
    nome TEXT,
    FOREIGN KEY (id_enquete) REFERENCES Enquetes(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Votos (
    id_enquete INTEGER,
    id_opcao INTEGER,
    ip_address TEXT,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_enquete) REFERENCES Enquetes(id),
    FOREIGN KEY (id_opcao) REFERENCES Opcoes(id)
  )
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vote_per_ip 
  ON Votos(id_enquete, ip_address)
`);

export default db;