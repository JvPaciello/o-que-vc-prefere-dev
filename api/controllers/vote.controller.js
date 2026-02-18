import { getPool } from '../repositories/pool.repository.js';
import { createVote, hasVoted, listVotesByPool } from '../repositories/vote.repository.js';
import { listOptionsByPool } from '../repositories/option.repository.js';

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.socket.remoteAddress ||
         req.connection.remoteAddress;
}

function calculateVoteDistribution(options, votes) {
  return options.map((option) => {
    const votesCount = votes.filter(vote => vote.id_opcao === option.id).length;
    return {
      id: option.id,
      name: option.nome,
      votes: votesCount
    };
  });
}

export function create(req, res) {
  const { id_option } = req.body;
  
  if (!id_option) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Option ID is required'
    });
  }

  const pool = getPool(1);
  
  if (!pool) {
    return res.status(404).json({ 
      error: 'Not found',
      message: 'Poll not found'
    });
  }

  if (pool.expirada) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'This poll has expired'
    });
  }

  const ipAddress = getClientIp(req);
  
  if (hasVoted(pool.id, ipAddress)) {
    return res.status(409).json({ 
      error: 'Duplicate vote',
      message: 'You have already voted in this poll'
    });
  }

  try {
    createVote(pool.id, id_option, ipAddress);
    
    const options = listOptionsByPool(pool.id);
    const votes = listVotesByPool(pool.id);
    const distribution = calculateVoteDistribution(options, votes);

    res.status(201).json({ 
      id_pool: pool.id,
      id_option,
      options: distribution,
      countVotes: votes.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to register vote'
    });
  }
}