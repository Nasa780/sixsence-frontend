import { GLYPHS, GLYPH_HEIGHT, GLYPH_WIDTH } from "./scoreboardGlyphs";

/**
 * Lecture de la capture de fin de match de MW4, dans le navigateur, gratuite et sans serveur :
 *  - Tesseract repère les en-têtes SCORE et POSES (position du tableau, même sur une capture recadrée) et lit les pseudos ;
 *  - les chiffres sont comparés aux modèles de scoreboardGlyphs.js (Tesseract confond le zéro barré du jeu) ;
 *  - une valeur douteuse n'est jamais devinée : la ligne reste « illisible ».
 * Le pseudo de la capture est l'identifiant Activision sans le #chiffres, avec parfois un tag de clan devant.
 */

const ROW_RATIO = 0.352; // hauteur d'une ligne / écart entre deux colonnes
const MIN_MARGIN = 0.1; // écart minimal avec le deuxième chiffre le plus proche
const MAX_ROWS = 6;

// --- Image ------------------------------------------------------------------------------------

/** Luminosité d'une image : le canal le plus clair de chaque pixel (textes bleus, rouges et jaunes compris). */
export function brightness(imageData) {
  const { data, width, height } = imageData;
  const lum = new Uint8Array(width * height);
  for (let i = 0; i < lum.length; i += 1) lum[i] = Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  return { lum, width, height };
}

function otsu(values) {
  const hist = new Array(256).fill(0);
  for (const value of values) hist[value] += 1;
  let best = 0;
  let threshold = 128;
  let sum = 0;
  let sumBack = 0;
  let weightBack = 0;
  for (let i = 0; i < 256; i += 1) sum += i * hist[i];
  for (let i = 0; i < 256; i += 1) {
    weightBack += hist[i];
    if (!weightBack) continue;
    const weightFront = values.length - weightBack;
    if (!weightFront) break;
    sumBack += i * hist[i];
    const between = (sumBack / weightBack - (sum - sumBack) / weightFront) ** 2 * weightBack * weightFront;
    if (between > best) {
      best = between;
      threshold = i;
    }
  }
  return threshold;
}

/** Vignettes normalisées des chiffres d'une case (colonnes vides = séparation entre deux chiffres). */
function cellGlyphs(image, left, top, cellWidth, cellHeight) {
  const x0Cell = Math.max(0, Math.round(left));
  const y0Cell = Math.max(0, Math.round(top));
  const W = Math.min(Math.round(cellWidth), image.width - x0Cell);
  const H = Math.min(Math.round(cellHeight), image.height - y0Cell);
  if (W < 4 || H < 4) return [];
  const px = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) px[y * W + x] = image.lum[(y + y0Cell) * image.width + x + x0Cell];
  const threshold = otsu(px);
  const on = (x, y) => px[y * W + x] > threshold;

  const runs = [];
  let start = -1;
  for (let x = 0; x <= W; x += 1) {
    let any = false;
    if (x < W) {
      for (let y = 0; y < H; y += 1) {
        if (on(x, y)) {
          any = true;
          break;
        }
      }
    }
    if (any && start < 0) start = x;
    if (!any && start >= 0) {
      runs.push([start, x - 1]);
      start = -1;
    }
  }

  const glyphs = [];
  for (const [x0, x1] of runs) {
    let y0 = H;
    let y1 = 0;
    for (let y = 0; y < H; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        if (on(x, y)) {
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
      }
    }
    const gw = x1 - x0 + 1;
    const gh = y1 - y0 + 1;
    if (gh < H * 0.4 || gh > H * 0.95 || gw > gh) continue;
    let low = 255;
    let high = 0;
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        low = Math.min(low, px[y * W + x]);
        high = Math.max(high, px[y * W + x]);
      }
    }
    const get = (x, y) => (px[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))] - low) / Math.max(1, high - low);
    const vector = new Float32Array(GLYPH_WIDTH * GLYPH_HEIGHT);
    for (let gy = 0; gy < GLYPH_HEIGHT; gy += 1) {
      for (let gx = 0; gx < GLYPH_WIDTH; gx += 1) {
        const fx = x0 + ((gx + 0.5) * gw) / GLYPH_WIDTH - 0.5;
        const fy = y0 + ((gy + 0.5) * gh) / GLYPH_HEIGHT - 0.5;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const ax = fx - ix;
        const ay = fy - iy;
        vector[gy * GLYPH_WIDTH + gx] = get(ix, iy) * (1 - ax) * (1 - ay) + get(ix + 1, iy) * ax * (1 - ay) + get(ix, iy + 1) * (1 - ax) * ay + get(ix + 1, iy + 1) * ax * ay;
      }
    }
    glyphs.push(normalize(vector));
  }
  return glyphs;
}

