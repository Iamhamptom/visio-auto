import { NextRequest, NextResponse } from 'next/server'
import type { SocialSignal } from '@/lib/types'

const MOCK_SOCIAL_SIGNALS: SocialSignal[] = [
  {
    id: 'soc-001',
    platform: 'tiktok',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@thabo_wheels',
    content: 'How much is this BMW 320d? Been looking for one in JHB area 🔥',
    engagement_count: 12,
    sentiment: 'positive',
    brand_mentioned: 'BMW',
    model_mentioned: '320d',
    area_detected: 'Johannesburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'soc-002',
    platform: 'tiktok',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@sandton_life',
    content: 'Which dealer in JHB has this GLC 300? Need one before December 🙏',
    engagement_count: 8,
    sentiment: 'positive',
    brand_mentioned: 'Mercedes-Benz',
    model_mentioned: 'GLC 300',
    area_detected: 'Sandton',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'soc-003',
    platform: 'facebook',
    signal_type: 'group_post',
    person_name: 'Mpho Sithole',
    person_handle: null,
    content: 'Looking for a reliable SUV under R400K in Pretoria. Must be low mileage, 2022 or newer. Toyota or Hyundai preferred. DMs open.',
    engagement_count: 34,
    sentiment: 'neutral',
    brand_mentioned: 'Toyota',
    model_mentioned: null,
    area_detected: 'Pretoria',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'soc-004',
    platform: 'linkedin',
    signal_type: 'job_announcement',
    person_name: 'Zanele Mkhize',
    person_handle: '@zanele-mkhize',
    content: 'Excited to start my new role as Regional Manager at Deloitte Sandton! Looking forward to this next chapter. #NewBeginnings #Deloitte',
    engagement_count: 523,
    sentiment: 'positive',
    brand_mentioned: null,
    model_mentioned: null,
    area_detected: 'Sandton',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'soc-005',
    platform: 'instagram',
    signal_type: 'engagement_spike',
    person_name: null,
    person_handle: '@luxe_pretoria',
    content: 'Liked 5 posts from Pharoah Auto in the last 24 hours — browsing GLE, GLC, and C-Class models',
    engagement_count: 5,
    sentiment: 'positive',
    brand_mentioned: 'Mercedes-Benz',
    model_mentioned: 'GLE',
    area_detected: 'Pretoria',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: 'soc-006',
    platform: 'youtube',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@JHBCarGuy',
    content: 'That M4 is insane. Any SA dealers have stock? Budget around R1.2M. Gauteng area.',
    engagement_count: 6,
    sentiment: 'positive',
    brand_mentioned: 'BMW',
    model_mentioned: 'M4',
    area_detected: 'Gauteng',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
  },
  {
    id: 'soc-007',
    platform: 'facebook',
    signal_type: 'marketplace_browse',
    person_name: 'Bongani Ndaba',
    person_handle: null,
    content: 'Browsing "Cars for Sale Gauteng" — viewed 12 Toyota Hilux listings in Centurion area in the last 3 days',
    engagement_count: 12,
    sentiment: 'neutral',
    brand_mentioned: 'Toyota',
    model_mentioned: 'Hilux',
    area_detected: 'Centurion',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
  },
  {
    id: 'soc-008',
    platform: 'tiktok',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@pta_girlie',
    content: 'I NEED this Polo GTI 😭 someone connect me with a dealer in PTA please!',
    engagement_count: 45,
    sentiment: 'positive',
    brand_mentioned: 'Volkswagen',
    model_mentioned: 'Polo GTI',
    area_detected: 'Pretoria',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'soc-009',
    platform: 'linkedin',
    signal_type: 'company_update',
    person_name: null,
    person_handle: '@grindrod-logistics',
    content: 'Grindrod Logistics expanding operations in Gauteng. Hiring 15 new drivers and looking to add to our commercial fleet.',
    engagement_count: 89,
    sentiment: 'positive',
    brand_mentioned: null,
    model_mentioned: null,
    area_detected: 'Johannesburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
  },
  {
    id: 'soc-010',
    platform: 'instagram',
    signal_type: 'dm_inquiry',
    person_name: null,
    person_handle: '@real_estate_mogul_sa',
    content: 'DM to Audi Sandton: "Hi, what\'s the wait time on a new Q7? Need it by end of month."',
    engagement_count: 1,
    sentiment: 'positive',
    brand_mentioned: 'Audi',
    model_mentioned: 'Q7',
    area_detected: 'Sandton',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
  },
  {
    id: 'soc-011',
    platform: 'facebook',
    signal_type: 'group_post',
    person_name: 'Sarah Botha',
    person_handle: null,
    content: 'Any ladies in Randburg driving a Haval Jolion? Thinking of getting one for the school run. Pros and cons?',
    engagement_count: 67,
    sentiment: 'neutral',
    brand_mentioned: 'Haval',
    model_mentioned: 'Jolion',
    area_detected: 'Randburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
  },
  {
    id: 'soc-012',
    platform: 'youtube',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@SuperCarsSA_Fan',
    content: 'Just saw one of these Porsche Cayennes in Fourways. Price in SA? Looking to finance.',
    engagement_count: 3,
    sentiment: 'positive',
    brand_mentioned: 'Porsche',
    model_mentioned: 'Cayenne',
    area_detected: 'Fourways',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
  },
  {
    id: 'soc-013',
    platform: 'tiktok',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@mzansi_whips',
    content: 'Ford Ranger Raptor or Toyota Hilux GR-S? Pretoria dealers, drop your prices below 👇',
    engagement_count: 156,
    sentiment: 'positive',
    brand_mentioned: 'Ford',
    model_mentioned: 'Ranger Raptor',
    area_detected: 'Pretoria',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
  },
  {
    id: 'soc-014',
    platform: 'facebook',
    signal_type: 'group_post',
    person_name: 'Tshepo Mokoena',
    person_handle: null,
    content: 'Just sold my house in Benoni, moving to Midstream Estate. Need a good car for the N1 commute. Budget R500-700K. SUV or crossover.',
    engagement_count: 22,
    sentiment: 'neutral',
    brand_mentioned: null,
    model_mentioned: null,
    area_detected: 'Midstream',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
  {
    id: 'soc-015',
    platform: 'instagram',
    signal_type: 'story_mention',
    person_name: null,
    person_handle: '@jozi_entrepreneur',
    content: 'Story post: Test driving at BMW Sandton today! Looking at the new X1. Thoughts?',
    engagement_count: 89,
    sentiment: 'positive',
    brand_mentioned: 'BMW',
    model_mentioned: 'X1',
    area_detected: 'Sandton',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 225).toISOString(),
  },
  {
    id: 'soc-016',
    platform: 'linkedin',
    signal_type: 'job_announcement',
    person_name: 'David Chen',
    person_handle: '@david-chen-sa',
    content: 'Relocating to Johannesburg from Hong Kong to lead the APAC expansion at Investec. Looking for housing in Sandton area. Any recommendations?',
    engagement_count: 234,
    sentiment: 'positive',
    brand_mentioned: null,
    model_mentioned: null,
    area_detected: 'Sandton',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
  },
  {
    id: 'soc-017',
    platform: 'tiktok',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@nurse_nomsa',
    content: 'Starting at Netcare Milpark next month, finally getting my own car! Any reliable hatches under R250K?',
    engagement_count: 31,
    sentiment: 'positive',
    brand_mentioned: null,
    model_mentioned: null,
    area_detected: 'Johannesburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
  },
  {
    id: 'soc-018',
    platform: 'youtube',
    signal_type: 'comment_intent',
    person_name: null,
    person_handle: '@BakkieBoss_GP',
    content: 'Need this Isuzu D-Max for my plumbing business in Boksburg. Anyone know what deposit I need?',
    engagement_count: 7,
    sentiment: 'positive',
    brand_mentioned: 'Isuzu',
    model_mentioned: 'D-Max',
    area_detected: 'Boksburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 290).toISOString(),
  },
  {
    id: 'soc-019',
    platform: 'facebook',
    signal_type: 'review_request',
    person_name: 'Fatima Patel',
    person_handle: null,
    content: 'Looking for honest reviews on Chery Tiggo 4 Pro. Husband says Chinese cars are unreliable but the price is right. We are in Laudium.',
    engagement_count: 143,
    sentiment: 'neutral',
    brand_mentioned: 'Chery',
    model_mentioned: 'Tiggo 4 Pro',
    area_detected: 'Laudium',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
  },
  {
    id: 'soc-020',
    platform: 'instagram',
    signal_type: 'engagement_spike',
    person_name: null,
    person_handle: '@ceo_of_levelling_up',
    content: 'Saved 8 Range Rover Sport posts from AutoTrader SA. Engaging with luxury car content daily for 2 weeks.',
    engagement_count: 8,
    sentiment: 'positive',
    brand_mentioned: 'Land Rover',
    model_mentioned: 'Range Rover Sport',
    area_detected: 'Johannesburg',
    language: 'en',
    is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const platform = searchParams.get('platform')
  const sentiment = searchParams.get('sentiment')
  const brand = searchParams.get('brand')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    let query = supabase.from('va_social_signals').select('*', { count: 'exact' })

    if (platform) query = query.eq('platform', platform)
    if (sentiment) query = query.eq('sentiment', sentiment)
    if (brand) query = query.ilike('brand_mentioned', `%${brand}%`)

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ signals: data, total: count })
  } catch {
    let filtered = [...MOCK_SOCIAL_SIGNALS]
    if (platform) filtered = filtered.filter((s) => s.platform === platform)
    if (sentiment) filtered = filtered.filter((s) => s.sentiment === sentiment)
    if (brand) filtered = filtered.filter((s) => s.brand_mentioned?.toLowerCase().includes(brand.toLowerCase()))

    const total = filtered.length
    const signals = filtered.slice(offset, offset + limit)

    return NextResponse.json({ signals, total })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data, error } = await supabase.from('va_social_signals').insert(body).select().single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create social signal' }, { status: 500 })
  }
}
