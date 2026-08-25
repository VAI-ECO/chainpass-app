/**
 * Two-frame FACE_SERVICE stub: frame two compared against frame one.
 * deno test --allow-read --allow-net --allow-env supabase/functions/enrol/two_frame_compare_test.ts
 */
import { bandFromSimilarity } from "../_shared/band-compare.ts";
import {
  compareFrameTwoAgainstFrameOne,
  cosineSimilarity,
} from "../_shared/frame-compare.ts";
import { embedBothAndCompare, heldCaptureToBase64 } from "../_shared/enrol-baseline.ts";
import {
  handleFaceStubRequest,
  vectorFromImageBytes,
} from "../_shared/face-service-stub.ts";

Deno.test("enrol-baseline compares frame two against frame one; both rows persist; no merge", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-baseline/index.ts", import.meta.url)
  );
  if (!/embedBothAndCompare/.test(fn) && !/compareFrameTwoAgainstFrameOne/.test(fn)) {
    throw new Error("baseline must compare frame two against frame one");
  }
  if (!/held_capture/.test(fn) || !/acceptance_capture/.test(fn)) {
    throw new Error("baseline must send both frames to FACE_SERVICE");
  }
  if (!/photo_ref:\s*"frame_one"/.test(fn) || !/photo_ref:\s*"frame_two"/.test(fn)) {
    throw new Error("both embeddings persist as separate rows");
  }
  if (/merge_threshold/.test(fn) || /averaged|mean_vector|merged_vector/.test(fn)) {
    throw new Error("do not invent a merge formula");
  }
  if (!/frames_compared/.test(fn)) {
    throw new Error("response must say the two frames were compared");
  }
  if (/similarity:/.test(fn)) {
    throw new Error("percentage stays at ChainPass — return the band only");
  }
});

Deno.test("identical bytes produce the same 512-vector; different bytes do not", async () => {
  const a = new TextEncoder().encode("frame-one-bytes");
  const b = new TextEncoder().encode("frame-two-bytes");
  const va = await vectorFromImageBytes(a);
  const vb = await vectorFromImageBytes(b);
  const va2 = await vectorFromImageBytes(a);
  if (va.length !== 512 || vb.length !== 512) {
    throw new Error(`expected 512 floats, got ${va.length} and ${vb.length}`);
  }
  if (cosineSimilarity(va, va2) !== 1) {
    throw new Error("same bytes must embed to cosine 1");
  }
  if (cosineSimilarity(va, vb) >= 1) {
    throw new Error("different bytes must not embed to the same vector");
  }
});

Deno.test("compare uses existing band settings — same frame is green; no invented threshold", () => {
  const unit = new Array(512).fill(0);
  unit[0] = 1;
  const same = compareFrameTwoAgainstFrameOne(unit, unit, 0.8, 0.6);
  if (same.frames_compared !== true) throw new Error("must mark frames_compared");
  if (same.band !== "green") throw new Error("identical vectors are green");
  if ("similarity" in same) throw new Error("do not return a percentage");
  if (bandFromSimilarity(1, 0.8, 0.6) !== "green") {
    throw new Error("must reuse bandFromSimilarity");
  }
  const other = new Array(512).fill(0);
  other[1] = 1;
  const diff = compareFrameTwoAgainstFrameOne(unit, other, 0.8, 0.6);
  if (diff.band === "green") {
    throw new Error("orthogonal frames must not band green");
  }
});

Deno.test("FACE_SERVICE stub is posted twice with the two frame bodies, then compared", async () => {
  const prevKey = Deno.env.get("FACE_SERVICE_KEY");
  Deno.env.set("FACE_SERVICE_KEY", "face-stub-key");
  const calls: Uint8Array[] = [];
  const ac = new AbortController();
  const server = Deno.serve(
    { hostname: "127.0.0.1", port: 0, signal: ac.signal },
    async (req) => {
      const bytes = new Uint8Array(await req.arrayBuffer());
      calls.push(bytes);
      return await handleFaceStubRequest(
        new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: bytes.slice().buffer as ArrayBuffer,
        })
      );
    }
  );
  try {
    const addr = server.addr;
    if (!("port" in addr)) throw new Error("stub did not bind a port");
    const frameOne = btoa("FRAME_ONE_IMAGE");
    const frameTwo = btoa("FRAME_TWO_IMAGE");
    const result = await embedBothAndCompare(
      { url: `http://127.0.0.1:${addr.port}/`, key: "face-stub-key" },
      frameOne,
      frameTwo,
      0.8,
      0.6
    );
    if (calls.length !== 2) {
      throw new Error(`expected 2 FACE_SERVICE posts, got ${calls.length}`);
    }
    // Live contract: POST JSON { image: base64 }. The stub accepts it too.
    const oneB64 = heldCaptureToBase64(frameOne);
    const twoB64 = heldCaptureToBase64(frameTwo);
    const oneBody = JSON.stringify({ image: oneB64 });
    const twoBody = JSON.stringify({ image: twoB64 });
    const oneText = new TextDecoder().decode(calls[0]);
    const twoText = new TextDecoder().decode(calls[1]);
    if (oneText !== oneBody || twoText !== twoBody) {
      throw new Error("stub must receive each frame as JSON { image: base64 }, not a client vector");
    }
    if (oneText === twoText) {
      throw new Error("the two posts must carry different frames");
    }
    if (result.frames_compared !== true) throw new Error("frames were not compared");
    if (result.band !== "green" && result.band !== "yellow" && result.band !== "red") {
      throw new Error("comparison must produce a band");
    }
    const sim = cosineSimilarity(result.frameOne.vector, result.frameTwo.vector);
    if (sim >= 1) throw new Error("different frames must not compare as the same vector");
    const again = await embedBothAndCompare(
      { url: `http://127.0.0.1:${addr.port}/`, key: "face-stub-key" },
      frameOne,
      frameOne,
      0.8,
      0.6
    );
    if (again.band !== "green") {
      throw new Error("identical frames must compare green");
    }
    const identical = cosineSimilarity(again.frameOne.vector, again.frameTwo.vector);
    if (identical < 0.999999) {
      throw new Error(`identical frames must be cosine 1, got ${identical}`);
    }
  } finally {
    ac.abort();
    await server.shutdown();
    if (prevKey !== undefined) Deno.env.set("FACE_SERVICE_KEY", prevKey);
    else Deno.env.delete("FACE_SERVICE_KEY");
  }
});
