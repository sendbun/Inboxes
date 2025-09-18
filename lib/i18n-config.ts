export const supportedLocales = ["en", "es"] as const
export type AppLocale = typeof supportedLocales[number]

export const defaultLocale: AppLocale = "en"

// Lazy import messages to keep file light; we export a map for server use
// For simplicity in this project, we import eagerly from messages directory
import en from "../messages/en.json"
import es from "../messages/es.json"

export const messagesMap: Record<AppLocale, Record<string, any>> = {
	en,
	es,
}

export function isValidLocale(locale: string): locale is AppLocale {
	return (supportedLocales as readonly string[]).includes(locale)
}

export function getLocaleMessages(locale: string) {
	const safe = isValidLocale(locale) ? locale : defaultLocale
	return messagesMap[safe]
}


