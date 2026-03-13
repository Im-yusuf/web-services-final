// Service layer for saved listing operations.
// Ensures the referenced property exists before saving, and that
// users can only access/delete their own saved listings.
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { SaveListingInput } from '../types';

export class SavedListingService {
  // Save a property to the user's list. Throws if the property ID doesn't exist
  // or if the user has already saved this property.
  static async save(userId: string, input: SaveListingInput) {
    const property = await prisma.propertySale.findUnique({
      where: { id: input.propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    try {
      return await prisma.savedListing.create({
        data: {
          userId,
          propertyId: input.propertyId,
          notes: input.notes || null,
        },
        include: { property: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('Property already saved');
      }
      throw error;
    }
  }

  // Retrieve all saved listings for a user, most recent first
  static async getAll(userId: string) {
    return prisma.savedListing.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update the notes on a saved listing - only if it belongs to the requesting user
  static async update(userId: string, id: string, notes: string | null) {
    const listing = await prisma.savedListing.findFirst({
      where: { id, userId },
    });

    if (!listing) {
      throw new Error('Saved listing not found');
    }

    return prisma.savedListing.update({
      where: { id },
      data: { notes },
      include: { property: true },
    });
  }

  // Delete a saved listing - only if it belongs to the requesting user
  static async delete(userId: string, id: string) {
    const listing = await prisma.savedListing.findFirst({
      where: { id, userId },
    });

    if (!listing) {
      throw new Error('Saved listing not found');
    }

    return prisma.savedListing.delete({ where: { id } });
  }
}
