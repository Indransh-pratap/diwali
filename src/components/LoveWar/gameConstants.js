// Character identities, powers, and assets for Radha vs Indransh Love War

export const CHARACTERS = {
  indransh: {
    id: 'indransh',
    name: 'Indransh',
    title: 'The Romantic Warrior 💛',
    side: 'left',
    color: '#e6c887',
    glowColor: 'rgba(230, 200, 135, 0.75)',
    avatar: '/assets/photos/indransh_avatar_facing_right.png',
    originalAvatar: '/assets/photos/indransh_avatar.png',
    defaultX: 22,
    powers: [
      {
        key: 'smile',
        name: "Radha's Smile ❤️",
        type: 'heal',
        icon: 'Heart',
        damage: 0,
        heal: 30,
        energy: 25,
        cd: 4000,
        hotkey: 'Q',
        desc: 'Heals 30 HP with pure happiness',
        announcement: "Radha smiled! Indransh regained his happiness. ❤️"
      },
      {
        key: 'love_bomb',
        name: 'Love Bomb 💖',
        type: 'projectile',
        icon: 'Bomb',
        damage: 20,
        heal: 0,
        energy: 20,
        cd: 2500,
        hotkey: 'W',
        desc: 'Heart projectile dealing 20 damage',
        announcement: "Love Bomb launched! Pure magic in the air."
      },
      {
        key: 'phuljhadi',
        name: 'Golden Phuljhadi ✨',
        type: 'projectile',
        icon: 'Sparkles',
        damage: 8,
        heal: 0,
        energy: 8,
        cd: 800,
        hotkey: 'E',
        desc: 'Rapid spark bursts dealing 8 damage',
        announcement: "Golden sparks flying everywhere!"
      },
      {
        key: 'love_shield',
        name: 'Love Shield 🛡️',
        type: 'shield',
        icon: 'Shield',
        damage: 0,
        heal: 0,
        energy: 30,
        cd: 7000,
        duration: 4000,
        hotkey: 'R',
        desc: 'Blocks all incoming damage for 4 seconds',
        announcement: "Love Shield active! Invulnerable for 4s."
      }
    ]
  },

  radha: {
    id: 'radha',
    name: 'Radha',
    title: 'The Queen of Hearts 👑',
    side: 'right',
    color: '#f29bb2',
    glowColor: 'rgba(242, 155, 178, 0.85)',
    avatar: '/assets/photos/radha_avatar.png',
    defaultX: 78,
    powers: [
      {
        key: 'gussa',
        name: 'Gussa Mode 🔥',
        type: 'special',
        icon: 'Flame',
        damage: 30,
        heal: 0,
        energy: 35,
        cd: 5000,
        hotkey: 'Q',
        desc: 'Pink firework burst dealing 30 damage',
        announcement: 'Uh oh! Radha is angry! Run, Indransh! 😂'
      },
      {
        key: 'anar',
        name: 'Anar Attack 🎆',
        type: 'projectile',
        icon: 'Sparkle',
        damage: 20,
        heal: 0,
        energy: 20,
        cd: 2500,
        hotkey: 'W',
        desc: 'Golden fountain firework dealing 20 damage',
        announcement: 'Golden Anar fountain unleashed!'
      },
      {
        key: 'chakri',
        name: 'Chakri Attack 🌀',
        type: 'projectile',
        icon: 'Disc',
        damage: 15,
        heal: 0,
        energy: 15,
        cd: 1800,
        hotkey: 'E',
        desc: 'Spinning ground chakri dealing 15 damage',
        announcement: 'Spinning golden Chakri incoming!'
      },
      {
        key: 'attitude_shield',
        name: 'Attitude Shield 💗',
        type: 'shield',
        icon: 'ShieldCheck',
        damage: 0,
        heal: 0,
        energy: 30,
        cd: 7000,
        duration: 4000,
        hotkey: 'R',
        desc: 'Blocks incoming damage for 4 seconds',
        announcement: 'Attitude Shield on! Completely blocked.'
      }
    ]
  }
}

export const ENDINGS = {
  indransh_win: 'Looks like love wins... but Radha still owns his heart. ❤️',
  radha_win: 'Radha wins! Indransh happily surrenders. 😂❤️',
  draw: 'Two hearts, no losers. ❤️',
  coop_win: 'Together, we lit every diya, defeated every challenge and made our own little Diwali. Forever us. ❤️',
  coop_defeat: "The sacred Diya flicker rested for tonight... but our love still burns eternal. Let's try together again! ❤️"
}
