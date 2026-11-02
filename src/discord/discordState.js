/**
 * CanvasCord Discord State & Collaboration Engine
 */

export const INITIAL_DISCORD_STATE = {
  currentUserId: 'user_self',
  currentUser: {
    id: 'user_self',
    name: 'You (Lead Designer)',
    tag: '#0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    status: 'online', // 'online' | 'idle' | 'dnd'
    customStatus: 'Designing in CanvasCord ✨',
    isMuted: false,
    isDeafened: false,
  },

  activeServerId: 'srv_design',
  activeChannelId: 'chan_critique',

  servers: [
    {
      id: 'srv_design',
      name: 'Design Guild',
      icon: '🎨',
      accentColor: '#5865F2',
      channels: [
        { id: 'chan_general', name: 'general-chat', type: 'text', unread: 0 },
        { id: 'chan_critique', name: 'design-critique', type: 'text', unread: 3 },
        { id: 'chan_ai_lab', name: 'ai-prompt-lab', type: 'text', unread: 1 },
        { id: 'chan_assets', name: 'asset-drops', type: 'text', unread: 0 },
        { id: 'chan_huddle', name: 'Design Huddle', type: 'voice', usersCount: 3 },
        { id: 'chan_focus', name: 'Silent Focus', type: 'voice', usersCount: 0 },
      ],
    },
    {
      id: 'srv_product',
      name: 'Acme Product Team',
      icon: '🚀',
      accentColor: '#57F287',
      channels: [
        { id: 'chan_prod_roadmap', name: 'roadmap', type: 'text', unread: 0 },
        { id: 'chan_prod_sprint', name: 'sprint-board', type: 'text', unread: 0 },
        { id: 'chan_prod_sync', name: 'Product Sync', type: 'voice', usersCount: 1 },
      ],
    },
    {
      id: 'srv_ai',
      name: 'AI Innovation Lab',
      icon: '✨',
      accentColor: '#EB459E',
      channels: [
        { id: 'chan_ai_models', name: 'gemma-experiments', type: 'text', unread: 0 },
        { id: 'chan_ai_sandbox', name: 'generative-canvas', type: 'text', unread: 0 },
        { id: 'chan_ai_huddle', name: 'Agent Huddle', type: 'voice', usersCount: 2 },
      ],
    },
  ],

  // Live Messages Feed per Channel
  messages: {
    chan_critique: [
      {
        id: 'msg_1',
        author: {
          name: 'Sarah Chen',
          role: 'Staff Designer',
          badge: 'STAFF',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          color: '#5865F2',
        },
        time: 'Today at 1:15 PM',
        content: 'Hey team! I just updated the main mobile onboarding frame on the canvas. Check the button hierarchy and let me know if the primary blurple CTA stands out enough! 📱✨',
        reactions: [
          { emoji: '🔥', count: 4, active: true },
          { emoji: '🚀', count: 2, active: false },
        ],
      },
      {
        id: 'msg_2',
        author: {
          name: 'Alex Rivera',
          role: 'Design Systems Lead',
          badge: 'PRO',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          color: '#57F287',
        },
        time: 'Today at 1:20 PM',
        content: 'Looks super clean! I dropped a couple of sticky notes near the footer. We should ensure the contrast ratio meets WCAG AAA standards for the dark mode cards.',
        reactions: [
          { emoji: '💡', count: 3, active: true },
        ],
      },
      {
        id: 'msg_3',
        author: {
          name: 'Canvas AI Copilot',
          role: 'AI Bot',
          badge: 'BOT',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          color: '#EB459E',
        },
        time: 'Today at 1:24 PM',
        content: '🤖 **Automated Design Audit**:\n- Active Canvas Objects: 14 elements\n- Color Harmony Score: 96%\n- Accessibility Status: All text layers pass WCAG AA (4.5:1 ratio)\n\n*Tip: Type `@copilot generate pricing` or `@copilot palette` in this chat to generate UI components directly onto your canvas!*',
        reactions: [
          { emoji: '⚡', count: 6, active: true },
        ],
      },
    ],
    chan_general: [
      {
        id: 'msg_gen_1',
        author: {
          name: 'DevBot',
          role: 'Integration',
          badge: 'BOT',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          color: '#FEE75C',
        },
        time: 'Today at 12:00 PM',
        content: 'Welcome to CanvasCord! Where vector design freedom meets real-time team community.',
        reactions: [{ emoji: '🎉', count: 12, active: true }],
      },
    ],
    chan_ai_lab: [
      {
        id: 'msg_ai_1',
        author: {
          name: 'Sarah Chen',
          role: 'Staff Designer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          color: '#5865F2',
        },
        time: 'Today at 1:00 PM',
        content: 'Testing generative prompts for SaaS landing page headers. The auto-layout algorithm is blazing fast!',
        reactions: [{ emoji: '✨', count: 3, active: true }],
      },
    ],
  },

  // Voice Huddle State
  voice: {
    isConnected: true,
    channelId: 'chan_huddle',
    channelName: 'Design Huddle',
    isSpeaking: true,
    participants: [
      {
        id: 'user_sarah',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        isSpeaking: true,
        isMuted: false,
        color: '#5865F2',
      },
      {
        id: 'user_alex',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        isSpeaking: false,
        isMuted: false,
        color: '#57F287',
      },
      {
        id: 'user_self',
        name: 'You (Lead)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        isSpeaking: false,
        isMuted: false,
        color: '#EB459E',
      },
    ],
  },
};
