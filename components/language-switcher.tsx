"use client"

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const languageOptions = [
	{ code: 'en', label: 'English' },
	{ code: 'es', label: 'Español' },
]

export default function LanguageSwitcher() {
	const locale = useLocale()
	const t = useTranslations()
	const router = useRouter()
	const pathname = usePathname()
	const currentLabel = languageOptions.find(l => l.code === locale)?.label || locale

	const onChange = (next: string) => {
		// Replace the leading /{locale} segment
		const parts = pathname.split('/')
		parts[1] = next
		router.push(parts.join('/'))
	}

	return (
		<Select defaultValue={locale} onValueChange={onChange}>
			<SelectTrigger className="w-[140px] text-gray-900">
				<SelectValue placeholder={currentLabel} />
			</SelectTrigger>
			<SelectContent>
				{languageOptions.map((l) => (
					<SelectItem key={l.code} value={l.code}>
						{l.label} {l.code === locale ? `(${t('nav.selected')})` : ''}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}


