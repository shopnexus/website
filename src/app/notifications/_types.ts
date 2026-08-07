import type { NotificationCategory } from "@/api/generated/types.gen"

/** "all" is the absence of a filter, not a category the server knows. */
export type CategoryFilter = "all" | NotificationCategory
