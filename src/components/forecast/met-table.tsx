// components/MetTable.tsx
'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@heroui/react'
import { Info } from 'lucide-react'
import React from 'react'

import { MetRowNormalized } from '@/lib/types'
import { fmt } from '@/lib/utils'

// Helper nhỏ để tạo tiêu đề bảng
// const TooltipHeader = ({
//   label,
//   helpText,
// }: {
//   label: string
//   helpText: string
// }) => (
//   <TableHead>
//     <div className='flex items-center gap-2 justify-end'>
//       <span>{label}</span>
//       <TooltipProvider delayDuration={100}>
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <HelpCircle className='h-4 w-4 cursor-pointer text-muted-foreground' />
//           </TooltipTrigger>
//           <TooltipContent>
//             <p>{helpText}</p>
//           </TooltipContent>
//         </Tooltip>
//       </TooltipProvider>
//     </div>
//   </TableHead>
// )

interface MetTableProps {
  rows: MetRowNormalized[]
}

export function MetTable({ rows }: MetTableProps) {
  return (
    <Table topContent='Forecast weather details'>
      <TableHeader>
        <TableColumn>Date</TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Sunlight (MJ/m²)
            <Tooltip content='Total daily sunlight energy'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Caught (MJ/m²)
            <Tooltip content='Sunlight captured by leaves'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Min temp (°C)
            <Tooltip content='Minimum temperature'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Max temp (°C)
            <Tooltip content='Maximum temperature'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Mean temp (°C)
            <Tooltip content='Mean temperature'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Air vapour (kPa)
            <Tooltip content='Air vapour pressure'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Air stress (VPD kPa)
            <Tooltip content='Vapour Pressure Deficit'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Wind (m/s)
            <Tooltip content='Wind speed'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Rain (mm)
            <Tooltip content='Rainfall'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Water loss (mm)
            <Tooltip content='Evapotranspiration (ET0)'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Light capture
            <Tooltip content='Fraction of PAR (fPAR)'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
        <TableColumn align='center'>
          <div className='flex gap-2'>
            Leaf area
            <Tooltip content='Leaf Area Index (LAI)'>
              <Info className='w-4 h-4' />
            </Tooltip>
          </div>
        </TableColumn>
      </TableHeader>
      <TableBody id='metBody'>
        {/* {isLoading && (
              <TableRow>
                <TableCell colSpan={13} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            )} */}
        {rows.map((r, i) => (
          <TableRow key={r.date || i}>
            <TableCell>{r.date ?? '-'}</TableCell>
            <TableCell>{fmt(r.PAR_MJ_m2, 1)}</TableCell>
            <TableCell>{fmt(r.APAR_MJ_m2, 1)}</TableCell>
            <TableCell>{fmt(r.TMIN_C, 1)}</TableCell>
            <TableCell>{fmt(r.TMAX_C, 1)}</TableCell>
            <TableCell>{fmt(r.TMEAN_C, 1)}</TableCell>
            <TableCell>{fmt(r.EA_KPA, 2)}</TableCell>
            <TableCell>{fmt(r.VPD_KPA, 2)}</TableCell>
            <TableCell>{fmt(r.U2_MEAN, 1)}</TableCell>
            <TableCell>{fmt(r.RAIN_MM, 1)}</TableCell>
            <TableCell>{fmt(r.ET0_mm, 1)}</TableCell>
            <TableCell>{fmt(r.fPAR, 2)}</TableCell>
            <TableCell>{fmt(r.LAI, 2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
