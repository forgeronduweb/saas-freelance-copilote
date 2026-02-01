import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  title: string;
  description: string;
  category: 'developpement-web' | 'design-graphique' | 'redaction-traduction' | 'marketing-digital';
  budget: {
    min: number;
    max: number;
    type: 'fixe' | 'horaire';
  };
  deadline: Date;
  status: 'brouillon' | 'publie' | 'en-cours' | 'en-revision' | 'termine' | 'annule';
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  
  // Relations
  clientId: mongoose.Types.ObjectId;
  freelancerId?: mongoose.Types.ObjectId;
  
  // Compétences requises
  skillsRequired: string[];
  experienceLevel: 'debutant' | 'intermediaire' | 'expert';
  
  // Nombre de candidatures (calculé)
  applicationsCount: number;
  
  // Progression du projet
  progress: {
    percentage: number;
    milestones: {
      title: string;
      description: string;
      dueDate: Date;
      isCompleted: boolean;
      completedAt?: Date;
    }[];
    lastUpdated: Date;
  };
  
  // Fichiers et ressources
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  
  // Nombre de messages (calculé)
  messagesCount: number;
  
  // Paiement
  payment: {
    amount: number;
    status: 'en-attente' | 'paye' | 'rembourse';
    paidAt?: Date;
    paymentMethod?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  category: {
    type: String,
    required: true,
    enum: ['developpement-web', 'design-graphique', 'redaction-traduction', 'marketing-digital'],
  },
  budget: {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['fixe', 'horaire'],
    },
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['brouillon', 'publie', 'en-cours', 'en-revision', 'termine', 'annule'],
    default: 'brouillon',
  },
  priority: {
    type: String,
    required: true,
    enum: ['basse', 'normale', 'haute', 'urgente'],
    default: 'normale',
  },
  
  // Relations
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  // Compétences
  skillsRequired: [{
    type: String,
    trim: true,
  }],
  experienceLevel: {
    type: String,
    required: true,
    enum: ['debutant', 'intermediaire', 'expert'],
  },
  
  // Nombre de candidatures
  applicationsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Progression
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    milestones: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
        default: null,
      },
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Fichiers
  attachments: [{
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Nombre de messages
  messagesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Paiement
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['en-attente', 'paye', 'rembourse'],
      default: 'en-attente',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
  },
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ freelancerId: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ skillsRequired: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
