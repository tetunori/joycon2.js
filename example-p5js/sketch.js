const jc2 = new JoyCon2();

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (jc2.buttonUp) {
    background(255, 0, 0);
  } else {
    background(220);
  }
}

function mouseClicked() {
  try {
    jc2.connect().then(() => console.log('connected ok')).catch(err => console.error('connect failed', err));
  } catch (err) {
    console.error('mouseClicked error', err);
  }
}
