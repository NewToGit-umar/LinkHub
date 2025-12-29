import React, { useState, useEffect } from "react";
import { bioAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function BioEditor() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [page, setPage] = useState({
    title: "",
    slug: "",
    description: "",
    links: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      bioAPI
        .getBySlug(slug)
        .then((r) => setPage(r.data.page))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  function handleChange(e) {
    const { name, value } = e.target;
    setPage((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (page._id) {
        await bioAPI.update(page._id, page);
      } else {
        const res = await bioAPI.create(page);
        navigate(`/bio/${res.data.page.slug}`);
        return;
      }
      navigate(`/bio/${page.slug || page._id}`);
    } catch (err) {
      console.error(err);
      alert("Error saving bio page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {slug ? "Edit" : "Create"} Bio Page
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Title</label>
          <input
            name="title"
            value={page.title || ""}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm">Slug (optional)</label>
          <input
            name="slug"
            value={page.slug || ""}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea
            name="description"
            value={page.description || ""}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
