'use client'
import { useCallback, useState } from 'react'

export function useMailtoFallback() {
  const [mailtoLink, setMailtoLink] = useState<string | null>(null)

  const triggerMailtoFallback = useCallback(
    (properties: Record<string, unknown>) => {
      const { farm_name, farm_type, farmer_name, farmer_email } = properties

      const body = [
        `Hello,`,
        ``,
        `Attached is my paddocks.geojson from the Paddock Creator.`,
        `Farm name: ${farm_name || '(not provided)'}`,
        `Farm type: ${farm_type || '(not provided)'}`,
        `Name: ${farmer_name || '(not provided)'}`,
        `Email: ${farmer_email || '(not provided)'}`,
        ``,
        `Thanks.`,
      ].join('%0D%0A') // URL-encoded newlines

      const subj = encodeURIComponent('Paddock GeoJSON submission')
      const mail = `mailto:info@aigorithm.com.au?subject=${subj}&body=${body}`

      setMailtoLink(mail)
    },
    [],
  )

  const FallbackComponent = mailtoLink ? (
    <></>
  ) : // <AlertDialog open={!!mailtoLink} onOpenChange={() => setMailtoLink(null)}>
  //   <AlertDialogContent>
  //     <AlertDialogHeader>
  //       <AlertDialogTitle>
  //         Email failed to send automatically
  //       </AlertDialogTitle>
  //       <AlertDialogDescription>
  //         We couldn’t send your email automatically. Please click the link
  //         below to open your email client and attach the{' '}
  //         <strong>paddocks.geojson</strong> file that was just downloaded.
  //       </AlertDialogDescription>
  //     </AlertDialogHeader>
  //     <AlertDialogFooter>
  //       <AlertDialogCancel>Cancel</AlertDialogCancel>
  //       {/* Nút Action là một thẻ <a> được tạo kiểu như Button */}
  //       <AlertDialogAction asChild>
  //         <a href={mailtoLink} onClick={() => setMailtoLink(null)}>
  //           Email info@aigorithm.com.au
  //         </a>
  //       </AlertDialogAction>
  //     </AlertDialogFooter>
  //   </AlertDialogContent>
  // </AlertDialog>
  null

  return { triggerMailtoFallback, FallbackComponent }
}
