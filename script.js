// 获取canvas元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let gameOver = false;
let score = 0;
// 防线血量，修改为500
let defenseHealth = 500;
// 城墙高度
const wallHeight = 30;
// 记录游戏开始时间
let startTime = Date.now();
// 记录当前游戏时间
let elapsedTime = 0;
// 温压弹冷却时间（秒）
const thermobaricBombCD = 5;
// 温压弹冷却剩余时间
let thermobaricBombCooldown = 0;
// 一排子弹数量
const bulletRowCount = 10;
// 伤害对象数组
let damageNumbers = [];
// 初始弹道数量
let bulletPaths = 1;
// 上次检查时的分数
let lastCheckedScore = 0;
// 弹道控制变量
let bulletPathOffset = 0;
const pathOffsetStep = 20;
// 用于记录上次增加怪物属性的时间
let lastPowerUpTime = Date.now();
// 用于记录上次增加怪物血量的时间
let lastHealthIncreaseTime = Date.now();
// 记录特殊状态开始时间
let specialStateStartTime = 0;
// 特殊状态标识
let isSpecialState = false;
// 存储每个僵尸原本的血量、速度和伤害
let originalZombieStats = {};

// 定义炮弹
class Bullet {
    constructor(x, y, dx, dy, speed) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }
}

// 定义普通僵尸
class Zombie {
    constructor(x, y, speed, damage, health) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.damage = damage;
        this.health = health;
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 30, 50);
        ctx.fillStyle ='red';
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.y += this.speed;
    }
}

