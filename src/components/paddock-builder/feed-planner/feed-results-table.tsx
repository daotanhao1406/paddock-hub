// components/paddock-builder/feed-planner/feed-results-table.tsx
'use client'

import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { Loader2 } from 'lucide-react'

import { moistureBadge, proteinBadge } from '@/lib/paddock-utils'
// (Từ file utils)
import { FeedResultRow } from '@/lib/types'

import Typography from '@/components/ui/typography'

type Props = {
  results: FeedResultRow[] | null
  isLoading: boolean
}

export function FeedResultsTable({ results, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-10 text-muted-foreground'>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        Calculating...
      </div>
    )
  }

  if (!results) {
    return (
      <div className='text-center text-muted-foreground p-4'>
        Run "Calculate" to see feed results.
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className='text-center text-muted-foreground p-4'>
        No paddock data found. Try loading or drawing paddocks first.
      </div>
    )
  }

  const columns = [
    { name: 'Paddock', uid: 'name' },
    { name: 'Status', uid: 'status' },
    { name: 'Area (ha)', uid: 'area_ha' },
    { name: 'Biomass (t/ha)', uid: 'biomass_t_ha' },
    { name: 'CP (%)', uid: 'cp_pct' },
    { name: 'Veg RWC (%)', uid: 'rwc_pct' },
    { name: '	Avail. (kg)', uid: 'available_kg' },
    { name: 'DSE-days', uid: 'dse_days' },
    { name: 'Days (N head)', uid: 'days_for_n_head' },
    { name: 'Head (target days)', uid: 'head_capacity_for_target_days' },
  ]

  const renderCell = (r: FeedResultRow, columnKey: React.Key) => {
    const cellValue = r[columnKey as keyof FeedResultRow]
    const m = moistureBadge(r.rwc_pct)
    const p = proteinBadge(r.cp_pct)
    switch (columnKey) {
      case 'name':
        return (
          <div className='font-medium'>
            <div>{r.name}</div>
            <Typography type='secondary' size='xs'>
              {m.emoji} {m.text}
            </Typography>
          </div>
        )
      case 'status':
        return (
          <Chip
            size='sm'
            variant='bordered'
            color={
              r.status.cls === 'keep'
                ? 'danger'
                : r.status.cls === 'ready'
                  ? 'success'
                  : r.status.cls === 'next'
                    ? 'primary'
                    : 'warning'
            }
          >
            {r.status.emoji} {r.status.label}
          </Chip>
        )
      case 'area_ha':
        return r.area_ha.toFixed(2)
      case 'biomass_t_ha':
        return r.biomass_t_ha.toFixed(2)
      case 'cp_pct':
        return p.text
      case 'rwc_pct':
        return r.rwc_pct.toFixed(1)
      case 'available_kg':
        return r.available_kg.toLocaleString()
      case 'dse_days':
        return r.dse_days.toLocaleString()
      default:
        return <>{cellValue}</>
    }
  }

  return (
    <Table isStriped classNames={{ wrapper: 'p-0 shadow-none' }}>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align='center'>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent='No users found' items={results}>
        {(item) => (
          <TableRow key={item.name}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
