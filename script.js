const sourceInput = document.getElementById("skin-input");
const dropzone = document.getElementById("skin-dropzone");
const usernameInput = document.getElementById("username-input");
const usernameLoadButton = document.getElementById("username-load");
const sourceStatus = document.getElementById("source-status");
const modelSelect = document.getElementById("model-select");
const modelHelp = document.getElementById("model-help");
const detectedModel = document.getElementById("detected-model");
const filenameInput = document.getElementById("filename-input");
const filenameHelp = document.getElementById("filename-help");
const downloadButton = document.getElementById("download-button");
const downloadNote = document.getElementById("download-note");
const sourceTitle = document.getElementById("source-title");
const sourceMeta = document.getElementById("source-meta");
const outputTitle = document.getElementById("output-title");
const outputMeta = document.getElementById("output-meta");
const sourcePreview = document.getElementById("source-preview");
const outputPreview = document.getElementById("output-preview");

const sourcePreviewContext = sourcePreview.getContext("2d");
const outputPreviewContext = outputPreview.getContext("2d");

const OUTPUT_SIZE = { width: 128, height: 80 };
const HEAD_NET = { x: 0, y: 0, width: 32, height: 16 };
const HEAD_OVERLAY_NET = { x: 32, y: 0, width: 32, height: 16 };
const BODY_NET = { x: 16, y: 16, width: 24, height: 16 };
const BODY_OVERLAY_NET = { x: 16, y: 32, width: 24, height: 16 };
const RIGHT_LEG_NET = { x: 0, y: 16, width: 16, height: 16 };
const RIGHT_LEG_OVERLAY_NET = { x: 0, y: 32, width: 16, height: 16 };
const LEFT_LEG_NET = { x: 16, y: 48, width: 16, height: 16 };
const LEFT_LEG_OVERLAY_NET = { x: 0, y: 48, width: 16, height: 16 };
const RIGHT_ARM_CLASSIC_NET = { x: 40, y: 16, width: 16, height: 16 };
const RIGHT_ARM_CLASSIC_OVERLAY_NET = { x: 40, y: 32, width: 16, height: 16 };
const LEFT_ARM_CLASSIC_NET = { x: 32, y: 48, width: 16, height: 16 };
const LEFT_ARM_CLASSIC_OVERLAY_NET = { x: 48, y: 48, width: 16, height: 16 };
const RIGHT_ARM_SLIM_NET = { x: 40, y: 16, width: 14, height: 16 };
const RIGHT_ARM_SLIM_OVERLAY_NET = { x: 40, y: 32, width: 14, height: 16 };
const LEFT_ARM_SLIM_NET = { x: 32, y: 48, width: 14, height: 16 };
const LEFT_ARM_SLIM_OVERLAY_NET = { x: 48, y: 48, width: 14, height: 16 };

const OUTPUT_NETS = {
  head: { x: 59, y: 1, width: 32, height: 16 },
  headOverlay: { x: 92, y: 1, width: 32, height: 16 },
  body: { x: 81, y: 24, width: 24, height: 16 },
  bodyOverlay: { x: 80, y: 41, width: 24, height: 16 },
  rightLeg: { x: 65, y: 24, width: 16, height: 16 },
  rightLegOverlay: { x: 64, y: 41, width: 16, height: 16 },
  leftLeg: { x: 75, y: 64, width: 16, height: 16 },
  leftLegOverlay: { x: 59, y: 64, width: 16, height: 16 },
  rightArmClassic: { x: 105, y: 24, width: 16, height: 16 },
  rightArmClassicOverlay: { x: 104, y: 41, width: 16, height: 16 },
  leftArmClassic: { x: 91, y: 64, width: 16, height: 16 },
  leftArmClassicOverlay: { x: 107, y: 64, width: 16, height: 16 },
  rightArmSlim: { x: 40, y: 47, width: 14, height: 16 },
  rightArmSlimOverlay: { x: 24, y: 47, width: 14, height: 16 },
  leftArmSlim: { x: 24, y: 64, width: 14, height: 16 },
  leftArmSlimOverlay: { x: 40, y: 64, width: 14, height: 16 },
};

