import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createServiceClient } from '@/lib/supabase/config'

// Initialize Gemini AI once per module
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ADD_BUTTON_MARKER = '[[add_button]]'
const MAX_HISTORY_MESSAGES = 12

type PricingContext = Record<string, unknown> | null

interface SpotContext {
  id: string
  title: string
  location: string
  description: string
  tags: string[]
  rating: number
  pricing: PricingContext
  amenities: string[]
  lat: number | null
  lng: number | null
  images: string[]
}

type DayPlanValue = Record<string, unknown>

interface ItineraryContext {
  id: string
  title: string | null
  start_date: string | null
  end_date: string | null
  days: Record<string, DayPlanValue[] | undefined> | null
}

const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(chatHistoryItemSchema).optional().default([]),
})

type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>

interface ExtractedSpot {
  id: string
  title: string
  location: string
  lat: number
  lng: number
  rating: number
  image?: string
  pricePerNight?: number
  day: number
  time?: string
}

interface DaySpots {
  [day: string]: ExtractedSpot[]
}

async function getSpotsContext(): Promise<SpotContext[]> {
  try {
    const supabase = createServiceClient()

    const { data: spots, error } = await supabase
      .from('spots')
      .select(
        'id, title, location, description, tags, rating, pricing, amenities, lat, lng, images'
      )
      .limit(50)

    if (error) {
      console.error('Error fetching spots:', error)
      return []
    }

    return (spots ?? []).map((spot) => ({
      ...spot,
      amenities: spot.amenities ?? [],
      tags: spot.tags ?? [],
      pricing: (spot.pricing as PricingContext) ?? null,
      lat: spot.lat !== null ? Number(spot.lat) : null,
      lng: spot.lng !== null ? Number(spot.lng) : null,
      images: spot.images ?? [],
    }))
  } catch (error) {
    console.error('Error in getSpotsContext:', error)
    return []
  }
}

async function getItinerariesContext(): Promise<ItineraryContext[]> {
  try {
    const supabase = createServiceClient()

    const { data: itineraries, error } = await supabase
      .from('itineraries')
      .select('id, title, start_date, end_date, days')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching itineraries:', error)
      return []
    }

    return (itineraries ?? []).map((itinerary) => ({
      ...itinerary,
      days:
        (itinerary.days as Record<
          string,
          DayPlanValue[] | undefined
        > | null) ?? null,
    }))
  } catch (error) {
    console.error('Error in getItinerariesContext:', error)
    return []
  }
}

function formatPricing(pricing: PricingContext) {
  if (!pricing || typeof pricing !== 'object') return ''
  const nightly = pricing['pricePerNight'] ?? pricing['per_night']
  const range = pricing['range']
  if (typeof nightly === 'number') {
    return ` Approx. ₱${nightly.toLocaleString()} per night.`
  }
  if (typeof range === 'string' && range.trim().length > 0) {
    return ` Price range: ${range}.`
  }
  return ''
}

function formatSpot(spot: SpotContext) {
  const tagList = spot.tags.length
    ? ` Tags: ${spot.tags.join(', ')}.`
    : ''
  const amenityList = spot.amenities.length
    ? ` Amenities: ${spot.amenities.join(', ')}.`
    : ''
  const pricingInfo = formatPricing(spot.pricing)
  return `${spot.title} (${spot.location}): ${spot.description}. Rating: ${spot.rating}/5.${tagList}${amenityList}${pricingInfo}`
}

function summarizeDayStops(value: DayPlanValue[] | undefined) {
  if (!value || value.length === 0) return null
  const summaries = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rawTitle = item['title']
      const rawName = item['name']
      const title =
        typeof rawTitle === 'string'
          ? rawTitle
          : typeof rawName === 'string'
            ? rawName
            : null
      const rawLocation = item['location']
      const location =
        typeof rawLocation === 'string' &&
        rawLocation.trim().length > 0
          ? ` (${rawLocation})`
          : ''
      const rawTime = item['time']
      const time =
        typeof rawTime === 'string' && rawTime.trim().length > 0
          ? ` at ${rawTime}`
          : ''
      if (title) {
        return `${title}${location}${time}`.trim()
      }
      return null
    })
    .filter((entry): entry is string => Boolean(entry))

  return summaries.length ? summaries.join('; ') : null
}

function formatItinerary(itinerary: ItineraryContext) {
  const period =
    itinerary.start_date && itinerary.end_date
      ? `${itinerary.start_date} to ${itinerary.end_date}`
      : 'Flexible dates'
  const daySummaries: string[] = []

  if (itinerary.days) {
    for (const [dayKey, value] of Object.entries(itinerary.days)) {
      const summary = summarizeDayStops(value)
      if (summary) {
        daySummaries.push(`Day ${dayKey}: ${summary}`)
      }
    }
  }

  const dayText = daySummaries.length
    ? daySummaries.join(' | ')
    : 'No detailed stops recorded.'

  return `${itinerary.title ?? 'Untitled Itinerary'} (${period}) -> ${dayText}`
}

