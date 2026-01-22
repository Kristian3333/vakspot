// src/app/help/articles/[slug]/page.tsx
// Help articles have been consolidated into the FAQ page
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function HelpArticleRedirect({ params }: Props) {
  redirect('/faq');
}