const STAND_RECTS = [
  { x: 0, y: 2, width: 2, height: 7, direction: "vertical", seed: 1 },
  { x: 2, y: 2, width: 2, height: 7, direction: "vertical", seed: 2 },
  { x: 4, y: 2, width: 2, height: 7, direction: "vertical", seed: 3 },
  { x: 6, y: 2, width: 2, height: 7, direction: "vertical", seed: 4 },
  { x: 2, y: 0, width: 2, height: 2, direction: "flat", seed: 5 },
  { x: 4, y: 0, width: 2, height: 2, direction: "flat", seed: 6 },
  { x: 8, y: 2, width: 2, height: 11, direction: "vertical", seed: 7 },
  { x: 10, y: 2, width: 2, height: 11, direction: "vertical", seed: 8 },
  { x: 12, y: 2, width: 2, height: 11, direction: "vertical", seed: 9 },
  { x: 14, y: 2, width: 2, height: 11, direction: "vertical", seed: 10 },
  { x: 10, y: 0, width: 2, height: 2, direction: "flat", seed: 11 },
  { x: 12, y: 0, width: 2, height: 2, direction: "flat", seed: 12 },
  { x: 16, y: 2, width: 2, height: 7, direction: "vertical", seed: 13 },
  { x: 18, y: 2, width: 2, height: 7, direction: "vertical", seed: 14 },
  { x: 20, y: 2, width: 2, height: 7, direction: "vertical", seed: 15 },
  { x: 22, y: 2, width: 2, height: 7, direction: "vertical", seed: 16 },
  { x: 18, y: 0, width: 2, height: 2, direction: "flat", seed: 17 },
  { x: 20, y: 0, width: 2, height: 2, direction: "flat", seed: 18 },
  { x: 24, y: 2, width: 2, height: 12, direction: "vertical", seed: 19 },
  { x: 26, y: 2, width: 2, height: 12, direction: "vertical", seed: 20 },
  { x: 28, y: 2, width: 2, height: 12, direction: "vertical", seed: 21 },
  { x: 30, y: 2, width: 2, height: 12, direction: "vertical", seed: 22 },
  { x: 26, y: 0, width: 2, height: 2, direction: "flat", seed: 23 },
  { x: 28, y: 0, width: 2, height: 2, direction: "flat", seed: 24 },
  { x: 32, y: 18, width: 2, height: 12, direction: "vertical", seed: 25 },
  { x: 34, y: 18, width: 2, height: 12, direction: "vertical", seed: 26 },
  { x: 36, y: 18, width: 2, height: 12, direction: "vertical", seed: 27 },
  { x: 38, y: 18, width: 2, height: 12, direction: "vertical", seed: 28 },
  { x: 34, y: 16, width: 2, height: 2, direction: "flat", seed: 29 },
  { x: 36, y: 16, width: 2, height: 2, direction: "flat", seed: 30 },
  { x: 40, y: 18, width: 2, height: 11, direction: "vertical", seed: 31 },
  { x: 42, y: 18, width: 2, height: 11, direction: "vertical", seed: 32 },
  { x: 44, y: 18, width: 2, height: 11, direction: "vertical", seed: 33 },
  { x: 46, y: 18, width: 2, height: 11, direction: "vertical", seed: 34 },
  { x: 42, y: 16, width: 2, height: 2, direction: "flat", seed: 35 },
  { x: 44, y: 16, width: 2, height: 2, direction: "flat", seed: 36 },
  { x: 48, y: 18, width: 2, height: 7, direction: "vertical", seed: 37 },
  { x: 50, y: 18, width: 2, height: 7, direction: "vertical", seed: 38 },
  { x: 52, y: 18, width: 2, height: 7, direction: "vertical", seed: 39 },
  { x: 54, y: 18, width: 2, height: 7, direction: "vertical", seed: 40 },
  { x: 50, y: 16, width: 2, height: 2, direction: "flat", seed: 41 },
  { x: 52, y: 16, width: 2, height: 2, direction: "flat", seed: 42 },
  { x: 3, y: 26, width: 12, height: 3, direction: "horizontal", seed: 43 },
  { x: 15, y: 26, width: 12, height: 3, direction: "horizontal", seed: 44 },
  { x: 0, y: 29, width: 3, height: 3, direction: "horizontal", seed: 45 },
  { x: 3, y: 29, width: 12, height: 3, direction: "horizontal", seed: 46 },
  { x: 15, y: 29, width: 3, height: 3, direction: "horizontal", seed: 47 },
  { x: 18, y: 29, width: 12, height: 3, direction: "horizontal", seed: 48 },
  { x: 12, y: 32, width: 12, height: 12, direction: "flat", seed: 49 },
  { x: 24, y: 32, width: 12, height: 12, direction: "flat", seed: 50 },
  { x: 0, y: 44, width: 12, height: 1, direction: "horizontal", seed: 51 },
  { x: 12, y: 44, width: 12, height: 1, direction: "horizontal", seed: 52 },
  { x: 24, y: 44, width: 12, height: 1, direction: "horizontal", seed: 53 },
  { x: 36, y: 44, width: 12, height: 1, direction: "horizontal", seed: 54 },
  { x: 2, y: 48, width: 8, height: 2, direction: "horizontal", seed: 55 },
  { x: 10, y: 48, width: 8, height: 2, direction: "horizontal", seed: 56 },
  { x: 0, y: 50, width: 2, height: 2, direction: "horizontal", seed: 57 },
  { x: 2, y: 50, width: 8, height: 2, direction: "horizontal", seed: 58 },
  { x: 10, y: 50, width: 2, height: 2, direction: "horizontal", seed: 59 },
  { x: 12, y: 50, width: 8, height: 2, direction: "horizontal", seed: 60 },
];

