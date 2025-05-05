"use server"

import { PrismaClient, UserRole, Secteur, ProfessionalInterest, CompanySize, CompanyNeed, TypeContrat } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Schéma pour les professionnels
const professionalLeadSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().min(1, "L'adresse est requise"),
  sector: z.nativeEnum(Secteur),
  professionalInterests: z.array(z.nativeEnum(ProfessionalInterest)).min(1, "Sélectionnez au moins un intérêt"),
  professionalChallenges: z.string().optional(),
  subscribedToNewsletter: z.boolean().default(false),
  referralSource: z.string().optional(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  emailVerified: z.boolean().default(false),
  contractType: z.nativeEnum(TypeContrat).optional(),
})

// Schéma pour les entreprises
const businessLeadSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().min(1, "L'adresse est requise"),
  sector: z.nativeEnum(Secteur),
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  companySize: z.nativeEnum(CompanySize),
  companyNeeds: z.array(z.nativeEnum(CompanyNeed)).min(1, "Sélectionnez au moins un besoin"),
  companyChallenges: z.string().optional(),
  subscribedToNewsletter: z.boolean().default(false),
  referralSource: z.string().optional(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  emailVerified: z.boolean().default(false),
})

export async function registerProfessional(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      sector: formData.get("sector"),
      professionalInterests: formData.getAll("professionalInterests"),
      professionalChallenges: formData.get("professionalChallenges"),
      subscribedToNewsletter: formData.get("subscribedToNewsletter") === "on",
      referralSource: formData.get("referralSource"),
      utmSource: formData.get("utmSource"),
      utmMedium: formData.get("utmMedium"),
      utmCampaign: formData.get("utmCampaign"),
      emailVerified: formData.get("emailVerified") === "true",
      contractType: formData.get("contractType"),
    }

    const validated = professionalLeadSchema.parse(rawData)

    // Déterminer le type de contrat si l'intérêt principal est l'emploi
    let typeContrat = validated.contractType || undefined

    const existingUser = await prisma.user.findUnique({
      where: { Email: validated.email },
    })

    if (existingUser) {
      const user = await prisma.user.update({
        where: { Email: validated.email },
        data: {
          Prénom: validated.firstName,
          Nom: validated.lastName,
          Téléphone_mobile: validated.phone || null,
          address: validated.address,
          sector: validated.sector,
          besoinPrincipal: ProfessionalInterest.EMPLOI,
          typeContrat: typeContrat,
          subscribedToNewsletter: validated.subscribedToNewsletter,
          referralSource: validated.referralSource || null,
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          emailVerified: validated.emailVerified,
          professionalDetails: {
            upsert: {
              create: {
                professionalInterests: validated.professionalInterests as ProfessionalInterest[],
                professionalChallenges: validated.professionalChallenges || null,
                address: validated.address,
              },
              update: {
                professionalInterests: validated.professionalInterests as ProfessionalInterest[],
                professionalChallenges: validated.professionalChallenges || null,
                address: validated.address,
              },
            },
          },
        },
      })
      return { success: true, user }
    } else {
      const user = await prisma.user.create({
        data: {
          Prénom: validated.firstName,
          Nom: validated.lastName,
          Email: validated.email,
          Téléphone_mobile: validated.phone || null,
          role: UserRole.PROFESSIONAL,
          address: validated.address,
          sector: validated.sector,
          besoinPrincipal: ProfessionalInterest.EMPLOI,
          typeContrat: typeContrat,
          subscribedToNewsletter: validated.subscribedToNewsletter,
          registeredForTrial: true,
          referralSource: validated.referralSource || null,
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          registrationDate: new Date(),
          ipAddress: "127.0.0.1",
          emailVerified: validated.emailVerified,
          professionalDetails: {
            create: {
              professionalInterests: validated.professionalInterests as ProfessionalInterest[],
              professionalChallenges: validated.professionalChallenges || null,
              address: validated.address,
            },
          },
        },
      })
      return { success: true, user }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    }
    console.error("Erreur inscription professionnel :", error)
    return { error: "Erreur lors de l'inscription. Veuillez réessayer." }
  }
}

