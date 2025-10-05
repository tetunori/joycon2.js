const jc2 = new JoyCon2();

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (jc2.buttonUp || jc2.buttonX) {
    background('red');
  } else {
    background(220);
  }
}

function mouseClicked() {
  jc2.connect().then(() => console.log("JoyCon2 Connected"));
}
