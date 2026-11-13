import { randomBytes, scrypt as deriveKey, timingSafeEqual } from "node:crypto";

const OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deriveKey(password, salt, 64, OPTIONS, (error, key) => error ? reject(error) : resolve(key));
  });
}

export function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128 && Buffer.byteLength(password, "utf8") <= 512;
}

export async function hashPassword(password: string) {
  if (!validPassword(password)) throw new Error("Use a password between 12 and 128 characters.");
  const salt = randomBytes(16).toString("hex");
  return `scrypt$32768$8$1$${salt}$${(await scrypt(password, salt)).toString("hex")}`;
}

// A missing account still performs the same expensive password derivation.
const DUMMY_HASH = `scrypt$32768$8$1$${"0".repeat(32)}$${"0".repeat(128)}`;
export async function verifyPassword(password: string, encoded: string = DUMMY_HASH) {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts.slice(0, 4).join("$") !== "scrypt$32768$8$1" ||
      !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) return false;
  const actual = await scrypt(password, parts[4]);
  return timingSafeEqual(actual, Buffer.from(parts[5], "hex"));
}
