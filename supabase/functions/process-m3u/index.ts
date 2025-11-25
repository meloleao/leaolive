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

    // Buscar o conteúdo M3U
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.statusText}`)
    }
    
    const m3uContent = await response.text()
    
    // Processar o conteúdo M3U
    const parsedContent = parseM3U(m3uContent)
    
    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Limpar conteúdo antigo
    await supabase
      .from('content')
      .delete()
      .eq('m3u_list_id', listId)
    
    // Inserir novo conteúdo
    let channelCount = 0
    let movieCount = 0
    let seriesCount = 0
    
    for (const item of parsedContent) {
      const { data, error } = await supabase
        .from('content')
        .insert({
          m3u_list_id: listId,
          title: item.title,
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
        if (item.type === 'live') channelCount++
        else if (item.type === 'movie') movieCount++
        else if (item.type === 'series') seriesCount++
      }
    }
    
    // Atualizar a lista com as contagens
    await supabase
      .from('m3u_lists')
      .update({
        status: 'active',
        channel_count: channelCount,
        movie_count: movieCount,
        series_count: seriesCount,
        last_updated: new Date().toISOString()
      })
      .eq('id', listId)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        channelCount, 
        movieCount, 
        seriesCount,
        totalItems: parsedContent.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing M3U:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseM3U(content: string) {
  const lines = content.split('\n')
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
      const title = currentItem.title.toLowerCase()
      const group = (currentItem.groupTitle || '').toLowerCase()
      
      if (group.includes('canal') || group.includes('channel') || 
          title.includes('hd') || title.includes('sd') || 
          title.includes('4k') || group.includes('tv')) {
        currentItem.type = 'live'
      } else if (group.includes('filme') || group.includes('movie') || 
                 title.includes('filme') || title.includes('movie')) {
        currentItem.type = 'movie'
      } else if (group.includes('série') || group.includes('series') || 
                 title.includes('série') || title.includes('series') ||
                 title.includes('s') || title.includes('temp')) {
        currentItem.type = 'series'
      } else {
        // Heurística adicional
        if (title.includes('season') || title.includes('episode') || 
            title.includes('s0') || title.includes('e0')) {
          currentItem.type = 'series'
        } else if (title.match(/\d{4}/)) {
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