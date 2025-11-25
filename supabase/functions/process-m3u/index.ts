import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { listId, url } = await req.json()
    
    if (!listId || !url) {
      return new Response(
        JSON.stringify({ error: 'listId and url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing M3U list ${listId} from URL: ${url}`)

    // Buscar o conteúdo M3U
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.status} ${response.statusText}`)
    }
    
    const m3uContent = await response.text()
    console.log(`M3U content length: ${m3uContent.length} characters`)
    
    if (!m3uContent || !m3uContent.startsWith('#EXTM3U')) {
      throw new Error('Invalid M3U format')
    }
    
    // Processar o conteúdo M3U
    const parsedContent = parseM3U(m3uContent)
    console.log(`Parsed ${parsedContent.length} items from M3U`)
    
    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Limpar conteúdo antigo
    console.log('Clearing old content...')
    const { error: deleteError } = await supabase
      .from('content')
      .delete()
      .eq('m3u_list_id', listId)
    
    if (deleteError) {
      console.error('Error deleting old content:', deleteError)
      throw deleteError
    }
    
    // Inserir novo conteúdo
    let channelCount = 0
    let movieCount = 0
    let seriesCount = 0
    let successCount = 0
    
    console.log('Inserting new content...')
    
    for (const item of parsedContent) {
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
        }
      } catch (error) {
        console.error('Error processing item:', error)
      }
    }
    
    console.log(`Successfully inserted ${successCount} items`)
    
    // Atualizar a lista com as contagens
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
      throw updateError
    }
    
    console.log(`List updated successfully: ${channelCount} channels, ${movieCount} movies, ${seriesCount} series`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        channelCount, 
        movieCount, 
        seriesCount,
        totalItems: parsedContent.length,
        successCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing M3U:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
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
      
      // Extrair informações do EXTINF
      const infMatch = line.match(/#EXTINF:-?([^,]+),(.+)/)
      if (infMatch) {
        const attributes = infMatch[1]
        const title = infMatch[2]
        
        currentItem.title = title
        
        // Extrair atributos
        const attrRegex = /(\w+)="([^"]*)"/g
        let match
        while ((match = attrRegex.exec(attributes)) !== null) {
          currentItem[match[1]] = match[2]
        }
        
        // Extrair tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/)
        if (logoMatch) {
          currentItem.tvgLogo = logoMatch[1]
        }
        
        // Extrair group-title
        const groupMatch = line.match(/group-title="([^"]*)"/)
        if (groupMatch) {
          currentItem.groupTitle = groupMatch[1]
        }
      }
    } else if (line && !line.startsWith('#') && currentItem) {
      // Esta é a URL do stream
      currentItem.url = line
      
      // Determinar o tipo baseado no título e categoria
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
        // Heurística adicional
        if (title.includes('season') || title.includes('episode') || 
            title.includes('s0') || title.includes('e0')) {
          currentItem.type = 'series'
        } else if (title.match(/\b(19|20)\d{2}\b/)) {
          currentItem.type = 'movie'
        } else {
          currentItem.type = 'live'
        }
      }
      
      // Extrair ano se presente no título
      const yearMatch = title.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        currentItem.year = yearMatch[0]
      }
      
      // Extrair classificação indicativa
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