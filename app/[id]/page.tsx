// app/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import React from 'react';
export default function Page() {
  const params = useParams<{ id: string }>();
  // Use optional chaining for safety
  const id = params?.id; 

  return <div>Page {id}</div>;
}