const WOOD_PALETTE = ["#5f3b22", "#7b4e2b", "#956135", "#b77e47", "#d2a15b"];

const state = {
  sourceCanvas: null,
  sourceLabel: "",
  detectedModel: "classic",
  loading: false,
};

sourcePreviewContext.imageSmoothingEnabled = false;
outputPreviewContext.imageSmoothingEnabled = false;

initialize();

function initialize() {
  clearCanvas(sourcePreviewContext, sourcePreview.width, sourcePreview.height);
  renderBlankOutput();
  updateFilenameHelp();

  sourceInput.addEventListener("change", handleFileInputChange);
  usernameLoadButton.addEventListener("click", handleUsernameLoad);
  usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleUsernameLoad();
    }
  });
  modelSelect.addEventListener("change", renderOutput);
  filenameInput.addEventListener("input", () => {
    updateFilenameHelp();
    renderOutput();
  });
  filenameInput.addEventListener("blur", () => {
    filenameInput.value = sanitizeFileName(filenameInput.value);
    updateFilenameHelp();
    renderOutput();
  });
  downloadButton.addEventListener("click", downloadOutput);

  bindDropzone();
}

function bindDropzone() {
  const activate = () => dropzone.classList.add("is-dragover");
  const deactivate = () => dropzone.classList.remove("is-dragover");

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      activate();
    });
  });

  ["dragleave", "dragend"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => deactivate());
  });

  dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    deactivate();
    const [file] = Array.from(event.dataTransfer?.files || []);
    if (file) {
      await loadSkinFromFile(file);
    }
  });
}

function setStatus(message, tone = "neutral") {
  sourceStatus.textContent = message;
  sourceStatus.dataset.tone = tone;
}

function clearCanvas(context, width, height) {
  context.clearRect(0, 0, width, height);
}

function renderBlankOutput() {
  clearCanvas(outputPreviewContext, outputPreview.width, outputPreview.height);
  paintStandTexture(outputPreviewContext);
}

function handleFileInputChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) {
    return;
  }

  loadSkinFromFile(file).finally(() => {
    sourceInput.value = "";
  });
}

async function handleUsernameLoad() {
  const username = usernameInput.value.trim();
  if (!username) {
    setStatus("Enter a Minecraft name before loading a skin.", "error");
    return;
  }

  await loadSkinFromUsername(username);
}

async function loadSkinFromFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("Use a PNG skin file for drag-and-drop or file upload.", "error");
    return;
  }

  state.loading = true;
  usernameLoadButton.disabled = true;
  downloadButton.disabled = true;
  setStatus(`Loading ${file.name}...`);

  try {
    const image = await loadImageFromObject(file);
    await applyLoadedImage(image, file.name, "Loaded local skin.");
  } catch (error) {
    setStatus(error.message || "The skin could not be loaded.", "error");
  } finally {
    state.loading = false;
    usernameLoadButton.disabled = false;
  }
}

