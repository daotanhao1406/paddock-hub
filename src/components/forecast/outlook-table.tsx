// components/OutlookTable.tsx
'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import React from 'react'

import { OutlookRow } from '@/lib/types'

import StatusBadge from '@/components/forecast/status-badge'
import Typography from '@/components/ui/typography'

interface OutlookTableProps {
  rows: OutlookRow[]
}

export function OutlookTable({ rows }: OutlookTableProps) {
  return (
    <Table
      topContent='Plain-English outlook (next 16 days)'
      bottomContent={
        <Typography type='secondary' size='sm' className='mt-2'>
          Green = good conditions, Amber = watch, Red = limiting. “Overall”
          blends these signals.
        </Typography>
      }
    >
      <TableHeader>
        <TableColumn>Date</TableColumn>
        <TableColumn align='center'>Sunlight</TableColumn>
        <TableColumn align='center'>Rain</TableColumn>
        <TableColumn align='center'>Water Loss</TableColumn>
        <TableColumn align='center'>Air Stress</TableColumn>
        <TableColumn align='center'>Overall</TableColumn>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={r.date || i}>
            <TableCell>{r.date}</TableCell>
            <TableCell>
              <StatusBadge text={r.sunlight} />
            </TableCell>
            <TableCell>
              <StatusBadge text={r.rain} />
            </TableCell>
            <TableCell>
              <StatusBadge text={r.drying} />
            </TableCell>
            <TableCell>
              <StatusBadge text={r.aird} />
            </TableCell>
            <TableCell>
              <StatusBadge text={r.overall} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
