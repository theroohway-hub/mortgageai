exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "GROQ_API_KEY is not set in Netlify environment variables.",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { messages, model } = body;

    if (!messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'messages' in request body." }),
      };
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: model || "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.7,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return {
        statusCode: groqResponse.status,
        body: JSON.stringify({ error: "Groq API error", details: errText }),
      };
    }

    const data = await groqResponse.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