async function loadSkinFromUsername(username) {
  state.loading = true;
  usernameLoadButton.disabled = true;
  downloadButton.disabled = true;
  setStatus(`Looking up ${username}'s skin...`);

  try {
    const response = await fetch(`https://mc-heads.net/download/${encodeURIComponent(username)}`, {
      mode: "cors",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Skin lookup failed with status ${response.status}.`);
    }

    const blob = await response.blob();
    const image = await loadImageFromObject(blob);
    await applyLoadedImage(image, `${username}.png`, `Loaded ${username}'s skin from username.`);
  } catch (error) {
    setStatus(error.message || "The username lookup failed.", "error");
  } finally {
    state.loading = false;
    usernameLoadButton.disabled = false;
  }
}

async function applyLoadedImage(image, label, successMessage) {
  const normalizedCanvas = normalizeSkinImage(image);
  state.sourceCanvas = normalizedCanvas;
  state.sourceLabel = label;
  state.detectedModel = detectSkinModel(normalizedCanvas);

  drawCanvas(sourcePreviewContext, normalizedCanvas, sourcePreview.width, sourcePreview.height);
  sourceTitle.textContent = label;
  sourceMeta.textContent = "Normalized to Minecraft's 64 x 64 skin layout.";
  detectedModel.textContent = formatModelLabel(state.detectedModel);
  setStatus(successMessage, "success");
  renderOutput();
}

function loadImageFromObject(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const objectUrl = source instanceof Blob ? URL.createObjectURL(source) : source;

    image.onload = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve(image);
    };

    image.onerror = () => {
      if (source instanceof Blob) {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error("The skin image could not be decoded."));
    };

    image.src = objectUrl;
  });
}

function normalizeSkinImage(image) {
  const aspect = image.naturalWidth / image.naturalHeight;

  if (Math.abs(aspect - 1) < 0.01) {
    const canvas = createCanvas(64, 64);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 64, 64);
    return canvas;
  }

  if (Math.abs(aspect - 2) < 0.01) {
    const legacyCanvas = createCanvas(64, 32);
    const legacyContext = legacyCanvas.getContext("2d");
    legacyContext.imageSmoothingEnabled = false;
    legacyContext.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 64, 32);

    const canvas = createCanvas(64, 64);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.drawImage(legacyCanvas, 0, 0);
    drawNet(context, legacyCanvas, RIGHT_LEG_NET, LEFT_LEG_NET);
    drawNet(context, legacyCanvas, RIGHT_ARM_CLASSIC_NET, LEFT_ARM_CLASSIC_NET);
    return canvas;
  }

  throw new Error("Use a square modern skin or a legacy 64 x 32 skin.");
}

function detectSkinModel(canvas) {
  const context = canvas.getContext("2d");
  const { data } = context.getImageData(0, 0, 64, 64);
  const slimColumns = [
    { x: 54, y: 20, width: 2, height: 12 },
    { x: 54, y: 36, width: 2, height: 12 },
    { x: 46, y: 52, width: 2, height: 12 },
    { x: 62, y: 52, width: 2, height: 12 },
  ];

  for (const rect of slimColumns) {
    for (let y = rect.y; y < rect.y + rect.height; y += 1) {
      for (let x = rect.x; x < rect.x + rect.width; x += 1) {
        const alpha = data[(y * 64 + x) * 4 + 3];
        if (alpha !== 0) {
          return "classic";
        }
      }
    }
  }

  return "slim";
}

function getActiveModel() {
  if (modelSelect.value === "auto") {
    return state.detectedModel || "classic";
  }

  return modelSelect.value;
}

function renderOutput() {
  renderBlankOutput();

  if (!state.sourceCanvas) {
    outputTitle.textContent = "Waiting for conversion";
    outputMeta.textContent = "128 x 80 texture";
    downloadButton.disabled = true;
    downloadNote.textContent = "The download button unlocks after a skin is loaded.";
    return;
  }

  const activeModel = getActiveModel();
  const fileName = sanitizeFileName(filenameInput.value);

  drawNet(outputPreviewContext, state.sourceCanvas, HEAD_NET, OUTPUT_NETS.head);
  drawNet(outputPreviewContext, state.sourceCanvas, HEAD_OVERLAY_NET, OUTPUT_NETS.headOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, BODY_NET, OUTPUT_NETS.body);
  drawNet(outputPreviewContext, state.sourceCanvas, BODY_OVERLAY_NET, OUTPUT_NETS.bodyOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_LEG_NET, OUTPUT_NETS.rightLeg);
  drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_LEG_OVERLAY_NET, OUTPUT_NETS.rightLegOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, LEFT_LEG_NET, OUTPUT_NETS.leftLeg);
  drawNet(outputPreviewContext, state.sourceCanvas, LEFT_LEG_OVERLAY_NET, OUTPUT_NETS.leftLegOverlay);

  if (activeModel === "slim") {
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_SLIM_NET, OUTPUT_NETS.rightArmSlim);
    drawNet(
      outputPreviewContext,
      state.sourceCanvas,
      RIGHT_ARM_SLIM_OVERLAY_NET,
      OUTPUT_NETS.rightArmSlimOverlay,
    );
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_SLIM_NET, OUTPUT_NETS.leftArmSlim);
    drawNet(
      outputPreviewContext,
      state.sourceCanvas,
      LEFT_ARM_SLIM_OVERLAY_NET,
      OUTPUT_NETS.leftArmSlimOverlay,
    );
  } else {
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_CLASSIC_NET, OUTPUT_NETS.rightArmClassic);
    drawNet(
      outputPreviewContext,
      state.sourceCanvas,
      RIGHT_ARM_CLASSIC_OVERLAY_NET,
      OUTPUT_NETS.rightArmClassicOverlay,
    );
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_CLASSIC_NET, OUTPUT_NETS.leftArmClassic);
    drawNet(
      outputPreviewContext,
      state.sourceCanvas,
      LEFT_ARM_CLASSIC_OVERLAY_NET,
      OUTPUT_NETS.leftArmClassicOverlay,
    );
  }

  outputTitle.textContent = fileName;
  outputMeta.textContent = `${OUTPUT_SIZE.width} x ${OUTPUT_SIZE.height} PNG • ${formatModelLabel(
    activeModel,
  )}`;
  downloadNote.textContent = `Ready to export as ${fileName}.`;
  downloadButton.disabled = false;

  if (modelSelect.value === "auto") {
    modelHelp.textContent = `Auto mode selected ${formatModelLabel(activeModel)} from the source skin.`;
  } else {
    modelHelp.textContent = `Manual override is active. The sheet will export with ${formatModelLabel(
      activeModel,
    )}.`;
  }
}

