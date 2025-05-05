"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { registerProfessional } from "@/app/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Lock,
  Shield
} from 'lucide-react'
import { useRouter } from "next/navigation"
import EmailVerification from "@/components/email-verification"
import { z } from "zod"
import { toast } from "@/components/ui/toast"

// Schéma de validation Zod
const formSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().min(1, "Sélectionnez un secteur"),
  professionalInterests: z.array(z.string()).min(1, "Sélectionnez au moins un intérêt"),
  professionalChallenges: z.string().optional(),
  subscribedToNewsletter: z.boolean().default(false),
  referralSource: z.string().optional(),
})

interface ProfessionalFormProps {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  onStepChange?: (step: number) => void
}

export default function ProfessionalForm({ utmSource, utmMedium, utmCampaign, onStepChange }: ProfessionalFormProps) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    sector: "",
    professionalInterests: [] as string[],
    professionalChallenges: "",
    subscribedToNewsletter: false,
    referralSource: "",
  })

  useEffect(() => {
    if (onStepChange) onStepChange(step)
  }, [step, onStepChange])

  const validateStep = (stepToValidate: number) => {
    try {
      const partialSchema = 
        stepToValidate === 1 
          ? formSchema.pick({ 
              firstName: true, 
              lastName: true, 
              email: true, 
              sector: true 
            })
          : formSchema.pick({
              professionalInterests: true
            })

      partialSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
        toast("Veuillez corriger les champs marqués en rouge")
      }
      return false
    }
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      professionalInterests: checked 
        ? [...prev.professionalInterests, interest]
        : prev.professionalInterests.filter(i => i !== interest)
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateStep(step)) {
      setIsSubmitting(false)
      return
    }

    const formDataObj = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formDataObj.append(key, item))
      } else {
        formDataObj.append(key, value.toString())
      }
    })

    formDataObj.append("emailVerified", isEmailVerified.toString())
    if (utmSource) formDataObj.append("utmSource", utmSource)
    if (utmMedium) formDataObj.append("utmMedium", utmMedium)
    if (utmCampaign) formDataObj.append("utmCampaign", utmCampaign)

    try {
      const result = await registerProfessional(formDataObj)
      if (result.success) {
        router.push("/register/success")
      } else {
        toast(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      toast("Une erreur inattendue est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (!validateStep(step)) return
    
    if (step === 1 && !isEmailVerified) {
      setStep(1.5)
    } else {
      setStep(step + 1)
    }
  }

  const prevStep = () => setStep(step === 1.5 ? 1 : step - 1)

  const handleEmailVerified = () => {
    setIsEmailVerified(true)
    setStep(2)
  }

  // Design professionnel pour les étapes
  const renderProgressSteps = () => {
    const steps = [
      { number: 1, title: "Identité", icon: <User size={16} /> },
      { number: 2, title: "Profil", icon: <Briefcase size={16} /> },
      { number: 3, title: "Paiement", icon: <CreditCard size={16} /> }
    ];
    
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {steps.map((stepItem) => (
            <div key={stepItem.number} className="flex flex-col items-center z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 ${
                  step >= stepItem.number
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {step > stepItem.number ? (
                  <CheckCircle2 className="text-white" size={20} />
                ) : (
                  <div className="flex items-center justify-center">
                    {stepItem.icon}
                  </div>
                )}
              </div>
              <span className={`text-sm mt-3 font-medium transition-colors duration-300 ${
                step >= stepItem.number ? "text-blue-700" : "text-gray-500"
              }`}>
                {stepItem.title}
              </span>
            </div>
          ))}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-1">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-b from-blue-50 to-white p-8 rounded-xl">
        {step !== 1.5 && renderProgressSteps()}

        {/* Étape 1 */}
        {step === 1 && (
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <User className="mr-3 text-blue-600" size={24} />
                Informations personnelles
              </h2>
              <p className="text-gray-600 mt-2">Tous les champs marqués d'un * sont obligatoires</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium flex items-center">
                  Prénom <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={`pl-10 h-11 transition-all duration-200 ${errors.firstName ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`}
                  />
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" /> {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium flex items-center">
                  Nom <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={`pl-10 h-11 transition-all duration-200 ${errors.lastName ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`}
                  />
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" /> {errors.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`pl-10 h-11 transition-all duration-200 ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`}
                  />
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" /> {errors.email}
                  </p>
                )}
                {isEmailVerified && (
                  <p className="text-green-600 text-sm flex items-center mt-1">
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Email vérifié
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Téléphone
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                  />
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Adresse
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                  />
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sector" className="text-gray-700 font-medium flex items-center">
                  Secteur d'activité <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => setFormData({...formData, sector: value})}
                  >
                    <SelectTrigger className={`pl-10 h-11 transition-all duration-200 ${errors.sector ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`}>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="TECHNOLOGIE">Technologie</SelectItem>
                      <SelectItem value="AGRO_HALIEUTIQUE">Agro-alimentaire</SelectItem>
                      <SelectItem value="COMMERCE">Commerce</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                      <SelectItem value="SANTE">Santé</SelectItem>
                      <SelectItem value="EDUCATION">Éducation</SelectItem>
                      <SelectItem value="AUTRE">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Briefcase className="absolute left-3 top-3 text-gray-400 z-10" size={18} />
                </div>
                {errors.sector && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" /> {errors.sector}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 h-12 rounded-lg shadow-md transition-all duration-200 font-medium"
              >
                {isEmailVerified ? "Continuer" : "Vérifier l'email"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
        </div>
      )}

        {/* Étape 1.5 - Vérification email */}
        {step === 1.5 && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Mail className="mr-3 text-blue-600" size={24} />
                Vérification de votre email
              </h2>
              <p className="text-gray-600 mt-2">Nous avons besoin de vérifier votre adresse email</p>
            </div>
            <EmailVerification
              email={formData.email}
              onVerified={handleEmailVerified}
              onBack={prevStep}
            />
          </div>
        )}

        {/* Étape 2 */}
        {step === 2 && (
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Briefcase className="mr-3 text-blue-600" size={24} />
                Votre profil professionnel
              </h2>
              <p className="text-gray-600 mt-2">Parlez-nous de vos intérêts et objectifs professionnels</p>
            </div>
            
            {!isEmailVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      Veuillez vérifier votre email avant de continuer.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1.5)}
                      className="mt-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100 transition-colors duration-200"
                    >
                      Vérifier l'email
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium flex items-center">
                  Centres d'intérêt professionnels <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {["MENTORAT", "RESEAUTAGE", "EMPLOI", "FORMATION", "AUTRE"].map((interest) => (
                    <div key={interest} className="flex items-center space-x-3 p-2 hover:bg-white rounded-md transition-colors duration-200">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={formData.professionalInterests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                        className="text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <Label htmlFor={`interest-${interest}`} className="font-normal cursor-pointer">
                        {interest.charAt(0) + interest.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.professionalInterests && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="mr-1 h-4 w-4" /> {errors.professionalInterests}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalChallenges" className="text-gray-700 font-medium">
                  Défis professionnels actuels
                </Label>
                <Textarea
                  id="professionalChallenges"
                  value={formData.professionalChallenges}
                  onChange={(e) => setFormData({...formData, professionalChallenges: e.target.value})}
                  rows={4}
                  placeholder="Décrivez brièvement vos défis professionnels..."
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralSource" className="text-gray-700 font-medium">
                  Comment avez-vous entendu parler de nous ?
                </Label>
                <div className="relative">
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) => setFormData({...formData, referralSource: value})}
                  >
                    <SelectTrigger className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Sélectionnez une option" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="SOCIAL_MEDIA">Réseaux sociaux</SelectItem>
                      <SelectItem value="SEARCH">Moteur de recherche</SelectItem>
                      <SelectItem value="FRIEND">Recommandation</SelectItem>
                      <SelectItem value="EVENT">Événement</SelectItem>
                      <SelectItem value="OTHER">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Briefcase className="absolute left-3 top-3 text-gray-400 z-10" size={18} />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Checkbox
                  id="subscribedToNewsletter"
                  checked={formData.subscribedToNewsletter}
                  onCheckedChange={(checked) => setFormData({...formData, subscribedToNewsletter: checked as boolean})}
                  className="text-blue-600 border-blue-300 focus:ring-blue-500"
                />
                <Label htmlFor="subscribedToNewsletter" className="font-normal text-blue-800">
                  Je souhaite recevoir la newsletter
                </Label>
              </div>
            </div>

            <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Retour
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 h-12 rounded-lg shadow-md transition-all duration-200 font-medium"
                disabled={!isEmailVerified}
              >
                Continuer
              </Button>
            </div>
        </div>
      )}

        {/* Étape 3 */}
        {step === 3 && (
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <CreditCard className="mr-3 text-blue-600" size={24} />
                Paiement sécurisé
              </h2>
              <p className="text-gray-600 mt-2">
                Vos informations de paiement sont nécessaires pour réserver votre place
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center">
              <Shield className="text-blue-600 mr-3 flex-shrink-0" size={20} />
              <p className="text-sm text-blue-800">
                Vos informations de paiement sont sécurisées et vous ne serez pas débité pendant la période d'essai.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="cardNumber" className="text-gray-700 font-medium flex items-center">
                  Numéro de carte <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                  />
                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-gray-700 font-medium flex items-center">
                    Date d'expiration <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="expiryDate"
                      placeholder="MM/AA"
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                    />
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-gray-700 font-medium flex items-center">
                    CVV <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                    />
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-gray-700 font-medium flex items-center">
                  Nom sur la carte <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all duration-200"
                  />
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="pt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    required
                    className="mt-1 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="terms" className="font-normal text-gray-700">
                    J'accepte les{" "}
                    <Link href="#" className="text-blue-600 hover:underline font-medium">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="#" className="text-blue-600 hover:underline font-medium">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Retour
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 h-12 rounded-lg shadow-md transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Finaliser l'inscription"
                )}
              </Button>
            </div>
        </div>
      )}
      </div>
    </form>
  )
}