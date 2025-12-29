import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function BioList() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    // For now, use dashboard API as placeholder to list user's pages if available
    api
      .get("/dashboard")
      .then((r) => setPages(r.data.pages || []))
      .catch(() => setPages([]));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Bio Pages</h2>
      {pages.length === 0 ? (
        <div>No bio pages yet.</div>
      ) : (
        <ul>
          {pages.map((p) => (
            <li key={p._id} className="py-2">
              <a href={`/bio/${p.slug}`} className="text-blue-600">
                {p.title || p.slug}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
