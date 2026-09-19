import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Youtube, 
  Twitter, 
  Instagram, 
  Newspaper, 
  ExternalLink, 
  Check, 
  UserPlus, 
  UserMinus, 
  Compass, 
  Sparkles,
  FolderPlus
} from "lucide-react";
import { Creator, Platform, Category } from "../types";

interface ExploreViewProps {
  creators: Creator[];
  onToggleFollow: (creatorId: string) => void;
  categories: Category[];
  onAddCategory: (category: string) => void;
  onAddCreator: (creator: Creator) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  creators,
  onToggleFollow,
  categories,
  onAddCategory,
  onAddCreator,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Custom Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add Creator Modal state
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [newCreatorName, setNewCreatorName] = useState("");
  const [newCreatorHandle, setNewCreatorHandle] = useState("");
  const [newCreatorPlatform, setNewCreatorPlatform] = useState<Platform>("youtube");
  const [newCreatorCategory, setNewCreatorCategory] = useState<Category>("Technology");
  const [newCreatorBio, setNewCreatorBio] = useState("");
  const [newCreatorUrl, setNewCreatorUrl] = useState("");

  const platforms: { id: string; label: string; icon?: any }[] = [
    { id: "All", label: "All Platforms" },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "x", label: "X (Twitter)", icon: Twitter },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "news", label: "News Wires", icon: Newspaper },
  ];

  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      // Platform filter
      if (selectedPlatform !== "All" && c.platform !== selectedPlatform) return false;
      // Category filter
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesHandle = c.handle.toLowerCase().includes(query);
        const matchesBio = c.bio.toLowerCase().includes(query);
        if (!matchesName && !matchesHandle && !matchesBio) return false;
      }
      return true;
    });
  }, [creators, selectedPlatform, selectedCategory, searchTerm]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  const handleCreateCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorName.trim()) return;
    const newCreator: Creator = {
      id: `custom-creator-${Date.now()}`,
      name: newCreatorName.trim(),
      handle: newCreatorHandle.trim() || `@${newCreatorName.toLowerCase().replace(/\s+/g, "")}`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      platform: newCreatorPlatform,
      category: newCreatorCategory,
      bio: newCreatorBio.trim() || "Independent curated channel for concise analysis.",
      followersCount: "10K+",
      isFollowed: true,
      channelUrl: newCreatorUrl.trim() || "https://summaryhub.internal",
    };
    onAddCreator(newCreator);
    setNewCreatorName("");
    setNewCreatorHandle("");
    setNewCreatorBio("");
    setNewCreatorUrl("");
    setIsCreatorModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
            Explore Channels & Creators
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
            Follow accounts across YouTube, X, Instagram, and News websites to personalize your AI feed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-create-category-btn"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <FolderPlus className="h-4 w-4 text-indigo-500" />
            <span>+ Custom Category</span>
          </button>

          <button
            id="open-add-creator-btn"
            onClick={() => setIsCreatorModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Channel</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="explore-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search creator by name, handle, topic, or bio..."
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                id={`platform-filter-${p.id}`}
                onClick={() => setSelectedPlatform(p.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`explore-cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  isSelected
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCreators.map((creator) => (
          <div
            key={creator.id}
            id={`creator-card-${creator.id}`}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800"
                />

                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                  {creator.platform}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {creator.name}
                  </h3>
                  {creator.verified && (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {creator.handle} • {creator.followersCount} audience
                </p>
              </div>

              <p className="mt-2.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {creator.bio}
              </p>

              <div className="mt-3">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {creator.category}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <button
                id={`toggle-follow-btn-${creator.id}`}
                onClick={() => onToggleFollow(creator.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  creator.isFollowed
                    ? "border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-rose-50 hover:text-rose-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    : "bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700"
                }`}
              >
                {creator.isFollowed ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <a
                href={creator.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                <span>Channel</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD CUSTOM CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCategoryModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Custom Category</h2>
            <p className="mt-1 text-xs text-neutral-500">Add a specialized folder tag for your feeds.</p>
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. UPSC Mains, Space, BioTech"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM CREATOR */}
      {isCreatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreatorModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Add Channel or Account</h2>
            <p className="mt-1 text-xs text-neutral-500">Track an account and summarize upcoming publications.</p>
            <form onSubmit={handleCreateCreator} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Creator / Channel Name</label>
                <input
                  type="text"
                  required
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="e.g. Marques Brownlee / BBC News"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Platform</label>
                  <select
                    value={newCreatorPlatform}
                    onChange={(e) => setNewCreatorPlatform(e.target.value as Platform)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="x">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                    <option value="news">News Website</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <select
                    value={newCreatorCategory}
                    onChange={(e) => setNewCreatorCategory(e.target.value as Category)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Handle / URL</label>
                <input
                  type="text"
                  value={newCreatorUrl}
                  onChange={(e) => setNewCreatorUrl(e.target.value)}
                  placeholder="https://youtube.com/@channel or @handle"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatorModalOpen(false)}
                  className="rounded-xl border px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Add to Following
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
