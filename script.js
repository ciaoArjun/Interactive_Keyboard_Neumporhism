let balls = [];
let keyIsCurrentlyDown = false;
let somethingExploded = false;

window.addEventListener("keydown", event => {
  if (!keyIsCurrentlyDown) {
    keyIsCurrentlyDown = true;
    var audio = new Audio("./buttonclick.mp3");
    audio.play();
    for (var i = 0; i < $("button").length; i++) {
      let k = event.key;
      if (k.length < 2) k = k.toUpperCase();
      if (
        $("button")
          .eq(i)
          .html() === k
      ) {
        let chosenColor = color(random(255), random(255), random(255));

        let pos = $("button")
          .eq(i)
          .position();
        let size = {
          w: $("button")
            .eq(i)
            .outerWidth(),
          h: $("button")
            .eq(i)
            .outerHeight()
        };

        for (var j = 0; j < 5; j++) {
          balls.push(
            new Ball(pos.left + size.w / 2, pos.top + size.h / 2, chosenColor)
          );
        }

        $("button")
          .eq(i)
          .addClass("pressed")
          .css(
            "color",
            "rgb(" +
              chosenColor.levels[0] +
              "," +
              chosenColor.levels[1] +
              "," +
              chosenColor.levels[2] +
              ")"
          );
      }
    }
  }
});

window.addEventListener("keyup", event => {
  $("button")
    .removeClass("pressed")
    .css("color", "");
  keyIsCurrentlyDown = false;
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(239, 238, 238);
}

function draw() {
  if (somethingExploded) {
    background(239, 238, 238, 50);
  } else {
    background(239, 238, 238, 255);
  }

  //   if (frameCount % 1 == 0) {
  //     balls.push(new Ball(mouseX, mouseY));
  //   }

  for (var i = balls.length - 1; i >= 0; i--) {
    balls[i].draw();
    balls[i].update();
    if (balls[i].remove) {
      balls.splice(i, 1);
    }
  }
}

class Ball {
  constructor(x, y, clr) {
    this.pos = createVector(x, y);
    this.acc = createVector();
    this.vel = p5.Vector.fromAngle(random(TWO_PI));
    this.vel.setMag(random(3, 10));
    this.color = clr;
    this.size = random(5, 10);
    this.opacity = 255;
    this.remove = false;
    this.imploding = false;
  }
  draw() {
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      this.opacity
    );
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(20);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    if (this.pos.x >= width - this.size / 2 || this.pos.x <= 0 + this.size / 2)
      this.vel.x *= -1;
    if (this.pos.y >= height - this.size / 2 || this.pos.y <= 0 + this.size / 2)
      this.vel.y *= -1;

    this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
    this.pos.y = constrain(this.pos.y, this.size / 2, height - this.size / 2);

    if (mouseIsPressed) {
      let desired = p5.Vector.sub(createVector(mouseX, mouseY), this.pos);
      desired.setMag(5);
      let steer = desired.sub(this.acc);
      steer.setMag(5);
      this.acc.add(steer);
    }

    for (var i = 0; i < balls.length; i++) {
      if (balls[i] !== this && balls[i].color !== this.color) {
        if (!mouseIsPressed) {
          let desired = p5.Vector.sub(balls[i].pos, this.pos);
          desired.setMag(5);
          let steer = desired.sub(this.acc);
          steer.setMag(5 / (balls.length - 1));
          this.acc.add(steer);
        }
      } else if (balls[i] !== this) {
        let d = this.pos.dist(balls[i].pos);
        if (d < this.size / 2 + balls[i].size / 2) {
          let repulse = p5.Vector.sub(this.pos, balls[i].pos);
          repulse.setMag(5);
          this.acc.add(repulse);
        }
      }
    }

    for (var i = 0; i < balls.length; i++) {
      if (balls[i] !== this && balls[i].color !== this.color) {
        let d = balls[i].pos.dist(this.pos);
        if (
          d < this.size / 2 + balls[i].size / 2 &&
          this.size > balls[i].size
        ) {
          balls[i].remove = true;
          this.size += balls[i].size / 2;
        }
      }
    }

    if (this.size >= 500 && !this.imploding) {
      this.imploding = true;
    }

    if (this.imploding) {
      this.size -= 100;
      if (this.size <= 0) {
        somethingExploded = true;
        setTimeout(() => {
          somethingExploded = false;
        }, 1000);
        for (var i = 0; i < 50; i++) {
          let b = new Ball(this.pos.x, this.pos.y, this.color);
          b.size = 10;
          balls.push(b);
        }
        this.remove = true;
      }
    }
  }
}
