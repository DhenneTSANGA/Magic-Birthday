"use server"

import { hash } from "bcrypt"
import prisma from "@/lib/prisma"

// Type pour la réponse de la fonction
type UserResponse = {
    success: boolean;
    error?: string;
    user?: any;
}

export async function checkAndAddUser(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
): Promise<UserResponse> {
    // Validation des entrées
    if(!email?.trim() || !firstName?.trim() || !lastName?.trim() || !password?.trim()) {
        return { 
            success: false, 
            error: "Tous les champs sont obligatoires" 
        }
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return {
            success: false,
            error: "Format d'email invalide"
        }
    }

    // Validation de la longueur du mot de passe
    if (password.length < 8) {
        return {
            success: false,
            error: "Le mot de passe doit contenir au moins 8 caractères"
        }
    }
    
    try {
        // Vérification si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { 
                email: email.toLowerCase() // Normalisation de l'email
            }
        })
        
        if(existingUser) {
            return { 
                success: false, 
                error: "Un compte existe déjà avec cet email" 
            }
        }
        
        // Hashage du mot de passe
        const hashedPassword = await hash(password, 10)
        
        // Création de l'utilisateur
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                // On exclut le mot de passe des données retournées
            }
        })
        
        return { 
            success: true, 
            user: newUser 
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error)
        return { 
            success: false, 
            error: "Une erreur est survenue lors de la création du compte" 
        }
    }
}
