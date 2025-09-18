import { useState, useEffect, useCallback } from 'react'
import { loadDomains, type Domain } from '@/lib/email-service'

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDomains = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const domainsData = await loadDomains()
      setDomains(domainsData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching domains:', err)
      setError('Failed to load domains. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load domains on mount
  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const refreshDomains = useCallback(() => {
    fetchDomains()
  }, [fetchDomains])

  const getDomainById = useCallback((id: number) => {
    return domains.find(domain => domain.id === id)
  }, [domains])

  const getDomainByName = useCallback((name: string) => {
    return domains.find(domain => domain.name === name)
  }, [domains])

  return {
    domains,
    isLoading,
    error,
    lastUpdated,
    refreshDomains,
    getDomainById,
    getDomainByName
  }
} 