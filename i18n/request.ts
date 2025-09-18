import {getRequestConfig} from 'next-intl/server'
import {getLocaleMessages, isValidLocale, defaultLocale} from '../lib/i18n-config'

export default getRequestConfig(async ({locale}) => {
	const selectedLocale = isValidLocale(locale || '') ? (locale as string) : defaultLocale
	const messages = getLocaleMessages(selectedLocale)
	return {locale: selectedLocale, messages}
})


