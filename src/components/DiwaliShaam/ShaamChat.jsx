import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, Sparkles, Smile, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { triggerHaptic } from '../../utils/haptics'

const CONVERSATION_STARTERS = [
  'Aaj ki shaam kaisi lagi? ❤️',
  'Agar hum yahan hamesha baith sakte...',
  'Tumhari favourite Diwali memory?',
  'Ek wish jo tum mere liye karogi?',
  'What are you thinking right now?'
]

const EMOJI_REACTIONS = ['❤️', '✨', '🪔', '🌸', '🥹', '🔥']

export default function ShaamChat({
  messages = [],
  myRole = 'indransh',
  partnerTyping = false,
  isConnected = false,
  onSendMessage,
  onSendTyping,
  onSendReaction
}) {
  const [inputText, setInputText] = useState('')
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partnerTyping])

  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (onSendTyping) {
      onSendTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        onSendTyping(false)
      }, 2000)
    }
  }

  const handleSend = (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputText).trim()
    if (!text) return
    triggerHaptic(25)
    onSendMessage(text)
    setInputText('')
    if (onSendTyping) onSendTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReactionClick = (msgId, emoji) => {
    triggerHaptic(20)
    onSendReaction(msgId, emoji)
    setShowEmojiPickerFor(null)
  }

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden bg-[#140728]/85 backdrop-blur-2xl border border-[#e6c887]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300">
      {/* 1. Header with Collapse Toggle */}
      <div className="px-5 py-3.5 bg-[#1a0833]/90 border-b border-[#e6c887]/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-full bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30 shadow-inner">
            <MessageCircle size={15} />
          </div>
          <div>
            <h4 className="font-script gold-text-luxury text-xl sm:text-2xl leading-none">
              Just Us, Under The Diwali Sky ❤️
            </h4>
            <p className="text-[10px] text-[#e6c887]/75 font-serif italic mt-0.5">
              Private room conversation • Indransh & Radha
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(15)
            setIsCollapsed(!isCollapsed)
          }}
          className="p-1.5 rounded-xl bg-[#120520] hover:bg-[#200b38] border border-[#e6c887]/25 text-[#e6c887] transition active:scale-90"
          title={isCollapsed ? 'Expand Chat' : 'Collapse Chat'}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col"
          >
            {/* 2. Romantic Conversation Starters */}
            <div className="px-3 py-2 bg-[#100420]/60 border-b border-[#e6c887]/15 overflow-x-auto no-scrollbar flex items-center gap-2">
              <span className="text-[10px] text-[#e6c887]/60 whitespace-nowrap flex items-center gap-1 font-medium pl-1">
                <Sparkles size={11} className="text-[#ffd700]" /> Starters:
              </span>
              {CONVERSATION_STARTERS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(starter)}
                  className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap bg-[#18082c] hover:bg-[#230b40] border border-[#f29bb2]/25 text-[#faf4ea]/85 transition active:scale-95"
                >
                  {starter}
                </button>
              ))}
            </div>

            {/* 3. Messages Stream */}
            <div className="p-4 sm:p-5 h-[230px] sm:h-[260px] overflow-y-auto no-scrollbar flex flex-col gap-3.5">
              {messages.length === 0 ? (
                <div className="my-auto text-center flex flex-col items-center">
                  <div className="p-3 rounded-full bg-[#f29bb2]/15 text-[#f29bb2] mb-2 animate-pulse">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <p className="font-serif italic text-xs text-[#e6c887]/80 max-w-xs">
                    “The city lights are dancing below, but the night is quiet. Say something to make her smile... ❤️”
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isIndransh = msg.senderRole === 'indransh'
                  const isRadha = msg.senderRole === 'radha'

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex items-end gap-2 ${
                        isIndransh ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Radha avatar on left */}
                      {isRadha && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[#f29bb2] shadow-sm flex-shrink-0">
                          <img
                            src="/assets/photos/radha_avatar.png"
                            alt="Radha"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="relative group max-w-[78%]">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isIndransh
                              ? 'bg-gradient-to-r from-[#2a133d] to-[#36154d] border border-[#e6c887]/40 text-[#f5e4be] rounded-br-none shadow-[0_4px_15px_rgba(230,200,135,0.12)]'
                              : 'bg-gradient-to-r from-[#380e2f] to-[#451239] border border-[#f29bb2]/40 text-[#faf4ea] rounded-bl-none shadow-[0_4px_15px_rgba(242,155,178,0.15)]'
                          }`}
                        >
                          {/* Sender Name & Timestamp */}
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-0.5">
                            <span className="font-bold tracking-wide">
                              {isIndransh ? 'Indransh 💛' : 'Radha 💗'}
                            </span>
                            <span className="font-mono text-[9px]">{msg.timestamp}</span>
                          </div>

                          <p className="font-sans break-words">{msg.text}</p>
                        </div>

                        {/* Reaction Badges on Bubble */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isIndransh ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {Object.entries(msg.reactions).map(([role, emoji]) => (
                              <span
                                key={role}
                                className="px-1.5 py-0.5 rounded-full bg-[#120520] border border-[#ffd700]/30 text-[11px] shadow-sm"
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quick Reaction Trigger Button on Hover/Touch */}
                        <button
                          type="button"
                          onClick={() =>
                            setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)
                          }
                          className="absolute -top-2 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-[#140728] border border-[#e6c887]/40 text-[#e6c887] text-[10px] transition hover:scale-110 shadow"
                          title="Add reaction"
                        >
                          <Smile size={11} />
                        </button>

                        {/* Emoji Picker Popup */}
                        {showEmojiPickerFor === msg.id && (
                          <div className="absolute z-30 -top-8 right-0 flex items-center gap-1 p-1 rounded-full bg-[#140728] border border-[#ffd700]/40 shadow-xl">
                            {EMOJI_REACTIONS.map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => handleReactionClick(msg.id, em)}
                                className="p-1 hover:scale-125 transition text-xs"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Indransh avatar on right */}
                      {isIndransh && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[#e6c887] shadow-sm flex-shrink-0">
                          <img
                            src="/assets/photos/indransh_avatar_facing_right.png"
                            alt="Indransh"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}

              {/* Typing Indicator */}
              {partnerTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-[#f29bb2] italic py-1"
                >
                  <span className="w-2 h-2 rounded-full bg-[#f29bb2] animate-ping" />
                  <span>
                    {myRole === 'indransh' ? 'Radha is typing... ✍️❤️' : 'Indransh is typing... ✍️💛'}
                  </span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 4. Input & Send Bar */}
            <div className="p-3 bg-[#120520]/90 border-t border-[#e6c887]/20 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message under the stars..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#1c0830] border border-[#e6c887]/30 text-xs sm:text-sm text-[#faf4ea] placeholder-[#e6c887]/40 focus:border-[#ffd700] focus:outline-none transition"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center ${
                  inputText.trim()
                    ? 'btn-primary-luxury text-[#120726] shadow-[0_0_15px_rgba(230,200,135,0.45)]'
                    : 'bg-[#18082c] border border-[#e6c887]/20 text-[#e6c887]/40 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
