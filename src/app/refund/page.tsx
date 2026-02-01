"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié pour contrat */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-xl md:text-2xl font-bold text-black">
            <Image 
              src="/logo.png" 
              alt="AfriLance Logo" 
              width={32} 
              height={32}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
            />
            afrilance
          </Link>
          <Link 
            href="/#footer" 
            className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
          >
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Politique de Remboursement</h1>
          <p className="text-gray-600 mt-2">Dernière mise à jour : 7 septembre 2025</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Principe Général</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                AfriLance s&apos;engage à assurer la satisfaction de ses utilisateurs. Cette politique de 
                remboursement définit les conditions dans lesquelles un remboursement peut être accordé 
                pour les services payés sur notre plateforme.
              </p>
              <p>
                Notre système de paiement sécurisé via Mobile Money et notre service de médiation 
                garantissent la protection des fonds jusqu&apos;à la livraison satisfaisante du travail.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Système de Paiement Sécurisé</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">2.1 Séquestre des fonds</h3>
              <p>
                Lorsqu&apos;un client accepte une proposition de freelance, les fonds sont automatiquement 
                placés en séquestre sur la plateforme AfriLance. Ces fonds ne sont libérés au freelance 
                qu&apos;après validation de la livraison par le client.
              </p>
              
              <h3 className="text-lg font-semibold">2.2 Protection automatique</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les fonds restent sécurisés jusqu&apos;à la fin du projet</li>
                <li>Aucun prélèvement définitif avant validation du travail</li>
                <li>Possibilité de récupération en cas de problème</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Conditions de Remboursement</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">3.1 Remboursement intégral</h3>
              <p>Un remboursement intégral est accordé dans les cas suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Non-livraison du travail dans les délais convenus</li>
                <li>Travail non conforme aux spécifications initiales</li>
                <li>Freelance qui abandonne le projet sans justification</li>
                <li>Violation grave des conditions d&apos;utilisation par le freelance</li>
                <li>Problème technique majeur empêchant la réalisation du projet</li>
              </ul>
              
              <h3 className="text-lg font-semibold">3.2 Remboursement partiel</h3>
              <p>Un remboursement partiel peut être accordé dans les cas suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Livraison partielle du travail convenu</li>
                <li>Qualité inférieure aux attentes mais travail utilisable</li>
                <li>Accord mutuel entre client et freelance</li>
                <li>Résolution amiable avec compensation</li>
              </ul>
              
              <h3 className="text-lg font-semibold">3.3 Cas d&apos;exclusion</h3>
              <p>Aucun remboursement ne sera accordé dans les cas suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Changement d&apos;avis du client après validation du travail</li>
                <li>Demandes non spécifiées dans le cahier des charges initial</li>
                <li>Problèmes liés à l&apos;utilisation du travail livré</li>
                <li>Délais dépassés dus au client (retard de feedback, etc.)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Procédure de Demande</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">4.1 Étapes à suivre</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Tentative de résolution amiable avec le freelance</li>
                <li>Ouverture d&apos;un litige via l&apos;interface de la plateforme</li>
                <li>Fourniture des éléments justificatifs</li>
                <li>Médiation par l&apos;équipe AfriLance</li>
                <li>Décision finale et traitement du remboursement</li>
              </ol>
              
              <h3 className="text-lg font-semibold">4.2 Documents requis</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Historique des communications avec le freelance</li>
                <li>Cahier des charges initial et modifications</li>
                <li>Preuves de non-conformité ou de non-livraison</li>
                <li>Captures d&apos;écran et fichiers pertinents</li>
              </ul>
              
              <h3 className="text-lg font-semibold">4.3 Délais</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Demande de litige :</strong> Maximum 7 jours après la date de livraison prévue</li>
                <li><strong>Traitement :</strong> 5 à 10 jours ouvrés selon la complexité</li>
                <li><strong>Remboursement :</strong> 3 à 5 jours ouvrés après décision favorable</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Processus de Médiation</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">5.1 Équipe de médiation</h3>
              <p>
                Notre équipe de médiation experte examine chaque litige de manière impartiale en 
                s&apos;appuyant sur les preuves fournies par les deux parties.
              </p>
              
              <h3 className="text-lg font-semibold">5.2 Critères d&apos;évaluation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Conformité aux spécifications initiales</li>
                <li>Respect des délais convenus</li>
                <li>Qualité du travail livré</li>
                <li>Communication entre les parties</li>
                <li>Bonne foi des intervenants</li>
              </ul>
              
              <h3 className="text-lg font-semibold">5.3 Solutions proposées</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remboursement intégral ou partiel</li>
                <li>Demande de correction du travail</li>
                <li>Compensation financière</li>
                <li>Résiliation du contrat</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Modalités de Remboursement</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">6.1 Méthodes de remboursement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Retour sur le compte Mobile Money utilisé pour le paiement</li>
                <li>Crédit sur le portefeuille AfriLance</li>
                <li>Virement bancaire (selon les cas)</li>
              </ul>
              
              <h3 className="text-lg font-semibold">6.2 Frais de remboursement</h3>
              <p>
                Les frais de transaction liés au remboursement sont à la charge d&apos;AfriLance 
                lorsque le remboursement est justifié par une faute du freelance ou de la plateforme.
              </p>
              
              <h3 className="text-lg font-semibold">6.3 Commissions</h3>
              <p>
                En cas de remboursement intégral justifié, les commissions prélevées par AfriLance 
                sont également remboursées au client.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prévention des Litiges</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-semibold">7.1 Bonnes pratiques</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Définir clairement les attentes et livrables</li>
                <li>Établir un calendrier réaliste</li>
                <li>Maintenir une communication régulière</li>
                <li>Valider les étapes intermédiaires</li>
                <li>Utiliser les outils de la plateforme</li>
              </ul>
              
              <h3 className="text-lg font-semibold">7.2 Outils disponibles</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Système de jalons (milestones)</li>
                <li>Messagerie intégrée</li>
                <li>Partage de fichiers sécurisé</li>
                <li>Suivi de progression</li>
                <li>Évaluations et commentaires</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Garantie de Satisfaction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                AfriLance s&apos;engage à fournir une plateforme sûre et équitable pour tous ses utilisateurs. 
                Notre garantie de satisfaction inclut :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Protection des paiements via notre système de séquestre</li>
                <li>Médiation professionnelle en cas de litige</li>
                <li>Support client disponible 24h/24, 7j/7</li>
                <li>Remboursement rapide en cas de problème avéré</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact et Support</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                Pour toute question concernant notre politique de remboursement ou pour ouvrir un litige :
              </p>
              <p><strong>Responsable :</strong> Baho Philomé Evrard</p>
              <p><strong>Email support :</strong> <a href="mailto:support@afrilance.com" className="text-orange-600 hover:underline">support@afrilance.com</a></p>
              <p><strong>Email litiges :</strong> <a href="mailto:disputes@afrilance.com" className="text-orange-600 hover:underline">disputes@afrilance.com</a></p>
              <p><strong>Téléphone :</strong> +225 07 XX XX XX XX</p>
              <p><strong>WhatsApp :</strong> <a href="https://wa.me/22507XXXXXXX" className="text-orange-600 hover:underline">+225 07 XX XX XX XX</a></p>
              <p><strong>Adresse :</strong> Cocody Angré, Rue des Jardins, Abidjan, Côte d&apos;Ivoire</p>
              <p><strong>Disponibilité :</strong> 24h/24, 7j/7</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Cette politique de remboursement peut être modifiée à tout moment. Les utilisateurs 
                seront informés des changements importants par email et via la plateforme.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
