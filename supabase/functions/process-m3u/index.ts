import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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
    console.log('=== M3U Function Started ===')
    console.log('Method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    // Parse request body
    let body
    try {
      const text = await req.text()
      console.log('Raw body:', text)
      body = JSON.parse(text)
      console.log('Parsed body:', body)
    } catch (error) {
      console.error('Error parsing request body:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { listId, url } = body
    
    if (!listId || !url) {
      console.error('Missing parameters:', { listId, url })
      return new Response(
        JSON.stringify({ error: 'Missing listId or url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing list ${listId} from ${url}`)

    // Test basic fetch
    try {
      console.log('Testing fetch...')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      console.log('Fetch response:', response.status, response.statusText)
      
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `HTTP ${response.status}: ${response.statusText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const content = await response.text()
      console.log('Content length:', content.length)
      console.log('First 100 chars:', content.substring(0, 100))

      if (!content.startsWith('#EXTM3U')) {
        return new Response(
          JSON.stringify({ error: 'Invalid M3U format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Simple parse test
      const lines = content.split('\n').filter(line => line.trim())
      const itemCount = lines.filter(line => !line.startsWith('#')).length
      console.log('Found items:', itemCount)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'M3U processed successfully',
          itemCount,
          contentLength: content.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Fetch failed', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===', error)
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error',
        details: error.message || error.toString(),
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})