import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, context: { params: Promise<{ accountId: string }> }) {
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

    const url = `${API_URL}site/account/${accountId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${API_KEY}`
      }
    })
    const data = await response.json()
    if (response.ok && data.status === true) {
      // Return the account and mailbox info as in your example
      return NextResponse.json({
        account: data.account || data.data?.account,
        mailbox: data.mailbox || data.data?.mailbox
      })
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch account info', details: data },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching account info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 