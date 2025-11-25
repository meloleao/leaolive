import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing M3U request...')
    
    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { listId, url } = body
    
    if (!listId || !url) {
      console.error('Missing required parameters:', { listId, url })
      return new Response(
        JSON.stringify({ error: 'listId and url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing M3U list ${listId} from URL: ${url}`)

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      console.error('Invalid URL format:', url)
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch M3U content with timeout
    let response
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error fetching M3U:', error)
      return new Response(
        JSON.stringify({ error: `Failed to fetch M3U: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({ error: `HTTP ${response.status}: ${response.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    let m3uContent
    try {
      m3uContent = await response.text()
    } catch (error) {
      console.error('Error reading response text:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to read M3U content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`M3U content length: ${m3uContent.length} characters`)
    
    if (!m3uContent || !m3uContent.trim().startsWith('#EXTM3U')) {
      console.error('Invalid M3U format - content:', m3uContent.substring(0, 200))
      return new Response(
        JSON.stringify({ error: 'Invalid M3U format - must start with #EXTM3U' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse M3U content
    let parsedContent
    try {
      parsedContent = parseM3U(m3uContent)
    } catch (error) {
      console.error('Error parsing M3U:', error)
      return new Response(
        JSON.stringify({ error: `Failed to parse M3U: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Parsed ${parsedContent.length} items from M3U`)
    
    if (parsedContent.length === 0) {
      console.warn('No items found in M3U content')
      return new Response(
        JSON.stringify({ error: 'No valid items found in M3U file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Clear old content
    console.log('Clearing old content...')
    const { error: deleteError } = await supabase
      .from('content')
      .delete()
      .eq('m3u_list_id', listId)
    
    if (deleteError) {
      console.error('Error deleting old content:', deleteError)
      return new Response(
        JSON.stringify({ error: `Failed to clear old content: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Insert new content in batches
    let channelCount = 0
    let movieCount = 0
    let seriesCount = 0
    let successCount = 0
    let errorCount = 0
    
    console.log('Inserting new content...')
    
    // Process in batches of 50 to avoid timeouts
    const batchSize = 50
    for (let i = 0; i < parsedContent.length; i += batchSize) {
      const batch = parsedContent.slice(i, i + batchSize)
      
      for (const item of batch) {
        try {
          const { data, error } = await supabase
            .from('content')
            .insert({
              m3u_list_id: listId,
              title: item.title || 'Unknown',
              thumbnail: item.logo || item.tvgLogo || '/api/placeholder/200/300',
              genre: item.groupTitle || 'Sem categoria',
              stream_url: item.url,
              type: item.type,
              description: item.description || `${item.type === 'live' ? 'Canal ao vivo' : item.type === 'movie' ? 'Filme' : 'Série'}: ${item.title}`,
              year: item.year ? parseInt(item.year) : null,
              rating: item.rating || 'L',
              duration: item.duration || (item.type === 'movie' ? '2h' : '50min')
            })
          
          if (!error) {
            successCount++
            if (item.type === 'live') channelCount++
            else if (item.type === 'movie') movieCount++
            else if (item.type === 'series') seriesCount++
          } else {
            console.error('Error inserting item:', error)
            errorCount++
          }
        } catch (error) {
          console.error('Error processing item:', error)
          errorCount++
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < parsedContent.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`Successfully inserted ${successCount} items, ${errorCount} errors`)
    
    // Update the list with counts
    const { error: updateError } = await supabase
      .from('m3u_lists')
      .update({
        status: 'active',
        channel_count: channelCount,
        movie_count: movieCount,
        series_count: seriesCount,
        last_updated: new Date().toISOString()
      })
      .eq('id', listId)
    
    if (updateError) {
      console.error('Error updating list:', updateError)
      return new Response(
        JSON.stringify({ error: `Failed to update list: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`List updated successfully: ${channelCount} channels, ${movieCount} movies, ${seriesCount} series`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        channelCount, 
        movieCount, 
        seriesCount,
        totalItems: parsedContent.length,
        successCount,
        errorCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Unexpected error in process-m3u:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error occurred',
        details: error.message || error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseM3U(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  const items = []
  let currentItem = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('#EXTINF:')) {
      currentItem = {}
      
      // Extract information from EXTINF
      const infMatch = line.match(/#EXTINF:-?([^,]+),(.+)/)
      if (infMatch) {
        const attributes = infMatch[1]
        const title = infMatch[2]
        
        currentItem.title = title
        
        // Extract attributes
        const attrRegex = /(\w+)="([^"]*)"/g
        let match
        while ((match = attrRegex.exec(attributes)) !== null) {
          currentItem[match[1]] = match[2]
        }
        
        // Extract tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/)
        if (logoMatch) {
          currentItem.tvgLogo = logoMatch[1]
        }
        
        // Extract group-title
        const groupMatch = line.match(/group-title="([^"]*)"/)
        if (groupMatch) {
          currentItem.groupTitle = groupMatch[1]
        }
      }
    } else if (line && !line.startsWith('#') && currentItem) {
      // This is the stream URL
      currentItem.url = line
      
      // Determine type based on title and category
      const title = (currentItem.title || '').toLowerCase()
      const group = (currentItem.groupTitle || '').toLowerCase()
      
      if (group.includes('canal') || group.includes('channel') || 
          title.includes('hd') || title.includes('sd') || 
          title.includes('4k') || group.includes('tv') ||
          group.includes('ao vivo') || group.includes('live')) {
        currentItem.type = 'live'
      } else if (group.includes('filme') || group.includes('movie') || 
                 title.includes('filme') || title.includes('movie') ||
                 title.match(/\b(19|20)\d{2}\b/)) {
        currentItem.type = 'movie'
      } else if (group.includes('série') || group.includes('series') || 
                 title.includes('série') || title.includes('series') ||
                 title.includes('season') || title.includes('episode') || 
                 title.includes('s0') || title.includes('e0') ||
                 title.includes('temp')) {
        currentItem.type = 'series'
      } else {
        // Additional heuristics
        if (title.includes('season') || title.includes('episode') || 
            title.includes('s0') || title.includes('e0')) {
          currentItem.type = 'series'
        } else if (title.match(/\b(19|20)\d{2}\b/)) {
          currentItem.type = 'movie'
        } else {
          currentItem.type = 'live'
        }
      }
      
      // Extract year if present in title
      const yearMatch = title.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        currentItem.year = yearMatch[0]
      }
      
      // Extract rating
      if (title.includes('18') || title.includes('+18')) {
        currentItem.rating = '18'
      } else if (title.includes('16') || title.includes('+16')) {
        currentItem.rating = '16'
      } else if (title.includes('14') || title.includes('+14')) {
        currentItem.rating = '14'
      } else if (title.includes('12') || title.includes('+12')) {
        currentItem.rating = '12'
      } else if (title.includes('10') || title.includes('+10')) {
        currentItem.rating = '10'
      } else {
        currentItem.rating = 'L'
      }
      
      items.push(currentItem)
      currentItem = null
    }
  }
  
  return items
}