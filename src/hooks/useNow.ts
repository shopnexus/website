"use client"

import { useEffect, useState } from "react"

/**
 * A clock that re-renders its caller on an interval.
 *
 * A countdown rendered once is a countdown that is wrong a minute later, and the order
 * screen sorts on deadlines — so the numbers on it have to move. Half a minute is fine
 * for a display counted in minutes and hours, and costs one render.
 */
export function useNow(intervalMs = 30_000): number {
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), intervalMs)
		return () => clearInterval(id)
	}, [intervalMs])

	return now
}
