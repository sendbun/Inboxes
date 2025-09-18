import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, context: { params: Promise<{ accountId: string }> }) {
  try {
    const API_URL = process.env.API_URL
    const API_KEY = process.env.API_KEY
    const { accountId } = await context.params

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const url = `${API_URL}site/message/${accountId}/send`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (response.ok && data.status === true) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to send email', details: data },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 