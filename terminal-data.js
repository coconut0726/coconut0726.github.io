// === terminal-data.js ===
// Store and manage file unlock data

// 初始化默认数据
const defaultData = {
    Games: {
      Pacman: true,       // Locked
      ECH8: false,           // Unlocked
      AikeMilkTea: false   // Unlocked
    },
    Others: {}
  };
  
  // 获取当前状态（从 localStorage 读取或初始化）
  function getFileData() {
    const data = localStorage.getItem("terminalData");
    if (data) {
      return JSON.parse(data);
    } else {
      localStorage.setItem("terminalData", JSON.stringify(defaultData));
      return defaultData;
    }
  }
  
  // 更新某个文件的解锁状态
  function unlockFile(folder, filename) {
    const data = getFileData();
    if (data[folder] && data[folder][filename] === false) {
      data[folder][filename] = true;
      localStorage.setItem("terminalData", JSON.stringify(data));
    }
  }
  
  // 获取指定文件夹内容
  function listFolder(folder) {
    const data = getFileData();
    const folderData = data[folder];
    if (!folderData) return `Folder '${folder}' not found.`;
  
    const entries = Object.entries(folderData);
    if (entries.length === 0) return `${folder}/ is empty.`;
  
    return entries.map(([name, unlocked]) =>
      unlocked ? `${name}` : `${name} (Locked)`
    ).join("   ");
  }
  