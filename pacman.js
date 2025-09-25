const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const debugInfo = document.getElementById('debugInfo');

// 游戏配置
const TILE_SIZE = 40;
const WALL = 1;
const DOT = 0;
const EMPTY = 2;
const POWER_PELLET = 3;

let showGrid = true;

// 简化的测试关卡
const level = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    [2, 1, 3, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 1, 2],
    [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    [2, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2],
    [2, 1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 0, 1, 2, 1, 1, 2, 1, 1, 2, 1, 0, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 0, 2, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 2],
    [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    [2, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 2],
    [2, 1, 3, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 3, 1, 2],
    [2, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2],
    [2, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2],
    [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];


class PacmanPlayer {
    constructor({ x, y, tileSize = 40, speed = 2 }) {
        this.tileX = x;
        this.tileY = y;
        this.tileSize = tileSize;

        this.pixelX = x * tileSize + tileSize / 2;
        this.pixelY = y * tileSize + tileSize / 2;

        this.direction = null;
        this.nextDirection = null;
        this.speed = speed;
        this.radius = tileSize * 0.35;

        this.animFrame = 0;
        this.animSpeed = 0.02;
        this.mouthOpen = true;

        this.score = 0;

        // 调试变量
        this.debugLog = [];
    }

    log(message) {
        const timestamp = Date.now();
        this.debugLog.push(`${timestamp}: ${message}`);
        if (this.debugLog.length > 15) {
            this.debugLog.shift();
        }
        console.log(`[${timestamp}] ${message}`); // 同时输出到控制台
    }

    canMove(direction, maze) {
        return this.canMoveFromTile(this.tileX, this.tileY, direction, maze);
    }

    canMoveFromTile(fromTileX, fromTileY, direction, maze) {
        let nextTileX = fromTileX;
        let nextTileY = fromTileY;

        switch (direction) {
            case 'UP': nextTileY -= 1; break;
            case 'DOWN': nextTileY += 1; break;
            case 'LEFT': nextTileX -= 1; break;
            case 'RIGHT': nextTileX += 1; break;
            default:
                this.log(`canMove: 无效方向 ${direction}`);
                return false;
        }

        // 检查边界
        if (nextTileX < 0 || nextTileX >= maze[0].length ||
            nextTileY < 0 || nextTileY >= maze.length) {
            this.log(`canMoveFromTile: 越界 from(${fromTileX},${fromTileY}) to(${nextTileX}, ${nextTileY})`);
            return false;
        }

        const tileType = maze[nextTileY][nextTileX];
        const canMove = tileType !== WALL;
        this.log(`canMoveFromTile ${direction}: from(${fromTileX},${fromTileY}) to(${nextTileX},${nextTileY}) = ${tileType}, can=${canMove}`);
        return canMove;
    }

    isAtTileCenter() {
        const centerX = this.tileX * this.tileSize + this.tileSize / 2;
        const centerY = this.tileY * this.tileSize + this.tileSize / 2;

        // 使用更小的容忍度，避免移动后立即被判断为"在中心"
        const threshold = this.speed * 0.5; // 1 像素容忍度
        const atCenter = Math.abs(this.pixelX - centerX) <= threshold &&
            Math.abs(this.pixelY - centerY) <= threshold;

        if (atCenter) {
            this.log(`在瓦片中心: pixel(${this.pixelX.toFixed(1)}, ${this.pixelY.toFixed(1)}) center(${centerX}, ${centerY}) threshold=${threshold}`);
        }

        return atCenter;
    }

    snapToTileCenter() {
        const oldX = this.pixelX;
        const oldY = this.pixelY;
        this.pixelX = this.tileX * this.tileSize + this.tileSize / 2;
        this.pixelY = this.tileY * this.tileSize + this.tileSize / 2;
        this.log(`对齐到中心: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) -> (${this.pixelX}, ${this.pixelY})`);
    }

    setDirection(direction) {
        this.log(`设置期望方向: ${this.nextDirection} -> ${direction}`);
        this.nextDirection = direction;
    }

    update(maze) {
        let wasAtTileCenter = false;

        // 检查是否在瓦片中心 - 只在真正接近中心时才处理转向逻辑
        if (this.isAtTileCenter()) {
            wasAtTileCenter = true;
            this.snapToTileCenter();

            // 收集豆豆
            const currentTile = maze[this.tileY][this.tileX];
            if (currentTile === DOT) {
                maze[this.tileY][this.tileX] = EMPTY;
                this.score += 10;
                this.log(`收集豆豆，分数: ${this.score}`);
            } else if (currentTile === POWER_PELLET) {
                maze[this.tileY][this.tileX] = EMPTY;
                this.score += 50;
                this.log(`收集能量球，分数: ${this.score}`);
            }

            // 处理方向变更 - 优先处理转向请求
            if (this.nextDirection) {
                this.log(`尝试转向: ${this.direction} -> ${this.nextDirection}`);
                if (this.canMove(this.nextDirection, maze)) {
                    this.direction = this.nextDirection;
                    this.nextDirection = null;
                    this.log(`转向成功: 新方向 ${this.direction}`);
                } else {
                    this.log(`转向失败: ${this.nextDirection} 被阻挡，保持 ${this.direction}`);
                    // 保持 nextDirection，继续尝试
                }
            }

            // 检查当前方向是否被阻挡（只在瓦片中心检查一次）
            if (this.direction && !this.canMove(this.direction, maze)) {
                this.log(`当前方向 ${this.direction} 在瓦片中心被阻挡，停止移动`);
                this.direction = null;
            }
        }
        // 如果不在瓦片中心但有转向请求，检查是否可以预转向
        else if (this.nextDirection && this.direction) {
            // 检查是否接近下一个瓦片的中心，允许预转向
            const nextTileX = this.tileX + (this.direction === 'RIGHT' ? 1 : this.direction === 'LEFT' ? -1 : 0);
            const nextTileY = this.tileY + (this.direction === 'DOWN' ? 1 : this.direction === 'UP' ? -1 : 0);
            const nextCenterX = nextTileX * this.tileSize + this.tileSize / 2;
            const nextCenterY = nextTileY * this.tileSize + this.tileSize / 2;

            // 如果接近下一个瓦片中心，尝试转向
            const distToNextCenter = Math.abs(this.pixelX - nextCenterX) + Math.abs(this.pixelY - nextCenterY);
            if (distToNextCenter <= this.speed * 1.5) {
                this.log(`接近下一个瓦片中心，尝试预转向: ${this.nextDirection}`);
                if (this.canMoveFromTile(nextTileX, nextTileY, this.nextDirection, maze)) {
                    this.log(`预转向成功: ${this.direction} -> ${this.nextDirection}`);
                    this.direction = this.nextDirection;
                    this.nextDirection = null;
                }
            }
        }

        // 执行移动
        if (this.direction) {
            let deltaX = 0, deltaY = 0;

            switch (this.direction) {
                case 'UP': deltaY = -this.speed; break;
                case 'DOWN': deltaY = this.speed; break;
                case 'LEFT': deltaX = -this.speed; break;
                case 'RIGHT': deltaX = this.speed; break;
            }

            const oldPixelX = this.pixelX;
            const oldPixelY = this.pixelY;

            this.pixelX += deltaX;
            this.pixelY += deltaY;

            this.log(`移动 ${this.direction}: (${oldPixelX.toFixed(1)}, ${oldPixelY.toFixed(1)}) -> (${this.pixelX.toFixed(1)}, ${this.pixelY.toFixed(1)}) [wasAtCenter: ${wasAtTileCenter}]`);

            // 更新瓦片坐标
            const newTileX = Math.floor((this.pixelX - this.tileSize / 2) / this.tileSize + 0.5);
            const newTileY = Math.floor((this.pixelY - this.tileSize / 2) / this.tileSize + 0.5);

            if (newTileX !== this.tileX || newTileY !== this.tileY) {
                this.log(`瓦片坐标变化: (${this.tileX}, ${this.tileY}) -> (${newTileX}, ${newTileY})`);
                this.tileX = newTileX;
                this.tileY = newTileY;
            }
        } else {
            // 没有方向时记录状态
            if (this.nextDirection) {
                this.log(`等待转向机会: ${this.nextDirection}, 当前在瓦片中心: ${this.isAtTileCenter()}`);
            }
        }

        this.updateAnimation();
    }

    updateAnimation() {
        if (this.direction) {
            this.animFrame += this.animSpeed;
            if (this.animFrame >= 1) {
                this.animFrame = 0;
                this.mouthOpen = !this.mouthOpen;
            }
        }
    }

    draw(ctx) {
        // 绘制玩家
        ctx.save();
        ctx.translate(this.pixelX, this.pixelY);

        let rotation = 0;
        switch (this.direction) {
            case 'RIGHT': rotation = 0; break;
            case 'DOWN': rotation = Math.PI / 2; break;
            case 'LEFT': rotation = Math.PI; break;
            case 'UP': rotation = -Math.PI / 2; break;
        }
        ctx.rotate(rotation);

        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();

        if (this.mouthOpen && this.direction) {
            ctx.arc(0, 0, this.radius, Math.PI * 0.2, Math.PI * 1.8);
            ctx.lineTo(0, 0);
        } else {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }

        ctx.fill();
        ctx.restore();

        // 绘制调试信息
        this.drawDebugVisuals(ctx);
    }

    drawDebugVisuals(ctx) {
        // 当前瓦片高亮
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.tileX * this.tileSize,
            this.tileY * this.tileSize,
            this.tileSize,
            this.tileSize
        );

        // 瓦片中心点
        const centerX = this.tileX * this.tileSize + this.tileSize / 2;
        const centerY = this.tileY * this.tileSize + this.tileSize / 2;
        ctx.fillStyle = 'red';
        ctx.fillRect(centerX - 3, centerY - 3, 6, 6);

        // 玩家实际位置
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.pixelX - 2, this.pixelY - 2, 4, 4);

        // 方向指示器
        if (this.direction) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.pixelX, this.pixelY);

            let endX = this.pixelX, endY = this.pixelY;
            switch (this.direction) {
                case 'UP': endY -= 20; break;
                case 'DOWN': endY += 20; break;
                case 'LEFT': endX -= 20; break;
                case 'RIGHT': endX += 20; break;
            }
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }

    getDebugInfo() {
        return {
            tilePos: `(${this.tileX}, ${this.tileY})`,
            pixelPos: `(${this.pixelX.toFixed(1)}, ${this.pixelY.toFixed(1)})`,
            direction: this.direction || 'NULL',
            nextDirection: this.nextDirection || 'NULL',
            atCenter: this.isAtTileCenter(),
            score: this.score,
            recentLogs: this.debugLog.slice(-8) // 显示更多日志
        };
    }
}

