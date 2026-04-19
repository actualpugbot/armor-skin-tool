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

const OUTPUT_SIZE = { width: 64, height: 155 };
const SOURCE_LAYOUT_SIZE = { width: 64, height: 64 };
const STANDARD_OUTPUT_Y_OFFSET = 27;
const SLIM_OUTPUT_Y_OFFSET = OUTPUT_SIZE.height - SOURCE_LAYOUT_SIZE.height;

// Source UV nets — where each part lives in the 64x64 skin
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

// Output UV nets — same positions as the source skin layout (armor stand model
// uses identical UV coordinates to the player skin, in a 64x155 texture space)
const OUTPUT_NET_TEMPLATE = {
  head:                   { x: 0,  y: 0,  width: 32, height: 16 },
  headOverlay:            { x: 32, y: 0,  width: 32, height: 16 },
  body:                   { x: 16, y: 16, width: 24, height: 16 },
  bodyOverlay:            { x: 16, y: 32, width: 24, height: 16 },
  rightLeg:               { x: 0,  y: 16, width: 16, height: 16 },
  rightLegOverlay:        { x: 0,  y: 32, width: 16, height: 16 },
  leftLeg:                { x: 16, y: 48, width: 16, height: 16 },
  leftLegOverlay:         { x: 0,  y: 48, width: 16, height: 16 },
  rightArmClassic:        { x: 40, y: 16, width: 16, height: 16 },
  rightArmClassicOverlay: { x: 40, y: 32, width: 16, height: 16 },
  leftArmClassic:         { x: 32, y: 48, width: 16, height: 16 },
  leftArmClassicOverlay:  { x: 48, y: 48, width: 16, height: 16 },
  rightArmSlim:           { x: 40, y: 16, width: 14, height: 16 },
  rightArmSlimOverlay:    { x: 40, y: 32, width: 14, height: 16 },
  leftArmSlim:            { x: 32, y: 48, width: 14, height: 16 },
  leftArmSlimOverlay:     { x: 48, y: 48, width: 14, height: 16 },
};

const OUTPUT_NETS = {
  slim: offsetNetMap(OUTPUT_NET_TEMPLATE, SLIM_OUTPUT_Y_OFFSET),
  classic: offsetNetMap(OUTPUT_NET_TEMPLATE, STANDARD_OUTPUT_Y_OFFSET),
};

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
  clearCanvas(outputPreviewContext, outputPreview.width, outputPreview.height);
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
    await applyLoadedImage(image, `${username}.png`, `Loaded ${username}'s skin.`);
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
  sourceMeta.textContent = "Normalized to 64 x 64.";
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

function offsetNetMap(netMap, yOffset) {
  return Object.fromEntries(
    Object.entries(netMap).map(([name, rect]) => [
      name,
      { ...rect, y: rect.y + yOffset },
    ]),
  );
}

function renderOutput() {
  clearCanvas(outputPreviewContext, outputPreview.width, outputPreview.height);

  if (!state.sourceCanvas) {
    outputTitle.textContent = "Waiting for skin";
    outputMeta.textContent = "64 x 155 texture";
    downloadButton.disabled = true;
    downloadNote.textContent = "Load a skin to unlock download.";
    return;
  }

  const activeModel = getActiveModel();
  const fileName = sanitizeFileName(filenameInput.value);
  const outputNets = activeModel === "classic" ? OUTPUT_NETS.classic : OUTPUT_NETS.slim;

  drawNet(outputPreviewContext, state.sourceCanvas, HEAD_NET, outputNets.head);
  drawNet(outputPreviewContext, state.sourceCanvas, HEAD_OVERLAY_NET, outputNets.headOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, BODY_NET, outputNets.body);
  drawNet(outputPreviewContext, state.sourceCanvas, BODY_OVERLAY_NET, outputNets.bodyOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_LEG_NET, outputNets.rightLeg);
  drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_LEG_OVERLAY_NET, outputNets.rightLegOverlay);
  drawNet(outputPreviewContext, state.sourceCanvas, LEFT_LEG_NET, outputNets.leftLeg);
  drawNet(outputPreviewContext, state.sourceCanvas, LEFT_LEG_OVERLAY_NET, outputNets.leftLegOverlay);

  if (activeModel === "slim") {
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_SLIM_NET, outputNets.rightArmSlim);
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_SLIM_OVERLAY_NET, outputNets.rightArmSlimOverlay);
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_SLIM_NET, outputNets.leftArmSlim);
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_SLIM_OVERLAY_NET, outputNets.leftArmSlimOverlay);
  } else {
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_CLASSIC_NET, outputNets.rightArmClassic);
    drawNet(outputPreviewContext, state.sourceCanvas, RIGHT_ARM_CLASSIC_OVERLAY_NET, outputNets.rightArmClassicOverlay);
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_CLASSIC_NET, outputNets.leftArmClassic);
    drawNet(outputPreviewContext, state.sourceCanvas, LEFT_ARM_CLASSIC_OVERLAY_NET, outputNets.leftArmClassicOverlay);
  }

  outputTitle.textContent = fileName;
  outputMeta.textContent = `64 x 155 PNG · ${formatModelLabel(activeModel)}`;
  downloadNote.textContent = `Ready to export as ${fileName}.`;
  downloadButton.disabled = false;

  if (modelSelect.value === "auto") {
    modelHelp.textContent = `Auto detected ${formatModelLabel(activeModel)}.`;
  } else {
    modelHelp.textContent = `Manual override: ${formatModelLabel(activeModel)}.`;
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
    return "Replaces the base armor stand texture.";
  }

  const numberedMatch = baseName.match(/^wood(.+)$/i);
  if (numberedMatch) {
    return `wood.properties line: skins.${numberedMatch[1]} = ${numberedMatch[1]}`;
  }

  return "Convention: woodNNN.png";
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
