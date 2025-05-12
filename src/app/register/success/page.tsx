"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Calendar, Mail, Star, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"
import confetti from "canvas-confetti"

 export default function SuccessPage() {
  // Lancer le confetti lors du chargement de la page
  useEffect(() => {
    const duration = 3 * 1000 
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti depuis les côtés
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#4F46E5", "#3B82F6", "#0EA5E9", "#06B6D4"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#4F46E5", "#3B82F6", "#0EA5E9", "#06B6D4"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Animation variants pour les éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Formes décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-cyan-100 opacity-30 blur-3xl"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-xl w-full"
      >
        {/* En-tête avec badge */}
        <motion.div
          variants={itemVariants}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
        >
          Inscription réussie
        </motion.div>

        {/* Carte principale */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Bannière supérieure */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 h-3"></div>

          {/* Contenu principal */}
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center space-y-6 text-center">
              {/* Icône de succès avec animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.5,
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-30 scale-110 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg">
                  <CheckCircle className="h-14 w-14 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>

              {/* Titre et sous-titre */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Félicitations !</h1>
                <p className="text-gray-600 text-lg max-w-md leading-relaxed">
                  Votre compte professionnel a été créé avec succès. Bienvenue dans notre communauté !
                </p>
              </div>
            </div>

            {/* Cartes d'information */}
            <div className="mt-10 space-y-4">
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-gray-100 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="ml-4">
                    <h2 className="font-semibold text-lg text-gray-900">Prochaines étapes</h2>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Votre inscription est validée et votre compte est prêt à être utilisé.</span>
                      </li>
                      <li className="flex items-start">
                        <Mail className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Vous recevrez un email de confirmation avec les détails de votre compte.</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Vous serez averti en priorité avant l'ouverture officielle de la plateforme.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-indigo-100 p-6 bg-indigo-50 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                    <Shield className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div className="ml-4">
                    <h2 className="font-semibold text-lg text-gray-900">Accès anticipé</h2>
                    <p className="mt-1 text-sm text-gray-700">
                      En tant que membre fondateur, vous bénéficierez d'un mois d'essai gratuit et d'un accès exclusif à
                      toutes nos fonctionnalités premium.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-10 space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
                variants={itemVariants}
              >
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-lg shadow-md transition-all duration-300 h-14"
                >
                  <Link href="/">
                    Retour à l'accueil
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Des questions ?{" "}
                  <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                    Contactez notre équipe
                  </a>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
