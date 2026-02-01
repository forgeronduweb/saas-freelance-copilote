import mongoose from 'mongoose';

interface ConnectionState {
  isConnected?: number;
}

const connection: ConnectionState = {};

export async function connectToDatabase() {
  if (connection.isConnected) {
    console.log('✅ Utilisation de la connexion MongoDB existante');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI est manquante. Ajoute-la dans client/.env.local (ex: MONGODB_URI="mongodb+srv://..." ou "mongodb://localhost:27017/...") puis redémarre le serveur.'
    );
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('✅ Nouvelle connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw new Error('Impossible de se connecter à la base de données');
  }
}

export async function disconnectFromDatabase() {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('✅ Déconnexion MongoDB effectuée');
  }
}

// Fonction utilitaire pour s'assurer que la connexion est établie
export async function ensureConnection() {
  if (!connection.isConnected) {
    await connectToDatabase();
  }
}
