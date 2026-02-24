import { useState } from 'react'
import axios from 'axios'
import * as Tone from 'tone'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('พร้อมทำงาน')
  const [temp, setTemp] = useState(0.6) // ตัวแปรความมั่ว (Temperature)
  const [isPlaying, setIsPlaying] = useState(false)

  const generateMusic = async () => {
    try {
      setIsLoading(true)
      setIsPlaying(false)
      setStatus('🧠 AI กำลังแต่งเพลง...')
      
      await Tone.start()

      // ส่งค่า temp ที่ user ปรับ ไปให้ backend
      const response = await axios.post('http://127.0.0.1:8000/generate', {
        length: 60,
        temperature: parseFloat(temp) 
      })

      const notes = response.data.notes
      setStatus(`🎵 ได้มาแล้ว ${notes.length} โน้ต! กำลังเล่น...`)
      setIsPlaying(true) // เริ่ม Animation
      
      playNotes(notes)

    } catch (error) {
      console.error(error)
      setStatus('❌ เกิดข้อผิดพลาด: ' + error.message)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const playNotes = (notes) => {
    // ใช้เสียงที่นุ่มขึ้น (AMSynth) + ใส่ Reverb ให้ดูแพง
    const reverb = new Tone.Reverb(2).toDestination();
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" }, // เสียงนุ่มๆ คล้าย Flute/Piano
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(reverb);

    const now = Tone.now()

    notes.forEach((note, index) => {
      let notesToPlay = note;
      
      // แปลงคอร์ด เช่น "4.7.10" ให้เป็น Array ["E4", "G4", "B4"] (สมมติ)
      // แต่ในที่นี้เพื่อความง่าย เราจะเล่นแค่โน้ตตัวแรกของคอร์ดไปก่อน
      if (note.includes('.') || !isNaN(note)) {
         // (ส่วนนี้ถ้าอยากให้เล่นคอร์ดจริงต้องมี mapping ที่ละเอียดกว่านี้)
         notesToPlay = "C4" // Fallback
      }

      // ใส่ความเป็นมนุษย์ (Humanize)
      // สุ่มความดัง (Velocity) และจังหวะเหลื่อมนิดหน่อย
      const velocity = 0.5 + Math.random() * 0.5; 
      const timeOffset = index * 0.4; // เล่นเร็วขึ้นนิดนึง (0.4s)

      synth.triggerAttackRelease(notesToPlay, "8n", now + timeOffset, velocity)
    })

    // จบการทำงาน
    setTimeout(() => {
      setIsLoading(false)
      setIsPlaying(false)
      setStatus('✨ เล่นจบแล้ว')
    }, notes.length * 400 + 1000)
  }

  return (
    <div className="container">
      <h1>AI Composer</h1>
      <p>สร้างทำนองเพลงด้วย Deep Learning</p>

      {/* Animation หลอกๆ เวลาเล่นเพลง */}
      <div className="visualizer">
        {isPlaying && [1,2,3,4,5].map(i => (
          <div key={i} className="bar" style={{animationDelay: `${i*0.1}s`}}></div>
        ))}
      </div>

      <div className="controls">
        <label>
          ระดับความคิดสร้างสรรค์ (Temperature): {temp}
        </label>
        <input 
          type="range" 
          min="0.2" 
          max="1.2" 
          step="0.1" 
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
        />
        <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>
          <span>(เรียบง่าย)</span> <span style={{float:'right'}}>(หลุดโลก)</span>
        </div>
      </div>

      <button 
        className="btn-generate"
        onClick={generateMusic} 
        disabled={isLoading}
      >
        {isLoading ? 'กำลังประมวลผล...' : '✨ สร้างเพลงใหม่'}
      </button>

      <div className="status-box">
        {status}
      </div>
    </div>
  )
}

export default App