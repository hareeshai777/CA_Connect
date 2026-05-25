/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@casaas.com" },
    update: {},
    create: {
      email: "admin@casaas.com",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      admin: {
        create: {
          firstName: "Super",
          lastName: "Admin",
          permissions: { all: true },
        },
      },
    },
  });
  console.log("✅ Admin created:", adminUser.email);

  // Create Services
  const services = [
    { name: "GST Filing", slug: "gst-filing", category: "GST", shortDescription: "Complete GST registration and filing services", description: "Our GST filing service covers everything from GST registration to monthly/quarterly returns filing. Our experts ensure 100% compliance with all GST regulations.", basePrice: 149900, isFeatured: true, sortOrder: 1, benefits: ["GST Registration", "Monthly Returns (GSTR-1, GSTR-3B)", "Annual Return (GSTR-9)", "GST Reconciliation", "Notices Handling"] },
    { name: "Income Tax Filing", slug: "income-tax-filing", category: "TAX", shortDescription: "Individual and corporate income tax returns", description: "Professional income tax filing for individuals, HUFs, and businesses. We ensure maximum deductions and complete compliance with Income Tax Act.", basePrice: 99900, isFeatured: true, sortOrder: 2, benefits: ["ITR-1 to ITR-7 filing", "Tax Planning", "Refund Processing", "Notice Handling", "Tax Optimization"] },
    { name: "Company Registration", slug: "company-registration", category: "REGISTRATION", shortDescription: "Private limited, LLP, and OPC registration", description: "End-to-end company incorporation services including Private Limited Company, LLP, OPC, and Section 8 Company registration.", basePrice: 499900, isFeatured: true, sortOrder: 3, benefits: ["Name Approval", "MOA & AOA Drafting", "Digital Signature Certificate", "DIN for Directors", "Certificate of Incorporation"] },
    { name: "Audit Services", slug: "audit-services", category: "AUDIT", shortDescription: "Statutory, tax, and internal audits", description: "Comprehensive audit services including statutory audit, tax audit, internal audit, and concurrent audit for businesses.", basePrice: 999900, isFeatured: false, sortOrder: 4, benefits: ["Statutory Audit", "Tax Audit (3CD)", "Internal Audit", "Bank Audit", "Audit Report Certification"] },
    { name: "Trademark Registration", slug: "trademark-registration", category: "REGISTRATION", shortDescription: "Protect your brand with trademark filing", description: "Complete trademark registration and protection services. We handle everything from trademark search to registration certificate.", basePrice: 299900, isFeatured: false, sortOrder: 5, benefits: ["Trademark Search", "Application Filing", "Opposition Handling", "Renewal", "TM Certificate"] },
    { name: "Business Compliance", slug: "business-compliance", category: "COMPLIANCE", shortDescription: "ROC filings and compliance management", description: "Annual compliance services for companies including ROC filings, board meetings, and regulatory compliances.", basePrice: 299900, isFeatured: false, sortOrder: 6, benefits: ["Annual Returns (ROC)", "Board Meeting Minutes", "Statutory Registers", "Event-based Filings", "Compliance Calendar"] },
    { name: "Startup Consulting", slug: "startup-consulting", category: "CONSULTING", shortDescription: "Expert guidance for new businesses", description: "Comprehensive startup consulting including business structure advice, compliance planning, funding strategies, and financial modeling.", basePrice: 199900, isFeatured: true, sortOrder: 7, benefits: ["Business Structure Advisory", "Funding Guidance", "Compliance Planning", "Financial Modelling", "Pitch Deck Support"] },
    { name: "Financial Planning", slug: "financial-planning", category: "FINANCIAL_PLANNING", shortDescription: "Personal and business financial planning", description: "Holistic financial planning services covering investment planning, retirement planning, insurance, and tax-efficient wealth management.", basePrice: 149900, isFeatured: false, sortOrder: 8, benefits: ["Investment Planning", "Retirement Planning", "Insurance Advisory", "Wealth Management", "Tax Optimization"] },
    { name: "Accounting Services", slug: "accounting-services", category: "ACCOUNTING", shortDescription: "Bookkeeping and accounting management", description: "Complete accounting and bookkeeping services including accounts payable/receivable, bank reconciliation, and financial statements.", basePrice: 199900, isFeatured: false, sortOrder: 9, benefits: ["Daily Bookkeeping", "Bank Reconciliation", "P&L Statement", "Balance Sheet", "MIS Reports"] },
    { name: "Payroll Services", slug: "payroll-services", category: "PAYROLL", shortDescription: "End-to-end payroll processing", description: "Comprehensive payroll processing services including salary calculation, PF/ESI compliance, TDS deduction, and Form 16 generation.", basePrice: 149900, isFeatured: false, sortOrder: 10, benefits: ["Salary Processing", "PF & ESI Filing", "TDS Calculation", "Form 16 Generation", "Leave Management"] },
  ];

  for (const svc of services) {
    const { benefits, ...serviceData } = svc;
    const service = await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: {
        ...serviceData,
        category: serviceData.category as any,
        benefits: { create: benefits.map((b) => ({ benefit: b })) },
      },
    });
    console.log(`✅ Service: ${service.name}`);
  }

  // Platform Settings
  const settings = [
    { key: "platform_commission_percent", value: "10", description: "Platform commission percentage" },
    { key: "ca_onboarding_fee", value: "499", description: "CA onboarding fee in INR" },
    { key: "min_consultation_fee", value: "299", description: "Minimum consultation fee in INR" },
    { key: "platform_name", value: "CA Pro", description: "Platform name" },
    { key: "support_email", value: "support@casaas.com", description: "Support email" },
    { key: "support_phone", value: "+91-9876543210", description: "Support phone" },
  ];

  for (const setting of settings) {
    await prisma.platformSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Platform settings seeded");

  // Demo Client
  const clientPassword = await bcrypt.hash("Client@123", 12);
  await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      phone: "+919876543210",
      passwordHash: clientPassword,
      role: "CLIENT",
      isEmailVerified: true,
      clientProfile: {
        create: {
          firstName: "Rahul",
          lastName: "Sharma",
          companyName: "Sharma Enterprises",
          city: "Mumbai",
          state: "Maharashtra",
        },
      },
    },
  });
  console.log("✅ Demo client created: client@demo.com / Client@123");

  // Demo CA Professional
  const caPassword = await bcrypt.hash("CA@123456", 12);
  const caGstService = await prisma.service.findUnique({ where: { slug: "gst-filing" } });
  const caTaxService = await prisma.service.findUnique({ where: { slug: "income-tax-filing" } });
  await prisma.user.upsert({
    where: { email: "ca@demo.com" },
    update: {},
    create: {
      email: "ca@demo.com",
      phone: "+919876500001",
      passwordHash: caPassword,
      role: "CA_PROFESSIONAL",
      isEmailVerified: true,
      caProfessional: {
        create: {
          firstName: "Priya",
          lastName: "Menon",
          bio: "Expert CA with 12+ years experience in GST, income tax, and startup consulting. ICAI member since 2012.",
          membershipNumber: "ICAI-MH-2012-45678",
          experienceYears: 12,
          consultationFee: 49900,
          city: "Mumbai",
          state: "Maharashtra",
          languages: "English, Hindi, Marathi",
          status: "ACTIVE",
          isAvailable: true,
          averageRating: 4.9,
          totalReviews: 127,
          totalConsultations: 340,
          ...(caGstService && caTaxService ? {
            specializations: {
              create: [
                { serviceId: caGstService.id, expertiseLevel: 5 },
                { serviceId: caTaxService.id, expertiseLevel: 4 },
              ],
            },
          } : {}),
        },
      },
    },
  });
  console.log("✅ Demo CA created: ca@demo.com / CA@123456");

  // Demo Assistance Team Member
  const assistancePassword = await bcrypt.hash("Assist@123", 12);
  await prisma.user.upsert({
    where: { email: "assistance@demo.com" },
    update: {},
    create: {
      email: "assistance@demo.com",
      phone: "+919876500002",
      passwordHash: assistancePassword,
      role: "ASSISTANCE_TEAM",
      isEmailVerified: true,
      assistanceMember: {
        create: {
          firstName: "Anjali",
          lastName: "Sharma",
          designation: "Senior Document Verifier",
          department: "Operations",
          isActive: true,
        },
      },
    },
  });
  console.log("✅ Demo assistance team member created: assistance@demo.com / Assist@123");

  // Default Commission Settings
  await prisma.commissionSettings.upsert({
    where: { id: "default-commission" },
    update: {},
    create: {
      id: "default-commission",
      platformCommissionPct: 20,
      caCommissionPct: 70,
      assistanceTeamPct: 10,
      consultationFeeFixed: 49900,
      isActive: true,
    },
  });
  console.log("✅ Default commission settings seeded");

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────────────────");
  console.log("ROLE              EMAIL                  PASSWORD");
  console.log("─────────────────────────────────────────────────");
  console.log("Super Admin     | admin@casaas.com     | Admin@123456");
  console.log("Client          | client@demo.com      | Client@123");
  console.log("CA Professional | ca@demo.com          | CA@123456");
  console.log("Assistance Team | assistance@demo.com  | Assist@123");
  console.log("─────────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