function normalize(vector) {
  let mean = 0;
  for (const value of vector) mean += value;
  mean /= vector.length;
  let norm = 0;
  for (let i = 0; i < vector.length; i += 1) {
    vector[i] -= mean;
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vector.length; i += 1) vector[i] /= norm;
  return vector;
}

// --- Chiffres ---------------------------------------------------------------------------------

let templates = null;
function loadTemplates() {
  if (templates) return templates;
  templates = Object.entries(GLYPHS).flatMap(([digit, list]) =>
    list.map((encoded) => {
      const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
      return { digit, vector: normalize(Float32Array.from(new Int8Array(bytes.buffer))) };
    }),
  );
  return templates;
}

/** Chiffre le plus proche, ou null si deux chiffres sont trop proches pour trancher. */
function readGlyph(glyph) {
  const best = {};
  for (const { digit, vector } of loadTemplates()) {
    let score = 0;
    for (let i = 0; i < vector.length; i += 1) score += glyph[i] * vector[i];
    if (score > (best[digit] ?? -1)) best[digit] = score;
  }
  const ranked = Object.entries(best).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] - (ranked[1]?.[1] ?? 0) >= MIN_MARGIN ? ranked[0][0] : null;
}

/** Nombre d'une case ; plusieurs cadrages sont essayés avant de renoncer. */
function readNumber(image, left, centerY, pitch, rowHeight) {
  for (const ratio of [0.62, 0.72, 0.54]) {
    const glyphs = cellGlyphs(image, left, centerY - (rowHeight * ratio) / 2, pitch * 0.75, rowHeight * ratio);
    if (glyphs.length === 0 || glyphs.length > 5) continue;
    const digits = glyphs.map(readGlyph);
    if (digits.every((digit) => digit !== null)) return Number(digits.join(""));
  }
  return null;
}

// --- Pseudos ----------------------------------------------------------------------------------

/** Pseudo comparable : sans tag de clan, sans le #chiffres d'Activision, sans casse ni symboles. */
export function cleanName(name) {
  return (name ?? "")
    .replace(/#\d+\s*$/, "")
    .replace(/^\s*[[(|].{0,8}?[\])|]\s*/, "")
    .replace(/^[a-z0-9]{1,4}\s+(?=\S)/i, "") // tag de clan sans crochets : « vK Rafa »
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

/** Ressemblance de 0 à 1 entre le pseudo lu et l'identifiant Activision d'un joueur. */
export function nameSimilarity(read, activision) {
  const a = cleanName(read);
  const b = cleanName(activision);
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) >= 3 ? 1 : 0;
  const ratio = (text) => 1 - distance(text, b) / Math.max(text.length, b.length);
  // Tag mal coupé (« [61X]JRiiiK1 ») : on compare aussi la fin du pseudo lu.
  return Math.max(ratio(a), a.length > b.length ? ratio(a.slice(-b.length)) : 0);
}

/**
 * Relie les lignes aux joueurs du match : les meilleures ressemblances d'abord, puis, dans une équipe où il ne reste
 * qu'une ligne et un joueur, ils vont ensemble (pseudos stylisés que Tesseract ne sait pas lire).
 */
export function matchPlayers(rows, players) {
  const pairs = [];
  rows.forEach((row, index) => {
    for (const player of players) pairs.push({ index, player, score: nameSimilarity(row.name, player.activision ?? player.username) });
  });
  pairs.sort((a, b) => b.score - a.score);
  const taken = new Set();
  const result = rows.map((row) => ({ ...row, userId: null }));
  for (const minimum of [0.7, 0.45]) {
    for (const { index, player, score } of pairs) {
      if (score < minimum || result[index].userId || taken.has(player.id)) continue;
      result[index].userId = player.id;
      taken.add(player.id);
    }
  }
  // Équipe de chaque colonne : celle de ses joueurs reconnus.
  for (const column of [0, 1]) {
    const inColumn = result.filter((row) => row.column === column);
    const known = inColumn.find((row) => row.userId);
    if (!known) continue;
    const side = players.find((player) => player.id === known.userId)?.side;
    const missingRows = inColumn.filter((row) => !row.userId);
    const missingPlayers = players.filter((player) => player.side === side && !taken.has(player.id));
    if (missingRows.length === 1 && missingPlayers.length === 1) {
      missingRows[0].userId = missingPlayers[0].id;
      taken.add(missingPlayers[0].id);
    }
  }
  return result;
}

// --- Lecture complète -------------------------------------------------------------------------

function toCanvas(image, left, top, width, height, threshold, scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const out = canvas.getContext("2d").createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const sx = Math.min(image.width - 1, left + Math.floor(x / scale));
      const sy = Math.min(image.height - 1, top + Math.floor(y / scale));
      const value = image.lum[sy * image.width + sx] > threshold ? 0 : 255; // texte noir sur blanc
      const offset = (y * canvas.width + x) * 4;
      out.data[offset] = value;
      out.data[offset + 1] = value;
      out.data[offset + 2] = value;
      out.data[offset + 3] = 255;
    }
  }
  canvas.getContext("2d").putImageData(out, 0, 0);
  return canvas;
}

