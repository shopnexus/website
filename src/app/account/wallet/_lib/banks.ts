/**
 * Bank codes offered as suggestions, not as the allowed set.
 *
 * The server takes `bank_code` as free text up to twenty characters — it has no register
 * of banks — so this is a datalist behind a plain input rather than a select: a seller at
 * a bank nobody listed here must still be able to type its code, and a hardcoded dropdown
 * would be this app inventing a validation rule the platform does not have.
 */
export const BANK_SUGGESTIONS: ReadonlyArray<{ code: string; name: string }> = [
	{ code: "vcb", name: "Vietcombank" },
	{ code: "tcb", name: "Techcombank" },
	{ code: "mb", name: "MB Bank" },
	{ code: "acb", name: "ACB" },
	{ code: "vtb", name: "VietinBank" },
	{ code: "bidv", name: "BIDV" },
	{ code: "vpb", name: "VPBank" },
	{ code: "tpb", name: "TPBank" },
	{ code: "vib", name: "VIB" },
	{ code: "scb", name: "Sacombank" },
	{ code: "hdb", name: "HDBank" },
	{ code: "agri", name: "Agribank" },
]
