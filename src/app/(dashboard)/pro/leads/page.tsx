// src/app/(dashboard)/pro/leads/page.tsx
import { redirect } from 'next/navigation';

// Redirect old URL to new one
export default function LeadsRedirect() {
  redirect('/pro/jobs');
}
