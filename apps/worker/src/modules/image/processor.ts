import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import exifReader from "exif-reader";
import type {
  OriginalMetadata,
  VersionInfo,
  ProcessedImageResult,
  ExifData,
} from "@libs/types/task.js";
import { parseError } from "@shared/utils/parseError.js";

function sanitizeExif(raw: Record<string, unknown>): ExifData {
  const result: ExifData = {};

  for (const [key, value] of Object.entries(raw)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }

  return result;
}
const rawQuality = Number(process.env.IMAGE_QUALITY);
const quality = Number.isFinite(rawQuality) ? rawQuality : 80;

const uploadDir = process.env.UPLOAD_DIR || path.resolve("uploads");
const outputDir = process.env.UPLOAD_DIR || path.resolve("outputs");

const FORMATS: Record<string, (img: sharp.Sharp) => sharp.Sharp> = {
  webp: (img) => img.webp({ quality }),
  jpg: (img) => img.jpeg({ quality }),
};

const SIZES = [
  { label: "low", width: 320 },
  { label: "medium", width: 640 },
  { label: "high", width: null },
] as const;

export async function processImage(
  taskId: string,
  inputFilename: string
): Promise<ProcessedImageResult> {
  const inputPath = path.isAbsolute(inputFilename)
    ? inputFilename
    : path.join(uploadDir, inputFilename);

  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`File not found: ${inputFilename}`);
  }

  const versions: VersionInfo[] = [];
  const processedAt = new Date();
  const base = sharp(inputPath);

  try {
    const metadata = await base.metadata();
    const rawExif = metadata.exif ? exifReader(metadata.exif) : undefined;
    const exifData = rawExif ? sanitizeExif(rawExif) : undefined;

    for (const format of Object.keys(FORMATS)) {
      const formatDir = path.join(outputDir, taskId, format);
      await fs.mkdir(formatDir, { recursive: true });

      await Promise.all(
        SIZES.map(
          async ({
            label,
            width,
          }: {
            label: "low" | "medium" | "high";
            width: number | null;
          }) => {
            const outputFilename = `${label}.${format}`;
            const outputRelPath = path.join(taskId, format, outputFilename);
            const outputFullPath = path.join(outputDir, outputRelPath);

            const transformer = FORMATS[format](
              width ? base.clone().resize({ width }) : base.clone()
            );

            await transformer.toFile(outputFullPath);

            const resizedMeta = await sharp(outputFullPath).metadata();
            const { size } = await fs.stat(outputFullPath);

            versions.push({
              label: label as "low" | "medium" | "high",
              path: outputRelPath,
              width: resizedMeta.width ?? 0,
              height: resizedMeta.height ?? 0,
              sizeInBytes: size,
            });
          }
        )
      );
    }

    const mimetype = metadata.format ? `image/${metadata.format}` : "unknown";

    const originalMetadata: OriginalMetadata = {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      mimetype,
      // Só inclui o campo se exifData existir
      ...(exifData && { exif: exifData }),
    };

    return { originalMetadata, versions, processedAt };
  } catch (err: unknown) {
    const { message } = parseError(err);
    throw new Error(`Failed to process image "${inputFilename}": ${message}`);
  }
}
