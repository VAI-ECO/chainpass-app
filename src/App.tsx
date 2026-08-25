import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import VaiIntro from "./pages/VaiIntro";
import VaiEntryCheck from "./pages/VaiEntryCheck";
import VaiContactCollection from "./pages/VaiContactCollection";
import VaiPricing from "./pages/VaiPricing";
import BusinessVerificationStart from "./pages/BusinessVerificationStart";
import BusinessTypeSelection from "./pages/BusinessTypeSelection";
import BusinessPackageSelection from "./pages/BusinessPackageSelection";
import NotFound from "./pages/NotFound";
import PaymentSelection from "./pages/PaymentSelection";
import PaymentForm from "./pages/PaymentForm";

import VerificationTransition from "./pages/VerificationTransition";
import VaiProcessing from "./pages/VaiProcessing";
import LeoDeclaration from "./pages/LeoDeclaration";
import SignatureAgreement from "./pages/SignatureAgreement";
import FacialVerification from "./pages/FacialVerification";
import LEOVaiSuccess from "./pages/LEOVaiSuccess";
import VaiSuccess from "./pages/VaiSuccess";
import ExistingVai from "./pages/ExistingVai";
import RecoverVai from "./pages/RecoverVai";
import Install from "./pages/Install";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import BusinessPartnerRegistration from "./pages/BusinessPartnerRegistration";
import BusinessPartnerPortal from "./pages/BusinessPartnerPortal";
import ApiDocumentation from "./pages/ApiDocumentation";
import DeveloperSandbox from "./pages/DeveloperSandbox";
import ErrorMonitoring from "./pages/ErrorMonitoring";
import ContractSignature from "./pages/ContractSignature";
import ComplyCubeFacialVerification from "./pages/ComplyCubeFacialVerification";
import VerificationCallback from "./pages/VerificationCallback";
import IdentityVerificationRequirements from "./pages/IdentityVerificationRequirements";
import VairifySignup from "./pages/VairifySignup";
import OnboardingComplete from "./pages/OnboardingComplete";
import BusinessCouponDashboard from "./pages/BusinessCouponDashboard";
import EmergencyRetrieval from "./pages/EmergencyRetrieval";
import EnrolEntry from "./pages/EnrolEntry";
import EnrolKeep from "./pages/EnrolKeep";
import EnrolConsent from "./pages/EnrolConsent";
import EnrolPay from "./pages/EnrolPay";
import EnrolRegister from "./pages/EnrolRegister";
import EnrolOtp from "./pages/EnrolOtp";
import EnrolCapture from "./pages/EnrolCapture";
import EnrolReveal from "./pages/EnrolReveal";
import EnrolAccept from "./pages/EnrolAccept";
import EnrolRequirements from "./pages/EnrolRequirements";
import EnrolDeclaration from "./pages/EnrolDeclaration";
import EnrolSign from "./pages/EnrolSign";
import EnrolBaseline from "./pages/EnrolBaseline";
import EnrolComplete from "./pages/EnrolComplete";
import EnrolSecurity from "./pages/EnrolSecurity";
import EnrolHandoff from "./pages/EnrolHandoff";
import VerifyShortfall from "./pages/VerifyShortfall";
import VerifyLastAttempt from "./pages/VerifyLastAttempt";
import VerifyRebaseline from "./pages/VerifyRebaseline";
import VerifyNotActive from "./pages/VerifyNotActive";
import RenewCredential from "./pages/RenewCredential";
import VerifyCrossPlatform from "./pages/VerifyCrossPlatform";
import TermsFirstVisit from "./pages/TermsFirstVisit";
import AdminRows from "./pages/AdminRows";
import UnruledPlate from "./pages/UnruledPlate";
import VerifyCall from "./pages/VerifyCall";
import VerifyChecking from "./pages/VerifyChecking";
import VerifyGreen from "./pages/VerifyGreen";
import VerifyBand from "./pages/VerifyBand";
import VerifyFourthState from "./pages/VerifyFourthState";
import ReviewFailures from "./pages/ReviewFailures";
import ReviewSideBySide from "./pages/ReviewSideBySide";
import SupplierObligations from "./pages/SupplierObligations";
import ClientOverview from "./pages/ClientOverview";
import ClientBlocks from "./pages/ClientBlocks";
import ClientAgreements from "./pages/ClientAgreements";
import ClientProofs from "./pages/ClientProofs";
import ClientCommission from "./pages/ClientCommission";
import ClientConfig from "./pages/ClientConfig";
import ClientHealth from "./pages/ClientHealth";
import ClientKeys from "./pages/ClientKeys";
import ClientUnruled from "./pages/ClientUnruled";
import MasterPlatforms from "./pages/MasterPlatforms";
import MasterProviders from "./pages/MasterProviders";
import MasterSettings from "./pages/MasterSettings";
import MasterFailures from "./pages/MasterFailures";
import MasterCredentials from "./pages/MasterCredentials";
import MasterRevenue from "./pages/MasterRevenue";
import MasterHealth from "./pages/MasterHealth";
import MasterAudit from "./pages/MasterAudit";
import MasterUnruled from "./pages/MasterUnruled";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/identity-verification-requirements" element={<IdentityVerificationRequirements />} />
              <Route path="/vai-intro" element={<VaiIntro />} />
              <Route path="/vai-entry" element={<VaiEntryCheck />} />
              <Route path="/vai-contact" element={<VaiContactCollection />} />
              <Route path="/vai-pricing" element={<VaiPricing />} />
              <Route path="/business-type" element={<BusinessTypeSelection />} />
              <Route path="/business-packages" element={<BusinessPackageSelection />} />
              <Route path="/existing-vai" element={<ExistingVai />} />
              <Route path="/recover-vai" element={<RecoverVai />} />
              <Route path="/emergency-retrieval" element={<EmergencyRetrieval />} />
              <Route path="/:businessId/verify" element={<BusinessVerificationStart />} />
              <Route path="/pricing" element={<PaymentSelection />} />
              <Route path="/payment" element={<PaymentForm />} />
              <Route path="/verification-transition" element={<VerificationTransition />} />
              <Route path="/vai-processing" element={<VaiProcessing />} />
              <Route path="/verification-callback" element={<VerificationCallback />} />
              <Route path="/complycube-facial-verification" element={<ComplyCubeFacialVerification />} />
              <Route path="/complycube-callback" element={<ComplyCubeFacialVerification />} />
              <Route path="/leo-declaration" element={<LeoDeclaration />} />
              <Route path="/legal-agreements" element={<SignatureAgreement />} />
              <Route path="/contract-signature" element={<ContractSignature />} />
              <Route path="/facial-verification" element={<FacialVerification />} />
              <Route path="/leo-vai-success" element={<LEOVaiSuccess />} />
              <Route path="/vai-success" element={<VaiSuccess />} />
              <Route path="/install" element={<Install />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/business-partner-registration" element={<BusinessPartnerRegistration />} />
              <Route path="/partner-portal" element={<BusinessPartnerPortal />} />
              <Route path="/business-coupons" element={<BusinessCouponDashboard />} />
              <Route path="/api-docs" element={<ApiDocumentation />} />
              <Route path="/sandbox" element={<DeveloperSandbox />} />
              <Route path="/error-monitoring" element={<ErrorMonitoring />} />
              <Route path="/enrol" element={<EnrolEntry />} />
              <Route path="/enrol/keep" element={<EnrolKeep />} />
              <Route path="/enrol/consent" element={<EnrolConsent />} />
              <Route path="/enrol/pay" element={<EnrolPay />} />
              <Route path="/enrol/register" element={<EnrolRegister />} />
              <Route path="/enrol/otp" element={<EnrolOtp />} />
              <Route path="/enrol/capture" element={<EnrolCapture />} />
              <Route path="/enrol/reveal" element={<EnrolReveal />} />
              <Route path="/enrol/accept" element={<EnrolAccept />} />
              <Route path="/enrol/requirements" element={<EnrolRequirements />} />
              <Route path="/enrol/declaration" element={<EnrolDeclaration />} />
              <Route path="/enrol/sign" element={<EnrolSign />} />
              <Route path="/enrol/baseline" element={<EnrolBaseline />} />
              <Route path="/enrol/complete" element={<EnrolComplete />} />
              <Route path="/enrol/security" element={<EnrolSecurity />} />
              <Route path="/enrol/handoff" element={<EnrolHandoff />} />
              <Route path="/verify/shortfall" element={<VerifyShortfall />} />
              <Route path="/verify/last-attempt" element={<VerifyLastAttempt />} />
              <Route path="/verify/rebaseline" element={<VerifyRebaseline />} />
              <Route path="/verify/not-active" element={<VerifyNotActive />} />
              <Route path="/renew" element={<RenewCredential />} />
              <Route path="/verify/cross-platform" element={<VerifyCrossPlatform />} />
              <Route path="/terms/first-visit" element={<TermsFirstVisit />} />
              <Route path="/admin/rows" element={<AdminRows />} />
              <Route path="/unruled" element={<UnruledPlate />} />
              <Route path="/verify/call" element={<VerifyCall />} />
              <Route path="/verify/checking" element={<VerifyChecking />} />
              <Route path="/verify/green" element={<VerifyGreen />} />
              <Route path="/verify/band" element={<VerifyBand />} />
              <Route path="/verify/fourth-state" element={<VerifyFourthState />} />
              <Route path="/review/failures" element={<ReviewFailures />} />
              <Route path="/review/side-by-side" element={<ReviewSideBySide />} />
              <Route path="/supplier/obligations" element={<SupplierObligations />} />
              <Route path="/client" element={<ClientOverview />} />
              <Route path="/client/blocks" element={<ClientBlocks />} />
              <Route path="/client/agreements" element={<ClientAgreements />} />
              <Route path="/client/proofs" element={<ClientProofs />} />
              <Route path="/client/commission" element={<ClientCommission />} />
              <Route path="/client/config" element={<ClientConfig />} />
              <Route path="/client/health" element={<ClientHealth />} />
              <Route path="/client/keys" element={<ClientKeys />} />
              <Route path="/client/unruled" element={<ClientUnruled />} />
              <Route path="/master" element={<MasterPlatforms />} />
              <Route path="/master/providers" element={<MasterProviders />} />
              <Route path="/master/settings" element={<MasterSettings />} />
              <Route path="/master/failures" element={<MasterFailures />} />
              <Route path="/master/credentials" element={<MasterCredentials />} />
              <Route path="/master/revenue" element={<MasterRevenue />} />
              <Route path="/master/health" element={<MasterHealth />} />
              <Route path="/master/audit" element={<MasterAudit />} />
              <Route path="/master/unruled" element={<MasterUnruled />} />
              <Route path="/vairify-signup" element={<VairifySignup />} />
              <Route path="/onboarding/complete" element={<OnboardingComplete />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