// 定义伤害对象
class DamageNumber {
    constructor(x, y, damage, isDefense) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.startTime = Date.now();
        this.duration = 1000; // 显示持续时间（毫秒）
        this.alpha = 1;
        this.isDefense = isDefense;
    }
    update() {
        const elapsed = Date.now() - this.startTime;
        if (elapsed < this.duration) {
            this.alpha = 1 - elapsed / this.duration;
            this.y -= 1; // 向上跳动
        } else {
            this.alpha = 0;
        }
    }
    draw() {
        ctx.font = '16px Arial';
        ctx.fillStyle = this.isDefense? 'lightcoral' : 'lightgreen';
        ctx.globalAlpha = this.alpha;
        ctx.fillText(this.damage, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// 炮弹和僵尸数组
let bullets = [];
let zombies = [];

// 生成普通僵尸
function spawnZombie() {
    const minY = -200; // 最小垂直位置
    const maxY = -50;  // 最大垂直位置
    const x = Math.random() * (canvas.width - 30);
    const y = Math.random() * (maxY - minY) + minY;
    const zombie = new Zombie(x, y, 2, 10, 20);
    zombies.push(zombie);
}

// 自动射击函数
function autoShoot() {
    if (gameOver) return;
    const startY = canvas.height - wallHeight;

    for (let i = 0; i < bulletPaths; i++) {
        let startX = (canvas.width / (bulletPaths + 1) * (i + 1)) + bulletPathOffset;
        if (startX < 0) startX = 0;
        if (startX > canvas.width) startX = canvas.width;

        if (zombies.length > 0) {
            // 找到最近的僵尸
            let closestZombie = zombies[0];
            let closestDistance = Math.sqrt((startX - closestZombie.x) ** 2 + (startY - closestZombie.y) ** 2);
            for (let j = 1; j < zombies.length; j++) {
                const distance = Math.sqrt((startX - zombies[j].x) ** 2 + (startY - zombies[j].y) ** 2);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestZombie = zombies[j];
                }
            }

            // 计算子弹的方向
            const dx = (closestZombie.x + 15 - startX) / closestDistance;
            const dy = (closestZombie.y + 25 - startY) / closestDistance;

            const bullet = new Bullet(startX, startY, dx, dy, 5);
            bullets.push(bullet);
        }
    }

    setTimeout(autoShoot, 200);
}

// 绘制城墙
function drawWall() {
    ctx.beginPath();
    ctx.rect(0, canvas.height - wallHeight, canvas.width, wallHeight);
    ctx.fillStyle = 'gray';
    ctx.fill();
    ctx.closePath();
}

// 将秒数转换为 分钟:秒 的格式
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 处理键盘事件
document.addEventListener('keydown', function (e) {
    if (e.key === ' ' && thermobaricBombCooldown <= 0) {
        const bulletSpacing = canvas.width / (bulletRowCount + 1);
        for (let i = 1; i <= bulletRowCount; i++) {
            const x = i * bulletSpacing;
            const bullet = new Bullet(x, canvas.height - wallHeight, 0, -1, 5);
            bullets.push(bullet);
        }
        thermobaricBombCooldown = thermobaricBombCD;
    }
    if (e.key === 'a') {
        bulletPathOffset -= pathOffsetStep;
    }
    if (e.key === 'd') {
        bulletPathOffset += pathOffsetStep;
    }
});

// 游戏循环
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新游戏时间
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // 更新温压弹冷却时间
    if (thermobaricBombCooldown > 0) {
        thermobaricBombCooldown -= 1 / 60; // 假设 60fps
        if (thermobaricBombCooldown < 0) {
            thermobaricBombCooldown = 0;
        }
    }

    // 检查分数是否增加 10 并增加弹道
    if (score >= lastCheckedScore + 10) {
        bulletPaths++;
        lastCheckedScore = Math.floor(score / 10) * 10;
    }

    // 当积分大于 40 时，每过 2 秒怪物伤害 +1，速度 +0.1%
    if (score > 40 && Date.now() - lastPowerUpTime >= 2000) {
        zombies.forEach(zombie => {
            zombie.damage += 1;
            zombie.speed *= 1.001;
        });
        lastPowerUpTime = Date.now();
    }

    // 每过 20 秒怪物血量增加 5
    if (Date.now() - lastHealthIncreaseTime >= 20000) {
        zombies.forEach(zombie => {
            zombie.health += 5;
        });
        lastHealthIncreaseTime = Date.now();
    }

    // 2 分 30 秒开始特殊状态
    if (elapsedTime === 150 &&!isSpecialState) {
        isSpecialState = true;
        specialStateStartTime = Date.now();
        zombies.forEach((zombie, index) => {
            originalZombieStats[index] = {
                health: zombie.health,
                speed: zombie.speed,
                damage: zombie.damage
            };
            zombie.health *= 10;
            zombie.speed *= 6;
            zombie.damage *= 3.5;
        });
    }

    // 3 分钟结束特殊状态
    if (isSpecialState && Date.now() - specialStateStartTime >= 30000) {
        isSpecialState = false;
        zombies.forEach((zombie, index) => {
            if (originalZombieStats[index]) {
                zombie.health = originalZombieStats[index].health;
                zombie.speed = originalZombieStats[index].speed;
                zombie.damage = originalZombieStats[index].damage;
            }
        });
        originalZombieStats = {};
    }

    // 绘制城墙
    drawWall();

    // 生成新普通僵尸
    if (Math.random() < 0.02) {
        spawnZombie();
    }

    // 更新和绘制炮弹
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw();
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(i, 1);
        }
    }

    // 更新和绘制僵尸
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        zombie.update();
        zombie.draw();
        if (zombie.y + 50 > canvas.height - wallHeight) {
            // 僵尸到达城墙，扣除防线血量
            defenseHealth -= zombie.damage;
            const damageX = canvas.width - 50;
            const damageY = canvas.height - wallHeight + 20;
            const damage = -zombie.damage;
            const damageNumber = new DamageNumber(damageX, damageY, damage, true);
            damageNumbers.push(damageNumber);
            zombies.splice(i, 1);
            if (defenseHealth <= 0) {
                gameOver = true;
                // 游戏失败，弹出提示框
                alert(`游戏失败！你的最终分数是: ${score}，游戏时长: ${formatTime(elapsedTime)}`);
            }
        }
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (
                bullet.x > zombie.x &&
                bullet.x < zombie.x + 30 &&
                bullet.y > zombie.y &&
                bullet.y < zombie.y + 50
            ) {
                const damageX = zombie.x + 15;
                const damageY = zombie.y + 25;
                const damage = 10;
                zombie.health -= damage;
                const damageNumber = new DamageNumber(damageX, damageY, damage, false);
                damageNumbers.push(damageNumber);
                if (zombie.health <= 0) {
                    bullets.splice(j, 1);
                    zombies.splice(i, 1);
                    if (isSpecialState) {
                        score += 15;
                    } else {
                        score++;
                    }
                    // 每杀一只怪物防线回血 1
                    defenseHealth += 1;
                    if (score >= 500) {
                        gameOver = true;
                        alert(`游戏成功！你的最终分数是: ${score}，游戏时长: ${formatTime(elapsedTime)}`);
                    }
                    break;
                }
            }
        }
    }

    // 更新和绘制伤害数字
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const damageNumber = damageNumbers[i];
        damageNumber.update();
        damageNumber.draw();
        if (damageNumber.alpha === 0) {
            damageNumbers.splice(i, 1);
        }
    }

    // 绘制分数
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`分数: ${score}`, 10, 30);

    // 绘制防线血量
    ctx.fillText(`防线血量: ${defenseHealth}`, 10, 60);

    // 绘制游戏时间
    ctx.fillText(`游戏时间: ${formatTime(elapsedTime)}`, 10, 90);

    // 绘制温压弹冷却时间
    ctx.fillText(`温压弹冷却: ${Math.ceil(thermobaricBombCooldown)} 秒`, 10, 120);

    // 绘制弹道数量
    ctx.fillText(`弹道数量: ${bulletPaths}`, 10, 150);

    requestAnimationFrame(gameLoop);
}

// 开始自动射击
autoShoot();

// 开始游戏
gameLoop();
