export const USERS = {
  admin:      { email: "admin@casaas.com",      password: "Admin@123456", dashboard: "/admin/dashboard"      },
  client:     { email: "client@demo.com",       password: "Client@123",   dashboard: "/client/dashboard"     },
  ca:         { email: "ca@demo.com",           password: "CA@123456",    dashboard: "/ca/dashboard"         },
  assistance: { email: "assistance@demo.com",   password: "Assist@123",   dashboard: "/assistance/dashboard" },
} as const;

export type Role = keyof typeof USERS;
