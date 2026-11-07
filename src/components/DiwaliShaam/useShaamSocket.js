import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { shaamAudio } from './shaamAudio'
import { triggerHaptic } from '../../utils/haptics'

const SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:3001'

const ROMANTIC_SOLO_REPLIES = {
  indransh: [
    "Radha, no firework in that entire city is as bright as your smile. 💖",
    "I would sit on this mountain forever if it meant sitting next to you. 🌸",
    "Every single star tonight is jealous of how beautiful you look. ❤️",
    "Happy Diwali meri Radha... you are my forever home. 🪔",
    "Holding your hand under these million lights is all I ever wished for. ✨"
  ],
  radha: [
    "Indransh... you always know how to make me blush. ❤️",
    "Looking at the lights with you is my favourite Diwali ever. 🪔",
    "Chai thandi ho rahi hai, pehle ek sip lo! ☕😂",
    "I am never letting go of your hand tonight. Forever us! 🌸",
    "You are the best Diwali surprise I could have ever asked for. 🫶"
  ]
}

export function useShaamSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomCode, setRoomCode] = useState(() => sessionStorage.getItem('shaam_room_code') || '')
  const [myRole, setMyRole] = useState(() => sessionStorage.getItem('shaam_my_role') || 'indransh')
  const [messages, setMessages] = useState([])
  const [wishes, setWishes] = useState([])
  const [handsHeld, setHandsHeld] = useState({ indransh: false, radha: false })
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [isChaiShared, setIsChaiShared] = useState(false)
  const [heartEvent, setHeartEvent] = useState(null)
  const [specialFireworkTrigger, setSpecialFireworkTrigger] = useState(null)
  const [bannerToast, setBannerToast] = useState(null)

  const showToast = (msg) => {
    setBannerToast(msg)
    setTimeout(() => setBannerToast(null), 3800)
  }

  // Initialize Socket.io connection
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
        setIsConnected(true)
        // If room code stored, auto-join
        const savedCode = sessionStorage.getItem('shaam_room_code')
        if (savedCode) {
          socket.emit('join_room', { roomCode: savedCode }, (res) => {
            if (res.success) {
              socket.emit('shaam_request_state')
            }
          })
        }
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      // Initial state
      socket.on('shaam_init_state', ({ messages: initMsgs, wishes: initWishes, handsHeld: initHands }) => {
        if (initMsgs) setMessages(initMsgs)
        if (initWishes) setWishes(initWishes)
        if (initHands) setHandsHeld(initHands)
      })

      // Chat message received
      socket.on('shaam_message_received', (msg) => {
        setMessages((prev) => [...prev, msg])
        setPartnerTyping(false)
        shaamAudio.playFireflyChime()
        triggerHaptic(20)
      })

      // Typing indicator
      socket.on('shaam_user_typing', ({ isTyping }) => {
        setPartnerTyping(isTyping)
      })

      // Reaction added
      socket.on('shaam_reaction_added', ({ messageId, emoji, role }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, reactions: { ...(m.reactions || {}), [role]: emoji } }
              : m
          )
        )
        if (emoji === '❤️') {
          shaamAudio.playHeartFlutter()
          triggerHaptic(30)
        }
      })

      // Send Heart activity
      socket.on('shaam_heart_effect', ({ senderRole, senderName }) => {
        setHeartEvent({ senderRole, senderName })
        shaamAudio.playHeartFlutter()
        triggerHaptic(40)
        showToast(`${senderName} sent you a warm romantic heart! ❤️`)
        setTimeout(() => setHeartEvent(null), 2500)
      })

      // Share Chai activity
      socket.on('shaam_chai_effect', ({ senderName, message }) => {
        setIsChaiShared(true)
        shaamAudio.playChaiClink()
        triggerHaptic(30)
        showToast(message || 'One cup of chai, two hearts, endless conversations. ☕❤️')
        setTimeout(() => setIsChaiShared(false), 3000)
      })

      // Hold Hands activity
      socket.on('shaam_hand_toggled', ({ role, isHolding }) => {
        setHandsHeld((prev) => ({ ...prev, [role]: isHolding }))
      })

      socket.on('shaam_hands_united', ({ message }) => {
        setHandsHeld({ indransh: true, radha: true })
        shaamAudio.playHoldHandsChord()
        triggerHaptic(50)
        showToast(message || 'Hands held under the Diwali sky... two souls, one heartbeat. 🤝❤️')
      })

      // Wish launched
      socket.on('shaam_wish_launched', (wish) => {
        setWishes((prev) => [...prev, wish])
        shaamAudio.playWishAscend()
        triggerHaptic(40)
        showToast(`${wish.senderName} released a Diwali wish into the sky! 🏮✨`)
      })

      // Synced special firework
      socket.on('shaam_firework_triggered', () => {
        setSpecialFireworkTrigger(Date.now())
        shaamAudio.playHeartFlutter()
        triggerHaptic(45)
        showToast('A giant romantic Heart Firework was lit over the city! 💖🎆')
      })
    } catch (e) {
      console.warn('Shaam socket init error:', e)
    }

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  // Create room for Shaam
  const createRoom = useCallback((role = 'indransh') => {
    setMyRole(role)
    sessionStorage.setItem('shaam_my_role', role)
    const socket = socketRef.current

    if (socket && isConnected) {
      socket.emit('create_room', { role, mode: 'coop' }, (res) => {
        if (res.success) {
          setRoomCode(res.roomCode)
          sessionStorage.setItem('shaam_room_code', res.roomCode)
          showToast(`Private Shaam Room created! Code: ${res.roomCode}`)
        }
      })
    } else {
      const code = 'SHAAM1'
      setRoomCode(code)
      sessionStorage.setItem('shaam_room_code', code)
      showToast(`Solo Shaam mode active! Code: ${code}`)
    }
  }, [isConnected])

  // Join room
  const joinRoom = useCallback((code, preferredRole = 'radha') => {
    const socket = socketRef.current
    if (socket && isConnected) {
      socket.emit('join_room', { roomCode: code, preferredRole }, (res) => {
        if (res.success) {
          setRoomCode(res.roomCode)
          setMyRole(res.player.role)
          sessionStorage.setItem('shaam_room_code', res.roomCode)
          sessionStorage.setItem('shaam_my_role', res.player.role)
          socket.emit('shaam_request_state')
          showToast(`Joined private evening room: ${res.roomCode}! ❤️`)
        } else {
          alert(res.message || 'Could not join room.')
        }
      })
    } else {
      setRoomCode(code)
      sessionStorage.setItem('shaam_room_code', code)
      showToast(`Joined local room: ${code}`)
    }
  }, [isConnected])

  // Send Chat message
  const sendMessage = useCallback((text) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_send_message', { text })
    } else {
      // Local / Solo simulation
      const myName = myRole === 'indransh' ? 'Indransh' : 'Radha'
      const partnerRole = myRole === 'indransh' ? 'radha' : 'indransh'
      const partnerName = myRole === 'indransh' ? 'Radha' : 'Indransh'

      const newMsg = {
        id: `local_msg_${Date.now()}`,
        senderRole: myRole,
        senderName: myName,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {}
      }
      setMessages((prev) => [...prev, newMsg])
      shaamAudio.playFireflyChime()

      // Cute simulated reply from companion
      setPartnerTyping(true)
      setTimeout(() => {
        setPartnerTyping(false)
        const replies = ROMANTIC_SOLO_REPLIES[partnerRole] || ROMANTIC_SOLO_REPLIES.radha
        const replyText = replies[Math.floor(Math.random() * replies.length)]

        const replyMsg = {
          id: `local_msg_${Date.now() + 1}`,
          senderRole: partnerRole,
          senderName: partnerName,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: { [partnerRole]: '❤️' }
        }
        setMessages((prev) => [...prev, replyMsg])
        shaamAudio.playHeartFlutter()
        triggerHaptic(20)
      }, 1600)
    }
  }, [isConnected, roomCode, myRole])

  // Send Typing
  const sendTyping = useCallback((isTyping) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_typing', { isTyping })
    }
  }, [isConnected, roomCode])

  // Send Reaction
  const sendReaction = useCallback((messageId, emoji) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_reaction', { messageId, emoji })
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: { ...(m.reactions || {}), [myRole]: emoji } }
            : m
        )
      )
      if (emoji === '❤️') shaamAudio.playHeartFlutter()
    }
  }, [isConnected, roomCode, myRole])

  // Romantic Activities
  const sendHeart = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_send_heart')
    } else {
      setHeartEvent({
        senderRole: myRole,
        senderName: myRole === 'indransh' ? 'Indransh' : 'Radha'
      })
      shaamAudio.playHeartFlutter()
      showToast('You sent a warm romantic heart! ❤️')
      setTimeout(() => setHeartEvent(null), 2500)
    }
  }, [isConnected, roomCode, myRole])

  const shareChai = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_share_chai')
    } else {
      setIsChaiShared(true)
      shaamAudio.playChaiClink()
      showToast('One cup of chai, two hearts, endless conversations. ☕❤️')
      setTimeout(() => setIsChaiShared(false), 3000)
    }
  }, [isConnected, roomCode])

  const toggleHoldHands = useCallback(() => {
    const nextHolding = !handsHeld[myRole]
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_hold_hands', { holding: nextHolding })
    } else {
      setHandsHeld({ indransh: true, radha: true })
      shaamAudio.playHoldHandsChord()
      showToast('Hands held under the Diwali sky... two souls, one heartbeat. 🤝❤️')
    }
  }, [isConnected, roomCode, myRole, handsHeld])

  const makeWish = useCallback((wishText) => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_make_wish', { wishText })
    } else {
      const newWish = {
        id: `local_wish_${Date.now()}`,
        senderRole: myRole,
        senderName: myRole === 'indransh' ? 'Indransh' : 'Radha',
        wishText,
        createdAt: Date.now()
      }
      setWishes((prev) => [...prev, newWish])
      shaamAudio.playWishAscend()
      showToast('Your Diwali wish was released into the starry sky! 🏮✨')
    }
  }, [isConnected, roomCode, myRole])

  const triggerFirework = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && roomCode) {
      socket.emit('shaam_firework', { fireworkType: 'heart' })
    } else {
      setSpecialFireworkTrigger(Date.now())
      shaamAudio.playHeartFlutter()
      showToast('A giant romantic Heart Firework was lit over the city! 💖🎆')
    }
  }, [isConnected, roomCode])

  return {
    isConnected,
    roomCode,
    myRole,
    messages,
    wishes,
    handsHeld,
    partnerTyping,
    isChaiShared,
    heartEvent,
    specialFireworkTrigger,
    bannerToast,
    createRoom,
    joinRoom,
    sendMessage,
    sendTyping,
    sendReaction,
    sendHeart,
    shareChai,
    toggleHoldHands,
    makeWish,
    triggerFirework
  }
}
