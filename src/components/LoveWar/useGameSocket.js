import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { gameAudio } from './gameAudio'
import { triggerHaptic } from '../../utils/haptics'
import { CHARACTERS, ENDINGS } from './gameConstants'

const SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:3001'

export function useGameSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSoloMode, setIsSoloMode] = useState(false)
  const [room, setRoom] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [myRole, setMyRole] = useState('indransh')
  const [countdown, setCountdown] = useState(null)
  const [screenShake, setScreenShake] = useState(false)
  const [bannerMessage, setBannerMessage] = useState(null)
  const [projectiles, setProjectiles] = useState([])
  const [stars, setStars] = useState([])
  const [obstacles, setObstacles] = useState([])
  const [waveAlert, setWaveAlert] = useState(null)

  const soloAiTimerRef = useRef(null)
  const soloGameLoopRef = useRef(null)
  const soloObstacleTimerRef = useRef(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    let socket = null
    try {
      socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 6000,
        reconnectionAttempts: 8,
        reconnectionDelay: 1500
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('[Socket.IO] Connected to Love War server:', socket.id)
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected from server')
        setIsConnected(false)
      })

      socket.on('connect_error', (err) => {
        console.warn('[Socket.IO] Connection notice:', err.message)
        setIsConnected(false)
      })

      // Room & Game state events
      socket.on('room_updated', (updatedRoom) => {
        setRoom(updatedRoom)
      })

      socket.on('countdown_started', ({ countdown: count }) => {
        setCountdown(count)
        gameAudio.playHitSound()
      })

      socket.on('countdown_tick', ({ countdown: count }) => {
        setCountdown(count)
        gameAudio.playHitSound()
      })

      socket.on('game_started', (startedRoom) => {
        setCountdown(null)
        setRoom(startedRoom)
        setProjectiles([])
        setStars([])
        setObstacles([])
        setBannerMessage(startedRoom.mode === 'coop' ? 'Defend the Sacred Diya Together! 🪔❤️' : 'Love War Started! Show your love! ⚔️❤️')
        setTimeout(() => setBannerMessage(null), 3000)
        gameAudio.playVictorySound()
      })

      socket.on('game_tick', ({ timeRemaining, players, diyaHp, currentWave, coopScore }) => {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            matchTimeRemaining: timeRemaining,
            players: { ...prev.players, ...players },
            diyaHp: diyaHp !== undefined ? diyaHp : prev.diyaHp,
            currentWave: currentWave !== undefined ? currentWave : prev.currentWave,
            coopScore: coopScore !== undefined ? coopScore : prev.coopScore
          }
        })
      })

      socket.on('player_moved', ({ id, x }) => {
        setRoom((prev) => {
          if (!prev || !prev.players[id]) return prev
          return {
            ...prev,
            players: {
              ...prev.players,
              [id]: { ...prev.players[id], x }
            }
          }
        })
      })

      socket.on('projectile_spawned', (proj) => {
        setProjectiles((prev) => [...prev, proj])
        if (proj.abilityKey === 'gussa' || proj.abilityKey === 'love_bomb') {
          triggerScreenShake()
          gameAudio.playFireworkBlastSound()
        } else if (proj.abilityKey === 'chakri') {
          gameAudio.playChakriSpinSound()
        } else {
          gameAudio.playHitSound()
        }

        // Update player energy locally if it was my player
        if (proj.playerEnergy !== undefined) {
          setRoom((prev) => {
            if (!prev || !prev.players[proj.ownerId]) return prev
            return {
              ...prev,
              players: {
                ...prev.players,
                [proj.ownerId]: { ...prev.players[proj.ownerId], energy: proj.playerEnergy }
              }
            }
          })
        }
      })

      socket.on('player_damaged', ({ targetId, attackerId, damage, targetHp, attackerScore }) => {
        triggerHaptic(30)
        gameAudio.playHitSound()
        setRoom((prev) => {
          if (!prev) return prev
          const target = prev.players[targetId]
          const attacker = prev.players[attackerId]
          return {
            ...prev,
            players: {
              ...prev.players,
              ...(target ? { [targetId]: { ...target, hp: targetHp } } : {}),
              ...(attacker ? { [attackerId]: { ...attacker, score: attackerScore } } : {})
            }
          }
        })
      })

      socket.on('player_healed', ({ id, hp, energy }) => {
        gameAudio.playHeartMagicSound()
        setRoom((prev) => {
          if (!prev || !prev.players[id]) return prev
          return {
            ...prev,
            players: {
              ...prev.players,
              [id]: { ...prev.players[id], hp, ...(energy !== undefined ? { energy } : {}) }
            }
          }
        })
      })

      socket.on('shield_activated', ({ id, message, energy }) => {
        gameAudio.playShieldSound()
        showBanner(message)
        setRoom((prev) => {
          if (!prev || !prev.players[id]) return prev
          return {
            ...prev,
            players: {
              ...prev.players,
              [id]: { ...prev.players[id], shieldActive: true, ...(energy !== undefined ? { energy } : {}) }
            }
          }
        })
      })

      socket.on('attack_blocked', ({ message }) => {
        gameAudio.playShieldSound()
        showBanner(message)
      })

      socket.on('special_event', ({ message }) => {
        showBanner(message)
        triggerHaptic(40)
      })

      socket.on('combo_activated', ({ name, message }) => {
        triggerScreenShake()
        gameAudio.playVictorySound()
        showBanner(`✨ COMBO: ${name} — ${message}`)
      })

      socket.on('star_spawned', (star) => {
        setStars((prev) => [...prev, star])
      })

      socket.on('star_collected', ({ starId, playerId, score, energy, coopScore, isDoubleBonus }) => {
        gameAudio.playHeartMagicSound()
        setStars((prev) => prev.filter((s) => s.id !== starId))
        setRoom((prev) => {
          if (!prev || !prev.players[playerId]) return prev
          return {
            ...prev,
            coopScore: coopScore !== undefined ? coopScore : prev.coopScore,
            players: {
              ...prev.players,
              [playerId]: { ...prev.players[playerId], score, energy }
            }
          }
        })
        if (isDoubleBonus) {
          triggerHaptic(50)
        }
      })

      socket.on('obstacle_spawned', (obs) => {
        setObstacles((prev) => [...prev, obs])
      })

      socket.on('obstacle_destroyed', ({ obstacleId, score }) => {
        gameAudio.playHitSound()
        setObstacles((prev) => prev.filter((o) => o.id !== obstacleId))
        setRoom((prev) => (prev ? { ...prev, coopScore: score } : prev))
      })

      socket.on('diya_hit', ({ damage }) => {
        triggerScreenShake()
        gameAudio.playFireworkBlastSound()
      })

      socket.on('diya_health_update', ({ diyaHp }) => {
        triggerHaptic(30)
        setRoom((prev) => (prev ? { ...prev, diyaHp } : prev))
      })

      socket.on('wave_cleared', ({ wave, diyaHp, message }) => {
        gameAudio.playVictorySound()
        setWaveAlert(message || `Wave Cleared! Wave ${wave} Approaching!`)
        setTimeout(() => setWaveAlert(null), 3500)
        setRoom((prev) => (prev ? { ...prev, currentWave: wave, diyaHp } : prev))
      })

      socket.on('game_ended', ({ winner, winnerName, endingMessage, room: endedRoom }) => {
        gameAudio.playVictorySound()
        triggerHaptic(60)
        setRoom(endedRoom || { status: 'ended', winner, winnerName, endingMessage })
      })

      socket.on('opponent_disconnected', ({ message }) => {
        showBanner(message)
      })
    } catch (e) {
      console.warn('Socket initialization fallback:', e)
    }

    return () => {
      if (socket) socket.disconnect()
      if (soloAiTimerRef.current) clearInterval(soloAiTimerRef.current)
      if (soloGameLoopRef.current) clearInterval(soloGameLoopRef.current)
      if (soloObstacleTimerRef.current) clearInterval(soloObstacleTimerRef.current)
    }
  }, [])

  const triggerScreenShake = () => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 450)
  }

  const showBanner = (msg) => {
    setBannerMessage(msg)
    setTimeout(() => setBannerMessage(null), 3800)
  }

  // 1. CREATE PRIVATE ROOM
  const createRoom = useCallback((role = 'indransh', mode = 'pvp') => {
    setIsSoloMode(false)
    setMyRole(role)
    const socket = socketRef.current

    if (socket && isConnected) {
      socket.emit('create_room', { role, mode }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode)
          setRoom(response.room)
        }
      })
    } else {
      // Offline fallback room
      const localCode = 'LOVE1'
      setRoomCode(localCode)
      setRoom({
        code: localCode,
        mode,
        status: 'waiting',
        matchTimeRemaining: 90,
        players: {
          local_p1: {
            id: 'local_p1',
            role,
            name: role === 'radha' ? 'Radha' : 'Indransh',
            avatar: role === 'radha' ? CHARACTERS.radha.avatar : CHARACTERS.indransh.avatar,
            hp: 100,
            energy: 100,
            score: 0,
            ready: true,
            x: role === 'indransh' ? 22 : 78,
            isHost: true
          }
        },
        diyaHp: 100,
        currentWave: 1,
        coopScore: 0
      })
    }
  }, [isConnected])

  // 2. JOIN ROOM
  const joinRoom = useCallback((code, preferredRole) => {
    setIsSoloMode(false)
    const socket = socketRef.current
    if (socket && isConnected) {
      socket.emit('join_room', { roomCode: code, preferredRole }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode)
          setRoom(response.room)
          setMyRole(response.player.role)
        } else {
          alert(response.message || 'Could not join room.')
        }
      })
    } else {
      alert('Cannot connect to multiplayer server. Starting Solo Mode instead!')
      startSoloPractice('indransh', 'pvp')
    }
  }, [isConnected])

  // 3. SET READY
  const setReady = useCallback((ready = true) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('player_ready', { ready })
    } else if (isSoloMode || !isConnected) {
      setCountdown(3)
      let c = 3
      const int = setInterval(() => {
        c -= 1
        if (c > 0) {
          setCountdown(c)
          gameAudio.playHitSound()
        } else {
          clearInterval(int)
          setCountdown(null)
          gameAudio.playVictorySound()
          setRoom((prev) => ({ ...prev, status: 'playing' }))
        }
      }, 1000)
    }
  }, [isConnected, roomCode, isSoloMode])

  // 4. SET GAME MODE
  const setMode = useCallback((mode) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('set_game_mode', { mode })
    } else {
      setRoom((prev) => (prev ? { ...prev, mode } : prev))
    }
  }, [isConnected, roomCode, isSoloMode])

  // 5. MOVE PLAYER
  const move = useCallback((x) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('player_move', { x })
    } else {
      setRoom((prev) => {
        if (!prev) return prev
        const pIds = Object.keys(prev.players)
        const myP = prev.players[pIds[0]]
        if (!myP) return prev
        return {
          ...prev,
          players: {
            ...prev.players,
            [myP.id]: { ...myP, x: Math.max(8, Math.min(92, x)) }
          }
        }
      })
    }
  }, [isConnected, roomCode, isSoloMode])

  // 6. ATTACK / ABILITY
  const attack = useCallback((abilityKey) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('player_attack', { abilityKey })
    } else if (isSoloMode || !isConnected) {
      executeLocalAttack(abilityKey)
    }
  }, [isConnected, roomCode, isSoloMode])

  // Local Solo Mode Attack Execution
  const executeLocalAttack = (abilityKey) => {
    setRoom((prev) => {
      if (!prev || prev.status !== 'playing') return prev
      const pIds = Object.keys(prev.players)
      const myP = prev.players[pIds[0]]
      const aiP = prev.players[pIds[1]]

      if (!myP) return prev

      if (abilityKey === 'smile') {
        gameAudio.playHeartMagicSound()
        showBanner("Radha smiled! Indransh regained his happiness. ❤️")
        return {
          ...prev,
          players: {
            ...prev.players,
            [myP.id]: { ...myP, hp: Math.min(100, myP.hp + 30), energy: Math.max(0, myP.energy - 25) }
          }
        }
      }

      if (abilityKey === 'love_shield' || abilityKey === 'attitude_shield') {
        gameAudio.playShieldSound()
        showBanner("Shield activated! Invulnerable for 4s 🛡️")
        setTimeout(() => {
          setRoom((r) => r ? { ...r, players: { ...r.players, [myP.id]: { ...r.players[myP.id], shieldActive: false } } } : r)
        }, 4000)
        return {
          ...prev,
          players: {
            ...prev.players,
            [myP.id]: { ...myP, shieldActive: true, energy: Math.max(0, myP.energy - 30) }
          }
        }
      }

      if (abilityKey === 'gussa' || abilityKey === 'love_bomb') {
        triggerScreenShake()
        gameAudio.playFireworkBlastSound()
      } else if (abilityKey === 'chakri') {
        gameAudio.playChakriSpinSound()
      } else {
        gameAudio.playHitSound()
      }

      const proj = {
        id: `proj_${Date.now()}`,
        ownerRole: myRole,
        abilityKey,
        startX: myP.x,
        direction: myRole === 'indransh' ? 1 : -1,
        color: myRole === 'indransh' ? '#e6c887' : '#f29bb2'
      }
      setProjectiles((p) => [...p, proj])

      // In PvP Mode, projectile damages AI
      if (prev.mode === 'pvp') {
        setTimeout(() => {
          hitTarget(proj.id, aiP?.id)
        }, 650)
      } else {
        // In Co-op Mode, projectile damages nearest obstacle
        setTimeout(() => {
          setObstacles((obsList) => {
            if (obsList.length === 0) return obsList
            const first = obsList[0]
            hitObstacle(first.id, 25)
            return obsList
          })
          setProjectiles((p) => p.filter((x) => x.id !== proj.id))
        }, 450)
      }

      return {
        ...prev,
        players: {
          ...prev.players,
          [myP.id]: { ...myP, energy: Math.max(0, myP.energy - 20) }
        }
      }
    })
  }

  // 7. HIT TARGET (PvP)
  const hitTarget = useCallback((projectileId, targetId) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('attack_hit', { projectileId, targetId })
    } else {
      setProjectiles((p) => p.filter((x) => x.id !== projectileId))
      triggerHaptic(30)
      gameAudio.playHitSound()

      setRoom((prev) => {
        if (!prev) return prev
        const pIds = Object.keys(prev.players)
        const myP = prev.players[pIds[0]]
        const aiP = prev.players[pIds[1]]
        if (!aiP) return prev

        const newAiHp = Math.max(0, aiP.hp - 18)
        if (newAiHp <= 0) {
          gameAudio.playVictorySound()
          return {
            ...prev,
            status: 'ended',
            winner: myRole,
            winnerName: myRole === 'radha' ? 'Radha' : 'Indransh',
            endingMessage: myRole === 'radha' ? ENDINGS.radha_win : ENDINGS.indransh_win
          }
        }

        return {
          ...prev,
          players: {
            ...prev.players,
            [myP.id]: { ...myP, score: myP.score + 90 },
            [aiP.id]: { ...aiP, hp: newAiHp }
          }
        }
      })
    }
  }, [isConnected, roomCode, isSoloMode, myRole])

  // 8. HIT OBSTACLE (Co-op)
  const hitObstacle = useCallback((obstacleId, damage = 20) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('obstacle_hit', { obstacleId, damage })
    } else {
      // Local Co-op obstacle destruction
      setObstacles((prev) => {
        const item = prev.find((o) => o.id === obstacleId)
        if (!item) return prev
        if (item.hp - damage <= 0) {
          gameAudio.playHitSound()
          setRoom((r) => r ? { ...r, coopScore: r.coopScore + 30 } : r)
          return prev.filter((o) => o.id !== obstacleId)
        }
        return prev.map((o) => o.id === obstacleId ? { ...o, hp: o.hp - damage } : o)
      })
    }
  }, [isConnected, roomCode, isSoloMode])

  // 9. COLLECT STAR
  const collectStar = useCallback((starId) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('collect_star', { starId })
    } else {
      setStars((prev) => prev.filter((s) => s.id !== starId))
      gameAudio.playHeartMagicSound()
      setRoom((prev) => {
        if (!prev) return prev
        const pIds = Object.keys(prev.players)
        const myP = prev.players[pIds[0]]
        if (!myP) return prev
        return {
          ...prev,
          coopScore: prev.coopScore + 25,
          players: {
            ...prev.players,
            [myP.id]: {
              ...myP,
              score: myP.score + 25,
              energy: Math.min(100, myP.energy + 20)
            }
          }
        }
      })
    }
  }, [isConnected, roomCode, isSoloMode])

  // 10. RESTART MATCH
  const restartMatch = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode && !isSoloMode) {
      socket.emit('restart_match')
    } else {
      setRoom((prev) => ({
        ...prev,
        status: 'waiting',
        matchTimeRemaining: 90,
        diyaHp: 100,
        currentWave: 1,
        winner: null,
        endingMessage: null,
        players: Object.fromEntries(
          Object.entries(prev?.players || {}).map(([id, p]) => [
            id,
            { ...p, hp: 100, energy: 100, score: 0, ready: true, shieldActive: false }
          ])
        )
      }))
    }
  }, [isConnected, roomCode, isSoloMode])

  // 11. START SOLO PRACTICE MODE (Instant AI Bot)
  const startSoloPractice = (role = 'indransh', mode = 'pvp') => {
    setIsSoloMode(true)
    setMyRole(role)
    const opponentRole = role === 'indransh' ? 'radha' : 'indransh'

    const localRoom = {
      code: 'SOLO-AI',
      mode,
      status: 'playing',
      matchTimeRemaining: 90,
      players: {
        player1: {
          id: 'player1',
          role,
          name: role === 'radha' ? 'Radha' : 'Indransh',
          avatar: role === 'radha' ? CHARACTERS.radha.avatar : CHARACTERS.indransh.avatar,
          hp: 100,
          energy: 100,
          score: 0,
          ready: true,
          x: role === 'indransh' ? 22 : 78
        },
        player2: {
          id: 'player2',
          role: opponentRole,
          name: opponentRole === 'radha' ? 'Radha (AI ❤️)' : 'Indransh (AI ❤️)',
          avatar: opponentRole === 'radha' ? CHARACTERS.radha.avatar : CHARACTERS.indransh.avatar,
          hp: 100,
          energy: 100,
          score: 0,
          ready: true,
          x: opponentRole === 'indransh' ? 22 : 78
        }
      },
      diyaHp: 100,
      currentWave: 1,
      coopScore: 0
    }

    setRoom(localRoom)
    setRoomCode('SOLO')
    setBannerMessage(`Solo ${mode === 'coop' ? 'Co-op' : 'PvP'} active! Enjoy the Diwali Love War ❤️`)

    // AI periodic playful attacks or partner support
    if (soloAiTimerRef.current) clearInterval(soloAiTimerRef.current)
    soloAiTimerRef.current = setInterval(() => {
      setRoom((prev) => {
        if (!prev || prev.status !== 'playing') return prev
        const myP = prev.players.player1
        const aiP = prev.players.player2
        if (!myP || !aiP) return prev

        const aiAttacks = opponentRole === 'radha' ? ['gussa', 'anar', 'chakri'] : ['love_bomb', 'phuljhadi', 'smile']
        const chosen = aiAttacks[Math.floor(Math.random() * aiAttacks.length)]

        const proj = {
          id: `ai_proj_${Date.now()}`,
          ownerRole: opponentRole,
          abilityKey: chosen,
          startX: aiP.x,
          direction: opponentRole === 'indransh' ? 1 : -1,
          color: opponentRole === 'indransh' ? '#e6c887' : '#f29bb2'
        }
        setProjectiles((pr) => [...pr, proj])

        if (prev.mode === 'pvp') {
          setTimeout(() => {
            setProjectiles((pr) => pr.filter((x) => x.id !== proj.id))
            gameAudio.playHitSound()
            triggerHaptic(20)
            setRoom((r) => {
              if (!r || r.status !== 'playing') return r
              const updatedMyHp = Math.max(0, r.players.player1.hp - 12)
              if (updatedMyHp <= 0) {
                return {
                  ...r,
                  status: 'ended',
                  winner: opponentRole,
                  winnerName: opponentRole === 'radha' ? 'Radha' : 'Indransh',
                  endingMessage: opponentRole === 'radha' ? ENDINGS.radha_win : ENDINGS.indransh_win
                }
              }
              return {
                ...r,
                players: {
                  ...r.players,
                  player1: { ...r.players.player1, hp: updatedMyHp }
                }
              }
            })
          }, 750)
        } else {
          // Co-op mode AI attacks obstacles
          setTimeout(() => {
            setProjectiles((pr) => pr.filter((x) => x.id !== proj.id))
            setObstacles((obs) => {
              if (obs.length === 0) return obs
              const target = obs[obs.length - 1]
              return obs.filter((o) => o.id !== target.id)
            })
          }, 600)
        }

        return prev
      })
    }, 4500)

    // Co-op solo obstacle spawner
    if (mode === 'coop') {
      if (soloObstacleTimerRef.current) clearInterval(soloObstacleTimerRef.current)
      soloObstacleTimerRef.current = setInterval(() => {
        setObstacles((prev) => [
          ...prev,
          {
            id: `solo_obs_${Date.now()}`,
            type: Math.random() < 0.5 ? 'lantern_imp' : 'firework_sprite',
            side: Math.random() < 0.5 ? 'left' : 'right',
            hp: 25,
            x: Math.random() < 0.5 ? 5 : 95,
            speed: 0.8
          }
        ])
      }, 3500)
    }

    // Match timer
    if (soloGameLoopRef.current) clearInterval(soloGameLoopRef.current)
    soloGameLoopRef.current = setInterval(() => {
      setRoom((prev) => {
        if (!prev || prev.status !== 'playing') return prev
        const remaining = prev.matchTimeRemaining - 1
        if (remaining <= 0) {
          clearInterval(soloGameLoopRef.current)
          clearInterval(soloAiTimerRef.current)
          if (soloObstacleTimerRef.current) clearInterval(soloObstacleTimerRef.current)
          return {
            ...prev,
            status: 'ended',
            winner: prev.mode === 'coop' ? 'coop_win' : 'draw',
            winnerName: prev.mode === 'coop' ? 'Indransh & Radha' : 'Both',
            endingMessage: prev.mode === 'coop' ? ENDINGS.coop_win : ENDINGS.draw
          }
        }
        return {
          ...prev,
          matchTimeRemaining: remaining,
          players: {
            ...prev.players,
            player1: { ...prev.players.player1, energy: Math.min(100, prev.players.player1.energy + 2) },
            player2: { ...prev.players.player2, energy: Math.min(100, prev.players.player2.energy + 2) }
          }
        }
      })
    }, 1000)
  }

  const players = room ? Object.values(room.players || {}) : []
  const myPlayer = players.find((p) => p.role === myRole) || players[0]
  const opponent = players.find((p) => p.role !== myRole) || players[1]

  return {
    isConnected,
    isSoloMode,
    room,
    roomCode,
    myRole,
    myPlayer,
    opponent,
    countdown,
    screenShake,
    bannerMessage,
    waveAlert,
    projectiles,
    stars,
    obstacles,
    createRoom,
    joinRoom,
    setReady,
    setMode,
    move,
    attack,
    hitTarget,
    hitObstacle,
    collectStar,
    restartMatch,
    startSoloPractice
  }
}
