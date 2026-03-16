import { getStore } from "@netlify/blobs";

const DEFAULT_VOTES = [0, 0, 0, 0, 0];
const STORE_NAME = "poll-results";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const poll = url.searchParams.get("poll") || "default-poll";

    const store = getStore({
      name: STORE_NAME,
      consistency: "strong"
    });

    let data = await store.get(poll, { type: "json" });

    if (
      !data ||
      !Array.isArray(data.votes) ||
      data.votes.length !== DEFAULT_VOTES.length ||
      typeof data.total !== "number"
    ) {
      data = { votes: [...DEFAULT_VOTES], total: 0 };
      await store.setJSON(poll, data);
    }

    if (request.method === "GET") {
      return json(data);
    }

    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body." }, 400);
      }

      const option = Number(body?.option);
      const previousOption =
        body?.previousOption === null || body?.previousOption === undefined
          ? null
          : Number(body.previousOption);

      if (!Number.isInteger(option) || option < 0 || option >= data.votes.length) {
        return json({ error: "Invalid option." }, 400);
      }

      if (
        previousOption !== null &&
        (!Number.isInteger(previousOption) ||
          previousOption < 0 ||
          previousOption >= data.votes.length)
      ) {
        return json({ error: "Invalid previous option." }, 400);
      }

      if (previousOption === null) {
        data.votes[option] += 1;
        data.total += 1;
      } else if (previousOption !== option) {
        if (data.votes[previousOption] > 0) {
          data.votes[previousOption] -= 1;
        }
        data.votes[option] += 1;
      }

      await store.setJSON(poll, data);
      return json(data);
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Poll function error:", error);
    return json(
      {
        error: "Function crashed",
        detail: error?.message || String(error)
      },
      500
    );
  }
};
