import Image from 'next/image'
import React from 'react'

function Loading() {
  return (
    <div className='flex justify-center place-content-center h-full'>
        <div className='flex gap-4 items-center'>
          <Image src='/loading.svg' width={36} height={36} alt='loading-icon' />
          <span>Loading</span>
        </div>
    </div>)
}

export default Loading
