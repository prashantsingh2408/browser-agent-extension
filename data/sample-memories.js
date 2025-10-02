// Comprehensive Sample Memory Data for Demo
// This file contains rich, realistic sample memories to showcase the Memory Agent

const SAMPLE_MEMORIES = [
  // FAMILY & PERSONAL MEMORIES
  {
    title: '👨‍👩‍👧‍👦 Family Beach Vacation',
    content: 'Amazing week at the beach with the whole family! Kids built sandcastles while we relaxed and watched the sunset. Sarah learned to swim and Tom collected shells. Perfect family bonding time.',
    category: 'personal',
    tags: ['family', 'vacation', 'beach', 'kids', 'memories', 'bonding'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#87CEEB"/><circle cx="350" cy="50" r="30" fill="#FFD700"/><rect x="0" y="200" width="400" height="100" fill="#F4A460"/><polygon points="50,250 80,220 110,250" fill="#8B4513"/><polygon points="150,240 180,210 210,240" fill="#8B4513"/><circle cx="300" cy="230" r="15" fill="#FF69B4"/><circle cx="320" cy="235" r="12" fill="#00CED1"/><text x="200" y="280" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="14">Family Beach Day</text></svg>`)
  },
  {
    title: '🎂 Mom\'s 60th Birthday Celebration',
    content: 'Surprise party for mom\'s 60th birthday was a huge success! All the relatives came, and she was so happy. The homemade chocolate cake was delicious, and her reaction to seeing everyone was priceless.',
    category: 'personal',
    tags: ['family', 'birthday', 'celebration', 'mom', 'surprise', 'relatives'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FFB6C1"/><rect x="150" y="150" width="100" height="60" fill="#8B4513"/><rect x="160" y="140" width="80" height="10" fill="#FFFAF0"/><rect x="195" y="120" width="10" height="20" fill="#FFD700"/><circle cx="200" cy="115" r="3" fill="#FF4500"/><text x="200" y="250" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="16">Happy 60th Birthday!</text><circle cx="100" cy="100" r="20" fill="#FFE4E1"/><circle cx="300" cy="120" r="18" fill="#E6E6FA"/></svg>`)
  },
  {
    title: '🏠 New House Purchase',
    content: 'Finally got the keys to our new house! After months of searching and paperwork, we\'re officially homeowners. The kids are excited about their new rooms, and we can\'t wait to make memories here.',
    category: 'personal',
    tags: ['house', 'purchase', 'family', 'milestone', 'achievement', 'home'],
    type: 'text'
  },
  {
    title: '🐕 Adopted Rescue Dog Max',
    content: 'Welcomed Max, a golden retriever rescue, into our family today! He\'s 3 years old and so gentle with the kids. Already feels like he\'s been part of the family forever. The children are over the moon.',
    category: 'personal',
    tags: ['dog', 'adoption', 'rescue', 'family', 'pets', 'golden retriever'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#98FB98"/><ellipse cx="200" cy="180" rx="60" ry="40" fill="#DAA520"/><circle cx="180" cy="160" r="8" fill="#8B4513"/><circle cx="220" cy="160" r="8" fill="#8B4513"/><ellipse cx="200" cy="175" rx="15" ry="8" fill="#8B4513"/><path d="M 185 190 Q 200 200 215 190" stroke="#8B4513" stroke-width="2" fill="none"/><text x="200" y="250" text-anchor="middle" fill="#228B22" font-family="Arial" font-size="14">Welcome Home Max!</text></svg>`)
  },

  // TRAVEL & ADVENTURE MEMORIES
  {
    title: '🗼 Paris Anniversary Trip',
    content: 'Incredible 10th anniversary trip to Paris! Visited the Eiffel Tower, Louvre, and had the most romantic dinner at a small bistro in Montmartre. The city of love lived up to its reputation.',
    category: 'personal',
    tags: ['travel', 'paris', 'anniversary', 'romantic', 'eiffel tower', 'vacation'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#87CEEB"/><polygon points="200,50 190,250 210,250" fill="#696969"/><polygon points="200,50 180,100 220,100" fill="#696969"/><polygon points="200,100 170,150 230,150" fill="#696969"/><polygon points="200,150 160,200 240,200" fill="#696969"/><circle cx="350" cy="80" r="25" fill="#FFD700"/><text x="200" y="280" text-anchor="middle" fill="#4B0082" font-family="Arial" font-size="14">Paris Anniversary</text></svg>`)
  },
  {
    title: '🏔️ Swiss Alps Skiing Adventure',
    content: 'Epic skiing trip to the Swiss Alps with college friends! Perfect powder snow and breathtaking mountain views. Even managed to ski down a black diamond slope without falling. Unforgettable experience!',
    category: 'personal',
    tags: ['travel', 'skiing', 'swiss alps', 'adventure', 'friends', 'mountains'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E0F6FF"/><polygon points="0,200 150,80 300,100 400,150 400,300 0,300" fill="#FFFFFF"/><polygon points="100,120 200,60 300,90 400,120 400,300 0,300" fill="#F0F8FF"/><circle cx="350" cy="50" r="20" fill="#FFD700"/><rect x="180" y="140" width="4" height="30" fill="#8B4513"/><rect x="220" y="140" width="4" height="30" fill="#8B4513"/><text x="200" y="280" text-anchor="middle" fill="#4169E1" font-family="Arial" font-size="14">Swiss Alps Adventure</text></svg>`)
  },
  {
    title: '🏖️ Bali Honeymoon Memories',
    content: 'Magical honeymoon in Bali! Stayed in an overwater villa, watched stunning sunsets, and experienced the beautiful Balinese culture. The rice terraces in Ubud were absolutely breathtaking.',
    category: 'personal',
    tags: ['travel', 'bali', 'honeymoon', 'villa', 'sunset', 'culture'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#00CED1"/><circle cx="320" cy="60" r="35" fill="#FF6347"/><path d="M 0 200 Q 100 180 200 190 T 400 200" fill="#FFD700"/><rect x="150" y="160" width="100" height="40" fill="#8B4513"/><polygon points="150,160 200,140 250,160" fill="#CD853F"/><text x="200" y="280" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="14">Bali Honeymoon</text></svg>`)
  },

  // WORK & CAREER MEMORIES
  {
    title: '🚀 Major Product Launch Success',
    content: 'Successfully launched our biggest product update ever! 6 months of hard work paid off with overwhelmingly positive user feedback. The team collaboration was exceptional, and we exceeded all our KPIs.',
    category: 'work',
    tags: ['product launch', 'success', 'collaboration', 'achievement', 'KPIs', 'teamwork'],
    type: 'text'
  },
  {
    title: '📈 Promoted to Senior Manager',
    content: 'Got promoted to Senior Manager today! All the late nights and dedication finally paid off. Excited about the new challenges and the opportunity to mentor junior team members.',
    category: 'work',
    tags: ['promotion', 'senior manager', 'achievement', 'career', 'success', 'leadership'],
    type: 'text'
  },
  {
    title: '🎤 Conference Presentation Win',
    content: 'Delivered my first keynote presentation at the Tech Innovation Conference! Spoke about AI integration to 500+ attendees. Got amazing feedback and several collaboration offers.',
    category: 'work',
    tags: ['conference', 'keynote', 'presentation', 'AI', 'success', 'networking'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F5F5F5"/><rect x="50" y="50" width="300" height="180" fill="#FFFFFF" stroke="#000000" stroke-width="2"/><rect x="170" y="240" width="60" height="40" fill="#8B4513"/><circle cx="200" cy="220" r="15" fill="#FFB6C1"/><rect x="190" y="200" width="20" height="20" fill="#4169E1"/><text x="200" y="120" text-anchor="middle" fill="#000000" font-family="Arial" font-size="12">AI Integration</text><text x="200" y="140" text-anchor="middle" fill="#000000" font-family="Arial" font-size="12">Future Trends</text></svg>`)
  },
  {
    title: '🏆 Employee of the Year Award',
    content: 'Received the Employee of the Year award! Completely unexpected but so grateful. The recognition for leading the digital transformation project means everything. Celebrating with the team tonight!',
    category: 'work',
    tags: ['award', 'employee of the year', 'recognition', 'achievement', 'digital transformation'],
    type: 'text'
  },

  // LEARNING & DEVELOPMENT
  {
    title: '🎓 Completed MBA Program',
    content: 'Finally graduated with my MBA after 3 years of evening classes! The journey was challenging but incredibly rewarding. Ready to apply all the strategic thinking and leadership skills I\'ve learned.',
    category: 'notes',
    tags: ['MBA', 'graduation', 'education', 'learning', 'achievement', 'leadership'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#000080"/><rect x="150" y="100" width="100" height="80" fill="#FFD700"/><polygon points="200,100 180,80 220,80" fill="#000000"/><circle cx="200" cy="140" r="30" fill="#FFFFFF"/><text x="200" y="145" text-anchor="middle" fill="#000080" font-family="Arial" font-size="12">MBA</text><text x="200" y="250" text-anchor="middle" fill="#FFD700" font-family="Arial" font-size="14">Graduation Day!</text></svg>`)
  },
  {
    title: '💻 Machine Learning Certification',
    content: 'Earned my Machine Learning certification from Stanford! The course was intensive but fascinating. Excited to apply these AI/ML concepts to our upcoming projects and drive innovation.',
    category: 'notes',
    tags: ['machine learning', 'certification', 'stanford', 'AI', 'learning', 'innovation'],
    type: 'text'
  },
  {
    title: '📚 Read 50 Books This Year',
    content: 'Achieved my goal of reading 50 books this year! Mix of business, fiction, and self-development. Favorites were "Atomic Habits", "The Midnight Library", and "Thinking, Fast and Slow".',
    category: 'notes',
    tags: ['reading', 'books', 'goal', 'learning', 'self-development', 'achievement'],
    type: 'text'
  },

  // HEALTH & FITNESS
  {
    title: '🏃‍♂️ Completed First Marathon',
    content: 'Finished my first marathon in 4:15! Six months of training paid off. The last 10K was brutal, but crossing the finish line was an incredible feeling. Already thinking about the next one!',
    category: 'personal',
    tags: ['marathon', 'running', 'fitness', 'achievement', 'training', 'goal'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#87CEEB"/><rect x="0" y="200" width="400" height="100" fill="#228B22"/><circle cx="200" cy="150" r="20" fill="#FFB6C1"/><rect x="190" y="170" width="20" height="30" fill="#FF0000"/><rect x="185" y="200" width="10" height="20" fill="#000000"/><rect x="205" y="200" width="10" height="20" fill="#000000"/><text x="200" y="280" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="14">Marathon Finish!</text><text x="350" y="50" text-anchor="middle" fill="#FFD700" font-family="Arial" font-size="20">26.2</text></svg>`)
  },
  {
    title: '🧘‍♀️ Started Daily Meditation',
    content: 'Been meditating daily for 3 months now using the Headspace app. Amazing how 10 minutes a day has improved my focus and reduced stress. Feeling more centered and productive.',
    category: 'personal',
    tags: ['meditation', 'mindfulness', 'health', 'stress relief', 'daily habit', 'wellness'],
    type: 'text'
  },

  // HOBBIES & INTERESTS
  {
    title: '🎸 Learned to Play Guitar',
    content: 'Finally learned to play "Wonderwall" on guitar! Been practicing for months and can now play several songs. Music has become such a great stress reliever after work.',
    category: 'personal',
    tags: ['guitar', 'music', 'hobby', 'learning', 'stress relief', 'practice'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F5DEB3"/><ellipse cx="200" cy="180" rx="80" ry="60" fill="#8B4513"/><ellipse cx="200" cy="180" rx="60" ry="45" fill="#000000"/><rect x="200" y="80" width="8" height="100" fill="#654321"/><circle cx="204" cy="70" r="6" fill="#C0C0C0"/><line x1="180" y1="120" x2="220" y2="120" stroke="#C0C0C0" stroke-width="1"/><line x1="180" y1="140" x2="220" y2="140" stroke="#C0C0C0" stroke-width="1"/><text x="200" y="270" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="14">Guitar Practice</text></svg>`)
  },
  {
    title: '🍳 Mastered Homemade Pasta',
    content: 'Successfully made fresh pasta from scratch! Took several attempts to get the dough right, but the final result was restaurant-quality. The family loved the homemade ravioli with spinach filling.',
    category: 'personal',
    tags: ['cooking', 'pasta', 'homemade', 'family', 'skill', 'italian cuisine'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FFFAF0"/><ellipse cx="200" cy="150" rx="120" ry="80" fill="#F5DEB3"/><path d="M 120 150 Q 140 130 160 150 T 200 150 T 240 150 T 280 150" stroke="#DAA520" stroke-width="4" fill="none"/><path d="M 120 170 Q 140 150 160 170 T 200 170 T 240 170 T 280 170" stroke="#DAA520" stroke-width="4" fill="none"/><circle cx="150" cy="120" r="8" fill="#FF6347"/><circle cx="250" cy="180" r="6" fill="#228B22"/><text x="200" y="250" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="14">Fresh Homemade Pasta</text></svg>`)
  },

  // TECHNOLOGY & INNOVATION
  {
    title: '💡 Built Smart Home System',
    content: 'Completed my DIY smart home project! Integrated lights, thermostat, security cameras, and voice control. Used Raspberry Pi and various sensors. The automation routines are working perfectly.',
    category: 'ideas',
    tags: ['smart home', 'DIY', 'automation', 'raspberry pi', 'technology', 'innovation'],
    type: 'text'
  },
  {
    title: '🤖 Created Personal AI Assistant',
    content: 'Built a custom AI assistant using OpenAI API to help with daily tasks and email management. It can schedule meetings, summarize documents, and even help with coding. Productivity has increased significantly!',
    category: 'ideas',
    tags: ['AI assistant', 'automation', 'productivity', 'OpenAI', 'coding', 'innovation'],
    type: 'text'
  },

  // COMMUNITY & VOLUNTEERING
  {
    title: '🌱 Community Garden Project',
    content: 'Started a community garden in our neighborhood! Organized 20 families to participate. We\'re growing vegetables and herbs to share. It\'s brought the community together and kids are learning about gardening.',
    category: 'personal',
    tags: ['community', 'garden', 'volunteering', 'neighborhood', 'environment', 'kids'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#87CEEB"/><rect x="0" y="200" width="400" height="100" fill="#8B4513"/><rect x="50" y="150" width="80" height="50" fill="#228B22"/><rect x="150" y="160" width="70" height="40" fill="#32CD32"/><rect x="250" y="155" width="90" height="45" fill="#90EE90"/><circle cx="100" cy="140" r="8" fill="#FF6347"/><circle cx="180" cy="145" r="6" fill="#FFD700"/><circle cx="300" cy="135" r="10" fill="#FF69B4"/><text x="200" y="280" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="14">Community Garden</text></svg>`)
  },
  {
    title: '📖 Teaching Kids to Code',
    content: 'Volunteering at the local library teaching kids basic programming with Scratch. Seeing their excitement when they create their first animated story or game is incredibly rewarding. Future programmers in the making!',
    category: 'personal',
    tags: ['volunteering', 'teaching', 'kids', 'programming', 'scratch', 'education'],
    type: 'text'
  },

  // SPECIAL MOMENTS
  {
    title: '💍 Engagement Day',
    content: 'She said YES! Proposed at sunset on the beach where we had our first date 3 years ago. Spent weeks planning the perfect moment. Her reaction was everything I hoped for and more. Can\'t wait to start this new chapter!',
    category: 'personal',
    tags: ['engagement', 'proposal', 'beach', 'sunset', 'milestone', 'love'],
    type: 'image',
    mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF69B4"/><circle cx="320" cy="60" r="30" fill="#FFD700"/><rect x="0" y="200" width="400" height="100" fill="#F4A460"/><circle cx="200" cy="150" r="25" fill="#FFB6C1"/><circle cx="180" cy="150" r="20" fill="#FFE4E1"/><circle cx="200" cy="130" r="8" fill="#FFD700"/><path d="M 190 135 L 200 125 L 210 135" stroke="#FFD700" stroke-width="2" fill="none"/><text x="200" y="280" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="16">She Said Yes!</text></svg>`)
  },
  {
    title: '👶 Baby\'s First Steps',
    content: 'Emma took her first steps today! 11 months old and walking across the living room to reach her favorite toy. We were both crying happy tears. Captured it on video to show the grandparents.',
    category: 'personal',
    tags: ['baby', 'first steps', 'milestone', 'family', 'Emma', 'development'],
    type: 'text'
  }
];

// Export for use in memory.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SAMPLE_MEMORIES;
} else if (typeof window !== 'undefined') {
  window.SAMPLE_MEMORIES = SAMPLE_MEMORIES;
}
