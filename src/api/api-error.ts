import type { Error as ErrorEnvelope, ErrorField } from "./generated/types.gen"

/**
 * Every failure from the API, normalised into one throwable.
 *
 * The generated client throws the parsed response body as-is, which for this API is
 * `{ error: { code, message, request_id, fields? } }` — a plain object, not an Error.
 * That loses stack traces, breaks `instanceof Error`, and leaves every call site
 * digging through `err.error.code`. The error interceptor in runtime-config.ts turns
 * all of it into this.
 */
export class ApiError extends Error {
	/** Stable machine-readable code. Switch on this, never on `message`. */
	readonly code: string
	/** HTTP status, or 0 when the request never reached the server. */
	readonly status: number
	/** Per-field validation detail. Empty unless `code === "validation"`. */
	readonly fields: ReadonlyArray<ErrorField>
	/** Matches the X-Request-Id response header, for grepping server logs. */
	readonly requestId: string | undefined

	constructor(init: {
		code: string
		message: string
		status: number
		fields?: ReadonlyArray<ErrorField>
		requestId?: string
	}) {
		super(init.message)
		this.name = "ApiError"
		this.code = init.code
		this.status = init.status
		this.fields = init.fields ?? []
		this.requestId = init.requestId
	}

	/** True for the codes that mean "sign in again", which the UI treats differently. */
	get isAuthFailure(): boolean {
		return this.code === "unauthorized" || this.code === "invalid_token"
	}

	/**
	 * Field errors keyed by the dotted path the server used, ready to hand to a form.
	 * The server sends paths like `skus[0].price`, so the key matches the input name.
	 */
	get fieldErrors(): Record<string, string> {
		const out: Record<string, string> = {}
		for (const f of this.fields) {
			// First one wins: a field with two broken rules shows the first message
			// rather than concatenating two sentences into one unreadable line.
			out[f.field] ??= f.message
		}
		return out
	}
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
	if (typeof value !== "object" || value === null) return false
	const inner = (value as { error?: unknown }).error
	return (
		typeof inner === "object" &&
		inner !== null &&
		typeof (inner as { code?: unknown }).code === "string"
	)
}

/**
 * Coerce whatever the client threw into an ApiError.
 *
 * The four shapes that reach here: the error envelope above; a TypeError from fetch
 * when the network is down; an AbortError when TanStack cancels a query; and — if the
 * gateway ever fails before its own handlers run — a bare string body.
 */
export function toApiError(thrown: unknown, status: number, requestId?: string): ApiError {
	if (thrown instanceof ApiError) return thrown

	if (isErrorEnvelope(thrown)) {
		return new ApiError({
			code: thrown.error.code,
			message: thrown.error.message,
			status,
			fields: thrown.error.fields,
			requestId: thrown.error.request_id || requestId,
		})
	}

	if (thrown instanceof DOMException && thrown.name === "AbortError") {
		return new ApiError({ code: "aborted", message: "Yêu cầu đã bị huỷ.", status: 0 })
	}

	if (thrown instanceof TypeError) {
		return new ApiError({
			code: "network",
			message: "Không thể kết nối đến máy chủ.",
			status: 0,
		})
	}

	return new ApiError({
		code: status >= 500 ? "internal" : "unknown",
		message: typeof thrown === "string" && thrown ? thrown : "Đã có lỗi xảy ra.",
		status,
		requestId,
	})
}
