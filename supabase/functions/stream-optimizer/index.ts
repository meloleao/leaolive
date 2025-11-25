import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreamConfig {
  id: string
  originalUrl: string
  type: 'live' | 'movie' | 'series'
  quality: 'sd' | 'hd' | 'fhd' | '4k'
  codec: 'h264' | 'h265'
  audioCodec: 'aac' | 'ac3' | 'eac3'
  protocol: 'hls' | 'dash' | 'mp4'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, streamUrl, contentId, quality = 'auto' } = await req.json()
    
    if (!streamUrl) {
      return new Response(
        JSON.stringify({ error: 'streamUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'optimize':
        const optimizedStream = await optimizeStream(streamUrl, quality)
        return new Response(
          JSON.stringify({ success: true, stream: optimizedStream }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      
      case 'transcode':
        const transcodedStream = await transcodeStream(streamUrl, quality)
        return new Response(
          JSON.stringify({ success: true, stream: transcodedStream }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      
      case 'validate':
        const validation = await validateStream(streamUrl)
        return new Response(
          JSON.stringify({ success: true, validation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      
      case 'generate-playlist':
        const playlist = await generateOptimizedPlaylist(streamUrl, contentId, quality)
        return new Response(
          JSON.stringify({ success: true, playlist }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
  } catch (error) {
    console.error('Stream optimization error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function optimizeStream(originalUrl: string, quality: string): Promise<StreamConfig> {
  // Detectar tipo de stream e codec
  const streamType = detectStreamType(originalUrl)
  const detectedCodec = await detectCodec(originalUrl)
  
  // Configurações baseadas no tipo e qualidade
  const configs = {
    live: {
      sd: { codec: 'h264', audioCodec: 'aac', bitrate: '1000k', resolution: '640x480' },
      hd: { codec: 'h264', audioCodec: 'aac', bitrate: '2500k', resolution: '1280x720' },
      fhd: { codec: 'h264', audioCodec: 'aac', bitrate: '5000k', resolution: '1920x1080' },
      '4k': { codec: 'h264', audioCodec: 'aac', bitrate: '15000k', resolution: '3840x2160' }
    },
    movie: {
      sd: { codec: 'h264', audioCodec: 'aac', bitrate: '1500k', resolution: '640x480' },
      hd: { codec: 'h264', audioCodec: 'aac', bitrate: '3000k', resolution: '1280x720' },
      fhd: { codec: 'h265', audioCodec: 'eac3', bitrate: '8000k', resolution: '1920x1080' },
      '4k': { codec: 'h265', audioCodec: 'eac3', bitrate: '25000k', resolution: '3840x2160' }
    },
    series: {
      sd: { codec: 'h264', audioCodec: 'aac', bitrate: '1200k', resolution: '640x480' },
      hd: { codec: 'h264', audioCodec: 'aac', bitrate: '2500k', resolution: '1280x720' },
      fhd: { codec: 'h265', audioCodec: 'eac3', bitrate: '6000k', resolution: '1920x1080' },
      '4k': { codec: 'h265', audioCodec: 'eac3', bitrate: '20000k', resolution: '3840x2160' }
    }
  }

  const config = configs[streamType][quality] || configs[streamType].hd
  
  return {
    id: generateStreamId(),
    originalUrl,
    type: streamType,
    quality: quality as any,
    codec: config.codec as any,
    audioCodec: config.audioCodec as any,
    protocol: 'hls'
  }
}

async function transcodeStream(streamUrl: string, quality: string): Promise<string> {
  // Simular transcodificação (em produção, integrar com FFmpeg ou serviço similar)
  const config = await optimizeStream(streamUrl, quality)
  
  // Gerar URL transcodada
  const transcodedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/transcoded/${config.id}.m3u8`
  
  return transcodedUrl
}

async function validateStream(streamUrl: string): Promise<any> {
  try {
    const response = await fetch(streamUrl, { method: 'HEAD' })
    const contentType = response.headers.get('content-type') || ''
    
    return {
      accessible: response.ok,
      contentType,
      size: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      isHLS: contentType.includes('application/vnd.apple.mpegurl') || streamUrl.includes('.m3u8'),
      isMP4: contentType.includes('video/mp4') || streamUrl.includes('.mp4'),
      isMPEGTS: contentType.includes('video/mp2t') || streamUrl.includes('.ts')
    }
  } catch (error) {
    return {
      accessible: false,
      error: error.message
    }
  }
}

async function generateOptimizedPlaylist(streamUrl: string, contentId: string, quality: string): Promise<string> {
  const config = await optimizeStream(streamUrl, quality)
  
  // Gerar playlist HLS otimizada
  const playlist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="AAC",DEFAULT=YES,AUTOSELECT=YES,URI="${streamUrl}"
#EXT-X-STREAM-INF:BANDWIDTH=${getBandwidth(quality)},RESOLUTION=${getResolution(quality)},CODECS="avc1.42E01E,mp4a.40.2"
${streamUrl}
#EXT-X-ENDLIST`

  return playlist
}

function detectStreamType(url: string): 'live' | 'movie' | 'series' {
  const lowerUrl = url.toLowerCase()
  
  if (lowerUrl.includes('live') || lowerUrl.includes('tv') || lowerUrl.includes('channel')) {
    return 'live'
  } else if (lowerUrl.includes('movie') || lowerUrl.includes('film')) {
    return 'movie'
  } else {
    return 'series'
  }
}

async function detectCodec(url: string): Promise<string> {
  // Em produção, analisar o stream para detectar codec
  return 'h264' // Default
}

function generateStreamId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getBandwidth(quality: string): number {
  const bandwidths = {
    sd: 1500000,
    hd: 3000000,
    fhd: 6000000,
    '4k': 25000000
  }
  return bandwidths[quality] || 3000000
}

function getResolution(quality: string): string {
  const resolutions = {
    sd: '640x480',
    hd: '1280x720',
    fhd: '1920x1080',
    '4k': '3840x2160'
  }
  return resolutions[quality] || '1280x720'
}