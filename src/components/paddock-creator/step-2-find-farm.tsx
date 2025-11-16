'use client'

import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { usePaddockStore } from '@/store/use-paddock-store'

export function Step2FindFarm() {
  const { setMapCommand } = usePaddockStore()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState(
    'Use the search below. Type an address, town, or landmark (worldwide).',
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage('Enter an address, town, or landmark.')
      return
    }
    setIsLoading(true)
    setMessage('Searching...')
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=en&addressdetails=1&polygon_geojson=0`
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!r.ok) throw new Error('Search failed')

      const res = await r.json()
      if (!res?.length) {
        setMessage('No results found.')
        return
      }

      const best = res[0]
      if (best.boundingbox?.length === 4) {
        const [s, n, w, e] = best.boundingbox.map(Number)
        setMapCommand({
          id: 'fitBounds',
          payload: [
            [s, w],
            [n, e],
          ],
        })
      } else {
        const lat = +best.lat,
          lon = +best.lon
        if (isFinite(lat) && isFinite(lon)) {
          setMapCommand({
            id: 'setView',
            payload: { center: [lat, lon], zoom: 14 },
          })
        }
      }
      setMessage(`Found: ${best.display_name}`)
    } catch {
      setMessage('Search error. Try a simpler query.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='p-3'>
      <CardHeader className='font-semibold'>2. Find your farm</CardHeader>
      <CardBody className='space-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='bordered'
            onPress={() =>
              setMapCommand({
                id: 'setView',
                payload: { center: [20, 0], zoom: 2 },
              })
            }
          >
            🌍 Focus world
          </Button>
          <Button
            variant='bordered'
            onPress={() =>
              setMapCommand({
                id: 'setView',
                payload: { center: [-25.5, 135.0], zoom: 4 },
              })
            }
          >
            📍 Focus Australia
          </Button>
        </div>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Input
            id='searchBox'
            placeholder='Search address / town / landmark…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
          />
          <Button
            color='secondary'
            onPress={handleSearch}
            isLoading={isLoading}
            className='w-full sm:w-auto'
          >
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                <Search /> Search
              </>
            )}
          </Button>
        </div>
        <p className='text-sm text-muted-foreground'>{message}</p>
      </CardBody>
    </Card>
  )
}