/** Colonnes du tableau d'après les en-têtes SCORE et POSES des deux équipes. */
async function findTable(worker, image) {
  await worker.setParameters({ tessedit_pageseg_mode: "11", user_defined_dpi: "300" });
  for (const threshold of [120, 95, 150]) {
    const { data } = await worker.recognize(toCanvas(image, 0, 0, image.width, image.height, threshold), {}, { blocks: true });
    const words = (data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines.flatMap((line) => line.words)));
    const find = (pattern) =>
      words
        .filter((word) => pattern.test(word.text.toUpperCase()))
        .map((word) => word.bbox)
        .sort((a, b) => a.x0 - b.x0);
    const scores = find(/^S?CORE/);
    const poses = find(/^P?OSES/);
    if (scores.length === 2 && poses.length === 2) {
      return scores.map((box, index) => ({ x: box.x0, centerY: (box.y0 + box.y1) / 2, pitch: (poses[index].x0 - box.x0) / 2 }));
    }
  }
  return null;
}

async function readName(worker, image, column, centerY, rowHeight) {
  const left = Math.max(0, Math.round(column.x - column.pitch * 2.15));
  const width = Math.round(column.pitch * 2.05);
  const top = Math.max(0, Math.round(centerY - rowHeight * 0.4));
  const height = Math.min(Math.round(rowHeight * 0.8), image.height - top);
  const texts = [];
  for (const threshold of [110, 140]) {
    const { data } = await worker.recognize(toCanvas(image, left, top, width, height, threshold, 3));
    texts.push(data.text.trim().replace(/\s+/g, " "));
  }
  return texts;
}

/**
 * Lit une capture. Renvoie { rows: [{ column, name, userId, score, kills, plants, defuses, readable }] }, ou null
 * si le tableau n'est pas trouvé. `players` : joueurs du match ({ id, activision, username, side }).
 */
export async function readScoreboard(file, players, onProgress = () => {}) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0);
  const image = brightness(context.getImageData(0, 0, canvas.width, canvas.height));

  onProgress("Préparation de la lecture…");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, { logger: () => {} });
  try {
    onProgress("Recherche du tableau…");
    const columns = await findTable(worker, image);
    if (!columns) return null;

    onProgress("Lecture des chiffres…");
    const rows = [];
    for (const [columnIndex, column] of columns.entries()) {
      const rowHeight = column.pitch * ROW_RATIO;
      for (let row = 0; row < MAX_ROWS; row += 1) {
        const centerY = column.centerY + (row + 0.93) * rowHeight;
        if (centerY + rowHeight / 2 > image.height) break;
        const left = (index) => column.x - column.pitch * 0.05 + index * column.pitch;
        const score = readNumber(image, left(0), centerY, column.pitch, rowHeight);
        const kills = readNumber(image, left(1), centerY, column.pitch, rowHeight);
        const plants = readNumber(image, left(2), centerY, column.pitch, rowHeight);
        const defuses = readNumber(image, left(3), centerY, column.pitch, rowHeight);
        if ([score, kills, plants, defuses].filter((value) => value !== null).length < 2) break; // fin du tableau
        const readable = [score, kills, plants, defuses].every((value) => value !== null) && score % 5 === 0;
        rows.push({ column: columnIndex, centerY, rowHeight, score, kills, plants, defuses, readable });
      }
    }

    onProgress("Lecture des pseudos…");
    await worker.setParameters({ tessedit_pageseg_mode: "7" });
    for (const row of rows) {
      const [first, second] = await readName(worker, image, columns[row.column], row.centerY, row.rowHeight);
      const candidates = [first, second];
      // Le texte qui ressemble le plus à un joueur du match ; sinon le premier lu.
      row.name = candidates.sort((a, b) => Math.max(...players.map((p) => nameSimilarity(b, p.activision ?? p.username))) - Math.max(...players.map((p) => nameSimilarity(a, p.activision ?? p.username))))[0];
    }
    return { rows: matchPlayers(rows, players).map(({ centerY, rowHeight, ...row }) => row) };
  } finally {
    await worker.terminate();
  }
}
