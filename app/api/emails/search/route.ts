import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.API_URL
    const API_KEY = process.env.API_KEY

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const emailAccountId = searchParams.get('emailAccountId')
    const folder = searchParams.get('folder') || 'inbox'
    const query = searchParams.get('query') || ''
    const from = searchParams.get('from') || ''
    const hasAttachments = searchParams.get('hasAttachments') || ''
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'

    if (!emailAccountId) {
      return NextResponse.json(
        { error: 'Email account ID is required' },
        { status: 400 }
      )
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (folder) queryParams.append('folder', folder)
    if (query) queryParams.append('query', query)
    if (from) queryParams.append('from', from)
    if (hasAttachments) queryParams.append('hasAttachments', hasAttachments)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('limit', limit)

    const url = `${API_URL}site/messages/${emailAccountId}/search?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${API_KEY}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        messages: data.messages || data.data || [],
        pagination: data.pagination || {
          current_page: parseInt(page),
          total_pages: 1,
          total_items: 0,
          items_per_page: parseInt(limit)
        }
      })
    } else {
      return NextResponse.json(
        { error: data.error || 'Search failed', details: data },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Error searching emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 