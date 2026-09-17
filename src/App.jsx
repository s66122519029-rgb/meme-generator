import { useState, useRef } from 'react';

// คลังมีม 10 ตัวจริงตามแถบในรูป
const TEMPLATES = [
  { id: 1, name: 'This Is Sparta', url: 'https://api.memegen.link/images/sparta.png' },
  { id: 2, name: 'Drake Hotline Bling', url: 'https://api.memegen.link/images/drake.png' },
  { id: 3, name: 'Two Buttons', url: 'https://api.memegen.link/images/two-buttons.png' },
  { id: 4, name: 'Distracted Boyfriend', url: 'https://api.memegen.link/images/distracted.png' },
  { id: 5, name: 'I Am Once Again Asking', url: 'https://api.memegen.link/images/bernie.png' },
  { id: 6, name: 'UNO Draw 25 Cards', url: 'https://api.memegen.link/images/draw-25.png' },
  { id: 7, name: 'Left Exit 12 Off Ramp', url: 'https://api.memegen.link/images/exit-12.png' },
  { id: 8, name: 'Always Has Been', url: 'https://api.memegen.link/images/astronaut.png' },
  { id: 9, name: 'Epic Handshake', url: 'https://api.memegen.link/images/handshake.png' },
  { id: 10, name: "Gru's Plan", url: 'https://api.memegen.link/images/gru.png' }
];