class LevelRenderer {
    constructor(maze, tileSize) {
        this.maze = maze;
        this.tileSize = tileSize;

        // 方向向量 - 对应右、下、左、上
        this.directions = [
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }, // 左
            { x: 0, y: -1 }  // 上
        ];
    }

    // 获取指定位置的瓦片类型，越界返回 WALL
    getTile(x, y) {
        if (x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length) {
            return WALL;
        }
        return this.maze[y][x];
    }

    // 检查某个方向是否有相邻的墙
    hasWallInDirection(x, y, dirIndex) {
        const dir = this.directions[dirIndex];
        return this.getTile(x + dir.x, y + dir.y) === WALL;
    }

    draw(ctx) {
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const tile = this.maze[y][x];
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                const centerX = pixelX + this.tileSize / 2;
                const centerY = pixelY + this.tileSize / 2;

                switch (tile) {
                    case WALL:
                        this.drawRoundedWall(ctx, x, y, pixelX, pixelY);
                        break;

                    case DOT:
                        ctx.fillStyle = '#FFFF00';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
                        ctx.fill();
                        break;

                    case POWER_PELLET:
                        ctx.fillStyle = '#FFFF00';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
                        ctx.fill();

                        const flash = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                        ctx.fillStyle = `rgba(255, 255, 0, ${flash})`;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            }
        }

        // 绘制网格
        if (showGrid) {
            this.drawGrid(ctx);
        }
    }

    drawRoundedWall(ctx, x, y, pixelX, pixelY) {
        ctx.strokeStyle = '#0080FF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let [right, down, left, up] = [
            this.hasWallInDirection(x, y, 0),
            this.hasWallInDirection(x, y, 1),
            this.hasWallInDirection(x, y, 2),
            this.hasWallInDirection(x, y, 3)
        ];

        const size = this.tileSize;
        const third = size / 3;
        const twoThird = 2 * size / 3;

        // === 边界修正 ===
        const maxX = this.mapWidth - 1;
        const maxY = this.mapHeight - 1;

        if (x === 0) left = true;
        if (x === maxX) right = true;
        if (y === 0) up = true;
        if (y === maxY) down = true;

        // === L 型：外角 + 内角 ===
        if (right && down && !left && !up) {
            // 右下角
            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY + size, twoThird, Math.PI, 1.5 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY + size, third, Math.PI, 1.5 * Math.PI, false);
            ctx.stroke();
        }
        else if (down && left && !right && !up) {
            // 左下角
            ctx.beginPath();
            ctx.arc(pixelX, pixelY + size, twoThird, 1.5 * Math.PI, 2 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX, pixelY + size, third, 1.5 * Math.PI, 2 * Math.PI, false);
            ctx.stroke();
        }
        else if (left && up && !right && !down) {
            // 左上角
            ctx.beginPath();
            ctx.arc(pixelX, pixelY, twoThird, 0, 0.5 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX, pixelY, third, 0, 0.5 * Math.PI, false);
            ctx.stroke();
        }
        else if (up && right && !left && !down) {
            // 右上角
            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY, twoThird, 0.5 * Math.PI, Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY, third, 0.5 * Math.PI, Math.PI, false);
            ctx.stroke();
        }

        // === T 型：两个小内角 ===
        else if (right && up && down && !left) {
            // 缺左 → 左上 + 左下
            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY, third, 0.5 * Math.PI, Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY + size, third, Math.PI, 1.5 * Math.PI, false);
            ctx.stroke();

            // 主干竖线
            ctx.beginPath();
            ctx.moveTo(pixelX + third, pixelY);
            ctx.lineTo(pixelX + third, pixelY + size);
            ctx.stroke();
        }

        else if (left && up && down && !right) {
            // 缺右 → 右上 + 右下
            ctx.beginPath();
            ctx.arc(pixelX, pixelY, third, 0, 0.5 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX, pixelY + size, third, 1.5 * Math.PI, 2 * Math.PI, false);
            ctx.stroke();

            // 主干竖线
            ctx.beginPath();
            ctx.moveTo(pixelX + twoThird, pixelY);
            ctx.lineTo(pixelX + twoThird, pixelY + size);
            ctx.stroke();
        }

        else if (up && left && right && !down) {
            // 缺下 → 左下 + 右下
            ctx.beginPath();
            ctx.arc(pixelX, pixelY, third, 0, 0.5 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY, third, 0.5 * Math.PI, Math.PI, false);
            ctx.stroke();

            // 主干横线
            ctx.beginPath();
            ctx.moveTo(pixelX, pixelY + twoThird);
            ctx.lineTo(pixelX + size, pixelY + twoThird);
            ctx.stroke();
        }

        else if (down && left && right && !up) {
            // 缺上 → 左上 + 右上
            ctx.beginPath();
            ctx.arc(pixelX, pixelY + size, third, 1.5 * Math.PI, 2 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelX + size, pixelY + size, third, - 1 * Math.PI, - 0.5 * Math.PI, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(pixelX, pixelY + third);
            ctx.lineTo(pixelX + size, pixelY + third);
            ctx.stroke();
        }

        // === 直线边 ===
        else {
            const radius = third / 2; // 半径 = 1/6 tileSize
            const midY = pixelY + size / 2;
            const midX = pixelX + size / 2;

            // 横线
            if (!up) {
                if (left && right) {
                    // 左右都有邻居 → 整条横线
                    ctx.beginPath();
                    ctx.moveTo(pixelX, pixelY + third);
                    ctx.lineTo(pixelX + size, pixelY + third);
                    ctx.stroke();
                } else if (left && !right) {
                    // 只有左邻居 → 2/3 长直线 + 右端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX, pixelY + third);
                    ctx.lineTo(pixelX + twoThird, pixelY + third);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pixelX + twoThird, midY, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
                    ctx.stroke();
                } else if (!left && right) {
                    // 只有右邻居 → 2/3 长直线 + 左端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + third, pixelY + third);
                    ctx.lineTo(pixelX + size, pixelY + third);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pixelX + third, midY, radius, 0.5 * Math.PI, 1.5 * Math.PI, false);
                    ctx.stroke();
                }
            }

            if (!down) {
                if (left && right) {
                    // 左右都有邻居 → 整条横线
                    ctx.beginPath();
                    ctx.moveTo(pixelX, pixelY + twoThird);
                    ctx.lineTo(pixelX + size, pixelY + twoThird);
                    ctx.stroke();
                } else if (left && !right) {
                    // 只有左邻居 → 2/3 长直线 + 右端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX, pixelY + twoThird);
                    ctx.lineTo(pixelX + twoThird, pixelY + twoThird);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pixelX + twoThird, midY, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
                    ctx.stroke();
                } else if (!left && right) {
                    // 只有右邻居 → 2/3 长直线 + 左端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + third, pixelY + twoThird);
                    ctx.lineTo(pixelX + size, pixelY + twoThird);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pixelX + third, midY, radius, 0.5 * Math.PI, 1.5 * Math.PI, false);
                    ctx.stroke();
                }
            }

            // 竖线
            if (!left) {
                if (up && down) {
                    // 上下都有邻居 → 整条竖线
                    ctx.beginPath();
                    ctx.moveTo(pixelX + third, pixelY);
                    ctx.lineTo(pixelX + third, pixelY + size);
                    ctx.stroke();
                } else if (up && !down) {
                    // 只有上邻居 → 2/3 长直线 + 下端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + third, pixelY);
                    ctx.lineTo(pixelX + third, pixelY + twoThird);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(midX, pixelY + twoThird, radius, 0, Math.PI, false);
                    ctx.stroke();
                } else if (!up && down) {
                    // 只有下邻居 → 2/3 长直线 + 上端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + third, pixelY + third);
                    ctx.lineTo(pixelX + third, pixelY + size);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(midX, pixelY + third, radius, Math.PI, 2 * Math.PI, false);
                    ctx.stroke();
                }
            }

            if (!right) {
                if (up && down) {
                    // 上下都有邻居 → 整条竖线
                    ctx.beginPath();
                    ctx.moveTo(pixelX + twoThird, pixelY);
                    ctx.lineTo(pixelX + twoThird, pixelY + size);
                    ctx.stroke();
                } else if (up && !down) {
                    // 只有上邻居 → 2/3 长直线 + 下端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + twoThird, pixelY);
                    ctx.lineTo(pixelX + twoThird, pixelY + twoThird);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(midX, pixelY + twoThird, radius, 0, Math.PI, false);
                    ctx.stroke();
                } else if (!up && down) {
                    // 只有下邻居 → 2/3 长直线 + 上端半圆
                    ctx.beginPath();
                    ctx.moveTo(pixelX + twoThird, pixelY + third);
                    ctx.lineTo(pixelX + twoThird, pixelY + size);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(midX, pixelY + third, radius, Math.PI, 2 * Math.PI, false);
                    ctx.stroke();
                }
            }
        }



    }


    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.maze[0].length; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.tileSize, 0);
            ctx.lineTo(x * this.tileSize, this.maze.length * this.tileSize);
            ctx.stroke();
        }

        for (let y = 0; y <= this.maze.length; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.tileSize);
            ctx.lineTo(this.maze[0].length * this.tileSize, y * this.tileSize);
            ctx.stroke();
        }
    }
}

