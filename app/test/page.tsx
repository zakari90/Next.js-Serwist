"use client"
import React from 'react'
import Testc from '../../pages/testc'
import { useState } from 'react';
function Page() {
    const [first, setfirst] = useState<number>(0)

  return (
    <div>bismi lah
        <button onClick={()=>setfirst(first+1)}>click me</button>
        <Testc id={first}
        />
    </div>
  )
}

export default Page