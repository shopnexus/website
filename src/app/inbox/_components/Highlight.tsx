import { highlightParts } from "../_lib/inbox.logic"

/**
 * A label with the search term marked in it. The list filters client-side, so a row is on
 * screen because *something* in it matched — this says which part.
 */
export default function Highlight({ text, query }: { text: string; query: string }) {
	if (!query.trim()) return <>{text}</>

	return (
		<>
			{highlightParts(text, query).map((part, index) =>
				part.match ? (
					<mark
						key={index}
						className="bg-secondary-container text-on-secondary-container rounded-[3px] px-0.5"
					>
						{part.text}
					</mark>
				) : (
					<span key={index}>{part.text}</span>
				),
			)}
		</>
	)
}