// 初始化游戏对象
const levelRenderer = new LevelRenderer(level, TILE_SIZE);
const player = new PacmanPlayer({
    x: 9,
    y: 15,
    tileSize: TILE_SIZE,
    speed: 1
});

// 键盘控制
const keyMap = {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'w': 'UP',
    'W': 'UP',
    's': 'DOWN',
    'S': 'DOWN',
    'a': 'LEFT',
    'A': 'LEFT',
    'd': 'RIGHT',
    'D': 'RIGHT'
};

window.addEventListener('keydown', (e) => {
    const direction = keyMap[e.key];
    if (direction) {
        player.setDirection(direction);
        e.preventDefault(); // 防止页面滚动
    }

    if (e.key === 'g' || e.key === 'G') {
        showGrid = !showGrid;
    }
});

// 更新调试信息显示
function updateDebugDisplay() {
    const debug = player.getDebugInfo();
    debugInfo.innerHTML = `
        <strong>调试信息:</strong><br>
        瓦片位置: ${debug.tilePos}<br>
        像素位置: ${debug.pixelPos}<br>
        当前方向: ${debug.direction}<br>
        期望方向: ${debug.nextDirection}<br>
        在瓦片中心: ${debug.atCenter}<br>
        分数: ${debug.score}<br>
        <strong>最近日志:</strong><br>
        ${debug.recentLogs.map(log => {
        const parts = log.split(': ');
        return parts.length > 1 ? parts[1] : log;
    }).join('<br>')}
    `;
}

// 游戏缩放因子（比如 0.7 表示 70% 大小）
const SCALE = 0.85;

// 在主循环里绘制之前缩放
function gameLoop() {
    ctx.save();               // 保存状态
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置 transform
    ctx.scale(SCALE, SCALE);  // 缩放绘制

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width / SCALE, canvas.height / SCALE);

    player.update(level);
    levelRenderer.draw(ctx);
    player.draw(ctx);

    ctx.restore();            // 恢复状态
    updateDebugDisplay();

    requestAnimationFrame(gameLoop);
}


// 调整画布大小并开始游戏
canvas.width = level[0].length * TILE_SIZE * SCALE;
canvas.height = level.length * TILE_SIZE *SCALE;

console.log('游戏开始，玩家初始位置:', player.tileX, player.tileY);
console.log('按键映射:', keyMap);

gameLoop();