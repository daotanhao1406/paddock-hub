// components/paddock-builder/map-display/rename-dialog.tsx
'use client'

import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  initialName: string
  onSave: (newName: string) => void
  onClose: () => void
}

export function RenameDialog({ isOpen, initialName, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
    }
  }, [isOpen, initialName])

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
      onClose()
    }
  }

  return (
    <></>
    // <Dialog open={isOpen} onOpenChange={onClose}>
    //   <DialogContent className='sm:max-w-[425px]'>
    //     <DialogHeader>
    //       <DialogTitle>Rename Paddock</DialogTitle>
    //       <DialogDescription>
    //         Enter a new name for this paddock.
    //       </DialogDescription>
    //     </DialogHeader>
    //     <div className='grid gap-4 py-4'>
    //       <div className='grid grid-cols-4 items-center gap-4'>
    //         <Label htmlFor='paddock-name-modal' className='text-right'>
    //           Name
    //         </Label>
    //         <Input
    //           id='paddock-name-modal'
    //           value={name}
    //           onChange={(e) => setName(e.target.value)}
    //           className='col-span-3'
    //           autoFocus
    //           onKeyDown={(e) => e.key === 'Enter' && handleSave()}
    //         />
    //       </div>
    //     </div>
    //     <DialogFooter>
    //       <Button variant='outline' onClick={onClose}>
    //         Cancel
    //       </Button>
    //       <Button onClick={handleSave}>Save</Button>
    //     </DialogFooter>
    //   </DialogContent>
    // </Dialog>
  )
}
