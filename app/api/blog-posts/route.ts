import { NextResponse } from 'next/server'
// rss-parser is optional; we will dynamic-import only if an RSS URL is configured

interface BlogPost {
  title: string
  description: string
  date: string
  link: string
  icon: string
}

export async function GET() {
  try {
    const rssFeedUrl = process.env.KOOWS_RSS_FEED
    
    if (!rssFeedUrl) {
      // Return default blog posts if RSS feed URL is not configured
      const defaultPosts: BlogPost[] = [
        {
          title: "How temp mail is useful for WhatsApp",
          description: "Learn how to protect your privacy when using WhatsApp with temporary emails.",
          date: "2024-01-15",
          link: "#",
          icon: "📱"
        },
        {
          title: "How to use temp mail for Amazon Prime",
          description: "Sign up for Amazon Prime trials without using your real email address.",
          date: "2024-01-10",
          link: "#",
          icon: "🛒"
        },
        {
          title: "Privacy guide using temp mail for YouTube",
          description: "Keep your YouTube account secure with temporary email addresses.",
          date: "2024-01-08",
          link: "#",
          icon: "📺"
        },
        {
          title: "Protect twitter account with temp mail",
          description: "Secure your Twitter account and avoid unwanted notifications.",
          date: "2024-01-05",
          link: "#",
          icon: "🐦"
        },
        {
          title: "Enhance Telegram usage with temp mail",
          description: "Use temporary emails to protect your Telegram account privacy.",
          date: "2024-01-03",
          link: "#",
          icon: "✈️"
        },
        {
          title: "Best temp mail options for Gmail",
          description: "Discover the best temporary email solutions for Gmail users.",
          date: "2024-01-01",
          link: "#",
          icon: "📧"
        }
      ]
      
      return NextResponse.json({ 
        success: true, 
        data: defaultPosts.slice(0, 6) 
      })
    }

    // Use rss-parser to fetch and parse the RSS feed (dynamic import)
    const { default: Parser } = await import('rss-parser')
    const parser = new Parser({
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)'
      }
    })

    const feed = await parser.parseURL(rssFeedUrl)
    
    // Convert feed items to our BlogPost format
    const posts: BlogPost[] = (feed.items || []).map((item: any) => {
      const title = item.title || 'Untitled'
      const description = item.contentSnippet || item.content || title
      const link = item.link || '#'
      const pubDate = item.pubDate || item.isoDate || new Date().toISOString()
      
      // Generate icon based on title content
      const icon = generateIconFromTitle(title)
      
      // Format date
      const formattedDate = formatDate(pubDate)
      
      return {
        title,
        description: description.length > 120 ? description.substring(0, 120) + '...' : description,
        date: formattedDate,
        link,
        icon
      }
    })
    
    // Sort by date (newest first) and return max 6 posts
    posts.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })
    
    return NextResponse.json({ 
      success: true, 
      data: posts.slice(0, 6) 
    })

  } catch (error) {
    console.error('Error fetching blog posts:', error)
    
    // Return default posts on error
    const defaultPosts: BlogPost[] = [
      {
        title: "How temp mail is useful for WhatsApp",
        description: "Learn how to protect your privacy when using WhatsApp with temporary emails.",
        date: "2024-01-15",
        link: "#",
        icon: "📱"
      },
      {
        title: "How to use temp mail for Amazon Prime",
        description: "Sign up for Amazon Prime trials without using your real email address.",
        date: "2024-01-10",
        link: "#",
        icon: "🛒"
      },
      {
        title: "Privacy guide using temp mail for YouTube",
        description: "Keep your YouTube account secure with temporary email addresses.",
        date: "2024-01-08",
        link: "#",
        icon: "📺"
      },
      {
        title: "Protect twitter account with temp mail",
        description: "Secure your Twitter account and avoid unwanted notifications.",
        date: "2024-01-05",
        link: "#",
        icon: "🐦"
      },
      {
        title: "Enhance Telegram usage with temp mail",
        description: "Use temporary emails to protect your Telegram account privacy.",
        date: "2024-01-03",
        link: "#",
        icon: "✈️"
      },
      {
        title: "Best temp mail options for Gmail",
        description: "Discover the best temporary email solutions for Gmail users.",
        date: "2024-01-01",
        link: "#",
        icon: "📧"
      }
    ]
    
    return NextResponse.json({ 
      success: true, 
      data: defaultPosts.slice(0, 6) 
    })
  }
}

function generateIconFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('whatsapp') || lowerTitle.includes('mobile') || lowerTitle.includes('phone') || lowerTitle.includes('android') || lowerTitle.includes('ios')) {
    return "📱"
  } else if (lowerTitle.includes('amazon') || lowerTitle.includes('shopping') || lowerTitle.includes('store') || lowerTitle.includes('sale') || lowerTitle.includes('deal')) {
    return "🛒"
  } else if (lowerTitle.includes('youtube') || lowerTitle.includes('video') || lowerTitle.includes('stream') || lowerTitle.includes('media')) {
    return "📺"
  } else if (lowerTitle.includes('twitter') || lowerTitle.includes('social') || lowerTitle.includes('tweet') || lowerTitle.includes('x')) {
    return "🐦"
  } else if (lowerTitle.includes('telegram') || lowerTitle.includes('message') || lowerTitle.includes('chat') || lowerTitle.includes('communication')) {
    return "✈️"
  } else if (lowerTitle.includes('gmail') || lowerTitle.includes('email') || lowerTitle.includes('mail') || lowerTitle.includes('outlook')) {
    return "📧"
  } else if (lowerTitle.includes('privacy') || lowerTitle.includes('security') || lowerTitle.includes('protect') || lowerTitle.includes('hack') || lowerTitle.includes('crypto')) {
    return "🔒"
  } else if (lowerTitle.includes('guide') || lowerTitle.includes('tutorial') || lowerTitle.includes('how') || lowerTitle.includes('learn')) {
    return "📖"
  } else if (lowerTitle.includes('ai') || lowerTitle.includes('artificial intelligence') || lowerTitle.includes('machine learning') || lowerTitle.includes('gpt') || lowerTitle.includes('claude')) {
    return "🤖"
  } else if (lowerTitle.includes('laptop') || lowerTitle.includes('computer') || lowerTitle.includes('pc') || lowerTitle.includes('desktop')) {
    return "💻"
  } else if (lowerTitle.includes('tablet') || lowerTitle.includes('ipad') || lowerTitle.includes('pad')) {
    return "📱"
  } else if (lowerTitle.includes('gaming') || lowerTitle.includes('game') || lowerTitle.includes('nvidia') || lowerTitle.includes('gpu') || lowerTitle.includes('graphics')) {
    return "🎮"
  } else if (lowerTitle.includes('react') || lowerTitle.includes('node') || lowerTitle.includes('javascript') || lowerTitle.includes('php') || lowerTitle.includes('development') || lowerTitle.includes('programming')) {
    return "💻"
  } else if (lowerTitle.includes('seo') || lowerTitle.includes('marketing') || lowerTitle.includes('blogging') || lowerTitle.includes('content')) {
    return "📈"
  } else if (lowerTitle.includes('payment') || lowerTitle.includes('gateway') || lowerTitle.includes('pay') || lowerTitle.includes('money') || lowerTitle.includes('bank')) {
    return "💰"
  } else {
    return "📝"
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  } catch (error) {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}
