// import { JoyCon2 } from "/joycon2.js/dist/joycon2.js";
import { JoyCon2 } from "@joycon2";

const jc2 = new JoyCon2();

const bleButton = document.getElementById('ble-connect') as HTMLButtonElement | null;
let isConnected = false;

function updateBleButton(connected: boolean) {
  if (!bleButton) return;
  isConnected = connected;
  bleButton.textContent = connected ? 'Disconnect' : 'Connect';
  // switch between Bootstrap primary (blue) and danger (red)
  bleButton.classList.remove('btn-primary', 'btn-danger');
  bleButton.classList.add(connected ? 'btn-danger' : 'btn-primary');
  bleButton.disabled = false;
}

bleButton?.addEventListener('click', async () => {
  if (!bleButton) return;
  if (isConnected) {
    // user requested disconnect
    try {
      jc2.disconnect();
    } catch (err) {
      console.error('disconnect error', err);
    }
    return;
  }

  // connect flow
  bleButton.disabled = true;
  try {
    await jc2.connect();
    // 'connected' event will update UI
  } catch (err) {
    console.error('connect error', err);
    bleButton.disabled = false;
  }
});

jc2.addEventListener('connected', () => updateBleButton(true));
jc2.addEventListener('disconnected', () => updateBleButton(false));
jc2.addEventListener('error', (e: Event) => {
  console.error('JoyCon2 error', (e as CustomEvent).detail);
  updateBleButton(false);
});

jc2.addEventListener('update', (e: Event) => {
  const data = ((e as CustomEvent).detail) as any;

  // reflect into the same UI as before
  document.getElementById("raw-data")!.textContent = Array.from(data.rawData as Uint8Array)
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join(" ");

  if (data.simpleParsed && typeof data.simpleParsed === 'object') {
    Object.entries(data.simpleParsed).forEach(([key, val]) => {
      const cell = document.getElementById('smpl-' + key) as HTMLTableCellElement | null;
      if (cell) cell.textContent = String(val);
    });
  }

  // library already provides normalized stick values (-1..1), so use them directly
  drawStick('leftStickSim', data.leftStickX, data.leftStickY);
  drawStick('rightStickSim', data.rightStickX, data.rightStickY);

  Object.entries(data).forEach(([key, val]) => {
    const cell = document.getElementById(key) as HTMLTableCellElement | null;
    if (cell) cell.textContent = String(val);
    if (val === true) updateButtonCell(key, true);
    if (val === false) updateButtonCell(key, false);
  });
});


function updateButtonCell(id: string, value: boolean) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = value ? "ON" : "OFF";

  if (value) {
    el.classList.add("bg-primary", "text-white"); // trueの時に色付け
  } else {
    el.classList.remove("bg-primary", "text-white"); // falseなら元に戻す
  }
}

// Helper functions for rendering are provided below. Stick normalization and parsing
// are handled inside the library; the example only draws the provided normalized
// values (-1..1).

function drawStick(canvasId: string, x: number, y: number) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const center = size / 2;
  const outerRadius = size / 2 - 5;
  const dotRadius = 6;

  // --- クリッピング処理 ---
  const len = Math.sqrt(x * x + y * y);
  if (len > 1) {
    x = x / len;
    y = y / len;
  }

  // クリア
  ctx.clearRect(0, 0, size, size);

  // 外円
  ctx.beginPath();
  ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 十字線
  ctx.beginPath();
  ctx.moveTo(center - outerRadius, center);
  ctx.lineTo(center + outerRadius, center);
  ctx.moveTo(center, center - outerRadius);
  ctx.lineTo(center, center + outerRadius);
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 値をキャンバス座標に変換
  const px = center + x * (outerRadius - dotRadius);
  const py = center - y * (outerRadius - dotRadius);

  // 内側の点
  ctx.beginPath();
  ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#007bff";
  ctx.fill();
}

