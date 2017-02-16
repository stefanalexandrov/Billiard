'use strict';

function random(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
};
function Ball(ballRadius, gradient) {
    //this.velX = random(-5, 5);
    this.velX = 0;
    //this.velY = random(-5, 5);
    this.velY = 0;
    this.color = "rgb(230,230,230)";
    this.radialGradient = gradient;
    //this.radius = random(5, 50);
	this.radius = ballRadius;
    //this.x = random(this.radius, width - this.radius);
    //this.y = random(this.radius, height - this.radius);
	this.x = 0;
	this.y = 0;
	this.processed = false;
	this.striker = false;
	this.resistance = (0.007 * 9.81) / this.radius;
	this.inPocket = false;
};
function Key() {
    this.length = 50;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
};
Key.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgb(130, 130, 120)";
    ctx.stroke();
};
Ball.prototype.draw = function (ctx) {
    if (this.inPocket)
        return;
    ctx.beginPath();
    var gradient = ctx.createRadialGradient(this.x - 3, this.y - 3, radius / 4, this.x, this.y, radius);
    if (this.striker) {
        gradient.addColorStop(0, '#ffeeee');
        gradient.addColorStop(0.4, '#ff6565');
        gradient.addColorStop(1, '#ff3335');
    } else {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.4, '#dedede');
        gradient.addColorStop(1, '#7a7e7e');
    }
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
};
Ball.prototype.update = function (billiard) {
    if (this.inPocket)
        return;
    var middlePocketDiff = Math.abs((billiard.tableX1 + billiard.width / 2) - this.x);
    var middlePocketSensitivity = 10;
    var cornerPocketsSensitivity = 1.5;
    var Y1diff = Math.abs(billiard.tableY1 - this.y);
    var Y2diff = Math.abs(billiard.tableY2 - this.y);
    var X1diff = Math.abs(billiard.tableX1 - this.x);
    var X2diff = Math.abs(billiard.tableX2 - this.x);
    if ((this.y - this.radius) <= billiard.tableY1 - this.radius / 2 && (middlePocketDiff <= middlePocketSensitivity)) {
        this.inPocket = true;
        return;
    }
    if ((this.y + this.radius) >= billiard.tableY2 + this.radius / 2 && (middlePocketDiff <= middlePocketSensitivity)) {
        this.inPocket = true;
        return;
    }
    if (X1diff <= cornerPocketsSensitivity * this.radius && Y1diff <= cornerPocketsSensitivity * this.radius) {
        this.inPocket = true;
        return;
    }
    if (X1diff <= cornerPocketsSensitivity * this.radius && Y2diff <= cornerPocketsSensitivity * this.radius) {
        this.inPocket = true;
        return;
    }
    if (X2diff <= cornerPocketsSensitivity * this.radius && Y2diff <= cornerPocketsSensitivity * this.radius) {
        this.inPocket = true;
        return;
    }
    if (X2diff <= cornerPocketsSensitivity * this.radius && Y1diff <= cornerPocketsSensitivity * this.radius) {
        this.inPocket = true;
        return;
    }
    
    if ((this.x + this.radius) >= billiard.tableX2) {
        this.velX = -(this.velX);
    }
    if ((this.x - this.radius) <= billiard.tableX1) {
        this.velX = -(this.velX);
    }
    if ((this.y + this.radius) >= billiard.tableY2 && middlePocketDiff > middlePocketSensitivity) {
        this.velY = -(this.velY);
    }
    if ((this.y - this.radius) <= billiard.tableY1 && middlePocketDiff > middlePocketSensitivity) {
        this.velY = -(this.velY);
    }
    /*
    if (this.velX > 0) {
        this.velX -= this.resistance;
        if (this.velX < 0)
            this.velX = 0;
    } else if (this.velX < 0) {
        this.velX += this.resistance;
        if (this.velX > 0)
            this.velX = 0;
    }
    if (this.velY > 0) {
        this.velY -= this.resistance;
        if (this.velY < 0)
            this.velY = 0;
    } else if (this.velY < 0) {
        this.velY += this.resistance;
        if (this.velY > 0)
            this.velY = 0;
    }
    */
    var speedBetrag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    speedBetrag -= this.resistance;
    if (speedBetrag < 0)
        speedBetrag = 0;
    var speedAngle = Math.atan2(this.velX, this.velY);
    this.velX = Math.sin(speedAngle) * speedBetrag;
    this.velY = Math.cos(speedAngle) * speedBetrag;
    this.x += this.velX/10;
    this.y += this.velY/10;
};

