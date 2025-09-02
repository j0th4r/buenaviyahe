import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/config'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface SpotContext {
  id: string
  title: string
  location: string
  description: string
  tags: string[]
  rating: number
  pricing: any
  amenities: string[]
}

async function getSpotsContext(): Promise<SpotContext[]> {
  try {
    const supabase = createServiceClient()

    const { data: spots, error } = await supabase
      .from('spots')
      .select(
        'id, title, location, description, tags, rating, pricing, amenities'
      )
      .limit(50) // Limit to avoid token limits

    if (error) {
      console.error('Error fetching spots:', error)
      return []
    }

    return spots || []
  } catch (error) {
    console.error('Error in getSpotsContext:', error)
    return []
  }
}

async function getCategoriesContext() {
  try {
    const supabase = createServiceClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, price_range')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return categories || []
  } catch (error) {
    console.error('Error in getCategoriesContext:', error)
    return []
  }
}

function createSystemPrompt(spots: SpotContext[], categories: any[]) {
  const spotsText = spots
    .map(
      (spot) =>
        `${spot.title} (${spot.location}): ${spot.description}. Tags: ${spot.tags.join(', ')}. Rating: ${spot.rating}/5. Amenities: ${spot.amenities.join(', ')}.`
    )
    .join('\n')

  const categoriesText = categories
    .map(
      (cat) =>
        `${cat.name}: ${cat.description}. Price range: ${cat.price_range}.`
    )
    .join('\n')

  return `You are a helpful travel assistant for Buenavista, a beautiful destination in the Philippines. You help visitors discover amazing spots, plan their trips, and answer questions about local attractions and activities.

IMPORTANT GUIDELINES:
- Be friendly, enthusiastic, and knowledgeable about Buenavista
- Only recommend places that exist in the provided spots database
- If asked about a specific place not in the database, politely say you don't have current information about it
- Provide practical travel advice and suggestions
- Keep responses concise but informative
- Use a warm, conversational tone
- When suggesting spots, mention their location and key features

AVAILABLE SPOTS IN BUENAVISTA:
${spotsText}

AVAILABLE CATEGORIES:
${categoriesText}

When users ask about places to visit, restaurants, activities, or travel advice, use this information to provide accurate, helpful recommendations based on the actual spots available in Buenavista.`
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get context data
    const [spots, categories] = await Promise.all([
      getSpotsContext(),
      getCategoriesContext(),
    ])

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    // Create the prompt with context
    const systemPrompt = createSystemPrompt(spots, categories)
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat API error:', error)

    // Return a user-friendly error message
    return NextResponse.json(
      {
        error:
          "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        details:
          process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
