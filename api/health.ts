export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ status: "error", message: "Use GET." });
  }

  return res.status(200).json({
    status: "ok",
    endpoint: "api/health",
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    ),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
}
