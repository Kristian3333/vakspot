// src/app/categories/page.tsx
// Categories are now accessible directly via job creation form
import { redirect } from 'next/navigation';

export default function CategoriesRedirect() {
  redirect('/client/jobs/new');
}