function createSystemPrompt(
  spots: SpotContext[],
  itineraries: ItineraryContext[],
  budget: number | null
) {
  const spotsText = spots.length
    ? spots.map(formatSpot).join('\n')
    : 'No spots available.'

  const itinerariesText = itineraries.length
    ? itineraries.map(formatItinerary).join('\n')
    : 'No sample itineraries stored.'

  const budgetLine = budget
    ? `The user budget is approximately ₱${budget.toLocaleString()}.`
    : 'The user budget has not been provided yet.'

  return `You are Sean, an enthusiastic yet grounded travel assistant for Buenavista in the Philippines. Use the provided datasets to guide every recommendation.

Core responsibilities:
- Ask for the traveler's approximate total budget in Philippine pesos before generating a detailed itinerary. If it is still unknown, politely ask again and keep the reply short.
- Only once the budget is clear, build a concise, day-by-day itinerary that references the available spots. Derive structure inspiration from the stored itineraries when helpful.
- IMPORTANT: When mentioning a spot, use its EXACT TITLE from the available spots list below. This is crucial for our system to properly track and save the itinerary.
- Structure your itinerary clearly with "Day 1:", "Day 2:", etc. followed by the activities for that day.
- Mention why each recommended stop fits the traveler, including notable amenities and any relevant pricing hints you know from the data.
- Never invent locations, prices, or details that are not surfaced in the provided context.
- Speak in plain text only—no bullet characters, markdown, or bold formatting.
- When you are done presenting a finalized itinerary that the traveler could add to their plans, append the exact marker ${ADD_BUTTON_MARKER} at the very end of your response. Do not use that marker in any other situation.

Context data you must rely on:
${budgetLine}

Available spots:
${spotsText}

Reference itineraries:
${itinerariesText}`
}

function ensureUserAtEnd(
  history: ChatHistoryItem[],
  message: string
): ChatHistoryItem[] {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) return history
  if (history.length === 0) {
    return [{ role: 'user' as const, content: trimmedMessage }]
  }
  const last = history[history.length - 1]
  if (last.role === 'user') {
    return [
      ...history.slice(0, -1),
      { role: 'user' as const, content: trimmedMessage },
    ]
  }
  return [
    ...history,
    { role: 'user' as const, content: trimmedMessage },
  ]
}

function truncateHistory(history: ChatHistoryItem[]) {
  if (history.length <= MAX_HISTORY_MESSAGES) return history
  return history.slice(history.length - MAX_HISTORY_MESSAGES)
}

function historyToPrompt(history: ChatHistoryItem[]) {
  if (!history.length) {
    return 'No prior conversation.'
  }
  return history
    .map((entry) =>
      entry.role === 'user'
        ? `User: ${entry.content}`
        : `Assistant: ${entry.content}`
    )
    .join('\n')
}

// Match budget in formats like:
// "budget is 5000", "₱5,000", "5000 pesos", "5k budget", "my budget 10000"
const budgetPattern1 =
  /(budget|₱|php|peso|pesos)\s*(?:is|:|-|around|approximately|about|=)?\s*([\d,.]+)(\s?[kK]| thousand)?/i
// Match reverse format: "5000 PHP", "10,000 pesos budget"
const budgetPattern2 =
  /([\d,.]+)\s*([kK]|thousand)?\s*(₱|php|peso|pesos|budget)/i

function extractBudget(history: ChatHistoryItem[]) {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i]
    if (entry.role !== 'user') continue

    console.log('Checking for budget in:', entry.content)

    // Try pattern 1: "budget 5000"
    let match = entry.content.match(budgetPattern1)
    if (match) {
      console.log('Pattern 1 matched:', match)
      const raw = match[2]?.replace(/,/g, '')
      const amount = raw ? Number(raw) : NaN
      if (!Number.isNaN(amount)) {
        const multiplier = match[3]
        if (multiplier && /k|thousand/i.test(multiplier)) {
          console.log(
            'Extracted budget (with multiplier):',
            amount * 1000
          )
          return amount * 1000
        }
        console.log('Extracted budget:', amount)
        return amount
      }
    }

    // Try pattern 2: "5000 PHP"
    match = entry.content.match(budgetPattern2)
    if (match) {
      console.log('Pattern 2 matched:', match)
      const raw = match[1]?.replace(/,/g, '')
      const amount = raw ? Number(raw) : NaN
      if (!Number.isNaN(amount)) {
        const multiplier = match[2]
        if (multiplier && /k|thousand/i.test(multiplier)) {
          console.log(
            'Extracted budget (with multiplier):',
            amount * 1000
          )
          return amount * 1000
        }
        console.log('Extracted budget:', amount)
        return amount
      }
    }
  }
  console.log('No budget found in history')
  return null
}