export default function App() {
  const [selectedMeme, setSelectedMeme] = useState(TEMPLATES[1]);
  const [image, setImage] = useState(TEMPLATES[1].url);
  const [activeBox, setActiveBox] = useState(null);
  const [watermark, setWatermark] = useState(true);

  const [texts, setTexts] = useState([
    { id: 1, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 260, y: 40, w: 220, h: 70 },
    { id: 2, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 260, y: 220, w: 220, h: 70 },
    { id: 3, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 50, y: 320, w: 180, h: 60 }
  ]);

  const carouselRef = useRef(null);
  const fileInputRef = useRef(null);

  // ปุ่มกดเลื่อนซ้าย-ขวาของแถบรูป
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth'
      });
    }
  };

  const updateText = (id, key, val) => {
    setTexts(texts.map((t) => (t.id === id ? { ...t, [key]: val } : t)));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setSelectedMeme({ id: 99, name: file.name, url });
    }
  };

  const handleDrag = (e, id, currentPos) => {
    e.stopPropagation();
    setActiveBox(id);
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (me) => {
      updateText(id, 'x', currentPos.x + (me.clientX - startX));
      updateText(id, 'y', currentPos.y + (me.clientY - startY));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleReset = () => {
    setTexts([
      { id: 1, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 260, y: 40, w: 220, h: 70 },
      { id: 2, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 260, y: 220, w: 220, h: 70 },
      { id: 3, text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 50, y: 320, w: 180, h: 60 }
    ]);
  };

  // ดาวน์โหลดด้วย Canvas ไม่ต้องพึ่ง html-to-image
  const handleGenerate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 420;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      texts.forEach((t) => {
        if (!t.text) return;
        ctx.font = `bold ${t.size}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const posX = t.x + t.w / 2;
        const posY = t.y + t.h / 2;

        ctx.strokeStyle = t.stroke;
        ctx.lineWidth = 4;
        ctx.strokeText(t.text.toUpperCase(), posX, posY);

        ctx.fillStyle = t.color;
        ctx.fillText(t.text.toUpperCase(), posX, posY);
      });

      if (watermark) {
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('imgflip.com', 45, canvas.height - 12);
      }

      const link = document.createElement('a');
      link.download = `${selectedMeme.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.onerror = () => {
      alert('Failed to process image. Upload an image from your computer to test safely.');
    };
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '20px auto', background: '#fff', border: '1px solid #d3d3d3', fontFamily: 'Arial, Helvetica, sans-serif', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => fileInputRef.current.click()} style={outlineBtn}>Upload new template</button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" style={{ display: 'none' }} />
        </div>
        <div>
          <input type="text" placeholder="Search all memes" style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '3px', width: '220px', fontSize: '13px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Left Column: Canvas Preview */}
        <div style={{ flex: '1 1 56%' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <button style={toolBtn}>↺</button>
            <button style={toolBtn}>Spacing</button>
            <button style={toolBtn} onClick={() => fileInputRef.current.click()}>📷 Add Image</button>
            <button style={toolBtn}>Draw</button>
          </div>

          <div
            onClick={() => setActiveBox(null)}
            style={{
              position: 'relative',
              width: '100%',
              height: '420px',
              backgroundColor: '#eee',
              overflow: 'hidden',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={image}
              alt="Meme"
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#222' }}
            />

            {/* Draggable Text Boxes with Handles */}
            {texts.map((t) => {
              const selected = activeBox === t.id;
              return (
                <div
                  key={t.id}
                  onClick={(e) => { e.stopPropagation(); setActiveBox(t.id); }}
                  onMouseDown={(e) => handleDrag(e, t.id, { x: t.x, y: t.y })}
                  style={{
                    position: 'absolute',
                    top: `${t.y}px`,
                    left: `${t.x}px`,
                    width: `${t.w}px`,
                    minHeight: `${t.h}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    border: selected ? '1px dashed #555' : '1px dashed rgba(255,255,255,0.4)',
                    backgroundColor: selected ? 'rgba(255,255,255,0.15)' : 'transparent',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Impact, Arial Black, sans-serif',
                      fontSize: `${t.size}px`,
                      color: t.color,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      lineHeight: '1.1',
                      wordBreak: 'break-word',
                      textShadow: `2px 2px 0 ${t.stroke}, -2px -2px 0 ${t.stroke}, 2px -2px 0 ${t.stroke}, -2px 2px 0 ${t.stroke}`
                    }}
                  >
                    {t.text}
                  </span>

                  {selected && (
                    <>
                      <div style={{ ...nodeHandle, top: -5, left: -5 }} />
                      <div style={{ ...nodeHandle, top: -5, right: -5 }} />
                      <div style={{ ...nodeHandle, bottom: -5, left: -5 }} />
                      <div style={{ ...nodeHandle, bottom: -5, right: -5 }} />
                      <div style={{ ...nodeHandle, top: '50%', left: -5, transform: 'translateY(-50%)' }} />
                      <div style={{ ...nodeHandle, top: '50%', right: -5, transform: 'translateY(-50%)' }} />
                    </>
                  )}
                </div>
              );
            })}

            {watermark && (
              <div style={{ position: 'absolute', bottom: '6px', left: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
                imgflip.com
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Imgflip Toolbar with Scrollable Carousel */}
        <div style={{ flex: '1 1 44%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{selectedMeme.name}</span>
            <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '3px', overflow: 'hidden' }}>
              <button style={tabStyle}>My</button>
              <button style={tabStyle}>Hot</button>
              <button style={{ ...tabStyle, background: '#e0e0e0', fontWeight: 'bold' }}>Top</button>
            </div>
          </div>

          {/* แถบเลื่อนรูปภาพมีม (Scrollable Meme Bar) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button onClick={() => scrollCarousel('left')} style={arrowBtnStyle} title="Scroll Left">◀</button>

            <div
              ref={carouselRef}
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'scroll',
                scrollBehavior: 'smooth',
                padding: '4px 0',
                width: '100%'
              }}
            >
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => { setSelectedMeme(tpl); setImage(tpl.url); }}
                  style={{
                    flexShrink: 0,
                    width: '56px',
                    height: '42px',
                    border: selectedMeme.id === tpl.id ? '2px solid #0088cc' : '1px solid #ccc',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#f2f2f2'
                  }}
                  title={tpl.name}
                >
                  <img
                    src={tpl.url}
                    alt={tpl.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>

            <button onClick={() => scrollCarousel('right')} style={arrowBtnStyle} title="Scroll Right">▶</button>
          </div>

          {/* กล่องข้อความ Text #1, #2, #3 */}
          {texts.map((t, idx) => (
            <div key={t.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Text #${idx + 1}`}
                value={t.text}
                onFocus={() => setActiveBox(t.id)}
                onChange={(e) => updateText(t.id, 'text', e.target.value)}
                style={{ flex: 1, padding: '7px 10px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '13px' }}
              />
              <input
                type="color"
                value={t.color}
                onChange={(e) => updateText(t.id, 'color', e.target.value)}
                style={colorBox}
                title="Font color"
              />
              <input
                type="color"
                value={t.stroke}
                onChange={(e) => updateText(t.id, 'stroke', e.target.value)}
                style={{ ...colorBox, background: '#000' }}
                title="Outline color"
              />
              <button
                onClick={() => {
                  const s = prompt('Size (px):', t.size);
                  if (s) updateText(t.id, 'size', Number(s));
                }}
                style={gearBtn}
                title="Font settings"
              >
                ⚙
              </button>
            </div>
          ))}

          {/* ปุ่มเครื่องมือเสริม */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', color: '#555' }}>
              Tip: If you <a href="#login" style={{ color: '#0088cc' }}>log in</a>, your memes will be saved in your account
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={toolActionBtn}>✨ AI</button>
              <button style={toolActionBtn}>✨ Effects</button>
              <button
                style={toolActionBtn}
                onClick={() =>
                  setTexts([
                    ...texts,
                    { id: Date.now(), text: '', color: '#ffffff', stroke: '#000000', size: 28, x: 100, y: 150, w: 180, h: 60 }
                  ])
                }
              >
                Add Text
              </button>
            </div>
          </div>

          {/* Checkbox Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', color: '#333', marginTop: '4px' }}>
            <label><input type="checkbox" /> Use original image resolution (higher)</label>
            <label><input type="checkbox" /> Private (must download image to save or share)</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
              Watermark <span style={{ background: '#eef8ff', border: '1px solid #bce8f1', padding: '0 4px', color: '#31708f', borderRadius: '3px' }}>imgflip.com</span> bottom left
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
            <button
              onClick={handleGenerate}
              style={{
                flex: 1,
                backgroundColor: '#00b0f0',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '3px',
                padding: '11px',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Generate Meme
            </button>
            <button
              onClick={handleReset}
              style={{
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '3px',
                padding: '10px 18px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const outlineBtn = { background: '#fff', border: '1px solid #ccc', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', borderRadius: '3px' };
const toolBtn = { background: '#fff', border: '1px solid #ccc', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: '3px' };
const tabStyle = { background: '#fff', border: 'none', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' };
const arrowBtnStyle = { background: '#eee', border: '1px solid #ccc', borderRadius: '2px', cursor: 'pointer', padding: '6px 4px', fontSize: '10px', color: '#555', zIndex: 2 };
const colorBox = { width: '30px', height: '30px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', padding: '0' };
const gearBtn = { width: '30px', height: '30px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' };
const toolActionBtn = { background: '#fff', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 8px', fontSize: '12px', cursor: 'pointer' };
const nodeHandle = { position: 'absolute', width: '9px', height: '9px', background: '#fff', border: '1px solid #222', boxSizing: 'border-box' };