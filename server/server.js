import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || '*'

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

// Health check endpoint for Render & Vercel
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Radha vs Indransh — The Diwali Love War ❤️',
    activeRooms: Object.keys(rooms).length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Active game rooms stored in memory
const rooms = {}
// Private timer storage to prevent circular reference serialization in Socket.io
const roomTimers = {}

function clearRoomTimers(code) {
  if (roomTimers[code]) {
    if (roomTimers[code].timer) clearInterval(roomTimers[code].timer)
    if (roomTimers[code].obstacle) clearInterval(roomTimers[code].obstacle)
    if (roomTimers[code].coopTick) clearInterval(roomTimers[code].coopTick)
    delete roomTimers[code]
  }
}

// Authoritative Ability Definitions
const ABILITIES = {
  // Indransh Powers (Left Player)
  smile: {
    damage: 0,
    heal: 30,
    energy: 25,
    cd: 4000,
    name: "Radha's Smile ❤️",
    message: "Radha smiled! Indransh regained his happiness. ❤️"
  },
  love_bomb: {
    damage: 20,
    heal: 0,
    energy: 20,
    cd: 2500,
    name: 'Love Bomb 💖',
    message: 'Love Bomb launched! Pure magic in the air.'
  },
  phuljhadi: {
    damage: 8,
    heal: 0,
    energy: 8,
    cd: 800,
    name: 'Golden Phuljhadi ✨',
    message: 'Golden sparks flying everywhere!'
  },
  love_shield: {
    damage: 0,
    heal: 0,
    energy: 30,
    cd: 7000,
    duration: 4000,
    name: 'Love Shield 🛡️',
    message: 'Love Shield active! Invulnerable for 4s.'
  },

  // Radha Powers (Right Player)
  gussa: {
    damage: 30,
    heal: 0,
    energy: 35,
    cd: 5000,
    name: 'Gussa Mode 🔥',
    message: 'Uh oh! Radha is angry! Run, Indransh! 😂'
  },
  anar: {
    damage: 20,
    heal: 0,
    energy: 20,
    cd: 2500,
    name: 'Anar Attack 🎆',
    message: 'Golden Anar fountain unleashed!'
  },
  chakri: {
    damage: 15,
    heal: 0,
    energy: 15,
    cd: 1800,
    name: 'Chakri Attack 🌀',
    message: 'Spinning golden Chakri incoming!'
  },
  attitude_shield: {
    damage: 0,
    heal: 0,
    energy: 30,
    cd: 7000,
    duration: 4000,
    name: 'Attitude Shield 💗',
    message: 'Attitude Shield on! Completely blocked.'
  }
}

