// ===== NASA APOD JSON 数据源（课程提供的 JSON 文件） =====
const DATA_URL = "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

document.addEventListener("DOMContentLoaded", () => {
  // 获取 HTML 元素
  const gallery = document.getElementById("gallery");       // 图片展示区
  const getImageBtn = document.getElementById("getImageBtn"); // “Get Space Images” 按钮
  const startInput = document.getElementById("startDate");    // 起始日期输入框
  const endInput = document.getElementById("endDate");        // 结束日期输入框
  // ---------- 随机太空知识区 ----------
// 定义一组有趣的太空知识
    const spaceFacts = [
    "Did you know? 🌌  One day on Venus is longer than one year on Venus!",
    "Did you know? 🚀  There are more trees on Earth than stars in the Milky Way galaxy.",
    "Did you know? 🌕  The footprints on the Moon will likely last millions of years.",
    "Did you know? 🌠  Jupiter’s Great Red Spot is a giant storm that’s been raging for over 350 years.",
    "Did you know? 🪐  Saturn could float in water because it’s mostly made of gas!",
    "Did you know? ☄️  A day on Mercury lasts 1,408 hours — that’s almost 59 Earth days!",
    "Did you know? 🌍  The Sun accounts for 99.8% of the total mass of our solar system.",
    "Did you know? 🌑  There are more stars in the universe than grains of sand on Earth.",
    "Did you know? 🛰️  Space is completely silent because there’s no air to carry sound waves.",
    "Did you know? 🪄  The Milky Way galaxy will collide with Andromeda in about 4.5 billion years!"
    ];

    // 选择随机索引
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);

    // 在页面上显示
    const factBox = document.getElementById("spaceFact");
    if (factBox) {
    factBox.innerHTML = `<strong>${spaceFacts[randomIndex]}</strong>`;
    }


  // ---------- 工具函数部分 ----------
  const dayMs = 24 * 60 * 60 * 1000; // 一天的毫秒数

  // 将日期对象转为 ISO 字符串（YYYY-MM-DD）
  const toISO = (d) => new Date(d).toISOString().slice(0, 10);

  // 解析 ISO 日期字符串为 Date 对象（补上时区，防止偏移）
  const parseISO = (s) => new Date(s + "T00:00:00");

  // 把 ISO 日期格式化成“Month Day, Year”样式（如 April 16, 2025）
  function formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ---------- UI 辅助函数 ----------
  // 显示“加载中”提示
  function showLoading(msg = "Loading space photos…") {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔄</div>
        <p>${msg}</p>
      </div>
    `;
  }

  // 显示错误信息
  function showError(msg) {
    gallery.innerHTML = `
      <div class="placeholder" style="color:#b00020">
        <div class="placeholder-icon">⚠️</div>
        <p>${msg}</p>
      </div>
    `;
  }

  // 创建 DOM 元素的简化函数
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- 渲染图片卡片 ----------
  function renderGallery(items) {
    gallery.innerHTML = ""; // 先清空画廊
    if (!items.length) {
      showError("No APOD entries found for that date range."); // 如果没数据
      return;
    }

    // 遍历每个数据项，创建卡片
    items.forEach((item) => {
      const card = el("div", "gallery-item");

      // 判断是图片还是视频
      const isVideo = item.media_type === "video";
      const img = el("img");
      img.src = isVideo
        ? item.thumbnail_url ||
          "https://via.placeholder.com/800x450?text=Video+Unavailable"
        : item.url;
      img.alt = item.title || (isVideo ? "NASA video" : "NASA image");
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("click", () => openModal(item)); // 点击图片打开弹窗
      card.appendChild(img);

      // 添加标题与日期
      const title = el(
        "h3",
        null,
        item.title || (isVideo ? "NASA Video" : "NASA Image")
      );
      const date = el("p", null, formatDate(item.date)); // 格式化日期
      card.append(title, date);

      gallery.appendChild(card);
    });
  }

  // ---------- 弹窗（Modal）逻辑 ----------
  function openModal(item) {
    const modal = el("div", "modal");               // 整个遮罩层
    const content = el("div", "modal-content");     // 弹窗内容框
    const closeBtn = el("span", "close-btn", "×");  // 关闭按钮

    // 创建标题、日期、说明文字
    const h2 = el("h2", null, item.title || "");
    const date = el("p", null, formatDate(item.date));
    const desc = el("p", null, item.explanation || "");

    // 判断是图片还是视频并生成对应元素
    let media;
    if (item.media_type === "video") {
      media = document.createElement("iframe");
      media.src = item.url;
      media.width = "100%";
      media.height = "420";
      media.title = item.title || "NASA video";
      media.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      media.allowFullscreen = true;
    } else {
      media = document.createElement("img");
      media.src = item.hdurl || item.url;
      media.alt = item.title || "NASA image";
      media.style.maxHeight = "70vh";
      media.style.objectFit = "contain";
    }

    // 关闭弹窗的事件绑定（点击 X、点击遮罩、按 Esc）
    closeBtn.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    const onEsc = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);

    // 组装弹窗内容
    content.append(closeBtn, h2, date, media, desc);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  // ---------- 数据获取与筛选逻辑 ----------
  async function fetchData() {
    try {
      showLoading(); // 显示加载提示

      // 获取输入框值（允许为空）
      const startVal = startInput?.value;
      const endVal = endInput?.value;

      // 转换为 ISO 格式
      let startStr = startVal ? toISO(parseISO(startVal)) : "";
      let endStr = endVal ? toISO(parseISO(endVal)) : "";

      // 如果两者都为空 → 默认显示最近 9 天
      if (!startStr && !endStr) {
        const today = new Date();
        endStr = toISO(today);
        startStr = toISO(new Date(today.getTime() - 8 * dayMs));
      }

      // 从远程拉取数据
      const resp = await fetch(DATA_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const all = await resp.json();

      // 数据按日期升序排序
      const sorted = [...all].sort((a, b) => (a.date < b.date ? -1 : 1));

      // 筛选在日期范围内的数据，并取最多 9 条
      const inRange = sorted.filter((x) => {
        const d = x.date;
        return (!startStr || d >= startStr) && (!endStr || d <= endStr);
      });
      const last9 = inRange.slice(-9); // 取最后 9 条（最新的）

      if (!last9.length) {
        showError("No APOD entries found for that date range."); // 没数据则提示
        return;
      }

      renderGallery(last9); // 渲染画廊
    } catch (error) {
      showError(`Failed to load APOD data. ${error.message || error}`);
    }
  }

  // ---------- 按钮绑定 ----------
  getImageBtn?.addEventListener("click", fetchData);

  // ---------- 默认日期（初始化时） ----------
  (function preset() {
    if (!startInput || !endInput) return;
    const today = new Date();
    const start = new Date(today.getTime() - 8 * dayMs);

    // 1️⃣ 设置真实值（内部用于计算）
    startInput.value = toISO(start);
    endInput.value = toISO(today);

    // 2️⃣ 设置占位符为美式格式（MM/DD/YYYY）
    startInput.placeholder = start.toLocaleDateString("en-US");
    endInput.placeholder = today.toLocaleDateString("en-US");
  })();
});
