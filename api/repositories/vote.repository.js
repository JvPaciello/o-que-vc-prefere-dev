import db from '../database.js';

export function createVote(poolId, optionId, ipAddress) {
  return db
    .prepare('INSERT INTO Votos (id_enquete, id_opcao, ip_address) VALUES (?, ?, ?)')
    .run(poolId, optionId, ipAddress);
}

export function hasVoted(poolId, ipAddress) {
  const result = db
    .prepare('SELECT 1 FROM Votos WHERE id_enquete = ? AND ip_address = ? LIMIT 1')
    .get(poolId, ipAddress);
  
  return Boolean(result);
}

export function listVotesByPool(poolId) {
  return db
    .prepare('SELECT * FROM Votos WHERE id_enquete = ?')
    .all(poolId);
}
