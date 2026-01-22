// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';

// Allowed file types for different upload contexts
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALL_ALLOWED_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Handle both single file (key: 'file') and multiple files (key: 'files')
    const singleFile = formData.get('file') as File | null;
    const multipleFiles = formData.getAll('files') as File[];
    const context = formData.get('context') as string || 'jobs'; // jobs, messages, profile
    
    const files: File[] = [];
    if (singleFile) {
      files.push(singleFile);
    }
    if (multipleFiles.length > 0) {
      files.push(...multipleFiles.filter((f): f is File => f instanceof File));
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Determine allowed types based on context
    const allowedTypes = context === 'messages' ? ALL_ALLOWED_TYPES : IMAGE_TYPES;
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        const allowedExtensions = context === 'messages' 
          ? 'JPEG, PNG, WebP, GIF, PDF, DOC, DOCX'
          : 'JPEG, PNG, WebP, GIF';
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Allowed: ${allowedExtensions}` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 10MB` },
          { status: 400 }
        );
      }
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Development fallback - return placeholders
      console.warn('BLOB_READ_WRITE_TOKEN not configured, using placeholders');
      const placeholderUrls = files.map((file, index) => {
        if (file.type.startsWith('image/')) {
          return `https://placehold.co/800x600/e2e8f0/64748b?text=Upload+${index + 1}`;
        }
        return `https://placehold.co/400x200/e2e8f0/64748b?text=${file.name}`;
      });
      
      if (files.length === 1) {
        return NextResponse.json({
          url: placeholderUrls[0],
          filename: files[0].name,
        });
      }
      
      return NextResponse.json({
        urls: placeholderUrls,
        filenames: files.map(f => f.name),
      });
    }

    // Upload files to Vercel Blob
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${context}/${session.user.id}/${timestamp}-${randomSuffix}.${extension}`;

        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false,
        });

        return {
          url: blob.url,
          filename: file.name,
        };
      })
    );

    // Return single file format for backwards compatibility
    if (files.length === 1) {
      return NextResponse.json({
        url: uploadResults[0].url,
        filename: uploadResults[0].filename,
      });
    }

    // Return multiple files format
    return NextResponse.json({
      urls: uploadResults.map(r => r.url),
      filenames: uploadResults.map(r => r.filename),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file(s)' },
      { status: 500 }
    );
  }
}

// Route segment config for App Router
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
