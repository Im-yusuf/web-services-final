import prisma from '../utils/prisma';
import { SaveListingInput } from '../types';

export class SavedListingService {
  static async save(userId: string, input: SaveListingInput) {
    const property = await prisma.propertySale.findUnique({
      where: { id: input.propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    return prisma.savedListing.create({
      data: {
        userId,
        propertyId: input.propertyId,
        notes: input.notes || null,
      },
      include: { property: true },
    });
  }

  static async getAll(userId: string) {
    return prisma.savedListing.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
  }

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