// Exact Personalized Ending Quotes
const ENDINGS = {
  indransh_win: 'Looks like love wins... but Radha still owns his heart. ❤️',
  radha_win: 'Radha wins! Indransh happily surrenders. 😂❤️',
  draw: 'Two hearts, no losers. ❤️',
  coop_win: 'Together, we lit every diya, defeated every challenge and made our own little Diwali. Forever us. ❤️',
  coop_defeat: "The sacred Diya flicker rested for tonight... but our love still burns eternal. Let's try together again! ❤️"
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function cleanRoom(roomCode) {
  clearRoomTimers(roomCode)
  delete rooms[roomCode]
  console.log(`[Room ${roomCode}] cleaned and removed.`)
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`)

  // 1. CREATE PRIVATE ROOM
  socket.on('create_room', ({ role = 'indransh', mode = 'pvp' }, callback) => {
    let roomCode = generateRoomCode()
    while (rooms[roomCode]) {
      roomCode = generateRoomCode()
    }

    const assignedRole = role === 'radha' ? 'radha' : 'indransh'
    const player = {
      id: socket.id,
      role: assignedRole,
      name: assignedRole === 'radha' ? 'Radha' : 'Indransh',
      avatar: assignedRole === 'radha' ? '/assets/photos/radha_avatar.png' : '/assets/photos/indransh_avatar_facing_right.png',
      hp: 100,
      maxHp: 100,
      energy: 100,
      score: 0,
      ready: false,
      shieldActive: false,
      shieldUntil: 0,
      x: assignedRole === 'indransh' ? 22 : 78,
      isHost: true
    }

    rooms[roomCode] = {
      code: roomCode,
      mode: mode === 'coop' ? 'coop' : 'pvp',
      status: 'waiting',
      countdown: 3,
      matchTimeRemaining: 90,
      players: { [socket.id]: player },
      diyaHp: 100,
      currentWave: 1,
      totalWaves: 3,
      waveTargetKills: 5,
      waveKills: 0,
      coopScore: 0,
      obstacles: [],
      stars: [],
      lastAttackTime: {},
      combos: {
        indranshBombTime: 0,
        radhaGussaTime: 0,
        shieldSyncTime: 0,
        lastStarCollectTime: 0,
        lastStarCollector: null
      },
      messages: [],
      wishes: [],
      handsHeld: { indransh: false, radha: false },
      winner: null,
      endingMessage: null,
      createdAt: Date.now()
    }

    socket.join(roomCode)
    socket.roomCode = roomCode

    console.log(`[Room Created] ${roomCode} by ${player.name} (mode: ${mode})`)

    if (typeof callback === 'function') {
      callback({
        success: true,
        roomCode,
        room: rooms[roomCode],
        player
      })
    }
  })

  // 2. JOIN ROOM WITH CODE
  socket.on('join_room', ({ roomCode }, callback) => {
    const code = (roomCode || '').toUpperCase().trim()
    const room = rooms[code]

    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Room not found. Please check the code.' })
      }
      return
    }

    const playerIds = Object.keys(room.players)
    if (playerIds.length >= 2) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Room is already full (2/2 players).' })
      }
      return
    }

    const existingRole = room.players[playerIds[0]].role
    const assignedRole = existingRole === 'indransh' ? 'radha' : 'indransh'

    const player = {
      id: socket.id,
      role: assignedRole,
      name: assignedRole === 'radha' ? 'Radha' : 'Indransh',
      avatar: assignedRole === 'radha' ? '/assets/photos/radha_avatar.png' : '/assets/photos/indransh_avatar_facing_right.png',
      hp: 100,
      maxHp: 100,
      energy: 100,
      score: 0,
      ready: false,
      shieldActive: false,
      shieldUntil: 0,
      x: assignedRole === 'indransh' ? 22 : 78,
      isHost: false
    }

    room.players[socket.id] = player
    socket.join(code)
    socket.roomCode = code

    console.log(`[Player Joined] ${player.name} joined room ${code}`)

    io.to(code).emit('room_updated', room)

    if (typeof callback === 'function') {
      callback({
        success: true,
        roomCode: code,
        room,
        player
      })
    }
  })

  // 3. SET GAME MODE
  socket.on('set_game_mode', ({ mode }) => {
    const room = rooms[socket.roomCode]
    if (!room || room.status === 'playing') return
    room.mode = mode === 'coop' ? 'coop' : 'pvp'
    io.to(socket.roomCode).emit('room_updated', room)
  })

  // 4. TOGGLE READY
  socket.on('player_ready', ({ ready }) => {
    const room = rooms[socket.roomCode]
    if (!room || !room.players[socket.id]) return

    room.players[socket.id].ready = !!ready

    const playerList = Object.values(room.players)
    const bothReady = playerList.length === 2 && playerList.every((p) => p.ready)

    if (bothReady && room.status === 'waiting') {
      room.status = 'countdown'
      room.countdown = 3
      io.to(socket.roomCode).emit('countdown_started', { countdown: room.countdown })

      const countInterval = setInterval(() => {
        room.countdown -= 1
        if (room.countdown > 0) {
          io.to(socket.roomCode).emit('countdown_tick', { countdown: room.countdown })
        } else {
          clearInterval(countInterval)
          startGame(room)
        }
      }, 1000)
    } else {
      io.to(socket.roomCode).emit('room_updated', room)
    }
  })

  // START MATCH
  function startGame(room) {
    room.status = 'playing'
    room.matchTimeRemaining = 90
    room.diyaHp = 100
    room.currentWave = 1
    room.waveKills = 0
    room.waveTargetKills = 5
    room.coopScore = 0
    room.obstacles = []
    room.stars = []
    room.combos = {
      indranshBombTime: 0,
      radhaGussaTime: 0,
      shieldSyncTime: 0,
      lastStarCollectTime: 0,
      lastStarCollector: null
    }

    Object.values(room.players).forEach((p) => {
      p.hp = 100
      p.energy = 100
      p.score = 0
      p.shieldActive = false
      p.shieldUntil = 0
      p.x = p.role === 'indransh' ? 22 : 78
    })

    io.to(room.code).emit('game_started', room)

    clearRoomTimers(room.code)
    roomTimers[room.code] = {}

    // Match Timer Loop (1 second tick)
    roomTimers[room.code].timer = setInterval(() => {
      room.matchTimeRemaining -= 1

      // Energy gradual regeneration (+2/sec up to 100)
      Object.values(room.players).forEach((p) => {
        p.energy = Math.min(100, p.energy + 2)
      })

      // Expire shields
      const now = Date.now()
      Object.values(room.players).forEach((p) => {
        if (p.shieldActive && now > p.shieldUntil) {
          p.shieldActive = false
        }
      })

      // Random floating star bonus spawn
      if (Math.random() < 0.3) {
        const star = {
          id: `star_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          x: Math.random() * 60 + 20,
          y: Math.random() * 35 + 20,
          points: 20
        }
        room.stars.push(star)
        io.to(room.code).emit('star_spawned', star)
      }

      // Check match time expiration
      if (room.matchTimeRemaining <= 0) {
        clearRoomTimers(room.code)
        endGameByTime(room)
      } else {
        io.to(room.code).emit('game_tick', {
          timeRemaining: room.matchTimeRemaining,
          players: room.players,
          diyaHp: room.diyaHp,
          currentWave: room.currentWave,
          coopScore: room.coopScore
        })
      }
    }, 1000)

    if (room.mode === 'coop') {
      startCoopMode(room)
    }
  }

  function startCoopMode(room) {
    room.obstacles = []

    const spawnObstacle = () => {
      if (room.status !== 'playing' || room.mode !== 'coop') return
      const side = Math.random() < 0.5 ? 'left' : 'right'
      const obstacle = {
        id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: Math.random() < 0.5 ? 'lantern_imp' : 'firework_sprite',
        side,
        x: side === 'left' ? 4 : 96,
        y: Math.random() * 20 + 45,
        hp: 20 + room.currentWave * 10,
        maxHp: 20 + room.currentWave * 10,
        speed: 0.6 + room.currentWave * 0.25
      }
      room.obstacles.push(obstacle)
      io.to(room.code).emit('obstacle_spawned', obstacle)
    }

    if (!roomTimers[room.code]) roomTimers[room.code] = {}
    roomTimers[room.code].obstacle = setInterval(spawnObstacle, Math.max(1800, 4200 - room.currentWave * 700))

    // Obstacle movement & Diya collision loop (every 120ms)
    roomTimers[room.code].coopTick = setInterval(() => {
      if (room.status !== 'playing' || room.mode !== 'coop') return

      let diyaDamaged = false
      let damageTaken = 0

      for (let i = room.obstacles.length - 1; i >= 0; i--) {
        const obs = room.obstacles[i]
        if (obs.x < 50) {
          obs.x += obs.speed * 0.35
          if (obs.x >= 47) {
            room.obstacles.splice(i, 1)
            diyaDamaged = true
            damageTaken += 10
            io.to(room.code).emit('diya_hit', { damage: 10, x: obs.x })
          }
        } else {
          obs.x -= obs.speed * 0.35
          if (obs.x <= 53) {
            room.obstacles.splice(i, 1)
            diyaDamaged = true
            damageTaken += 10
            io.to(room.code).emit('diya_hit', { damage: 10, x: obs.x })
          }
        }
      }

      if (diyaDamaged) {
        room.diyaHp = Math.max(0, room.diyaHp - damageTaken)
        io.to(room.code).emit('diya_health_update', { diyaHp: room.diyaHp })
        if (room.diyaHp <= 0) {
          endCoopDefeat(room)
        }
      }
    }, 120)
  }

  // 5. PLAYER POSITION UPDATE
  socket.on('player_move', ({ x }) => {
    const room = rooms[socket.roomCode]
    if (!room || !room.players[socket.id] || room.status !== 'playing') return

    const boundedX = Math.max(8, Math.min(92, Number(x) || 50))
    room.players[socket.id].x = boundedX

    socket.to(socket.roomCode).emit('player_moved', {
      id: socket.id,
      x: boundedX
    })
  })

  // 6. PLAYER ATTACK / ABILITY EXECUTION
  socket.on('player_attack', ({ abilityKey }) => {
    const room = rooms[socket.roomCode]
    if (!room || room.status !== 'playing') return

    const player = room.players[socket.id]
    if (!player) return

    const ability = ABILITIES[abilityKey]
    if (!ability) return

    const now = Date.now()
    const lastTime = room.lastAttackTime[`${socket.id}_${abilityKey}`] || 0

    if (now - lastTime < ability.cd) return
    if (player.energy < ability.energy) return

    player.energy -= ability.energy
    room.lastAttackTime[`${socket.id}_${abilityKey}`] = now

    // A. SELF HEAL
    if (ability.heal > 0) {
      player.hp = Math.min(100, player.hp + ability.heal)
      io.to(room.code).emit('special_event', {
        title: "Radha's Smile ❤️",
        message: ability.message,
        playerId: player.id,
        sound: 'heal'
      })
      io.to(room.code).emit('player_healed', {
        id: player.id,
        hp: player.hp,
        heal: ability.heal,
        energy: player.energy
      })
      return
    }

    // B. SHIELDS
    if (ability.duration) {
      player.shieldActive = true
      player.shieldUntil = now + ability.duration
      io.to(room.code).emit('shield_activated', {
        id: player.id,
        duration: ability.duration,
        message: ability.message,
        energy: player.energy
      })

      if (room.mode === 'coop') {
        room.combos.shieldSyncTime = now
        const otherPlayer = Object.values(room.players).find((p) => p.id !== socket.id)
        if (otherPlayer && otherPlayer.shieldActive) {
          room.diyaHp = Math.min(100, room.diyaHp + 20)
          io.to(room.code).emit('combo_activated', {
            name: 'Golden Diya Protection ✨',
            message: 'Both shields united! The sacred Diya gained +20 protection with divine golden aura!'
          })
          io.to(room.code).emit('diya_health_update', { diyaHp: room.diyaHp })
        }
      }
      return
    }

    // C. OFFENSIVE ATTACKS & PROJECTILES
    const projectileId = `proj_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const isIndransh = player.role === 'indransh'
    const projectile = {
      id: projectileId,
      ownerId: player.id,
      ownerRole: player.role,
      abilityKey,
      name: ability.name,
      damage: ability.damage,
      startX: player.x,
      direction: isIndransh ? 1 : -1,
      color: isIndransh ? '#e6c887' : '#f29bb2'
    }

    io.to(room.code).emit('projectile_spawned', {
      ...projectile,
      playerEnergy: player.energy
    })

    if (!room.activeProjectiles) room.activeProjectiles = new Set()
    room.activeProjectiles.add(projectileId)

    if (room.mode === 'pvp') {
      const target = Object.values(room.players).find((p) => p.id !== player.id)
      if (target) {
        setTimeout(() => {
          if (!room || room.status !== 'playing') return
          if (!room.activeProjectiles || !room.activeProjectiles.has(projectileId)) return
          room.activeProjectiles.delete(projectileId)
          io.to(room.code).emit('projectile_removed', { projectileId })

          resolveAttackHit(room, projectileId, player, target, ability.damage)
        }, 550)
      }
    } else if (room.mode === 'coop') {
      setTimeout(() => {
        if (!room || room.status !== 'playing') return
        if (!room.activeProjectiles || !room.activeProjectiles.has(projectileId)) return
        room.activeProjectiles.delete(projectileId)
        io.to(room.code).emit('projectile_removed', { projectileId })

        if (room.obstacles && room.obstacles.length > 0) {
          const obs = room.obstacles[0]
          damageObstacle(room, obs.id, ability.damage || 20)
        }
      }, 450)
    }

    if (room.mode === 'coop') {
      if (abilityKey === 'love_bomb') room.combos.indranshBombTime = now
      if (abilityKey === 'gussa') room.combos.radhaGussaTime = now

      if (Math.abs(room.combos.indranshBombTime - room.combos.radhaGussaTime) < 2500) {
        room.coopScore += 150
        const clearedCount = room.obstacles.length
        room.obstacles = []
        room.waveKills += clearedCount

        io.to(room.code).emit('combo_activated', {
          name: 'Ultimate Heart Firework 💖🔥',
          message: "Indransh's Love + Radha's Gussa merged into an explosive romantic firework! Arena cleared!"
        })

        if (room.waveKills >= room.waveTargetKills) {
          advanceCoopWave(room)
        }
      }
    }
  })

  function resolveAttackHit(room, projectileId, attacker, target, baseDamage) {
    if (!room || room.status !== 'playing') return

    if (target.shieldActive && Date.now() < target.shieldUntil) {
      io.to(room.code).emit('attack_blocked', {
        targetId: target.id,
        attackerId: attacker.id,
        targetRole: target.role,
        message: `${target.name}'s shield absorbed the attack! 🛡️`
      })
      return
    }

    const damage = baseDamage || (attacker.role === 'indransh' ? 20 : 25)
    target.hp = Math.max(0, target.hp - damage)
    attacker.score += damage * 5

    io.to(room.code).emit('player_damaged', {
      targetId: target.id,
      attackerId: attacker.id,
      targetRole: target.role,
      attackerRole: attacker.role,
      damage,
      targetHp: target.hp,
      attackerScore: attacker.score
    })

    if (target.hp <= 0) {
      endGameByKnockout(room, attacker, target)
    }
  }

  function damageObstacle(room, obstacleId, damage = 20) {
    const obsIndex = room.obstacles.findIndex((o) => o.id === obstacleId)
    if (obsIndex === -1) return

    room.obstacles[obsIndex].hp -= damage
    room.coopScore += 25

    if (room.obstacles[obsIndex].hp <= 0) {
      const removed = room.obstacles.splice(obsIndex, 1)[0]
      room.waveKills += 1

      io.to(room.code).emit('obstacle_destroyed', {
        obstacleId,
        score: room.coopScore,
        waveKills: room.waveKills
      })

      if (room.waveKills >= room.waveTargetKills) {
        advanceCoopWave(room)
      }
    } else {
      io.to(room.code).emit('obstacle_damaged', {
        obstacleId,
        hp: room.obstacles[obsIndex].hp,
        score: room.coopScore
      })
    }
  }

  // 7. ATTACK HIT CONFIRMATION (PvP)
  socket.on('attack_hit', ({ projectileId, targetId, damage }) => {
    const room = rooms[socket.roomCode]
    if (!room || room.status !== 'playing') return

    if (room.activeProjectiles && !room.activeProjectiles.has(projectileId)) return
    if (room.activeProjectiles) room.activeProjectiles.delete(projectileId)
    io.to(room.code).emit('projectile_removed', { projectileId })

    const target = room.players[targetId]
    const attacker = room.players[socket.id]
    if (!target || !attacker) return

    resolveAttackHit(room, projectileId, attacker, target, damage)
  })

  // 8. CO-OP OBSTACLE HIT
  socket.on('obstacle_hit', ({ obstacleId, damage = 20 }) => {
    const room = rooms[socket.roomCode]
    if (!room || room.status !== 'playing' || room.mode !== 'coop') return

    damageObstacle(room, obstacleId, damage)
  })

  function advanceCoopWave(room) {
    if (room.currentWave < room.totalWaves) {
      room.currentWave += 1
      room.waveKills = 0
      room.waveTargetKills = 5 + room.currentWave * 2
      room.diyaHp = Math.min(100, room.diyaHp + 15)

      io.to(room.code).emit('wave_cleared', {
        wave: room.currentWave,
        diyaHp: room.diyaHp,
        message: `✨ Wave ${room.currentWave - 1} Cleared! Wave ${room.currentWave} Approaching!`
      })
    } else {
      endCoopVictory(room)
    }
  }

  // 9. STAR COLLECTION
  socket.on('collect_star', ({ starId }) => {
    const room = rooms[socket.roomCode]
    if (!room || room.status !== 'playing') return

    const player = room.players[socket.id]
    if (!player) return

    const now = Date.now()
    let points = 20
    let isDoubleBonus = false

    if (room.mode === 'coop') {
      if (room.combos.lastStarCollector && room.combos.lastStarCollector !== player.id && now - room.combos.lastStarCollectTime < 3500) {
        isDoubleBonus = true
        points = 50
        room.coopScore += points
        io.to(room.code).emit('combo_activated', {
          name: 'Golden Star Double Bonus 🌟⭐',
          message: 'Both Radha & Indransh collected stars together! Double Bonus +50!'
        })
      } else {
        room.coopScore += points
      }
      room.combos.lastStarCollectTime = now
      room.combos.lastStarCollector = player.id
    }

    player.score += points
    player.energy = Math.min(100, player.energy + 20)
    room.stars = room.stars.filter((s) => s.id !== starId)

    io.to(room.code).emit('star_collected', {
      starId,
      playerId: player.id,
      score: player.score,
      energy: player.energy,
      coopScore: room.coopScore,
      isDoubleBonus
    })
  })

  // 10. RESTART MATCH
  socket.on('restart_match', () => {
    const room = rooms[socket.roomCode]
    if (!room) return

    clearRoomTimers(room.code)

    room.status = 'waiting'
    room.countdown = 3
    room.matchTimeRemaining = 90
    room.diyaHp = 100
    room.currentWave = 1
    room.waveKills = 0
    room.obstacles = []
    room.stars = []
    room.winner = null
    room.endingMessage = null

    Object.values(room.players).forEach((p) => {
      p.hp = 100
      p.energy = 100
      p.score = 0
      p.ready = false
      p.shieldActive = false
    })

    io.to(room.code).emit('room_updated', room)
  })

  // ENDINGS
  function endGameByKnockout(room, winner, loser) {
    clearRoomTimers(room.code)

    room.status = 'ended'
    room.winner = winner.role

    const message = winner.role === 'radha'
      ? ENDINGS.radha_win
      : ENDINGS.indransh_win

    room.endingMessage = message

    io.to(room.code).emit('game_ended', {
      winner: winner.role,
      winnerName: winner.name,
      endingMessage: message,
      room
    })
  }

  function endGameByTime(room) {
    clearRoomTimers(room.code)

    room.status = 'ended'
    const players = Object.values(room.players)

    if (room.mode === 'coop') {
      endCoopVictory(room)
      return
    }

    if (players.length < 2) return

    const [p1, p2] = players
    let winner = null
    let message = ''

    if (p1.hp > p2.hp) {
      winner = p1.role
      message = p1.role === 'radha' ? ENDINGS.radha_win : ENDINGS.indransh_win
    } else if (p2.hp > p1.hp) {
      winner = p2.role
      message = p2.role === 'radha' ? ENDINGS.radha_win : ENDINGS.indransh_win
    } else {
      winner = 'draw'
      message = ENDINGS.draw
    }

    room.winner = winner
    room.endingMessage = message

    io.to(room.code).emit('game_ended', {
      winner,
      winnerName: winner === 'draw' ? 'Both' : (winner === 'radha' ? 'Radha' : 'Indransh'),
      endingMessage: message,
      room
    })
  }

  function endCoopVictory(room) {
    clearRoomTimers(room.code)

    room.status = 'ended'
    room.winner = 'coop_win'
    room.endingMessage = ENDINGS.coop_win

    io.to(room.code).emit('game_ended', {
      winner: 'coop_win',
      winnerName: 'Indransh & Radha',
      endingMessage: ENDINGS.coop_win,
      room
    })
  }

  function endCoopDefeat(room) {
    clearRoomTimers(room.code)

    room.status = 'ended'
    room.winner = 'coop_defeat'
    room.endingMessage = ENDINGS.coop_defeat

    io.to(room.code).emit('game_ended', {
      winner: 'coop_defeat',
      winnerName: 'Together',
      endingMessage: ENDINGS.coop_defeat,
      room
    })
  }

  // ==========================================
  // THE DIWALI SHAAM — ROMANTIC ACTIVITIES & CHAT
  // ==========================================

  // Request initial Shaam chat & interaction state
  socket.on('shaam_request_state', () => {
    const room = rooms[socket.roomCode]
    if (!room) return
    socket.emit('shaam_init_state', {
      messages: room.messages || [],
      wishes: room.wishes || [],
      handsHeld: room.handsHeld || { indransh: false, radha: false }
    })
  })

  // 1. Send Chat Message
  socket.on('shaam_send_message', ({ text }) => {
    const room = rooms[socket.roomCode]
    if (!room || !text || !text.trim()) return
    const player = room.players[socket.id]
    if (!player) return

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: socket.id,
      senderRole: player.role,
      senderName: player.name,
      avatar: player.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    }

    if (!room.messages) room.messages = []
    room.messages.push(message)
    if (room.messages.length > 100) room.messages.shift()

    io.to(socket.roomCode).emit('shaam_message_received', message)
  })

  // 2. Typing Indicator
  socket.on('shaam_typing', ({ isTyping }) => {
    const room = rooms[socket.roomCode]
    if (!room) return
    const player = room.players[socket.id]
    if (!player) return

    socket.to(socket.roomCode).emit('shaam_user_typing', {
      role: player.role,
      name: player.name,
      isTyping: !!isTyping
    })
  })

  // 3. Emoji Reactions
  socket.on('shaam_reaction', ({ messageId, emoji }) => {
    const room = rooms[socket.roomCode]
    if (!room || !room.messages) return
    const player = room.players[socket.id]
    if (!player) return

    const msg = room.messages.find((m) => m.id === messageId)
    if (msg) {
      if (!msg.reactions) msg.reactions = {}
      msg.reactions[player.role] = emoji
      io.to(socket.roomCode).emit('shaam_reaction_added', {
        messageId,
        emoji,
        role: player.role
      })
    }
  })

  // 4. Send Heart Activity
  socket.on('shaam_send_heart', () => {
    const room = rooms[socket.roomCode]
    if (!room) return
    const player = room.players[socket.id]
    if (!player) return

    io.to(socket.roomCode).emit('shaam_heart_effect', {
      senderRole: player.role,
      senderName: player.name
    })
  })

  // 5. Share Chai Activity
  socket.on('shaam_share_chai', () => {
    const room = rooms[socket.roomCode]
    if (!room) return
    const player = room.players[socket.id]
    if (!player) return

    io.to(socket.roomCode).emit('shaam_chai_effect', {
      senderRole: player.role,
      senderName: player.name,
      message: 'One cup of chai, two hearts, endless conversations. ☕❤️'
    })
  })

  // 6. Hold Hands Activity
  socket.on('shaam_hold_hands', ({ holding = true }) => {
    const room = rooms[socket.roomCode]
    if (!room) return
    const player = room.players[socket.id]
    if (!player) return

    if (!room.handsHeld) room.handsHeld = { indransh: false, radha: false }
    room.handsHeld[player.role] = !!holding

    io.to(socket.roomCode).emit('shaam_hand_toggled', {
      role: player.role,
      isHolding: !!holding
    })

    if (room.handsHeld.indransh && room.handsHeld.radha) {
      io.to(socket.roomCode).emit('shaam_hands_united', {
        message: 'Hands held under the Diwali sky... two souls, one heartbeat. 🤝❤️'
      })
    }
  })

  // 7. Make a Wish (Sky Lantern)
  socket.on('shaam_make_wish', ({ wishText }) => {
    const room = rooms[socket.roomCode]
    if (!room || !wishText || !wishText.trim()) return
    const player = room.players[socket.id]
    if (!player) return

    const wish = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderRole: player.role,
      senderName: player.name,
      wishText: wishText.trim(),
      createdAt: Date.now()
    }

    if (!room.wishes) room.wishes = []
    room.wishes.push(wish)

    io.to(socket.roomCode).emit('shaam_wish_launched', wish)
  })

  // 8. Synchronized Special Firework
  socket.on('shaam_firework', ({ fireworkType = 'heart' }) => {
    const room = rooms[socket.roomCode]
    if (!room) return
    const player = room.players[socket.id]

    io.to(socket.roomCode).emit('shaam_firework_triggered', {
      fireworkType,
      senderRole: player?.role || 'indransh',
      senderName: player?.name || 'Someone'
    })
  })

  // DISCONNECT HANDLING
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`)
    const code = socket.roomCode
    if (code && rooms[code]) {
      const room = rooms[code]
      delete room.players[socket.id]

      if (Object.keys(room.players).length === 0) {
        cleanRoom(code)
      } else {
        io.to(code).emit('opponent_disconnected', {
          message: 'Partner disconnected. Room is waiting...'
        })
        io.to(code).emit('room_updated', room)
      }
    }
  })
})

server.listen(PORT, () => {
  console.log(`===============================================`)
  console.log(` Diwali Love War Multiplayer Server Running   `)
  console.log(` Port: ${PORT}                                 `)
  console.log(` Health: http://localhost:${PORT}/health       `)
  console.log(`===============================================`)
})
