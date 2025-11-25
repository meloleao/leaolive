export interface M3UItem {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  type: 'live' | 'movie' | 'series';
  tvgId?: string;
  tvgName?: string;
  radio?: boolean;
}

export const useM3UProcessor = () => {
  const parseM3U = async (url: string): Promise<M3UItem[]> => {
    try {
      console.log('Fetching M3U from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      console.log('M3U content length:', content.length);

      if (!content.startsWith('#EXTM3U')) {
        throw new Error('Invalid M3U format - must start with #EXTM3U');
      }

      const lines = content.split('\n');
      const items: M3UItem[] = [];
      let currentItem: Partial<M3UItem> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
          // Parse EXTINF line
          currentItem = {};
          
          // Extract name
          const nameMatch = line.match(/,(.+)$/);
          if (nameMatch) {
            currentItem.name = nameMatch[1].trim();
          }

          // Extract other attributes
          const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
          if (tvgIdMatch) currentItem.tvgId = tvgIdMatch[1];

          const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
          if (tvgNameMatch) currentItem.tvgName = tvgNameMatch[1];

          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          if (logoMatch) currentItem.logo = logoMatch[1];

          const groupMatch = line.match(/group-title="([^"]*)"/);
          if (groupMatch) currentItem.group = groupMatch[1];

          const radioMatch = line.match(/radio="([^"]*)"/);
          if (radioMatch) currentItem.radio = radioMatch[1] === 'true';

        } else if (line && !line.startsWith('#') && currentItem.name) {
          // This is the URL line
          currentItem.url = line;
          
          // Determine type based on name and group
          const name = currentItem.name.toLowerCase();
          const group = currentItem.group?.toLowerCase() || '';
          
          if (name.includes('filme') || name.includes('movie') || group.includes('filme') || group.includes('movie')) {
            currentItem.type = 'movie';
          } else if (name.includes('série') || name.includes('serie') || name.includes('season') || group.includes('série') || group.includes('serie')) {
            currentItem.type = 'series';
          } else {
            currentItem.type = 'live';
          }

          items.push(currentItem as M3UItem);
          currentItem = {};
        }
      }

      console.log(`Parsed ${items.length} items from M3U`);
      return items;

    } catch (error) {
      console.error('Error parsing M3U:', error);
      throw error;
    }
  };

  const categorizeItems = (items: M3UItem[]) => {
    const live = items.filter(item => item.type === 'live' && !item.radio);
    const movies = items.filter(item => item.type === 'movie');
    const series = items.filter(item => item.type === 'series');
    const radio = items.filter(item => item.radio);

    return {
      live,
      movies,
      series,
      radio,
      total: items.length
    };
  };

  return {
    parseM3U,
    categorizeItems
  };
};