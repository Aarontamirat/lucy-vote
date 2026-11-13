export async function readJson(req: Request, limit = 16_384): Promise<unknown> {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new SyntaxError("Send an application/json request.");
  if (Number(req.headers.get("content-length")) > limit) throw new SyntaxError("Request is too large.");
  if (!req.body) throw new SyntaxError("A JSON body is required.");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new SyntaxError("Request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
