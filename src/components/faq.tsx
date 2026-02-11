"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqsData = [
    {
      question: 'Qu\'est-ce que le Copilote du Freelance ?',
      answer: 'Le Copilote du Freelance est votre assistant business tout-en-un qui gère autonomie commerciale, rigueur administrative et efficacité opérationnelle. Il vous fait gagner 15h par semaine en automatisant tout ce qui vous fait perdre du temps.'
    },
    {
      question: 'Comment ça fonctionne concrètement ?',
      answer: 'Vous configurez vos 3 piliers selon vos besoins : commercial (CRM, opportunités), admin (facturation, impôts) et opérationnel (planning, projets). L\'IA optimise automatiquement votre organisation au fil du temps.'
    },
    {
      question: 'Y a-t-il un essai gratuit ?',
      answer: 'Oui ✅. Vous pouvez commencer avec un plan gratuit (limité), puis passer à Pro quand vous en avez besoin.'
    },
    {
      question: 'Puis-je importer mes données existantes ?',
      answer: 'Absolument ! Migration assistée de vos clients, projets et facturations depuis Excel, Google Sheets ou autres outils. Zéro perte de données garanti.'
    },
    {
      question: 'Y a-t-il des commissions sur mon chiffre d\'affaires ?',
      answer: 'Non ❌. Contrairement aux marketplaces, nous ne prenons aucune commission sur votre CA. Vous payez juste un abonnement mensuel fixe, quel que soit votre revenu.'
    },
    {
      question: 'Qu\'est-ce que l\'autonomie commerciale ?',
      answer: 'C\'est votre liberté de trouver des clients sans dépendre des plateformes. CRM intégré, pipeline commercial, agrégateur d\'opportunités et templates pour prospecter efficacement.'
    },
    {
      question: 'Comment la rigueur administrative m\'aide-t-elle ?',
      answer: 'Facturation intelligente, calcul impôts/charges en temps réel, documents légaux automatisés. Plus de stress administratif et une situation financière/légale sécurisée.'
    },
    {
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer: 'Oui, sans engagement. Annulation en un clic depuis votre espace. Vos données restent accessibles pendant 30 jours après l\'annulation.'
    },
    {
      question: 'Est-ce adapté à mon métier de freelance ?',
      answer: 'Le Copilote est conçu pour tous les freelances digitaux : développeurs, designers, consultants, rédacteurs, community managers, etc.'
    }
  ];

  return (
    <section className='py-16 bg-white'>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="text-center mb-16">
          <p className='text-base font-medium text-yellow-500 mb-2'>FAQ</p>
          <h1 className='text-3xl md:text-4xl font-semibold text-slate-800 mb-4'>Questions sur votre Copilote</h1>
          <p className='text-lg text-slate-600 max-w-3xl mx-auto'>
            Tout ce que vous devez savoir sur votre assistant business et comment il transformera votre activité freelance.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqsData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-slate-200 hover:border-yellow-300 rounded-lg transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline px-6 py-4">
                  <span className="text-lg font-medium text-slate-800">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-base text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
