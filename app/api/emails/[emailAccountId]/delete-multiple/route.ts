import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { emailAccountId: string } }
) {
  try {
    const API_URL = process.env.API_URL
    const API_KEY = process.env.API_KEY

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    const paramsData = await params;
    const emailAccountId = paramsData.emailAccountId;
    if (!emailAccountId) {
      return NextResponse.json(
        { error: 'emailAccountId is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const ids = body.ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_URL}site/message/delete-selected`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${API_KEY}`
      },
      body: JSON.stringify({
        account_id: emailAccountId,
        ids: ids
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Sendbun API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to delete emails', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error deleting multiple emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 