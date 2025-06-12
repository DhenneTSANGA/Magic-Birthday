import { PrismaClient, Event as PrismaEvent, EventStatus, EventType } from '@prisma/client'
import { supabase } from '@/utils/supabase'

const prisma = new PrismaClient()

/**
 * Génère un code unique pour un événement
 * Format: 6 caractères alphanumériques en majuscules
 * Exemple: "ABC123"
 */
export function generateEventCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let code = '';
    
    // Générer un code aléatoire
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    
    return code;
}

/**
 * Vérifie si un code d'événement est valide
 * @param code Le code à vérifier
 * @returns true si le code est valide, false sinon
 */
export function isValidEventCode(code: string): boolean {
    // Le code doit être composé de 6 caractères alphanumériques en majuscules
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(code);
}

/**
 * Formate une date pour l'affichage
 * @param date La date à formater
 * @returns La date formatée en français
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Interface pour les données d'un événement
 */
export interface EventData {
    id: string;
    code: string;
    name: string;
    date: Date;
    time: string;
    location: string;
    description: string | null;
    type: EventType;
    status: EventStatus;
    maxGuests: number;
    userId: string;
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Types
export type CreateEventData = {
    name: string;
    date: string | Date;
    time: string;
    location: string;
    description?: string;
    type?: EventType;
    maxGuests?: number;
    userId: string;
}

export type UpdateEventData = Partial<CreateEventData> & {
  status?: EventStatus
}

/**
 * Vérifie si l'utilisateur existe et le crée si nécessaire
 * @param userId L'ID de l'utilisateur Supabase
 * @returns L'utilisateur Prisma
 */
export async function ensureUserExists(userId: string) {
  try {
    console.log('[ensureUserExists] Début de la vérification pour userId:', userId);

    // Vérifier si l'utilisateur existe déjà dans Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('[ensureUserExists] Utilisateur Prisma existant:', prismaUser);

    if (!prismaUser) {
      console.log('[ensureUserExists] Création d\'un nouvel utilisateur dans Prisma');
      // Créer l'utilisateur dans Prisma avec un email temporaire
      prismaUser = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@temp.com`,
          firstName: 'Utilisateur',
          lastName: 'Anonyme',
          password: '', // Le mot de passe est géré par Supabase
        }
      });
      console.log('[ensureUserExists] Nouvel utilisateur Prisma créé:', prismaUser);
    }

    return prismaUser;
  } catch (error) {
    console.error('[ensureUserExists] Erreur détaillée:', {
      error,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw new Error(`Impossible de vérifier/créer l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Crée un nouvel événement dans la base de données
 * @param eventData Les données de l'événement à créer
 * @returns L'événement créé
 */
export async function createEvent(data: CreateEventData): Promise<EventData> {
    try {
        const code = generateEventCode()
        console.log('Données reçues dans createEvent:', data)

        // S'assurer que l'utilisateur existe
        const user = await ensureUserExists(data.userId);
        console.log('User data after ensureUserExists:', user);

        // S'assurer que la date est un objet Date
        const eventDate = data.date instanceof Date ? data.date : new Date(data.date)

        const event = await prisma.event.create({
            data: {
                name: data.name,
                date: eventDate,
                time: data.time,
                location: data.location,
                description: data.description || null,
                type: data.type || 'PUBLIC',
                maxGuests: data.maxGuests || 0,
                userId: data.userId,
                code,
                status: 'DRAFT',
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
        })

        console.log('Événement créé dans la base de données:', event)

        // Transformer l'événement pour correspondre à l'interface EventData
        const transformedEvent: EventData = {
            id: event.id,
            code: event.code,
            name: event.name,
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description,
            type: event.type,
            status: event.status,
            maxGuests: event.maxGuests,
            userId: event.userId,
            createdBy: {
                id: event.createdBy.id,
                firstName: event.createdBy.firstName,
                lastName: event.createdBy.lastName,
                avatar: event.createdBy.avatar,
                email: event.createdBy.email,
            },
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
        }

        return transformedEvent
    } catch (error) {
        console.error('Erreur détaillée dans createEvent:', error)
        if (error instanceof Error) {
            throw new Error(`Failed to create event: ${error.message}`)
        }
        throw new Error('Failed to create event')
    }
}

/**
 * Récupère un événement par son code
 * @param code Le code de l'événement
 * @returns L'événement ou null s'il n'existe pas
 */
export async function getEventByCode(code: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { code },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        activities: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!event) {
      throw new Error('Événement non trouvé')
    }

    console.log('Event data in getEventByCode:', event);
    console.log('Creator data in getEventByCode:', event.createdBy);

    return event
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error)
    throw error
  }
}

/**
 * Récupère les événements d'un utilisateur
 * @param userId L'ID de l'utilisateur
 * @returns La liste des événements ou un tableau vide en cas d'erreur
 */
export async function getUserEvents(userId: string): Promise<EventData[]> {
  try {
    const events = await prisma.event.findMany({
      where: { userId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            invites: true,
            activities: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return events.map(event => ({
      id: event.id,
      code: event.code,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      type: event.type,
      status: event.status,
      maxGuests: event.maxGuests,
      userId: event.userId,
      createdBy: {
        id: event.createdBy.id,
        firstName: event.createdBy.firstName,
        lastName: event.createdBy.lastName,
        avatar: event.createdBy.avatar,
        email: event.createdBy.email,
      },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return [];
  }
}

/**
 * Met à jour un événement
 * @param code Le code de l'événement
 * @param data Les données à mettre à jour
 * @returns L'événement mis à jour
 */
export async function updateEvent(code: string, data: UpdateEventData): Promise<EventData> {
  try {
    const event = await prisma.event.update({
      where: { code },
      data: {
        name: data.name,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time,
        location: data.location,
        description: data.description,
        type: data.type,
        maxGuests: data.maxGuests,
        status: data.status,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: event.id,
      code: event.code,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      type: event.type,
      status: event.status,
      maxGuests: event.maxGuests,
      userId: event.userId,
      createdBy: {
        id: event.createdBy.id,
        firstName: event.createdBy.firstName,
        lastName: event.createdBy.lastName,
        avatar: event.createdBy.avatar,
        email: event.createdBy.email,
      },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    throw new Error('Impossible de mettre à jour l\'événement');
  }
}

export async function deleteEvent(code: string): Promise<void> {
  try {
    await prisma.event.delete({
      where: { code },
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    throw new Error('Impossible de supprimer l\'événement')
  }
} 