import { describe, it, expect, vi } from "vitest";

vi.mock("fs/promises", async () => {
  const actual = await vi.importActual("fs/promises");
  return {
    ...actual,
    default: {
      ...actual,
      access: vi.fn(() => Promise.resolve()),
      mkdir: vi.fn(() => Promise.resolve()),
      stat: vi.fn(() => Promise.resolve({ size: 123456 })),
    },
  };
});

vi.mock("sharp", () => {
  const mockSharp = vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({
      width: 1920,
      height: 1080,
      format: "jpeg",
      exif: undefined,
    }),
    clone: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  }));

  return {
    default: mockSharp,
    __esModule: true,
  };
});

vi.mock("exif-reader", () => ({
  default: vi.fn(() => ({})),
  __esModule: true,
}));

vi.mock("@shared/utils/parseError.js", () => ({
  parseError: vi.fn((err) => ({ message: String(err) })),
}));

vi.mock("../src/modules/image/sanitizeExif.ts", () => ({
  sanitizeExif: vi.fn(() => ({})),
}));

import { processImage } from "../src/modules/image/processor.js";

const quality = 80;
import type { Sharp } from "sharp";

const FORMATS: Record<string, (img: Sharp) => Sharp> = {
  webp: (img) => img.webp({ quality }),
  jpg: (img) => img.jpeg({ quality }),
};

const SIZES = [
  { label: "low", width: 320 },
  { label: "medium", width: 640 },
  { label: "high", width: null },
] as const;

describe("processImage", () => {
  it("retorna metadata original, versões e data de processamento", async () => {
    const result = await processImage("mock-task-id", "image.jpg");

    expect(result.originalMetadata).toMatchObject({
      width: 1920,
      height: 1080,
      mimetype: "image/jpeg",
    });

    const expectedVersions = Object.keys(FORMATS).length * SIZES.length;
    expect(result.versions).toHaveLength(expectedVersions);

    for (const version of result.versions) {
      expect(version).toHaveProperty("path");
      expect(version).toHaveProperty("width");
      expect(version).toHaveProperty("height");
      expect(version).toHaveProperty("sizeInBytes");
    }

    expect(result.processedAt).toBeInstanceOf(Date);
  });
});
