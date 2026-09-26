const rawBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const productionHosts = new Set(["api.starrynightsindia.in"]);
const allowHttp = process.env.STAGING_SMOKE_ALLOW_HTTP === "true";

if (!rawBaseUrl) throw new Error("EXPO_PUBLIC_API_BASE_URL is required. Supply the staging Node API URL ending in /api.");

let parsedBase;
try { parsedBase = new URL(rawBaseUrl); } catch { throw new Error("EXPO_PUBLIC_API_BASE_URL must be an absolute URL."); }
if (productionHosts.has(parsedBase.hostname.toLowerCase())) throw new Error("Refusing to run the staging smoke script against the production API host.");
if (!parsedBase.pathname.replace(/\/+$/, "").endsWith("/api")) throw new Error("EXPO_PUBLIC_API_BASE_URL must end in /api.");
if (parsedBase.protocol !== "https:" && !allowHttp) throw new Error("Staging smoke tests require HTTPS. Set STAGING_SMOKE_ALLOW_HTTP=true only for an isolated local/LAN Node API.");

const apiBaseUrl = parsedBase.toString().replace(/\/+$/, "");
const request = async (label, path, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      redirect: "error",
      headers: { Accept: "application/json", ...(options.headers ?? {}) },
      signal: controller.signal,
    });
    let body;
    try { body = await response.json(); } catch { throw new Error(`${label}: expected a JSON response (HTTP ${response.status}).`); }
    return { response, body };
  } finally { clearTimeout(timer); }
};

const expectSuccess = async (label, path, array = false) => {
  const { response, body } = await request(label, path);
  if (!response.ok || body?.success !== true) throw new Error(`${label}: expected a successful API envelope, received HTTP ${response.status}.`);
  if (array && !Array.isArray(body.data)) throw new Error(`${label}: expected an array response.`);
  console.log(`PASS ${label}`);
  return body.data;
};

const expectValidationFailure = async (label, path, payload) => {
  const { response, body } = await request(label, path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (response.status !== 400 || body?.success !== false) throw new Error(`${label}: expected HTTP 400 with the shared failure envelope, received HTTP ${response.status}.`);
  console.log(`PASS ${label}`);
};

console.log(`Staging API smoke target: ${parsedBase.origin}${parsedBase.pathname}`);
await expectSuccess("health", "/health");
const packages = await expectSuccess("packages", "/packages", true);
const categories = await expectSuccess("categories", "/categories", true);
await expectSuccess("hero sliders", "/hero-sliders/public", true);
await expectSuccess("featured rows", "/featured-rows/public?visibleOn=home", true);
await expectSuccess("homepage statistics", "/homepage-statistics/public", true);
await expectSuccess("occasion popup", "/occasion-popups/current");
await expectSuccess("gallery", "/gallery/public", true);
await expectSuccess("public notifications", "/notifications/public", true);

const packageCode = packages.find((item) => typeof item?.packageCode === "string" || typeof item?.code === "string")?.packageCode
  ?? packages.find((item) => typeof item?.code === "string")?.code;
const categoryCode = categories.find((item) => typeof item?.code === "string")?.code;
if (!packageCode || !categoryCode) throw new Error("Catalogue smoke data does not contain a package and category code.");
await expectSuccess("package detail", `/packages/${encodeURIComponent(packageCode)}`);
await expectSuccess("category packages", `/categories/${encodeURIComponent(categoryCode)}/packages`, true);

// Both payloads fail validation before the Node handlers can create a record.
await expectValidationFailure("enquiry validation", "/enquiries", {});
await expectValidationFailure("chatbot validation", "/chatbot/query", { message: " " });
console.log("Staging public compatibility smoke: PASS");
