import { Joycon2 } from "joycon2.js";

interface JoyCon2Data {
  packetId: number;
  buttonL: boolean;
  buttonR: boolean;
  buttonMinus: boolean;
  buttonPlus: boolean;
  buttonLStick: boolean;
  buttonRStick: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonC: boolean;
  buttonX: boolean;
  buttonY: boolean;
  buttonUp: boolean;
  buttonDown: boolean;
  buttonLeft: boolean;
  buttonRight: boolean;
  buttonCapture: boolean;
  buttonHome: boolean;
  buttonZR: boolean,
  buttonZL: boolean,
  buttonSR_R: boolean,
  buttonSL_R: boolean,
  buttonSR_L: boolean,
  buttonSL_L: boolean,
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  mouseX: number;
  mouseY: number;
  mouseUnknown: number;
  mouseDistance: number;
  magX: number;
  magY: number;
  magZ: number;
  batteryVoltage: number;
  batteryCurrent: number;
  // reserved: number;
  temperature: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  triggerL: number;
  triggerR: number;
  simpleParsed: SimpleParsedJoyCon2Data;
  rawData: Uint8Array;
}

interface SimpleParsedJoyCon2Data {
  packetId: number;
  buttons: number;
  leftStick: number;
  rightStick: number;
  mouseX: number;
  mouseY: number;
  mouseUnknown: number;
  mouseDistance: number;
  magX: number;
  magY: number;
  magZ: number;
  batteryVoltage: number;
  batteryCurrent: number;
  // reserved: number;
  temperature: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  triggerL: number;
  triggerR: number;
}

const joy = new Joycon2();

document.getElementById("ble-connect")?.addEventListener("click", async () => {
  try {
    await joy.connect();
    console.log('connected');
  } catch (err) {
    console.error('connect error', err);
  }
});

joy.addEventListener('update', (e) => {
  const data = (e as CustomEvent).detail;

  // reflect into the same UI as before
  document.getElementById("raw-data")!.textContent = Array.from(data.rawData as Uint8Array)
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join(" ");

  (Object.keys(data.simpleParsed) as (keyof SimpleParsedJoyCon2Data)[]).forEach((key) => {
    const cell = document.getElementById("smpl-" + key) as HTMLTableCellElement | null;
    if (cell) cell.textContent = (data.simpleParsed[key]).toString();
  });

  // library already provides normalized stick values (-1..1), so use them directly
  drawStick('leftStickSim', data.leftStickX, data.leftStickY);
  drawStick('rightStickSim', data.rightStickX, data.rightStickY);

  (Object.keys(data) as (keyof JoyCon2Data)[]).forEach((key) => {
    const cell = document.getElementById(key) as HTMLTableCellElement | null;
    if (cell) cell.textContent = (data as any)[key].toString();
    if ((data as any)[key] === true) updateButtonCell(key as string, true);
    if ((data as any)[key] === false) updateButtonCell(key as string, false);
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



function readUint24LE(dv: DataView, offset: number): number {
  const b0 = dv.getUint8(offset);       // 下位バイト
  const b1 = dv.getUint8(offset + 1);
  const b2 = dv.getUint8(offset + 2);   // 上位バイト
  return (b2 << 16) | (b1 << 8) | b0;   // 24bit 整数
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

