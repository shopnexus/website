import { useState } from "react";
import { useRouter } from "next/navigation";

export function useSearch(initialLocation = "") {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && !location) return;

    setIsLoading(true);
    
    // Giả lập network delay để show loading effect
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (location) params.append("loc", location);
    
    router.push(`/search?${params.toString()}`);
    // Component will unmount or stay if already on /search, but we can reset loading just in case
    setIsLoading(false);
  };

  return {
    query,
    setQuery,
    location,
    setLocation,
    isLoading,
    handleSearch
  };
}
