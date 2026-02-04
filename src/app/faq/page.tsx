"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "À quoi sert Le Copilote du Freelance ?",
    answer:
      "Le Copilote du Freelance centralise la prospection, l'organisation et l'administratif au même endroit : CRM + opportunités, suivi de projets/temps, devis/factures et pilotage des charges. L'objectif : réduire la charge mentale et te faire gagner du temps chaque semaine.",
  },
  {
    question: "Y a-t-il une commission sur mon chiffre d'affaires ?",
    answer:
      "Non. Le Copilote du Freelance fonctionne sur un abonnement SaaS : tu gardes 100% de ton chiffre d'affaires. La plateforme ne s'interpose pas dans la relation avec tes clients.",
  },
  {
    question: "La plateforme gère-t-elle les paiements à ma place ?",
    answer:
      "Non. Tu restes propriétaire de la relation client et des encaissements. Le Copilote t'aide à créer des devis/factures, suivre les statuts (envoyé, payé, en retard) et rester à jour sur ton administratif.",
  },
  {
    question: "Quels modules sont disponibles dans le dashboard ?",
    answer:
      "Tu peux naviguer entre : Prospection & CRM (pipeline, contacts, opportunités, scripts), Projets & Production (missions, documents, time tracker) et Finance & Admin (devis, factures, dépenses, charges, documents).",
  },
  {
    question: "Comment gagner du temps sur le suivi des projets ?",
    answer:
      "Utilise Projets & Production pour regrouper tes missions, documents et le suivi du temps. Le time tracker te permet de mesurer le temps passé, éviter les dérives et mieux piloter ta rentabilité.",
  },
  {
    question: "Comment suivre mes charges et mon administratif ?",
    answer:
      "Dans Finance & Admin, tu peux centraliser factures, devis, dépenses et documents. L'idée est d'avoir une vue claire sur ce qui est encaissé, ce qui manque, et ce que tu dois provisionner.",
  },
  {
    question: "J'ai un bug ou une idée : comment vous le dire ?",
    answer:
      "Va dans la page Feedback depuis le dashboard (menu). Plus ton message est précis (où, quand, ce que tu attends), plus on peut corriger/améliorer vite.",
  },
  {
    question: "Puis-je connecter des outils (agenda, etc.) ?",
    answer:
      "Oui, tu peux retrouver une page Intégrations dans le dashboard. Si tu ne vois pas l'intégration dont tu as besoin, envoie-nous une demande via Feedback.",
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Centre d’aide</h1>
            <p className="text-lg text-muted-foreground">
              Réponses rapides aux questions les plus courantes sur le dashboard
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
              Besoin d’aide sur un cas précis ?
            </p>
            <a 
              href="/dashboard/feedback" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Envoyer un feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
