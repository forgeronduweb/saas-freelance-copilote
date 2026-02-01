"use client";
import { useState } from "react";

interface FormData {
  fullName: string;
  email: string;
  projectType: string;
  budget: string;
  deadline: string;
  objectives: string;
  attachments: File[];
  reference: string;
}

interface FieldOption {
  value: string;
  label: string;
}

interface Field {
  name: keyof FormData;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  accept?: string;
  multiple?: boolean;
  help?: string;
}

interface Step {
  title: string;
  field: Field;
}

function QuoteRequestForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    projectType: "",
    budget: "",
    deadline: "",
    objectives: "",
    attachments: [],
    reference: ""
  });

  const steps: Step[] = [
    {
      title: "Votre nom complet",
      field: {
        name: "fullName",
        label: "Saisissez votre nom complet pour que nous puissions vous identifier",
        type: "text",
        placeholder: "Ex: Jean Dupont",
        required: true
      }
    },
    {
      title: "Votre adresse email",
      field: {
        name: "email",
        label: "Saisissez votre adresse e-mail pour recevoir les propositions des freelances",
        type: "email",
        placeholder: "votre@email.com",
        required: true
      }
    },
    {
      title: "Type de projet",
      field: {
        name: "projectType",
        label: "Sélectionnez le type de projet que vous souhaitez réaliser",
        type: "select",
        options: [
          { value: "", label: "Sélectionnez votre type de projet" },
          { value: "web-development", label: "Développement Web" },
          { value: "mobile-app", label: "Application Mobile" },
          { value: "graphic-design", label: "Design Graphique" },
          { value: "logo-branding", label: "Logo & Identité Visuelle" },
          { value: "content-writing", label: "Rédaction de Contenu" },
          { value: "translation", label: "Traduction" },
          { value: "digital-marketing", label: "Marketing Digital" },
          { value: "seo", label: "Référencement SEO" },
          { value: "video-editing", label: "Montage Vidéo" },
          { value: "other", label: "Autre (préciser dans les objectifs)" }
        ],
        required: true
      }
    },
    {
      title: "Budget estimé",
      field: {
        name: "budget",
        label: "Sélectionnez la fourchette de budget que vous avez prévue pour ce projet",
        type: "select",
        options: [
          { value: "", label: "Sélectionnez votre budget" },
          { value: "under-100k", label: "Moins de 100 000 FCFA" },
          { value: "100k-300k", label: "100 000 - 300 000 FCFA" },
          { value: "300k-500k", label: "300 000 - 500 000 FCFA" },
          { value: "500k-1m", label: "500 000 - 1 000 000 FCFA" },
          { value: "1m-2m", label: "1 000 000 - 2 000 000 FCFA" },
          { value: "over-2m", label: "Plus de 2 000 000 FCFA" },
          { value: "discuss", label: "À discuter selon les propositions" }
        ],
        required: true
      }
    },
    {
      title: "Deadline souhaitée",
      field: {
        name: "deadline",
        label: "Indiquez dans quel délai vous aimeriez que votre projet soit terminé",
        type: "select",
        options: [
          { value: "", label: "Sélectionnez votre délai préféré" },
          { value: "asap", label: "Le plus tôt possible (1-2 semaines)" },
          { value: "urgent", label: "Urgent (3-4 semaines)" },
          { value: "normal", label: "Normal (1-2 mois)" },
          { value: "relaxed", label: "Pas pressé (2-3 mois)" },
          { value: "flexible", label: "Flexible selon les propositions" }
        ],
        required: true
      }
    },
    {
      title: "Objectifs principaux",
      field: {
        name: "objectives",
        label: "Décrivez en détail vos objectifs, attentes et spécifications techniques pour ce projet",
        type: "textarea",
        placeholder: "Ex: Je souhaite créer un site e-commerce pour vendre mes produits artisanaux. Le site doit avoir un système de paiement Mobile Money, une galerie de produits, et être optimisé pour mobile...",
        required: true
      }
    },
    {
      title: "Pièces jointes",
      field: {
        name: "attachments",
        label: "Uploadez des fichiers de référence, maquettes, ou documents utiles pour votre projet",
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.rar",
        multiple: true,
        required: false,
        help: "Formats acceptés : PDF, DOC, DOCX, images (JPG, PNG, GIF), archives (ZIP, RAR). Maximum 5 fichiers de 10MB chacun."
      }
    },
    {
      title: "Référence ou exemple (optionnel)",
      field: {
        name: "reference",
        label: "Partagez des liens ou références de projets similaires qui vous inspirent",
        type: "textarea",
        placeholder: "Ex: https://exemple-site.com - J'aime le design de ce site, ou décrivez un style/fonctionnalité que vous admirez ailleurs...",
        required: false
      }
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData({
        ...formData,
        [name as keyof FormData]: Array.from(e.target.files) as any
      });
    } else {
      setFormData({
        ...formData,
        [name as keyof FormData]: value as any
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < steps.length - 1) {
      e.preventDefault();
      if (isCurrentFieldValid()) {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulation d'envoi - remplacer par l'API réelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Demande de devis enregistrée:", formData);
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error?.message || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Page de confirmation après soumission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 sm:p-12">
            {/* Icône de succès */}
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Merci pour votre demande !
            </h1>
            
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="mb-4">
                Votre projet a bien été enregistré et sera partagé avec nos freelances vérifiés.
              </p>
              <p className="mb-4">
                Vous recevrez prochainement des propositions directement par email depuis{" "}
                <span className="font-semibold text-orange-600">propositio@mail.com</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-medium transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(0);
                  setFormData({
                    fullName: "",
                    email: "",
                    projectType: "",
                    budget: "",
                    deadline: "",
                    objectives: "",
                    attachments: [],
                    reference: ""
                  });
                }}
                className="px-8 py-3 border border-orange-600 text-orange-600 hover:bg-orange-50 rounded-full font-medium transition-colors"
              >
                Nouvelle demande
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const currentField = currentStepData.field;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Vérifier si le champ actuel est valide pour activer le bouton "Suivant"
  const isCurrentFieldValid = () => {
    const fieldValue = formData[currentField.name];
    
    // Pour les fichiers, toujours valide car optionnel
    if (currentField.type === "file") {
      return true;
    }
    
    // Pour les champs requis, vérifier qu'ils ne sont pas vides
    if (currentField.required) {
      if (currentField.type === "select") {
        return fieldValue && fieldValue !== "";
      }
      return fieldValue && typeof fieldValue === 'string' && fieldValue.trim() !== "";
    }
    
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col justify-center">
      {/* Header avec logo */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-8">
          {/* Barre de progression */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 space-y-2 sm:space-y-0">
              <span className="font-medium text-center sm:text-left">Étape {currentStep + 1} sur {steps.length}</span>
              <span className="font-medium text-center sm:text-right">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 sm:h-3 mb-6">
              <div 
                className="bg-orange-600 h-4 sm:h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Formulaire adaptatif */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-orange-200 p-4 sm:p-8 md:p-10 w-full">
            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center leading-tight">
                {currentStepData.title}
              </h2>

              <div className="space-y-4">
                <label className="block text-base font-medium text-gray-700">
                  {currentField.label}
                  {currentField.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {currentField.type === "select" ? (
                  <div className="relative">
                    <select
                      name={currentField.name}
                      value={formData[currentField.name] as string}
                      onChange={handleInputChange}
                      required={currentField.required}
                      style={{ 
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundPosition: 'right 20px center',
                        backgroundRepeat: 'no-repeat'
                      }}
                      className="w-full px-8 py-6 pr-16 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-300 text-base font-[var(--font-poppins)] bg-gradient-to-r from-white to-orange-50/30 hover:border-orange-400 hover:shadow-xl cursor-pointer shadow-lg hover:shadow-2xl transform hover:-translate-y-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDlsLTcgNy03LTciIHN0cm9rZT0iI2VhNTgwYyIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat"
                    >
                      {currentField.options?.map((option, optionIndex) => (
                        <option 
                          key={optionIndex} 
                          value={option.value} 
                          className="bg-white py-4 px-6 text-gray-800 font-medium"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : currentField.type === "textarea" ? (
                  <textarea
                    name={currentField.name}
                    value={formData[currentField.name] as string}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    required={currentField.required}
                    placeholder={currentField.placeholder}
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none text-base bg-gray-50 focus:bg-white"
                  />
                ) : currentField.type === "file" ? (
                  <div>
                    <input
                      type="file"
                      name={currentField.name}
                      onChange={handleInputChange}
                      accept={currentField.accept}
                      multiple={currentField.multiple}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData[currentField.name] && Array.isArray(formData[currentField.name]) && (formData[currentField.name] as File[]).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Fichiers sélectionnés :</p>
                        <ul className="space-y-1">
                          {(formData[currentField.name] as File[]).map((file: File, index: number) => (
                            <li key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded flex justify-between items-center">
                              <span className="truncate">{file.name}</span>
                              <span className="text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={currentField.type}
                    name={currentField.name}
                    value={formData[currentField.name] as string}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    required={currentField.required}
                    placeholder={currentField.placeholder}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base bg-gray-50 focus:bg-white"
                  />
                )}

                {currentField.help && (
                  <p className="mt-2 text-sm text-gray-500">{currentField.help}</p>
                )}
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-base">{error}</p>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  Précédent
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentFieldValid()}
                    className="px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 text-base"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !isCurrentFieldValid()}
                    className="px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    <span className="hidden sm:inline">{isLoading ? "Envoi en cours..." : "Envoyer ma demande de devis"}</span>
                    <span className="sm:hidden">{isLoading ? "Envoi..." : "Envoyer"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteRequestForm;
