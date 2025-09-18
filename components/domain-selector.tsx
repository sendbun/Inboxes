import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Globe, RefreshCw } from "lucide-react"
import { useDomains } from "@/hooks/use-domains"

interface DomainSelectorProps {
  selectedDomain: string
  onDomainSelect: (domain: string) => void
  showRefresh?: boolean
  className?: string
}

export function DomainSelector({ 
  selectedDomain, 
  onDomainSelect, 
  showRefresh = true,
  className = "" 
}: DomainSelectorProps) {
  const { domains, isLoading, error, refreshDomains } = useDomains()

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <Label className="text-lg font-medium">Available Domains</Label>
        </div>
        {showRefresh && (
          <Button variant="outline" size="sm" onClick={refreshDomains} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {domains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDomain === domain.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onDomainSelect(domain.name)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{domain.name}</div>
                  <div className="text-sm text-gray-500">
                    {domain.accounts} accounts • {domain.total_emails} emails
                  </div>
                </div>
                {selectedDomain === domain.name && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No domains available. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
} 