function drawNet(context, sourceCanvas, sourceRect, destinationRect) {
  context.imageSmoothingEnabled = false;
  context.drawImage(
    sourceCanvas,
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height,
    destinationRect.x,
    destinationRect.y,
    destinationRect.width,
    destinationRect.height,
  );
}

function drawCanvas(context, sourceCanvas, width, height) {
  clearCanvas(context, width, height);
  context.imageSmoothingEnabled = false;
  context.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);
}

function paintStandTexture(context) {
  clearCanvas(context, OUTPUT_SIZE.width, OUTPUT_SIZE.height);
  for (const rect of STAND_RECTS) {
    paintWoodRect(context, rect);
  }
}

function paintWoodRect(context, rect) {
  for (let offsetY = 0; offsetY < rect.height; offsetY += 1) {
    for (let offsetX = 0; offsetX < rect.width; offsetX += 1) {
      const x = rect.x + offsetX;
      const y = rect.y + offsetY;
      const isEdge =
        offsetX === 0 ||
        offsetY === 0 ||
        offsetX === rect.width - 1 ||
        offsetY === rect.height - 1;
      const paletteIndex = getWoodTone(offsetX, offsetY, rect.seed, rect.direction, isEdge);
      context.fillStyle = WOOD_PALETTE[paletteIndex];
      context.fillRect(x, y, 1, 1);
    }
  }
}

function getWoodTone(x, y, seed, direction, isEdge) {
  if (isEdge) {
    return 0;
  }

  if (direction === "vertical") {
    return 1 + ((y + seed) % 4);
  }

  if (direction === "horizontal") {
    return 1 + ((x + seed) % 4);
  }

  return 1 + ((x * 3 + y * 5 + seed) % 4);
}

function sanitizeFileName(value) {
  const cleaned = (value || "wood001.png")
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "");

  const baseName = cleaned.replace(/\.png$/i, "");
  return `${baseName || "wood001"}.png`;
}

function updateFilenameHelp() {
  const fileName = sanitizeFileName(filenameInput.value);
  const baseName = fileName.replace(/\.png$/i, "");
  filenameHelp.textContent = buildFilenameHint(baseName);
}

function buildFilenameHint(baseName) {
  if (/^wood$/i.test(baseName)) {
    return "wood.png replaces the base armor stand texture, so no numbered wood.properties line is needed.";
  }

  const numberedMatch = baseName.match(/^wood(.+)$/i);
  if (numberedMatch) {
    return `Typical wood.properties line: skins.${numberedMatch[1]} = ${numberedMatch[1]}`;
  }

  return "Custom names work, but the usual armor-stand pack convention is woodNNN.png.";
}

function formatModelLabel(model) {
  if (model === "slim") {
    return "Slim / Alex";
  }

  return "Standard / Steve";
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function downloadOutput() {
  if (!state.sourceCanvas) {
    return;
  }

  const fileName = sanitizeFileName(filenameInput.value);
  outputPreview.toBlob((blob) => {
    if (!blob) {
      setStatus("The PNG export could not be created.", "error");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