function looksLikeItineraryPlan(text: string) {
  const normalized = text.trim()
  if (!normalized) return false

  // Exclude if it's asking for budget
  if (
    /what.{0,20}budget|how much.{0,20}budget|please.{0,20}budget/i.test(
      normalized
    )
  ) {
    return false
  }

  const hasDayCallout = /\bday\s*\d+\b/i.test(normalized)
  if (hasDayCallout) return true

  const hasItineraryKeyword =
    /\b(itinerary|travel plan|trip plan|schedule)\b/i.test(normalized)
  const hasTimeSegment =
    /\b(morning|afternoon|evening|night)\b/i.test(normalized)

  return hasItineraryKeyword && hasTimeSegment
}

function extractMentionedSpots(
  responseText: string,
  availableSpots: SpotContext[]
): DaySpots {
  const daySpots: DaySpots = {}
  const usedSpotIds = new Set<string>() // Track spots already assigned to prevent duplicates

  console.log('Extracting spots from response:', {
    responseLength: responseText.length,
    availableSpotsCount: availableSpots.length,
  })

  // Split response by day markers (e.g., "Day 1:", "Day 2:", etc.)
  const dayPattern = /Day\s+(\d+)[:\-\s]/gi
  const matches = Array.from(responseText.matchAll(dayPattern))

  console.log('Found day markers:', matches.length)

  if (matches.length === 0) {
    // No day markers found, treat entire response as Day 1
    console.log('No day markers found, treating as Day 1')
    const spots = extractSpotsFromText(
      responseText,
      availableSpots,
      1,
      usedSpotIds
    )
    if (spots.length > 0) {
      daySpots['1'] = spots
    }
  } else {
    // Process each day section
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const dayNumber = match[1]
      const startIndex = match.index! + match[0].length
      const endIndex =
        i < matches.length - 1 ? matches[i + 1].index! : undefined
      const dayText = responseText.substring(startIndex, endIndex)

      console.log(`Processing Day ${dayNumber}`, {
        startIndex,
        endIndex,
        textLength: dayText.length,
        textPreview: dayText.substring(0, 150),
      })

      const spots = extractSpotsFromText(
        dayText,
        availableSpots,
        parseInt(dayNumber, 10),
        usedSpotIds
      )

      console.log(`Day ${dayNumber} extracted ${spots.length} spots`)

      if (spots.length > 0) {
        daySpots[dayNumber] = spots
      }
    }
  }

  const totalSpots = Object.values(daySpots).reduce(
    (sum, spots) => sum + spots.length,
    0
  )
  console.log('Extracted spots by day:', {
    days: Object.keys(daySpots),
    totalSpots,
  })

  return daySpots
}

