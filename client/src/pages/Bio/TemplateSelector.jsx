import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesAPI } from "../../services/api";

export default function TemplateSelector({
  bioPageId,
  currentTemplate,
  onApply,
}) {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState(currentTemplate || "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await templatesAPI.list();
      return res.data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({ bioPageId, slug }) => templatesAPI.apply(bioPageId, slug),
    onSuccess: () => {
      queryClient.invalidateQueries(["bio"]);
      if (onApply) onApply(selectedSlug);
    },
  });

  if (isLoading)
    return <p className="text-sm text-gray-500">Loading templates...</p>;
  if (error)
    return <p className="text-sm text-red-500">Failed to load templates</p>;

  const systemTemplates = data?.system || [];
  const userTemplates = data?.user || [];

  const handleApply = () => {
    if (!selectedSlug || !bioPageId) return;
    applyMutation.mutate({ bioPageId, slug: selectedSlug });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Choose a Template</h3>

      {/* System Templates */}
      <div>
        <p className="text-xs text-gray-500 mb-2">System Templates</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {systemTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.slug}
              template={tpl}
              selected={selectedSlug === tpl.slug}
              onSelect={() => setSelectedSlug(tpl.slug)}
            />
          ))}
        </div>
      </div>

      {/* User Templates */}
      {userTemplates.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Your Templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.slug}
                template={tpl}
                selected={selectedSlug === tpl.slug}
                onSelect={() => setSelectedSlug(tpl.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={!selectedSlug || applyMutation.isPending}
        className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {applyMutation.isPending ? "Applying..." : "Apply Template"}
      </button>
      {applyMutation.isError && (
        <p className="text-red-500 text-sm">Failed to apply template</p>
      )}
    </div>
  );
}

function TemplateCard({ template, selected, onSelect }) {
  const styles = template.styles || {};
  const bgStyle = styles.backgroundColor?.startsWith("linear")
    ? { background: styles.backgroundColor }
    : { backgroundColor: styles.backgroundColor || "#fff" };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-lg overflow-hidden border-2 p-3 h-24 flex flex-col justify-end transition-all ${
        selected
          ? "border-indigo-500 ring-2 ring-indigo-300"
          : "border-gray-200 hover:border-gray-300"
      }`}
      style={bgStyle}
    >
      <span
        className="text-xs font-semibold truncate"
        style={{ color: styles.textColor || "#333" }}
      >
        {template.name}
      </span>
      {selected && (
        <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded">
          Selected
        </span>
      )}
    </button>
  );
}
