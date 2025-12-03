import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const DEFAULT_BUCKET = "esp_files";

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

export async function getGridFSBucket(bucketName: string = DEFAULT_BUCKET): Promise<GridFSBucket> {
  const client = await getMongoClient();
  const db = client.db(getDbName(mongoUri!));
  return new GridFSBucket(db, { bucketName });
}

export async function uploadBufferToGridFS(
  filename: string,
  contentType: string,
  buffer: Buffer,
  bucketName: string = DEFAULT_BUCKET,
): Promise<ObjectId> {
  const bucket = await getGridFSBucket(bucketName);
  return await new Promise<ObjectId>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as ObjectId));
    uploadStream.end(buffer);
  });
}

export async function readGridFSFileToBuffer(id: string, bucketName: string = DEFAULT_BUCKET): Promise<Buffer> {
  const bucket = await getGridFSBucket(bucketName);
  return await new Promise<Buffer>((resolve, reject) => {
    const objectId = new ObjectId(id);
    const downloadStream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    downloadStream.on("error", reject);
  });
}

export { ObjectId, DEFAULT_BUCKET };
