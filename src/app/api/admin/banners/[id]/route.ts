import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bannerId = parseInt(params.id);
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
        const currentBanner = await prisma.banner.findUnique({
          where: { id: bannerId }
        });
        
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

      const banner = await prisma.banner.update({
        where: { id: bannerId },
        data: updateData,
      });

      return NextResponse.json({ success: true, banner });
    } else {
      // Handle JSON request (status toggle)
      const { title, subtitle, imageUrl, isActive, order } = await request.json();
      
      const banner = await prisma.banner.update({
        where: { id: bannerId },
        data: {
          title,
          subtitle,
          imageUrl,
          isActive,
          order,
        },
      });

      return NextResponse.json({ success: true, banner });
    }
  } catch (_error) {
    console.error('Error updating banner:', _error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bannerId = parseInt(params.id);
    
    // Get banner to delete image file
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });
    
    // Delete banner from database
    await prisma.banner.delete({
      where: { id: bannerId },
    });
    
    // Delete image file if exists
    if (banner?.imageUrl && banner.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', banner.imageUrl);
        await unlink(filePath);
      } catch (deleteError) {
        console.log('Could not delete image file:', deleteError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('Error deleting banner:', _error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}