import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';

const TEMPLATES = [
  { id: 1, name: 'Sparta', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Leonidas_I.jpg/640px-Leonidas_I.jpg' },
  { id: 2, name: 'Cat', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/640px-Cat03.jpg' },
  { id: 3, name: 'Dog', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/640px-YellowLabradorLooking_new.jpg' }
];

export default function App() {
  const [image, setImage] = useState(TEMPLATES[0].url);
  
  // จัดการข้อความ
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  
  // ตำแหน่งลากวางข้อความ
  const [topPos, setTopPos] = useState({ x: 0, y: 15 });
  const [bottomPos, setBottomPos] = useState({ x: 0, y: 320 });

  // ฟิลเตอร์รูป
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);

  // สติกเกอร์ / อีโมจิ
  const [stickers, setStickers] = useState([]);

  const memeRef = useRef(null);

  // อัปโหลดรูปจากเครื่อง
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // เพิ่มอีโมจิ
  const addEmoji = (emoji) => {
    setStickers([...stickers, { id: Date.now(), char: emoji, x: 50, y: 50 }]);
  };

  // ลบสติกเกอร์
  const removeSticker = (id) => {
    setStickers(stickers.filter((s) => s.id !== id));
  };

  // ฟังก์ชันลากวัตถุ (Drag)
  const handleDrag = (e, setPosition, currentPos) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPosition({
        x: currentPos.x + dx,
        y: currentPos.y + dy
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // เซฟและดาวน์โหลดรูป
  const handleDownload = async () => {
    if (!memeRef.current) return;
    try {
      const dataUrl = await toPng(memeRef.current);
      const link = document.createElement('a');
      link.download = 'meme.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to save image.');
    }
  };

  const memeTextStyle = {
    position: 'absolute',
    color: textColor,
    fontSize: `${fontSize}px`,
    fontWeight: '900',
    fontFamily: 'Impact, Arial Black, sans-serif',
    textTransform: 'uppercase',
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0px 2px 0 #000, 0px -2px 0 #000',
    cursor: 'move',
    userSelect: 'none',
    textAlign: 'center',
    width: '100%',
    left: 0
  };

  return (
    <div style={{ maxWidth: '850px', margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: '16px' }}>
      <h2 style={{ textAlign: 'center' }}>Tiny Meme Generator</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* ฝั่งแสดงตัวอย่าง Meme */}
        <div style={{ flex: 1, minWidth: '350px' }}>
          <div
            ref={memeRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              backgroundColor: '#111',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={image}
              alt="Meme Base"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`
              }}
            />

            {/* ข้อความบน */}
            <div
              style={{ ...memeTextStyle, top: `${topPos.y}px`, transform: `translateX(${topPos.x}px)` }}
              onMouseDown={(e) => handleDrag(e, setTopPos, topPos)}
            >
              {topText}
            </div>

            {/* ข้อความล่าง */}
            <div
              style={{ ...memeTextStyle, top: `${bottomPos.y}px`, transform: `translateX(${bottomPos.x}px)` }}
              onMouseDown={(e) => handleDrag(e, setBottomPos, bottomPos)}
            >
              {bottomText}
            </div>

            {/* รายการสติกเกอร์ / อีโมจิ */}
            {stickers.map((s) => (
              <div
                key={s.id}
                onDoubleClick={() => removeSticker(s.id)}
                style={{
                  position: 'absolute',
                  top: `${s.y}px`,
                  left: `${s.x}px`,
                  fontSize: '40px',
                  cursor: 'move',
                  userSelect: 'none'
                }}
                onMouseDown={(e) =>
                  handleDrag(
                    e,
                    (newPos) => {
                      setStickers((prev) =>
                        prev.map((item) => (item.id === s.id ? { ...item, ...newPos } : item))
                      );
                    },
                    { x: s.x, y: s.y }
                  )
                }
                title="Double click to delete"
              >
                {s.char}
              </div>
            ))}
          </div>

          <button
            onClick={handleDownload}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Download Meme (PNG)
          </button>
        </div>

        {/* ฝั่งเครื่องมือปรับแต่ง (Controls) */}
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* เลือกรูป */}
          <div>
            <label><strong>Template / Upload:</strong></label>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'block', margin: '6px 0' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setImage(t.url)} style={{ padding: '4px 8px' }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* ปรับแต่งข้อความ */}
          <div>
            <label><strong>Top Text:</strong></label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label><strong>Bottom Text:</strong></label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div>
              <label><strong>Size: </strong></label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: '60px', padding: '4px' }}
              />
            </div>
            <div>
              <label><strong>Color: </strong></label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>

          {/* สติกเกอร์ */}
          <div>
            <label><strong>Add Emojis (Click to add, Double-click on image to remove):</strong></label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '20px', marginTop: '4px' }}>
              {['😂', '🔥', '🕶️', '💀', '💯', '❤️'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  style={{ fontSize: '20px', cursor: 'pointer', padding: '2px 8px' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ฟิลเตอร์ภาพ */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            <label><strong>Filters:</strong></label>
            <div>
              <small>Brightness: {brightness}%</small>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <small>Contrast: {contrast}%</small>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <small>Grayscale: {grayscale}%</small>
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => setGrayscale(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}