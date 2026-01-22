// src/app/help/page.tsx
// Help content has been consolidated into the FAQ page
import { redirect } from 'next/navigation';

export default function HelpRedirect() {
  redirect('/faq');
}
