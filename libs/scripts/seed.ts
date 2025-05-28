import "dotenv/config";
import { connectToMongo } from "@libs/mongo/connection.js";
import { ImageTaskModel } from "@libs/mongo/image-task/image-task.model.js";
import { OptimizedAssetModel } from "@libs/mongo/optimized-assets/optimized-asset.model.js";

function toInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const totalTasks = toInt(process.argv[2], 10_000);
const whitelistCount = toInt(process.argv[3], 2800);
const exclusiveCount = toInt(process.argv[4], 800);

console.log("Running seed with:");
console.log(`totalTasks: ${totalTasks}`);
console.log(`whitelistCount: ${whitelistCount}`);
console.log(`exclusiveCount: ${exclusiveCount}`);

async function seed() {
  await connectToMongo("SEED");

  console.log("Clearing existing collections");
  await ImageTaskModel.deleteMany({});
  await OptimizedAssetModel.deleteMany({});

  console.log("Generating ImageTasks");
  const allTasks = Array.from({ length: totalTasks }).map((_, i) => {
    const taskId = `task-${i + 1}`;
    return {
      displayId: `D-${i + 1}`,
      taskId,
      originalFilename: `img-${i + 1}.jpg`,
      status: i < whitelistCount ? "done" : "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const inserted = await ImageTaskModel.insertMany(allTasks);
  console.log(`Inserted ${inserted.length} ImageTasks`);

  console.log("Generating optimized_assets whitelist");
  const whitelisted = inserted.slice(0, whitelistCount).map((task, i) => ({
    clientId: "trakto",
    taskId: task.taskId,
    type: i < exclusiveCount ? "exclusive" : "selected",
    createdAt: new Date(),
  }));

  await OptimizedAssetModel.insertMany(whitelisted);
  console.log(`Registered ${whitelisted.length} optimized assets`);

  console.log("Seed completed");
  process.exit(0);
}

seed();
