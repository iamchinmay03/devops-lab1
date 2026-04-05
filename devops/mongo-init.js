// MongoDB initialization script
// Creates the placement_tracker database with a dedicated user and seed data

db = db.getSiblingDB('placement_tracker');

// Create application user
db.createUser({
  user: 'pt_user',
  pwd: 'pt_password_change_in_prod',
  roles: [{ role: 'readWrite', db: 'placement_tracker' }]
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ 'studentProfile.branch': 1 });
db.users.createIndex({ 'studentProfile.placementStatus': 1 });

db.companies.createIndex({ name: 1 });
db.companies.createIndex({ hiringStatus: 1 });
db.companies.createIndex({ industry: 1 });
db.companies.createIndex({ name: 'text', description: 'text' });

db.applications.createIndex({ student: 1, company: 1 }, { unique: true });
db.applications.createIndex({ status: 1 });
db.applications.createIndex({ company: 1 });

print('✅ Placement Tracker database initialized');
