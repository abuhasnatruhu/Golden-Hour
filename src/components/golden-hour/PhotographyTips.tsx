import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera } from 'lucide-react'

export const PhotographyTips = memo(function PhotographyTips() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Professional Photography Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">Golden Hour:</p>
            <p className="text-muted-foreground">
              Best for portraits, landscapes, and warm tones. The soft, directional light creates long shadows and adds depth.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Blue Hour:</p>
            <p className="text-muted-foreground">
              Perfect for cityscapes and architecture. The even lighting balances artificial lights with the twilight sky.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})