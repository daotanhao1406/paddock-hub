'use client'

import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
} from '@heroui/react'

import { usePaddockStore } from '@/store/use-paddock-store'

export function Step1Details() {
  const { farmDetails, setFarmDetails } = usePaddockStore()

  return (
    <Card className='p-3'>
      <CardHeader className='font-semibold'>1. Farm details</CardHeader>
      <CardBody className='space-y-4'>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Input
              label='Paddock name'
              labelPlacement='outside'
              placeholder='e.g. Bonarby Station'
              value={farmDetails.farmName}
              onChange={(e) => setFarmDetails({ farmName: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Select
              label='Paddock type'
              labelPlacement='outside'
              placeholder='Select type of paddock'
              value={farmDetails.farmType}
              onChange={(e) => setFarmDetails({ farmType: e.target.value })}
            >
              <SelectItem key='livestock'>Livestock</SelectItem>
              <SelectItem key='cropping'>Cropping</SelectItem>
            </Select>
          </div>
        </div>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Input
              label='Your name'
              labelPlacement='outside'
              placeholder='Jane Farmer'
              autoComplete='name'
              value={farmDetails.farmerName}
              onChange={(e) => setFarmDetails({ farmerName: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Input
              label='Your email'
              labelPlacement='outside'
              type='email'
              autoComplete='email'
              placeholder='you@example.com'
              value={farmDetails.farmerEmail}
              onChange={(e) => setFarmDetails({ farmerEmail: e.target.value })}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
