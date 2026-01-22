// src/app/(auth)/register/page.tsx
import { redirect } from 'next/navigation';

// Redirect to home page which shows the two registration options
export default function RegisterPage() {
  redirect('/');
}
