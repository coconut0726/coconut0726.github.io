const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// 加载 sprite sheet
const img = new Image();
img.src = "CatPackFree/Box3.png"; // 确保路径正确

// 动画参数
let frame = 0;
const totalFrames = 4;
const frameWidth = 32;
const frameHeight = 32;
const fps = 5;
const frameDuration = 1000 / fps;
let lastTime = 0;

// 显示文本
let topText = "";
let textTimeout = null;

// 候选内容
const messages = ["Try different commands.", "Play Pacman.", "Hi, this is Coconut.", "There's a cheat mode."];

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;

  if (delta >= frameDuration) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 小猫缩放比例
    const scale = 3; // 放大 2 倍
    const drawW = frameWidth * scale;
    const drawH = frameHeight * scale;

    // 居中位置
    const centerX = (canvas.width - drawW) / 2;
    const centerY = (canvas.height - drawH) / 2;

    ctx.save();
    ctx.scale(-1, 1); // 水平翻转
    ctx.drawImage(
      img,
      frame * frameWidth, 0, frameWidth, frameHeight, // 源图
      -(centerX + drawW), centerY, drawW, drawH      // 目标绘制
    );
    ctx.restore();

    // 在头顶绘制文字
    if (topText) {
      ctx.save();
      ctx.font = "14px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(topText, canvas.width / 2, centerY - 10);
      ctx.restore();
    }

    frame = (frame + 1) % totalFrames;
    lastTime = timestamp;
  }

  requestAnimationFrame(animate);
}

// 点击 canvas 时显示随机文字
canvas.addEventListener("click", () => {
  topText = messages[Math.floor(Math.random() * messages.length)];
  if (textTimeout) clearTimeout(textTimeout);
  textTimeout = setTimeout(() => {
    topText = "";
  }, 2000);
});

img.onload = () => {
  requestAnimationFrame(animate);
};
