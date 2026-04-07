/**
 * Gemini Nano Banana batch image generator for Visio Auto.
 * Uses gemini-3.1-flash-image-preview via AI Gateway pattern with generateText.
 *
 * Usage: node scripts/generate-images.mjs
 *
 * Requires GOOGLE_GENERATIVE_AI_API_KEY in .env.local
 */

import { config } from "dotenv";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "public", "generated");

if (!existsSync(OUTPUT_DIR)) {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

const STYLE_BASE =
  "Cinematic automotive photography, deep emerald-tinted dark background (#030f0a), " +
  "moody studio lighting with subtle green rim light, ultra high-end commercial car shoot, " +
  "shallow depth of field, glossy paint reflecting subtle highlights, premium luxury aesthetic, " +
  "minimalist composition, ultra sharp, photorealistic, 8K quality, no people, no text, no logos, " +
  "Bloomberg-terminal-meets-luxury-magazine vibe";

const images = [
  {
    name: "hero-car",
    prompt:
      "A sleek matte black luxury performance sedan from a low front-three-quarter angle, " +
      "headlights on with subtle emerald LED accent strip, parked on wet polished asphalt with " +
      "faint reflections, deep emerald-black background fading to pure black, dramatic side-lit " +
      "studio lighting, wide cinematic 16:9 composition. " + STYLE_BASE,
  },
  {
    name: "car-volume",
    prompt:
      "A modern crossover SUV from a clean side angle, family practical aesthetic, slate grey " +
      "paint, parked in a minimalist studio with deep emerald-black background, soft top lighting, " +
      "4:3 composition. " + STYLE_BASE,
  },
  {
    name: "car-premium",
    prompt:
      "A premium luxury German sedan from a hero three-quarter angle, midnight blue metallic " +
      "paint, polished alloy wheels, deep emerald-black studio background with subtle floor " +
      "reflection, executive elegance, 4:3 composition. " + STYLE_BASE,
  },
  {
    name: "car-luxury",
    prompt:
      "An exotic supercar from a dramatic low-angle three-quarter front view, deep emerald " +
      "metallic paint with ultra-glossy finish, sharp aerodynamic lines, carbon fiber accents, " +
      "deep emerald-black studio background, dramatic spotlight from above, 4:3 composition. " +
      STYLE_BASE,
  },
  {
    name: "car-bakkie",
    prompt:
      "A modern double-cab pickup truck (bakkie) from a hero front angle, charcoal grey paint, " +
      "rugged but premium aesthetic, parked on a clean studio floor, deep emerald-black " +
      "background, dramatic side lighting, 4:3 composition. " + STYLE_BASE,
  },
  {
    name: "car-ev",
    prompt:
      "A futuristic electric SUV from a clean side angle, pearl white paint with subtle emerald " +
      "underglow accent lighting, modern aerodynamic shape, glowing headlight signature, deep " +
      "emerald-black studio background, 4:3 composition. " + STYLE_BASE,
  },
  {
    name: "showroom-empty",
    prompt:
      "An empty premium car dealership showroom interior at night, polished concrete floor with " +
      "subtle emerald-tinted reflections, modern minimalist architecture, large floor-to-ceiling " +
      "windows showing dark cityscape outside, no cars visible, dramatic ambient lighting, 16:9 " +
      "cinematic composition. " + STYLE_BASE,
  },
  {
    name: "key-fob",
    prompt:
      "A premium black car key fob with subtle emerald LED indicator, photographed from above on " +
      "a dark polished surface with shallow depth of field, deep emerald-black background, " +
      "macro product photography, square 1:1 composition. " + STYLE_BASE,
  },
  {
    name: "dashboard",
    prompt:
      "A modern luxury car interior dashboard view from the driver perspective, ambient emerald " +
      "accent lighting, premium leather and brushed aluminium, modern digital instrument cluster " +
      "glowing softly, no driver visible, 16:9 cinematic composition. " + STYLE_BASE,
  },
  {
    name: "wheel-detail",
    prompt:
      "A close-up macro shot of a premium polished alloy wheel with carbon ceramic brake disc " +
      "visible behind the spokes, dramatic side lighting, deep emerald-black background, ultra " +
      "sharp detail, square 1:1 composition. " + STYLE_BASE,
  },

  // ──────────────────────────────────────────────
  // LUXURY CONCIERGE — African HNW market imagery
  // ──────────────────────────────────────────────
  {
    name: "concierge-rangerover",
    prompt:
      "A flagship full-size luxury SUV (Range Rover-style proportions) in deep matte black, " +
      "photographed from an elevated front-three-quarter hero angle on a polished concrete " +
      "showroom floor, deep emerald-black background, ambient luxury showroom lighting, " +
      "executive presence. 16:9 cinematic composition. " + STYLE_BASE,
  },
  {
    name: "concierge-gwagon",
    prompt:
      "An iconic boxy luxury SUV (Mercedes G-Class style proportions) in matte obsidian black, " +
      "front-three-quarter angle showing the iconic vertical front grille and round headlights, " +
      "deep emerald-black studio background, dramatic spotlight from above, status symbol " +
      "aesthetic. 4:3 composition. " + STYLE_BASE,
  },
  {
    name: "concierge-bentley",
    prompt:
      "An ultra-premium British luxury sedan (Bentley Continental GT style proportions) in deep " +
      "midnight metallic, hero side-front angle showcasing the sweeping coachbuilt lines, " +
      "polished chrome accents, deep emerald-black studio background, soft luxury lighting. " +
      "16:9 cinematic composition. " + STYLE_BASE,
  },
  {
    name: "concierge-rolls",
    prompt:
      "A flagship British ultra-luxury sedan (Rolls-Royce Ghost style proportions) in obsidian " +
      "black with chrome accents, photographed from a slightly elevated hero front angle " +
      "showcasing the imposing front grille, deep emerald-black background, dramatic studio " +
      "lighting, ultimate status symbol. 16:9 composition. " + STYLE_BASE,
  },
  {
    name: "roro-ship",
    prompt:
      "A massive RoRo (roll-on roll-off) car carrier ship at port at night, deep emerald-tinted " +
      "ambient lighting, dramatic moody atmosphere, the silhouette of cars being loaded via the " +
      "stern ramp visible, port cranes in background, water reflections, no people visible. " +
      "16:9 cinematic composition. " + STYLE_BASE,
  },
  {
    name: "africa-map-glow",
    prompt:
      "An abstract topographic map of the African continent rendered as glowing emerald wireframe " +
      "lines on a deep black background, with subtle pin-point glow markers indicating major " +
      "cities (Lagos, Nairobi, Cape Town, Johannesburg, Lubumbashi, Luanda, Accra), data " +
      "visualization aesthetic, no text labels, premium tech-meets-luxury feel. 16:9 composition. " +
      STYLE_BASE,
  },
  {
    name: "container-port-aerial",
    prompt:
      "An aerial top-down view of a major container port at twilight, rows of shipping containers " +
      "and car carrier vessels, polished water reflections, deep emerald-tinted ambient lighting, " +
      "data visualization meets reality aesthetic, no text. 16:9 cinematic composition. " +
      STYLE_BASE,
  },
  {
    name: "lagos-skyline-night",
    prompt:
      "An abstract atmospheric night view of a modern African city skyline (Lagos-style high-rise " +
      "silhouettes) with subtle warm golden window lights and emerald accent lighting in the " +
      "foreground, water reflections in foreground, moody cinematic, no recognizable landmarks. " +
      "16:9 composition. " + STYLE_BASE,
  },

  // ──────────────────────────────────────────────
  // INFOGRAPHIC AESTHETICS — abstract data viz backgrounds
  // (Real numbers will be overlaid as SVG. These are pure aesthetic layers.)
  // ──────────────────────────────────────────────
  {
    name: "infographic-bars",
    prompt:
      "Abstract data visualization: glowing emerald vertical bar chart rendered as 3D crystalline " +
      "luminous columns of varying heights, deep emerald-black void background, dramatic side " +
      "lighting, no axis labels, no numbers, no text, premium financial terminal aesthetic, " +
      "cinematic depth of field. 16:9 composition. " + STYLE_BASE,
  },
  {
    name: "infographic-line",
    prompt:
      "Abstract data visualization: a glowing emerald wireframe line graph trending sharply " +
      "upward across a deep emerald-black grid background, the line rendered as a luminous " +
      "neon stroke with subtle particle trails, no labels, no numbers, no text, Bloomberg " +
      "terminal meets art installation. 16:9 composition. " + STYLE_BASE,
  },
  {
    name: "infographic-network",
    prompt:
      "Abstract neural network visualization: glowing emerald nodes connected by luminous lines " +
      "forming an organic web pattern, deep emerald-black background, particles flowing along " +
      "the connections, premium AI/data visualization aesthetic, no labels, no numbers, no text. " +
      "16:9 composition. " + STYLE_BASE,
  },
  {
    name: "infographic-globe",
    prompt:
      "Abstract data globe: a transparent wireframe sphere of the earth rendered in glowing " +
      "emerald lines on deep black, with bright pin-point connection lines arcing between " +
      "different continents, premium data visualization, no labels, no text, Bloomberg-meets-art. " +
      "16:9 composition. " + STYLE_BASE,
  },
  {
    name: "infographic-funnel",
    prompt:
      "Abstract sales funnel visualization: an inverted cone shape rendered as glowing emerald " +
      "horizontal layers narrowing from wide top to narrow bottom, particles flowing through, " +
      "deep emerald-black background, premium data viz aesthetic, no labels, no numbers, no text. " +
      "1:1 square composition. " + STYLE_BASE,
  },
  {
    name: "infographic-radar",
    prompt:
      "Abstract radar/spider chart visualization: a glowing emerald polygon shape inside a " +
      "concentric emerald wireframe circle pattern, deep emerald-black background, premium " +
      "performance metric visualization, no labels, no numbers, no text. 1:1 square composition. " +
      STYLE_BASE,
  },
  {
    name: "infographic-flow",
    prompt:
      "Abstract process flow diagram: 4 glowing emerald cube nodes connected by luminous arrows " +
      "in a horizontal sequence, each node larger than the last, particles flowing along the " +
      "arrows, deep emerald-black background, premium pipeline visualization, no labels, no " +
      "numbers, no text. 16:9 composition. " + STYLE_BASE,
  },
  {
    name: "infographic-donut",
    prompt:
      "Abstract donut chart visualization: a glowing emerald ring divided into segments of " +
      "varying sizes by subtle gaps, the ring rendered with luminous depth, deep emerald-black " +
      "background, premium financial visualization, no labels, no numbers, no text. 1:1 square " +
      "composition. " + STYLE_BASE,
  },
  {
    name: "infographic-heatmap",
    prompt:
      "Abstract heat map visualization: a 12x8 grid of glowing squares of varying emerald " +
      "intensity from dim to bright, deep emerald-black background, premium analytics dashboard " +
      "aesthetic, no labels, no numbers, no text. 16:9 composition. " + STYLE_BASE,
  },
];

console.log(`\n🍌 Visio Auto — Nano Banana batch generator`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log(`🎨 Generating ${images.length} images via gemini-3.1-flash-image-preview...\n`);

for (const img of images) {
  const outputPath = join(OUTPUT_DIR, `${img.name}.png`);

  if (existsSync(outputPath)) {
    console.log(`⏭  ${img.name}.png — already exists, skipping`);
    continue;
  }

  try {
    console.log(`⏳ ${img.name}.png — generating...`);
    const startTime = Date.now();

    const result = await generateText({
      model: google("gemini-3.1-flash-image-preview"),
      prompt: img.prompt,
      providerOptions: {
        google: {
          responseModalities: ["IMAGE"],
        },
      },
    });

    // Image data is in result.files
    const imageFile = result.files?.find((f) =>
      f.mediaType?.startsWith("image/")
    );

    if (!imageFile) {
      throw new Error(
        "No image file in result. Files: " +
          JSON.stringify(result.files?.map((f) => f.mediaType))
      );
    }

    // imageFile.uint8Array or imageFile.base64
    const buffer = imageFile.uint8Array
      ? imageFile.uint8Array
      : Buffer.from(imageFile.base64, "base64");

    await writeFile(outputPath, buffer);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${img.name}.png — saved in ${elapsed}s`);
  } catch (err) {
    console.error(`❌ ${img.name}.png — failed:`, err.message);
  }
}

console.log(`\n✨ Done. Check ${OUTPUT_DIR}\n`);
