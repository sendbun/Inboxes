import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.API_URL
    const API_KEY = process.env.API_KEY

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const url = `${API_URL}site/account/login`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${API_KEY}`
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok && data.status === true) {
      // Return only the account information 
      return NextResponse.json({
        success: true,
        message: data.message,
        data: {
          id: data.id,
          email: data.email,
          status: data.status
        }
      })
    } else {
      return NextResponse.json(
        { error: data.error || 'Login failed', details: data },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 