function extractSpotsFromText(
  text: string,
  availableSpots: SpotContext[],
  dayNumber: number,
  usedSpotIds: Set<string>
): ExtractedSpot[] {
  const mentioned: ExtractedSpot[] = []
  const lowerText = text.toLowerCase()

  console.log(`Searching for spots in Day ${dayNumber} text:`, {
    textLength: text.length,
    availableSpotTitles: availableSpots.map((s) => s.title),
  })

  // Try to extract time if mentioned (e.g., "9:00 AM", "morning", "afternoon")
  const extractTime = (spotTitle: string): string | undefined => {
    // Find the spot mention in the text
    const spotIndex = lowerText.indexOf(spotTitle.toLowerCase())
    if (spotIndex === -1) return undefined

    // Look for time patterns near the spot mention (within 100 chars before/after)
    const contextStart = Math.max(0, spotIndex - 50)
    const contextEnd = Math.min(text.length, spotIndex + 150)
    const context = text.substring(contextStart, contextEnd)

    // Match time patterns like "9:00 AM", "09:00", "9 AM"
    const timeMatch = context.match(
      /\b(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?\b/
    )
    if (timeMatch) {
      const hour = timeMatch[1]
      const minute = timeMatch[2] || '00'
      const period = timeMatch[3]?.toUpperCase()
      return period
        ? `${hour}:${minute} ${period}`
        : `${hour}:${minute}`
    }

    // Match general time of day
    if (context.match(/\b(morning|breakfast)\b/i)) return '08:00'
    if (context.match(/\b(lunch|noon|midday)\b/i)) return '12:00'
    if (context.match(/\b(afternoon)\b/i)) return '14:00'
    if (context.match(/\b(evening|dinner)\b/i)) return '18:00'
    if (context.match(/\b(night)\b/i)) return '20:00'

    return '09:00' // Default time
  }

  for (const spot of availableSpots) {
    // Skip if spot already used in another day
    if (usedSpotIds.has(spot.id)) {
      console.log(
        `⏭ Skipping "${spot.title}" - already used in another day`
      )
      continue
    }

    const spotTitleLower = spot.title.toLowerCase()
    const isExactMatch = lowerText.includes(spotTitleLower)

    console.log(
      `Checking spot "${spot.title}" in Day ${dayNumber}:`,
      {
        spotTitleLower,
        isExactMatch,
        hasCoordinates: spot.lat !== null && spot.lng !== null,
      }
    )

    // Only match exact spot titles (no keyword matching to avoid false positives)
    if (isExactMatch) {
      console.log(`✓ Found spot on Day ${dayNumber}:`, spot.title)

      // Skip if no valid coordinates
      if (spot.lat === null || spot.lng === null) {
        console.log('⚠ Skipping spot (no coordinates):', spot.title)
        continue
      }

      // Mark this spot as used
      usedSpotIds.add(spot.id)

      const pricePerNight =
        spot.pricing && typeof spot.pricing === 'object'
          ? ((spot.pricing['pricePerNight'] as number) ?? undefined)
          : undefined

      let mainImage =
        spot.images && spot.images.length > 0
          ? spot.images[0]
          : undefined

      // Convert relative image paths to full Supabase URLs if needed
      if (mainImage && !mainImage.startsWith('http')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const imagePath = mainImage.startsWith('/')
          ? mainImage.slice(1)
          : mainImage
        mainImage = `${supabaseUrl}/storage/v1/object/public/${imagePath}`
      }

      const time = extractTime(spot.title)

      mentioned.push({
        id: spot.id,
        title: spot.title,
        location: spot.location,
        lat: spot.lat,
        lng: spot.lng,
        rating: spot.rating,
        image: mainImage,
        pricePerNight,
        day: dayNumber,
        time,
      })
    }
  }

  return mentioned
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const json = await request.json()
    const parsed = chatRequestSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      )
    }

    const { message, history } = parsed.data

    // Trim message and content in history manually
    const trimmedMessage = message.trim()
    const trimmedHistory = history.map((item) => ({
      role: item.role,
      content: item.content.trim(),
    })) as ChatHistoryItem[]

    const combinedHistory = ensureUserAtEnd(
      trimmedHistory,
      trimmedMessage
    )
    const truncatedHistory = truncateHistory(combinedHistory)
    const detectedBudget = extractBudget(truncatedHistory)

    const [spots, itineraries] = await Promise.all([
      getSpotsContext(),
      getItinerariesContext(),
    ])

    const systemPrompt = createSystemPrompt(
      spots,
      itineraries,
      detectedBudget
    )
    const conversationPrompt = historyToPrompt(truncatedHistory)

    const prompt = `${systemPrompt}\n\nConversation so far:\n${conversationPrompt}\nAssistant:`

    const model = genAI.getGenerativeModel({
      model: 'gemma-3-27b-it',
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text() ?? ''
    const assistantMarkedAddButton =
      rawText.includes(ADD_BUTTON_MARKER)
    const messageText = rawText.replace(ADD_BUTTON_MARKER, '').trim()

    if (!messageText) {
      return NextResponse.json(
        {
          error:
            "Sorry, I couldn't generate a response right now. Please try again in a moment.",
        },
        { status: 500 }
      )
    }

    const itineraryCheck = looksLikeItineraryPlan(messageText)
    const hasBudget = detectedBudget !== null && detectedBudget > 0

    // Show button only when:
    // 1. Assistant marked it with [[add_button]]
    // 2. Message looks like an itinerary plan
    // 3. User has provided a budget
    const finalShowAddButton =
      assistantMarkedAddButton && itineraryCheck && hasBudget

    // Extract mentioned spots if we're showing the add button
    const mentionedSpots = finalShowAddButton
      ? extractMentionedSpots(messageText, spots)
      : {}

    const totalSpots = Object.values(mentionedSpots).reduce(
      (sum, daySpots) => sum + daySpots.length,
      0
    )

    // Debug logging
    console.log('Chat API Response Debug:', {
      assistantMarkedAddButton,
      itineraryCheck,
      hasBudget,
      detectedBudget,
      finalShowAddButton,
      mentionedSpotsDays: Object.keys(mentionedSpots),
      totalSpots,
      messagePreview: messageText.substring(0, 150),
    })

    return NextResponse.json({
      message: messageText,
      showAddButton: finalShowAddButton,
      detectedBudget,
      mentionedSpots: totalSpots > 0 ? mentionedSpots : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat API error:', error)

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
