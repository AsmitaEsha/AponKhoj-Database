interface AdminCredential {
  email: string;
  password: string;
}

let adminCredentials: AdminCredential[] = [];

// Parse admin credentials from ENV
try {
  const credentialsJson = process.env.ADMIN_CREDENTIALS;
  if (credentialsJson) {
    adminCredentials = JSON.parse(credentialsJson);
    console.log(`✅ Loaded ${adminCredentials.length} admin credentials from ENV`);
  }
} catch (error) {
  console.error('❌ Error parsing ADMIN_CREDENTIALS from ENV:', error);
  adminCredentials = [];
}

export const isAdminCredential = (email: string, password: string): boolean => {
  return adminCredentials.some(
    admin => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
  );
};

export const getAdminCredentials = (): AdminCredential[] => {
  return adminCredentials;
};