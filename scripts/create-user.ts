import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/afrilance';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userType: { type: String, required: true, enum: ['freelance', 'client'] },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  planType: { type: String, default: 'gratuit' },
}, { timestamps: true });

async function createUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'forgeronduweb@gmail.com' });
    if (existingUser) {
      console.log('⚠️ Utilisateur existe déjà, mise à jour du mot de passe...');
      const hashedPassword = await bcrypt.hash('Philome98@', 12);
      await User.updateOne(
        { email: 'forgeronduweb@gmail.com' },
        { password: hashedPassword }
      );
      console.log('✅ Mot de passe mis à jour');
    } else {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash('Philome98@', 12);

      // Créer l'utilisateur
      const newUser = new User({
        email: 'forgeronduweb@gmail.com',
        password: hashedPassword,
        firstName: 'Forgeron',
        lastName: 'Du Web',
        userType: 'freelance',
        isEmailVerified: true,
        isActive: true,
        planType: 'premium',
      });

      await newUser.save();
      console.log('✅ Utilisateur créé avec succès');
    }

    console.log('\n📧 Email: forgeronduweb@gmail.com');
    console.log('🔑 Mot de passe: Philome98@');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

createUser();
