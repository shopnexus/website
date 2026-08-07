"use client";

import React from "react";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import { useTags } from "@/hooks/api/useTags";

/**
 * The vocabulary the marketplace actually uses, as a way in.
 *
 * A tag is how a seller described their thing in their own words, so browsing by one is
 * closer to how people look for secondhand goods than a category tree is. `/tags` was
 * already served and nothing in this app had ever called it.
 */
export default function HomeTagCloud(): React.ReactElement | null {
  const { data: tags = [], isLoading } = useTags({ limit: 20 });

  if (!isLoading && tags.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-xl p-6">
      <h3 className="font-headline font-bold text-headline-sm mb-4">Tìm theo thẻ</h3>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/search?tag=${encodeURIComponent(tag.slug)}`}
                title={tag.description ?? undefined}
                className="inline-flex items-center rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                #{tag.slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
