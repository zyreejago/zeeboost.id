import { NextRequest, NextResponse } from 'next/server';
import { Banner } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);
    const contentType = request.headers.get('content-type');
    
    // Check if it's FormData (with file upload) or JSON (status toggle)
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const title = formData.get('title') as string;
      const subtitle = formData.get('subtitle') as string;
      const isActive = formData.get('isActive') === 'true';
      const order = parseInt(formData.get('order') as string);
      const imageFile = formData.get('image') as File;

      let imageUrl: string | undefined;
      
      // If new image is uploaded
      if (imageFile && imageFile.size > 0) {
        // Get current banner to delete old image
        const currentBanner = await Banner.findById(bannerId);
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `banner_${timestamp}.${fileExtension}`;
        
        // Save new file
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
        const filePath = join(uploadsDir, fileName);
        
        try {
          await writeFile(filePath, buffer);
        } catch (writeError) {
          const { mkdir } = await import('fs/promises');
          await mkdir(uploadsDir, { recursive: true });
          await writeFile(filePath, buffer);
        }
        
        imageUrl = `/uploads/banners/${fileName}`;
        
        // Delete old image file if exists
        if (currentBanner?.imageUrl && currentBanner.imageUrl.startsWith('/uploads/')) {
          try {
            const oldFilePath = join(process.cwd(), 'public', currentBanner.imageUrl);
            await unlink(oldFilePath);
          } catch (deleteError) {
            console.log('Could not delete old image file:', deleteError);
          }
        }
      }

      const updateData: Record<string, unknown> = {
        title,
        subtitle: subtitle || null,
        isActive,
        order,
      };
      
      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      const banner = await Banner.update(bannerId, updateData);

      return NextResponse.json({ success: true, banner });
    } else {
      // Handle JSON request (status toggle)
      const { title, subtitle, imageUrl, isActive, order } = await request.json();
      
      const banner = await Banner.update(bannerId, {
        title,
        subtitle,
        imageUrl,
        isActive,
        order,
      });

      return NextResponse.json({ success: true, banner });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);
    
    // Get banner to delete image file
    const banner = await Banner.findById(bannerId);
    
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }
    
    // Delete image file if exists
    if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', banner.imageUrl);
        await unlink(filePath);
      } catch (deleteError) {
        console.log('Could not delete image file:', deleteError);
      }
    }
    
    await Banner.delete(bannerId);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}