import createMiddleware from 'next-intl/middleware'
import {supportedLocales, defaultLocale} from './lib/i18n-config'

export default createMiddleware({
	locales: Array.from(supportedLocales),
	defaultLocale
})

export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}