function collisionPhysics(ball1, ball2) { // models ideal elastic collision in 2D
    if (ball1.inPocket)
        return;
    if (ball2.inPocket)
        return;
    var m1 = Math.pow(ball1.radius + 1, 3);
    var m2 = Math.pow(ball2.radius + 1, 3);
    var V1 = Math.sqrt(ball1.velX * ball1.velX + ball1.velY * ball1.velY);
    var V2 = Math.sqrt(ball2.velX * ball2.velX + ball2.velY * ball2.velY);
    var x1 = ball1.x;
    var y1 = ball1.y;
    var x2 = ball2.x;
    var y2 = ball2.y;
    var movAngle1 = Math.atan2(ball1.velY, ball1.velX);
    var movAngle2 = Math.atan2(ball2.velY, ball2.velX);
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    var collAngle = Math.atan(deltaY / deltaX);
    var cos1 = Math.cos(movAngle1 - collAngle);
    var cos2 = Math.cos(movAngle2 - collAngle);

    var tmp1 = (V1 * cos1 * (m1 - m2) + 2 * m2 * V2 * cos2) / (m1 + m2);

    ball1.velX = tmp1 * Math.cos(collAngle);
    ball1.velX += V1 * Math.sin(movAngle1 - collAngle) * Math.cos(collAngle + Math.PI / 2);

    ball1.velY = tmp1 * Math.sin(collAngle);
    ball1.velY += V1 * Math.sin(movAngle1 - collAngle) * Math.sin(collAngle + Math.PI / 2);

    var tmp2 = (V2 * cos2 * (m2 - m1) + 2 * m1 * V1 * cos1) / (m2 + m1);

    ball2.velX = tmp2 * Math.cos(collAngle);
    ball2.velX += V2 * Math.sin(movAngle2 - collAngle) * Math.cos(collAngle + Math.PI / 2);

    ball2.velY = tmp2 * Math.sin(collAngle);
    ball2.velY += V2 * Math.sin(movAngle2 - collAngle) * Math.sin(collAngle + Math.PI / 2);
};