export async function registerBusiness(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      sector: formData.get("sector"),
      companyName: formData.get("companyName"),
      companySize: formData.get("companySize"),
      companyNeeds: formData.getAll("companyNeeds"),
      companyChallenges: formData.get("companyChallenges"),
      subscribedToNewsletter: formData.get("subscribedToNewsletter") === "on",
      referralSource: formData.get("referralSource"),
      utmSource: formData.get("utmSource"),
      utmMedium: formData.get("utmMedium"),
      utmCampaign: formData.get("utmCampaign"),
      emailVerified: formData.get("emailVerified") === "true",
    }

    const validated = businessLeadSchema.parse(rawData)

    const existingUser = await prisma.user.findUnique({
      where: { Email: validated.email },
    })

    if (existingUser) {
      const user = await prisma.user.update({
        where: { Email: validated.email },
        data: {
          Prénom: validated.firstName,
          Nom: validated.lastName,
          Téléphone_mobile: validated.phone || null,
          address: validated.address,
          sector: validated.sector,
          besoinPrincipal: ProfessionalInterest.AUTRE,
          subscribedToNewsletter: validated.subscribedToNewsletter,
          referralSource: validated.referralSource || null,
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          emailVerified: validated.emailVerified,
          companyDetails: {
            upsert: {
              create: {
                companyName: validated.companyName,
                companySize: validated.companySize,
                companyNeeds: validated.companyNeeds as CompanyNeed[],
                companyChallenges: validated.companyChallenges || null,
              },
              update: {
                companyName: validated.companyName,
                companySize: validated.companySize,
                companyNeeds: validated.companyNeeds as CompanyNeed[],
                companyChallenges: validated.companyChallenges || null,
              },
            },
          },
        },
      })
      return { success: true, user }
    } else {
      const user = await prisma.user.create({
        data: {
          Prénom: validated.firstName,
          Nom: validated.lastName,
          Email: validated.email,
          Téléphone_mobile: validated.phone || null,
          role: UserRole.BUSINESS,
          address: validated.address,
          sector: validated.sector,
          besoinPrincipal: ProfessionalInterest.AUTRE,
          subscribedToNewsletter: validated.subscribedToNewsletter,
          registeredForTrial: true,
          referralSource: validated.referralSource || null,
          utmSource: validated.utmSource || null,
          utmMedium: validated.utmMedium || null,
          utmCampaign: validated.utmCampaign || null,
          registrationDate: new Date(),
          ipAddress: "127.0.0.1",
          emailVerified: validated.emailVerified,
          companyDetails: {
            create: {
              companyName: validated.companyName,
              companySize: validated.companySize,
              companyNeeds: validated.companyNeeds as CompanyNeed[],
              companyChallenges: validated.companyChallenges || null,
            },
          },
        },
      })
      return { success: true, user }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    }
    console.error("Erreur inscription entreprise :", error)
    return { error: "Erreur lors de l'inscription. Veuillez réessayer." }
  }
}

export async function verifyEmail(email: string) {
  try {
    // Envoyer l'email de vérification ici
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  } catch (error) {
    console.error("Erreur vérification email :", error)
    return { error: "Erreur lors de l'envoi du code de vérification" }
  }
}

export async function confirmVerificationCode(email: string, code: string) {
  try {
    // Vérifier le code ici
    await new Promise(resolve => setTimeout(resolve, 1000))

    await prisma.user.update({
      where: { Email: email },
      data: { emailVerified: true },
    })

    return { success: true }
  } catch (error) {
    console.error("Erreur confirmation code :", error)
    return { error: "Code de vérification invalide" }
  }
}

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || !z.string().email().safeParse(email).success) {
    return { error: "Email invalide" }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { Email: email } })

    if (existingUser) {
      await prisma.user.update({
        where: { Email: email },
        data: { subscribedToNewsletter: true },
      })
    } else {
      await prisma.user.create({
        data: {
          Email: email,
          Prénom: "",
          Nom: "",
          role: UserRole.PROFESSIONAL,
          address: "",
          sector: Secteur.AUTRE,
          besoinPrincipal: ProfessionalInterest.AUTRE,
          subscribedToNewsletter: true,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur newsletter :", error)
    return { error: "Une erreur est survenue. Veuillez réessayer." }
  }
}