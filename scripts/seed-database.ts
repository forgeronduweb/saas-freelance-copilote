/**
 * Script de seed pour MongoDB
 * Crée les utilisateurs de test et données initiales
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// URI MongoDB locale
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Tuma';

// Import des modèles
import User from '../src/lib/models/User';
import Client from '../src/lib/models/Client';
import Invoice from '../src/lib/models/Invoice';
import Task from '../src/lib/models/Task';
import Quote from '../src/lib/models/Quote';
import Event from '../src/lib/models/Event';
import TimeEntry from '../src/lib/models/TimeEntry';
import Opportunity from '../src/lib/models/Opportunity';
import Mission from '../src/lib/models/Mission';
import ProjectDocument from '../src/lib/models/ProjectDocument';

async function seedDatabase() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    console.log('URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    
    // Récupérer l'utilisateur test@mail.com
    let user = await User.findOne({ email: 'test@mail.com' });
    
    if (!user) {
      console.log('⚠️ Utilisateur test@mail.com non trouvé, création...');
      const hashedPassword = await bcrypt.hash('Test1234!', 12);
      user = await User.create({
        email: 'test@mail.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        userType: 'freelance',
        isEmailVerified: true,
        isActive: true,
        hourlyRate: 25000,
        monthlyTarget: 5000000,
      });
    }

    const userId = user._id;
    console.log(`👤 Utilisateur: ${user.email} (${userId})`);

    // Nettoyer les anciennes données de cet utilisateur
    console.log('🗑️ Nettoyage des anciennes données...');
    await Promise.all([
      Client.deleteMany({ userId }),
      Invoice.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      Quote.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      TimeEntry.deleteMany({ userId }),
      Opportunity.deleteMany({ userId }),
      Mission.deleteMany({ userId }),
      ProjectDocument.deleteMany({ userId }),
    ]);

    // Créer des clients
    console.log('👥 Création des clients...');
    const clientsData = [
      { name: 'Kouamé Yao', email: 'kouame@techsolutions.ci', phone: '+225 07 12 34 56 78', company: 'Tech Solutions CI', status: 'Actif' },
      { name: 'Adjoua Konan', email: 'adjoua@startup-xyz.ci', phone: '+225 05 98 76 54 32', company: 'Startup XYZ', status: 'Actif' },
      { name: 'Sékou Diallo', email: 'sekou@agence-web.ci', phone: '+225 01 11 22 33 44', company: 'Agence Web Abidjan', status: 'Prospect' },
      { name: 'Awa Touré', email: 'awa@commerce.ci', phone: '+225 07 55 66 77 88', company: 'E-Commerce Plus', status: 'Actif' },
      { name: 'Fatou Bamba', email: 'fatou@fintech.ci', phone: '+225 01 44 55 66 77', company: 'FinTech.ci', status: 'Prospect' },
    ];

    const clients = await Client.insertMany(
      clientsData.map(c => ({ ...c, userId, totalProjects: 0, totalRevenue: 0 }))
    );
    console.log(`✅ ${clients.length} clients créés`);

    // Créer des factures
    console.log('💰 Création des factures...');
    const today = new Date();
    const invoicesData = [
      {
        clientName: 'Tech Solutions CI',
        invoiceNumber: 'FAC-2024-001',
        amount: 1500000,
        total: 1500000,
        status: 'Payée',
        issueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
        paidDate: new Date(today.getFullYear(), today.getMonth() - 1, 25),
        items: [{ description: 'Développement site web', quantity: 1, unitPrice: 1500000, total: 1500000 }],
      },
      {
        clientName: 'Startup XYZ',
        invoiceNumber: 'FAC-2024-002',
        amount: 1200000,
        total: 1200000,
        status: 'Envoyée',
        issueDate: new Date(today.getFullYear(), today.getMonth(), 5),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        items: [{ description: 'Application mobile', quantity: 1, unitPrice: 1200000, total: 1200000 }],
      },
      {
        clientName: 'E-Commerce Plus',
        invoiceNumber: 'FAC-2024-003',
        amount: 2100000,
        total: 2100000,
        status: 'Payée',
        issueDate: new Date(today.getFullYear(), today.getMonth(), 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        paidDate: new Date(today.getFullYear(), today.getMonth(), 10),
        items: [{ description: 'Refonte e-commerce', quantity: 1, unitPrice: 2100000, total: 2100000 }],
      },
      {
        clientName: 'Agence Web Abidjan',
        invoiceNumber: 'FAC-2024-004',
        amount: 650000,
        total: 650000,
        status: 'En retard',
        issueDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        items: [{ description: 'Maintenance mensuelle', quantity: 1, unitPrice: 650000, total: 650000 }],
      },
    ];

    await Invoice.insertMany(invoicesData.map(inv => ({ ...inv, userId })));
    console.log(`✅ ${invoicesData.length} factures créées`);

    // Créer des tâches
    console.log('📋 Création des tâches...');
    const tasksData = [
      { title: 'Finaliser le projet Tech Solutions', type: 'Feature', status: 'En cours', priority: 'Haute' },
      { title: 'Relancer devis Sékou Diallo', type: 'Documentation', status: 'À faire', priority: 'Haute' },
      { title: 'Corriger bug formulaire contact', type: 'Bug', status: 'À faire', priority: 'Moyenne' },
      { title: 'Mettre à jour le portfolio', type: 'Documentation', status: 'À faire', priority: 'Basse' },
      { title: 'Intégrer module paiement', type: 'Feature', status: 'En cours', priority: 'Haute' },
      { title: 'Réunion client Startup XYZ', type: 'Autre', status: 'Terminé', priority: 'Moyenne' },
      { title: 'Optimiser performances site', type: 'Bug', status: 'Terminé', priority: 'Haute' },
    ];

    await Task.insertMany(tasksData.map(t => ({ ...t, userId })));
    console.log(`✅ ${tasksData.length} tâches créées`);

    // Créer des devis
    console.log('📄 Création des devis...');
    const quotesData = [
      {
        clientName: 'Sékou Diallo',
        quoteNumber: 'DEV-2024-001',
        title: 'Site web vitrine',
        amount: 650000,
        total: 650000,
        status: 'Envoyé',
        validUntil: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        items: [
          { description: 'Création site web vitrine', quantity: 1, unitPrice: 500000, total: 500000 },
          { description: 'Intégration responsive', quantity: 1, unitPrice: 150000, total: 150000 },
        ],
      },
      {
        clientName: 'Fatou Bamba',
        quoteNumber: 'DEV-2024-002',
        title: 'Application mobile FinTech',
        amount: 2000000,
        total: 2000000,
        status: 'Brouillon',
        validUntil: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        items: [
          { description: 'Application mobile', quantity: 1, unitPrice: 1200000, total: 1200000 },
          { description: 'Backend API', quantity: 1, unitPrice: 800000, total: 800000 },
        ],
      },
      {
        clientName: 'Adjoua Konan',
        quoteNumber: 'DEV-2024-003',
        title: 'Refonte UI/UX',
        amount: 400000,
        total: 400000,
        status: 'Accepté',
        validUntil: new Date(today.getFullYear(), today.getMonth(), 30),
        acceptedAt: new Date(today.getFullYear(), today.getMonth(), 12),
        items: [{ description: 'Refonte UI/UX', quantity: 1, unitPrice: 400000, total: 400000 }],
      },
    ];

    await Quote.insertMany(quotesData.map(q => ({ ...q, userId })));
    console.log(`✅ ${quotesData.length} devis créés`);

    // Créer des événements
    console.log('📅 Création des événements...');
    const eventsData = [
      { title: 'Appel client Tech Solutions', type: 'RDV Client', status: 'Planifié', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), time: '14:00' },
      { title: 'Livraison projet Startup XYZ', type: 'Deadline', status: 'Planifié', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), time: '10:00' },
      { title: 'Réunion kickoff FinTech', type: 'RDV Client', status: 'Planifié', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), time: '09:30' },
      { title: 'Relance devis Sékou', type: 'Rappel', status: 'Planifié', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), time: '11:00' },
    ];

    await Event.insertMany(eventsData.map(e => ({ ...e, userId })));
    console.log(`✅ ${eventsData.length} événements créés`);

    // Créer des entrées de temps
    console.log('⏱️ Création des entrées de temps...');
    const timeEntriesData = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Pas les weekends
        timeEntriesData.push({
          userId,
          date,
          hours: Math.floor(Math.random() * 4) + 4, // 4-8 heures
          description: 'Travail sur projet client',
          billable: true,
          hourlyRate: 25000,
        });
      }
    }

    await TimeEntry.insertMany(timeEntriesData);
    console.log(`✅ ${timeEntriesData.length} entrées de temps créées`);

    // Créer des opportunités
    console.log('🎯 Création des opportunités...');
    const opportunitiesData = [
      { source: 'LinkedIn', title: 'Refonte site vitrine (Next.js)', company: 'Agence Digitale Abidjan', url: 'https://www.linkedin.com/', status: 'Nouvelle', publishedAt: new Date() },
      { source: 'Twitter/X', title: 'Développeur freelance pour MVP e-commerce', company: 'Startup CI', url: 'https://x.com/', status: 'Nouvelle', publishedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) },
      { source: 'Web', title: 'Audit performance + SEO technique', company: 'E-commerce Plus', url: 'https://www.google.com/', status: 'Contactée', publishedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { source: 'Malt', title: 'Application React Native', company: 'HealthTech Abidjan', url: 'https://www.malt.fr/', status: 'Nouvelle', publishedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { source: 'LinkedIn', title: 'Développement API REST Node.js', company: 'Banque Digitale CI', url: 'https://www.linkedin.com/', status: 'En discussion', publishedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
    ];

    await Opportunity.insertMany(opportunitiesData.map(o => ({ ...o, userId })));
    console.log(`✅ ${opportunitiesData.length} opportunités créées`);

    // Créer des missions
    console.log('🎯 Création des missions...');
    const missionsData = [
      { title: 'Landing page marketing', clientName: 'Startup XYZ', status: 'En cours', priority: 'Haute', dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Refonte UI/UX', clientName: 'Design Studio', status: 'To-do', priority: 'Moyenne', dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000) },
      { title: 'API paiement', clientName: 'FinTech.ci', status: 'Terminé', priority: 'Haute', dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { title: 'Application mobile', clientName: 'E-Commerce Plus', status: 'En cours', priority: 'Haute', dueDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000) },
      { title: 'Maintenance site web', clientName: 'Tech Solutions CI', status: 'To-do', priority: 'Basse', dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
    ];

    await Mission.insertMany(missionsData.map(m => ({ ...m, userId })));
    console.log(`✅ ${missionsData.length} missions créées`);

    // Créer des documents
    console.log('📁 Création des documents...');
    const documentsData = [
      { title: 'Brief - Landing page', type: 'Brief' },
      { title: 'CDC - Refonte UI', type: 'Cahier des charges' },
      { title: 'Livrable - API v1', type: 'Livrable' },
      { title: 'Brief - Application mobile', type: 'Brief' },
      { title: 'Spécifications techniques', type: 'Cahier des charges' },
    ];

    await ProjectDocument.insertMany(documentsData.map(d => ({ ...d, userId })));
    console.log(`✅ ${documentsData.length} documents créés`);

    // Mettre à jour les stats utilisateur
    const totalEarnings = invoicesData
      .filter(i => i.status === 'Payée')
      .reduce((sum, i) => sum + i.total, 0);

    await User.findByIdAndUpdate(userId, {
      totalEarnings,
      completedProjects: 3,
      hourlyRate: 25000,
      monthlyTarget: 5000000,
    });
    
    console.log('\n🎉 Base de données initialisée avec succès!');
    console.log('\n📊 Résumé:');
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${invoicesData.length} factures`);
    console.log(`   - ${tasksData.length} tâches`);
    console.log(`   - ${quotesData.length} devis`);
    console.log(`   - ${eventsData.length} événements`);
    console.log(`   - ${timeEntriesData.length} entrées de temps`);
    console.log(`   - ${opportunitiesData.length} opportunités`);
    console.log(`   - ${missionsData.length} missions`);
    console.log(`   - ${documentsData.length} documents`);
    console.log(`   - Revenus total: ${totalEarnings.toLocaleString()} FCFA`);
    console.log('\n📝 Connectez-vous avec: test@mail.com / Test1234!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
