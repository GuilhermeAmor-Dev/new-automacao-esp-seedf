import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const mongoUri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient> | null = null;

function getDbName(uri: string): string {
  try {
    const parsed = new URL(uri);
    const dbPath = parsed.pathname.replace("/", "");
    return dbPath || "test";
  } catch {
    return "test";
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required for MongoDB file storage");
  }
  if (!clientPromise) {
    const client = new MongoClient(mongoUri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getGridFSBucket(): Promise<GridFSBucket> {
  const client = await getMongoClient();
  const db = client.db(getDbName(mongoUri!));
  return new GridFSBucket(db, { bucketName: "esp_files" });
}

export async function uploadBufferToGridFS(
  filename: string,
  contentType: string,
  buffer: Buffer
): Promise<ObjectId> {
  const bucket = await getGridFSBucket();
  return await new Promise<ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as ObjectId));
    uploadStream.end(buffer);
  });
}

export async function readGridFSFileToBuffer(id: string): Promise<Buffer> {
  const bucket = await getGridFSBucket();
  return await new Promise<Buffer>((resolve, reject) => {
    const objectId = new ObjectId(id);
    const downloadStream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    downloadStream.on("error", reject);
  });
}

export { ObjectId };