function Billiard(x, y, width, height, ballRadius) {
    this.balls = [];
    while (this.balls.length < 15) {
        var ball = new Ball(ballRadius);
        this.balls.push(ball);
    }
    this.pockets = [];
    while (this.balls.length < 15) {
        var ball = new Ball(ballRadius);
        this.balls.push(ball);
    }
    this.strikerBall = new Ball(ballRadius);
    this.strikerBall.striker = true;
    this.strikerBall.color = "rgb(170, 20, 30)";
    this.tableX1 = x;
    this.tableY1 = y;
    this.tableX2 = x + width;
    this.tableY2 = y + height;
    this.width = width;
    this.height = height;
    this.ballRadius = ballRadius;
    this.drawKey = false;
    this.key = new Key();
};
Billiard.prototype.setInitPosition = function () {
    var startX = this.tableX2 - 100;
    var startY = this.tableY2 - this.height / 2 + 4 * this.ballRadius;
    var x = startX;
    var y = startY;
    var ballsPerRow = 5;
    var ballsCounter = ballsPerRow;
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].x = x;
        this.balls[i].y = y;
        if (i + 1 == ballsCounter) {
            ballsPerRow -= 1;
            ballsCounter = (i + 1) + ballsPerRow;
            x = startX -= 2*this.ballRadius*Math.cos(Math.PI/6) + 0.5;
            y = startY -= this.ballRadius + 0.5;
        } else {
            y = y - 2*this.ballRadius + 0.5;
        } 
    }
    this.strikerBall.x = this.tableX1 + this.width/5;
    this.strikerBall.velX = 0;
    this.strikerBall.y = this.tableY2 - this.height / 2;
    this.balls.push(this.strikerBall);
};
Billiard.prototype.collisionDetect = function (ball) {
    if (ball.processed)
        return;
    if (ball.inPocket)
        return;
    for (var j = 0; j < this.balls.length; j++) {
        if (!this.balls[j].processed &&
            (!(ball.x === this.balls[j].x && ball.y === this.balls[j].y && ball.velX === this.balls[j].velX
            && ball.velY === this.balls[j].velY))) {
            var dx = ball.x - this.balls[j].x;
            var dy = ball.y - this.balls[j].y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if ((0.01 > (distance - (ball.radius + this.balls[j].radius))) &&
                ((dx < 0 && ball.velX > this.balls[j].velX) || (dy < 0 && ball.velY > this.balls[j].velY) ||
                (dx > 0 && ball.velX < this.balls[j].velX) || (dy > 0 && ball.velY < this.balls[j].velY))) {
                //balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
                collisionPhysics(ball, this.balls[j]);

            }
        }
    }
};
Billiard.prototype.checkMouseHit = function (x, y) {
    for (var i = 0; i < this.balls.length; i++) {
        if (this.balls[i].striker == true && Math.abs(this.balls[i].velX) <= 0.5 && Math.abs(this.balls[i].velY) <= 0.5) {
            var dx = x - this.balls[i].x;
            var dy = y - this.balls[i].y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (0.5 > distance - this.balls[i].radius) {
                //this.balls[i].color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
                this.key.x2 = this.key.x1 = this.balls[i].x;
                this.key.y2 = this.key.y1 = this.balls[i].y;
                billiard.drawKey = true;

            }
        }
    }
};
Billiard.prototype.strikeBall = function () {
    for (var i = 0; i < this.balls.length; i++) {
        if (this.balls[i].striker == true) {
            var dx = this.key.x2 - this.key.x1;
            var dy = this.key.y2 - this.key.y1;
            this.balls[i].velX = dx / 10;
            this.balls[i].velY = dy / 10;
        }
    }

};
Billiard.prototype.drawPockets = function(ctx) {
    var coeff = 1.8; // sizing of pockets
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	
	// left top pocket
    ctx.beginPath();
    ctx.moveTo(tableX1 + coeff * radius, tableY1);
    ctx.lineTo(tableX1, tableY1 + coeff * radius);
    ctx.stroke();

    ctx.arc(tableX1, tableY1, coeff + radius, 135 * Math.PI / 180, Math.PI + 135 * Math.PI / 180);
    ctx.fill();
    // right bottom pocket
    ctx.beginPath();
    ctx.moveTo(tableX2 - coeff * radius, tableY2);
    ctx.lineTo(tableX2, tableY2 - coeff * radius);
    ctx.stroke();

    ctx.arc(tableX2, tableY2, coeff + radius, 315 * Math.PI / 180, Math.PI + 315 * Math.PI / 180);
    ctx.fill();
    // right top pocket
    ctx.beginPath();
    ctx.moveTo(tableX2 - coeff * radius, tableY1);
    ctx.lineTo(tableX2, tableY1 + coeff * radius);
    ctx.stroke();

    ctx.arc(tableX2, tableY1, coeff + radius, 45 * Math.PI / 180, 225 * Math.PI / 180, true);
    ctx.fill();
    // left bottom pocket
    ctx.beginPath();
    ctx.moveTo(tableX1 + coeff * radius, tableY2);
    ctx.lineTo(tableX1, tableY2 - coeff * radius);
    ctx.stroke();

    ctx.arc(tableX1, tableY2, coeff + radius, 225 * Math.PI / 180, 45 * Math.PI / 180, true);
    ctx.fill();
    // middle upper pocket
    ctx.beginPath();
    ctx.moveTo((this.tableX1 + this.width/2) - (coeff + radius), tableY1);
    ctx.lineTo((this.tableX1 + this.width/2) + coeff + radius, tableY1);
    ctx.stroke();

    ctx.arc((this.tableX1 + this.width / 2), tableY1 - 5, coeff + radius, 0, Math.PI, true);
    ctx.fill();
    // middle bottom pocket
    ctx.beginPath();
    ctx.moveTo((this.tableX1 + this.width/2) - (coeff + radius), tableY2);
    ctx.lineTo((this.tableX1 + this.width/2) + coeff + radius, tableY2);
    ctx.stroke();

    ctx.arc((this.tableX1 + this.width / 2), tableY2 + 5, coeff + radius, 0, Math.PI);
    ctx.fill();

};
module.exports.Ball = Ball;
module.exports.random = random;
module.exports.Billiard = Billiard;
