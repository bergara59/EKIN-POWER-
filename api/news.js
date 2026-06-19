// Newsletter EKIN · titulares del sector eléctrico/energético mexicano.
// Agrega Google News RSS (que recoge los principales diarios) y devuelve JSON.
// Cache de borde para no golpear la fuente en cada visita.

const QUERIES = [
  "sector eléctrico México",
  "energía México CFE CRE",
  "almacenamiento BESS solar México",
  "mercado eléctrico mayorista México",
];

function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i"));
  return m ? m[1] : "";
}

function parseItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < 30) {
    const b = m[1];
    let title = decode(pick(b, "title"));
    const link = decode(pick(b, "link"));
    const pubDate = decode(pick(b, "pubDate"));
    const source = decode(pick(b, "source")) || "";
    // Google News añade " - Fuente" al final del título; lo separamos.
    let src = source;
    const dash = title.lastIndexOf(" - ");
    if (!src && dash > 20) { src = title.slice(dash + 3); title = title.slice(0, dash); }
    if (title && link) items.push({ title, link, source: src, date: pubDate });
  }
  return items;
}

export default async function handler(req, res) {
  try {
    const results = await Promise.all(
      QUERIES.map(async (q) => {
        const url =
          "https://news.google.com/rss/search?q=" +
          encodeURIComponent(q) +
          "&hl=es-419&gl=MX&ceid=MX:es-419";
        try {
          const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 EKINNewsBot" } });
          if (!r.ok) return [];
          return parseItems(await r.text());
        } catch {
          return [];
        }
      })
    );

    // Mezcla, deduplica por título, ordena por fecha desc.
    const seen = new Set();
    let all = [];
    for (const list of results) {
      for (const it of list) {
        const key = it.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        all.push(it);
      }
    }
    all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    all = all.slice(0, 18);

    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({ items: all, updated: new Date().toISOString() });
  } catch (err) {
    console.error("news handler error", err);
    res.status(200).json({ items: [], updated: new Date().toISOString(), error: "fetch" });
  }
}
