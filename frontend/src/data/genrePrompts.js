// คลังแนวเพลงสำหรับโหมด Basic
// แต่ละแนวมี prompt สำรองหลายแบบ — เมื่อผู้ใช้กดซ้ำจะหมุนไม่ให้ได้ prompt เดิมติด ๆ กัน

export const GENRES = [
  {
    id: 'pop',
    name: 'Pop',
    emoji: '🎤',
    description: 'เพลงป็อปสดใส ฟังง่าย ติดหู',
    gradient: 'from-pink-500 to-rose-400',
    prompts: [
      'upbeat pop track with catchy melodies, bright synths, and danceable rhythms',
      'modern pop song with punchy drums, glossy synths and a memorable chorus hook',
      'feel-good summer pop with bright guitars, hand claps, and tropical percussion',
      'dreamy synth-pop with shimmering pads, warm bass, and a soft 80s vibe',
      'energetic dance pop with four-on-the-floor beat, sparkling leads, and uplifting energy',
      'acoustic pop with strummed guitar, soft piano, and a wholesome heartwarming feel',
      'electro pop with crisp claps, vocal chops, and a euphoric drop',
      'indie pop with jangly guitars, airy melodies, and a sunny optimistic mood',
      'k-pop inspired track with snappy beats, layered synths, and dynamic energy',
      'romantic ballad pop with cinematic strings, gentle piano, and emotional swells',
      'retro 80s pop with gated drums, neon synths, and a nostalgic chorus',
      'tropical house pop with marimba leads, smooth bass, and beachy chillout vibes',
    ],
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    emoji: '🌙',
    description: 'ชิล ผ่อนคลาย เหมาะกับการอ่านหนังสือ',
    gradient: 'from-purple-500 to-indigo-400',
    prompts: [
      'lo-fi hip hop with dusty drums, mellow jazz piano, and vinyl crackle',
      'chill lofi beat with smooth Rhodes piano, soft bass, and rainy ambience',
      'study lofi with warm tape saturation, gentle guitar, and slow boom-bap drums',
      'late-night lofi with hazy synths, muted trumpet, and laid-back swing',
      'jazzy lofi with brushed drums, walking bass, and dreamy chord changes',
      'cozy lofi with crackling fireplace ambience, soft chimes, and lullaby melodies',
      'sleepy lofi with downtempo beats, blurred pads, and gentle nostalgic vibes',
      'rainy day lofi with mellow guitar plucks, ambient rain, and slow tempo',
      'anime lofi with shimmery bells, soft piano, and bittersweet melancholic feel',
      'cafe lofi with mellow saxophone, brushed drums, and relaxing weekend energy',
      'morning lofi with bright Rhodes, chopped vocal samples, and a sunny groove',
      'midnight lofi with smoky chords, sub bass, and a meditative looped phrase',
    ],
  },
  {
    id: 'edm',
    name: 'EDM / Dance',
    emoji: '🔥',
    description: 'พลังงานสูง เต้นได้สนุก',
    gradient: 'from-cyan-400 to-blue-500',
    prompts: [
      'energetic EDM with festival synths, big build-up, and explosive drop',
      'progressive house with euphoric leads, driving four-on-the-floor beat, and uplifting energy',
      'future bass with chopped vocals, supersaw chords, and emotional drop',
      'tech house with groovy bassline, snappy claps, and rolling percussion',
      'trance anthem with soaring leads, arpeggiated synths, and dreamy breakdown',
      'big room EDM with stadium kicks, massive drops, and crowd-pumping energy',
      'electro house with gritty bass, fast hi-hats, and aggressive lead synth',
      'melodic dubstep with ethereal pads, wobble bass, and emotional build',
      'deep house with smooth bass, jazzy chords, and hypnotic groove',
      'drum and bass with fast breakbeats, deep sub bass, and high-energy synths',
      'tropical EDM with sunny pluck synths, warm vibes, and tropical percussion',
      'hardstyle with pounding kicks, distorted leads, and intense rave energy',
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    emoji: '🎸',
    description: 'กีตาร์หนักแน่น กลองเร้าใจ',
    gradient: 'from-red-500 to-orange-500',
    prompts: [
      'classic rock with driving electric guitars, punchy drums, and gritty energy',
      'alternative rock with distorted guitars, anthemic chorus, and powerful drums',
      'indie rock with jangly guitars, energetic drumming, and youthful vibe',
      'hard rock with heavy power chords, soaring guitar solos, and pounding rhythm',
      'pop punk with fast guitars, catchy chorus, and rebellious teenage energy',
      'arena rock with massive guitars, stadium-sized drums, and triumphant melody',
      'garage rock with raw fuzzy guitars, lo-fi production, and gritty attitude',
      'psychedelic rock with swirling guitars, reverb-soaked vocals, and trippy atmosphere',
      'punk rock with three-chord guitars, fast tempo, and rebellious shouted energy',
      'grunge with sludgy guitars, dynamic loud-quiet shifts, and angsty mood',
      'progressive rock with intricate guitar work, odd time signatures, and epic structure',
      'blues rock with bending guitar leads, swung shuffle drums, and soulful groove',
    ],
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    emoji: '🎧',
    description: 'บีตหนัก เบสแน่น',
    gradient: 'from-yellow-500 to-amber-500',
    prompts: [
      'hard-hitting hip hop beat with booming 808s, crisp hi-hats, and trap-style drums',
      'old school boom bap with chopped soul samples, dusty drums, and gritty vinyl',
      'modern trap beat with rolling hi-hats, deep sub bass, and dark atmospheric pads',
      'west coast hip hop with funky bassline, smooth synths, and laid-back groove',
      'east coast hip hop with jazzy piano samples, hard kicks, and classic feel',
      'cloud rap with hazy ethereal synths, slow trap drums, and dreamy texture',
      'drill beat with sliding 808s, ominous melodies, and aggressive energy',
      'lo-fi hip hop with warm vinyl crackle, mellow jazz chords, and chill drums',
      'phonk with cowbell percussion, distorted Memphis vocals, and dark vibes',
      'jazz rap with upright bass, brushed drums, and sophisticated horn samples',
      'experimental hip hop with glitchy textures, off-kilter drums, and avant-garde mood',
      'soulful hip hop with chopped vocal samples, lush strings, and emotional depth',
    ],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    emoji: '🎬',
    description: 'ดนตรีประกอบภาพยนตร์ ยิ่งใหญ่อลังการ',
    gradient: 'from-amber-400 to-yellow-300',
    prompts: [
      'epic cinematic orchestra with soaring strings, powerful brass, and thunderous drums',
      'emotional film score with delicate piano, swelling strings, and bittersweet melody',
      'heroic trailer music with massive percussion, choir, and triumphant brass',
      'dark cinematic with brooding low strings, ominous drones, and tension-building percussion',
      'fantasy adventure score with sweeping orchestra, magical harp, and majestic horns',
      'sci-fi cinematic with hybrid orchestral and electronic elements, futuristic atmosphere',
      'romantic film score with tender solo violin, warm piano, and lush string section',
      'action cinematic with driving percussion, aggressive brass, and pulse-pounding tempo',
      'mysterious cinematic with subtle strings, eerie textures, and growing suspense',
      'inspirational cinematic with uplifting strings, hopeful piano, and triumphant build',
      'horror score with dissonant strings, unsettling textures, and creeping dread',
      'medieval epic with celtic flutes, choir, and dramatic orchestral swells',
    ],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    emoji: '🎷',
    description: 'แจ๊ส อบอุ่น มีคลาส',
    gradient: 'from-emerald-400 to-teal-500',
    prompts: [
      'smooth jazz with mellow saxophone, warm piano, and gentle brushed drums',
      'classic jazz quartet with swinging piano, walking bass, and brushed drums',
      'cool jazz with relaxed trumpet, soft piano comping, and laid-back swing',
      'bossa nova with nylon guitar, soft shaker, and breezy Brazilian rhythm',
      'jazz fusion with electric piano, funky bass, and complex syncopated drums',
      'big band swing with punchy horn section, walking bass, and energetic shuffle',
      'late-night jazz with smoky saxophone, brushed drums, and intimate club vibe',
      'gypsy jazz with rapid acoustic guitar, swinging rhythm, and virtuosic feel',
      'modal jazz with floating piano voicings, exploratory sax, and open atmosphere',
      'jazz funk with groovy bass, wah guitar, and tight horn stabs',
      'piano trio jazz with elegant piano, melodic bass, and tasteful brushes',
      'soul jazz with Hammond organ, bluesy guitar, and toe-tapping groove',
    ],
  },
  {
    id: 'ambient',
    name: 'Ambient',
    emoji: '🌌',
    description: 'บรรยากาศนุ่ม ๆ สบายหู',
    gradient: 'from-violet-400 to-fuchsia-400',
    prompts: [
      'ethereal ambient with floating pads, gentle textures, and serene atmosphere',
      'dark ambient with deep drones, eerie textures, and otherworldly mood',
      'space ambient with cosmic synthesizers, slow evolving pads, and weightless feel',
      'nature ambient with field recordings, soft wind chimes, and tranquil pads',
      'meditation ambient with om-like drones, soft singing bowls, and calming flow',
      'cinematic ambient with reverb-drenched piano, swelling pads, and emotional depth',
      'ambient drone with sustained tones, subtle modulations, and hypnotic stillness',
      'new age ambient with crystalline bells, soft synths, and spiritual atmosphere',
      'ambient electronic with glitchy textures, warm pads, and introspective mood',
      'sleep ambient with extremely slow tempo, soft white noise, and dreamlike pads',
      'forest ambient with bird sounds, gentle guitar harmonics, and peaceful breeze',
      'underwater ambient with bubbling textures, deep filtered drones, and weightless flow',
    ],
  },
];

// ── ตัวจัดการลำดับการสุ่ม prompt แบบ shuffle queue ─────────────
// แต่ละแนวเก็บ queue ไว้ใน Map; เมื่อหมดจะ shuffle ใหม่
const queues = new Map();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * ดึง prompt ถัดไปจากแนวเพลง โดยไม่ให้ซ้ำกับครั้งก่อนหน้า
 * ใช้ระบบ shuffle queue: เล่นวนทุก prompt จนครบก่อนถึงจะหมุนซ้ำ
 */
export function getNextPrompt(genreId) {
  const genre = GENRES.find((g) => g.id === genreId);
  if (!genre) return '';

  let q = queues.get(genreId);
  if (!q || q.length === 0) {
    q = shuffle(genre.prompts);
    queues.set(genreId, q);
  }
  const next = q.shift();
  queues.set(genreId, q);
  return next;
}

export function getGenreById(id) {
  return GENRES.find((g) => g.id === id);
}
