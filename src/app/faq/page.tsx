"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Comment fonctionne la plateforme ?",
    answer: "Notre plateforme met en relation les freelances avec des clients. Vous pouvez créer un profil, proposer vos services, et recevoir des missions directement via notre interface. Les paiements sont sécurisés et le suivi des projets est simplifié."
  },
  {
    question: "Quels sont les frais de service ?",
    answer: "Nous appliquons une commission de 10% sur chaque transaction réussie. Il n'y a aucun frais d'inscription ni d'abonnement mensuel. Vous ne payez que lorsque vous gagnez de l'argent."
  },
  {
    question: "Comment suis-je payé pour mes missions ?",
    answer: "Les paiements sont traités via notre système sécurisé. Une fois la mission validée par le client, les fonds sont transférés sur votre compte dans un délai de 2-5 jours ouvrés. Vous pouvez choisir votre mode de paiement préférée dans vos paramètres."
  },
  {
    question: "Puis-je travailler avec des clients internationaux ?",
    answer: "Oui, notre plateforme est ouverte aux clients du monde entier. Cependant, les paiements sont toujours traités en FCFA pour les freelances basés en Afrique de l'Ouest."
  },
  {
    question: "Comment puis-je améliorer mon profil ?",
    answer: "Pour améliorer votre profil, assurez-vous de compléter toutes les sections : bio, compétences, portfolio, et certifications. Les profils complets reçoivent 3x plus de propositions de missions."
  },
  {
    question: "Que faire en cas de litige avec un client ?",
    answer: "En cas de litige, notre équipe de médiation intervient rapidement. Nous examinons les communications et les livrables pour trouver une solution équitable. Notre processus de résolution est transparent et impartial."
  },
  {
    question: "Puis-je refuser une mission ?",
    answer: "Oui, vous avez le droit de refuser toute mission qui ne correspond pas à vos compétences ou à votre disponibilité. Cependant, nous recommandons de communiquer poliment et rapidement avec le client."
  },
  {
    question: "Comment fonctionnent les évaluations ?",
    answer: "Après chaque mission terminée, les deux parties peuvent laisser une évaluation. Les évaluations sont publiques et contribuent à votre réputation sur la plateforme. Une moyenne de 4 étoiles ou plus est requise pour accéder aux missions premium."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Questions Fréquemment Posées</h1>
            <p className="text-lg text-muted-foreground">
              Trouvez des réponses aux questions les plus courantes sur notre plateforme
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Vous ne trouvez pas réponse à votre question ?
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
