// components/paddock-builder/feed-planner/index.tsx
'use client'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  NumberInput,
  Select,
  SelectItem,
  Tooltip,
} from '@heroui/react'
import { Calculator, Info } from 'lucide-react'

import Typography from '@/components/ui/typography'

import { usePaddockBuilderStore } from '@/store/use-paddock-builder-store'

import { FeedResultsTable } from './feed-results-table' // (File tiếp theo)

// Component con cho Tooltip
const FormLabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string
  tooltip: string
}) => (
  <div className='flex items-center gap-1'>
    {label}
    <Tooltip className='capitalize' color='secondary' content={tooltip}>
      <Typography type='secondary'>
        <Info className='w-4 h-4' />
      </Typography>
    </Tooltip>
  </div>
)

export function FeedPlanner() {
  const { feedInputs, setFeedInput, runFeedPlanner, isLoading, feedResults } =
    usePaddockBuilderStore()

  const handleInputChange = (
    id: keyof typeof feedInputs,
    valueAsNumber: number,
  ) => {
    setFeedInput(
      id as keyof typeof feedInputs,
      isNaN(valueAsNumber) ? 0 : valueAsNumber,
    )
  }

  const handleSelectChange = (value: string) => {
    setFeedInput('dsePerHead', parseFloat(value))
  }

  return (
    <Card className='p-3'>
      <CardHeader className='font-semibold'>
        Feed Planner & Graze Status
      </CardHeader>
      <CardBody>
        {/* Form Inputs */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
          <NumberInput
            labelPlacement='outside'
            label={
              <FormLabelWithTooltip
                label='Edible Fraction'
                tooltip='Proportion of total pasture animals can actually eat (leafy; not trampled or too stemmy). Typical 0.75–0.90.'
              />
            }
            min={0}
            max={1}
            step={0.05}
            value={feedInputs.edibleFraction}
            onValueChange={(value) =>
              handleInputChange('edibleFraction', value)
            }
          />

          <NumberInput
            labelPlacement='outside'
            label={
              <FormLabelWithTooltip
                label='Utilisation'
                tooltip='Share of edible feed you plan to remove before shifting. Rotational grazing often 0.35–0.45.'
              />
            }
            min={0}
            max={1}
            step={0.05}
            value={feedInputs.utilisation}
            onValueChange={(value) => handleInputChange('utilisation', value)}
          />

          <NumberInput
            labelPlacement='outside'
            label={
              <FormLabelWithTooltip
                label='kg/DSE/day'
                tooltip='Daily intake per Dry Sheep Equivalent. “Low Gain” (~1.25) is a sensible default; raise for high growth targets.'
              />
            }
            step={0.05}
            value={feedInputs.kgPerDseDay}
            onValueChange={(value) => handleInputChange('kgPerDseDay', value)}
          />
          {/* TODO: Thêm các nút preset 'Maint', 'Low Gain' dùng <ToggleGroup> */}

          <Select
            label={
              <FormLabelWithTooltip
                label='Class (DSE/head)'
                tooltip='Converts head to total DSE load. Lactating or growing stock use more—pick the closest class.'
              />
            }
            labelPlacement='outside'
            placeholder='Select type of paddock'
            value={String(feedInputs.dsePerHead)}
            onChange={(e) => handleSelectChange(e.target.value)}
          >
            <SelectItem key='1'>Sheep – Dry (1 DSE)</SelectItem>
            <SelectItem key='1.7'>Sheep – Lact (1.7 DSE)</SelectItem>
            <SelectItem key='8'>Cattle – Dry Cow (8 DSE)</SelectItem>
            <SelectItem key='11'>Cattle – Lact Cow (11 DSE)</SelectItem>
            <SelectItem key='3.5'>Cattle – Weaner (3.5 DSE)</SelectItem>
          </Select>

          <NumberInput
            labelPlacement='outside'
            label={
              <FormLabelWithTooltip
                label='Number of Head'
                tooltip='Used to convert feed on offer into days before the paddock needs a shift. Leave 0 to ignore.'
              />
            }
            min={0}
            step={1}
            value={feedInputs.numHead}
            onValueChange={(value) => handleInputChange('numHead', value)}
          />

          <NumberInput
            labelPlacement='outside'
            label={
              <FormLabelWithTooltip
                label='Target Days'
                tooltip='Desired graze length for a paddock. We back-solve head capacity for that duration. Leave 0 to skip.'
              />
            }
            min={0}
            step={1}
            value={feedInputs.targetDays}
            onValueChange={(value) => handleInputChange('targetDays', value)}
          />
        </div>

        {/* Nút Calculate */}
        <div className='mt-6 flex justify-end'>
          <Button
            color='primary'
            onPress={runFeedPlanner}
            isLoading={isLoading.feed}
          >
            {isLoading.feed ? (
              'Calculating...'
            ) : (
              <>
                <Calculator className='h-4 w-4' /> Calculate
              </>
            )}
          </Button>
        </div>

        {/* Bảng kết quả */}
        <div className='mt-6'>
          <FeedResultsTable results={feedResults} isLoading={isLoading.feed} />
        </div>
      </CardBody>
    </Card>
  )
}
